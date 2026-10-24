"""F authoring: editable IK sources -> baked anatomical rigs -> real GLBs.

Accepted E files are read only. Export scenes contain only six baked actions,
so control curves cannot be mistaken for exported animation tracks.
"""
from pathlib import Path
import sys
import math
import json
import hashlib
import struct
import importlib.util
import bpy
from mathutils import Matrix,Vector

sys.dont_write_bytecode=True
spec=importlib.util.spec_from_file_location('f_rig',Path(__file__).with_name('rig.py'))
r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art-source/character-f'
EV=ROOT/'evidence/character-f'
INPUT=ROOT/'art-source/character-eh/base-models-e.blend'


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def geometry_hash(ob):
    h=hashlib.sha256()
    for v in ob.data.vertices:h.update(struct.pack('<3f',*v.co))
    for p in ob.data.polygons:
        h.update(struct.pack('<I',len(p.vertices)))
        for i in p.vertices:h.update(struct.pack('<I',i))
    return h.hexdigest()


def make_deform_rig(source,female):
    data=bpy.data.armatures.new(('Female' if female else 'Male')+' | F export skeleton')
    ob=bpy.data.objects.new(('Female' if female else 'Male')+' | F anatomical rig',data);bpy.context.scene.collection.objects.link(ob)
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    bpy.ops.object.mode_set(mode='EDIT')
    for name,(head,tail,parent) in r.bone_spec(female).items():
        bone=data.edit_bones.new(name);bone.head=head;bone.tail=tail;bone.use_deform=True
        if parent:bone.parent=data.edit_bones[parent]
        # Reuse source rest matrices including bone roll.
        bone.matrix=source.data.bones[name].matrix_local
        bone.length=source.data.bones[name].length
    bpy.ops.object.mode_set(mode='OBJECT');ob.show_in_front=True
    for bone in ob.pose.bones:bone.rotation_mode='QUATERNION'
    return ob


def sample_actions(rig,actions):
    cache={};goal_errors=[]
    for action,clip in zip(actions,r.CLIPS):
        rig.animation_data.action=action;frames=[]
        for frame in range(1,r.END+1):
            bpy.context.scene.frame_set(frame);bpy.context.view_layer.update()
            frames.append({bone.name:bone.matrix.copy() for bone in rig.pose.bones if bone.name.startswith('DEF_')})
            for side in ['L','R']:
                for joint,control in [('forearm','hand'),('shin','foot')]:
                    error=(rig.pose.bones['DEF_'+joint+'.'+side].tail-rig.pose.bones['CTRL_'+control+'.'+side].head).length
                    goal_errors.append({'clip':clip,'frame':frame,'joint':joint+'.'+side,'error':error})
        cache[clip]=frames
    return cache,goal_errors


def export_meshes(objects,control_rig,deform_rig):
    control_rig.data.pose_position='REST';bpy.context.view_layer.update()
    dg=bpy.context.evaluated_depsgraph_get();result=[];report=[]
    for source in objects:
        data=bpy.data.meshes.new_from_object(source.evaluated_get(dg),preserve_all_data_layers=True,depsgraph=dg)
        ob=bpy.data.objects.new('F mesh '+str(len(result)),data);bpy.context.scene.collection.objects.link(ob)
        ob['source_part']=source.name
        names=[group.name for group in source.vertex_groups]
        groups=[ob.vertex_groups.new(name=name) for name in names]
        largest=0;min_sum=1;max_sum=0
        for vertex in data.vertices:
            weights=sorted([(group.group,group.weight) for group in vertex.groups if group.weight>1e-8],key=lambda item:item[1],reverse=True)
            assert weights,(source.name,vertex.index,'evaluated skin weights missing')
            top=weights[:4];total=sum(value for _,value in top);assert total>0
            for group in groups:group.remove([vertex.index])
            for index,value in top:groups[index].add([vertex.index],value/total,'REPLACE')
            largest=max(largest,len(top));min_sum=min(min_sum,sum(value/total for _,value in top));max_sum=max(max_sum,sum(value/total for _,value in top))
        modifier=ob.modifiers.new('F | glTF-compatible linear skin','ARMATURE');modifier.object=deform_rig;modifier.use_deform_preserve_volume=False
        ob.parent=deform_rig;ob.matrix_parent_inverse=Matrix.Identity(4)
        report.append({'object':source.name,'vertices':len(data.vertices),'max_influences':largest,'sum_min':min_sum,'sum_max':max_sum})
        result.append(ob)
    control_rig.data.pose_position='POSE'
    return result,report


def bake_actions(rig,samples):
    rig.animation_data_create();actions=[];maximum_scale_error=0
    for clip in r.CLIPS:
        action=bpy.data.actions.new(clip);action.use_fake_user=True;rig.animation_data.action=action
        previous={}
        for frame,worlds in enumerate(samples[clip],1):
            for bone in rig.pose.bones:
                rest=bone.bone.matrix_local
                if bone.parent:
                    basis=rest.inverted()@bone.parent.bone.matrix_local@worlds[bone.parent.name].inverted()@worlds[bone.name]
                else:basis=rest.inverted()@worlds[bone.name]
                location,rotation,scale=basis.decompose()
                if bone.name in previous and rotation.dot(previous[bone.name])<0:rotation.negate()
                previous[bone.name]=rotation.copy()
                bone.location=location;bone.rotation_quaternion=rotation;bone.scale=scale
                maximum_scale_error=max(maximum_scale_error,max(abs(v-1) for v in scale))
                for channel in ['location','rotation_quaternion','scale']:bone.keyframe_insert(channel,frame=frame,group=bone.name)
        actions.append(action)
    assert maximum_scale_error<.0001,maximum_scale_error
    rig.animation_data.action=actions[1];bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
    return actions,maximum_scale_error


def read_glb(path):
    data=path.read_bytes();assert data[:4]==b'glTF'
    length=struct.unpack_from('<I',data,12)[0];return json.loads(data[20:20+length])


def main():
    manifest_e=json.loads((INPUT.parent/'manifest-e.json').read_text());assert sha(INPUT)==manifest_e['source_sha256']
    requested=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    genders=[requested[0]] if requested else ['male','female']
    results=[]
    for gender in genders:
        assert gender in ['male','female'];female=gender=='female';label=gender.title()
        bpy.ops.wm.open_mainfile(filepath=str(INPUT));scene=bpy.context.scene
        scene.render.fps=r.FPS;scene.frame_start=1;scene.frame_end=r.END
        collection=bpy.data.collections[label+' | E normalized base'];objects=list(collection.objects)
        before={ob.name:geometry_hash(ob) for ob in objects}
        for other in list(bpy.data.objects):
            if other.type=='MESH' and other not in objects and other.name!='Studio floor':bpy.data.objects.remove(other,do_unlink=True)
        control,calibration=r.create_rig(female)
        weights=r.skin_objects(objects,control,female)
        actions,authored_samples=r.author_actions(control,female)
        pose_samples,ik_errors=sample_actions(control,actions)
        assert all(geometry_hash(ob)==before[ob.name] for ob in objects)
        scene.camera.location=(3,4,2.6);scene.camera.rotation_euler=(Vector((0,0,.9))-scene.camera.location).to_track_quat('-Z','Y').to_euler();scene.camera.data.ortho_scale=2.6
        control.animation_data.action=actions[1];scene.frame_set(1)
        source_path=OUT/(gender+'-controls-f.blend');bpy.ops.wm.save_as_mainfile(filepath=str(source_path))
        deform=make_deform_rig(control,female)
        exports,export_weights=export_meshes(objects,control,deform)
        baked,scale_error=bake_actions(deform,pose_samples)
        # The editable source is already saved. Remove controllers and their
        # actions only from this separate export working scene.
        for ob in objects:bpy.data.objects.remove(ob,do_unlink=True)
        bpy.data.objects.remove(control,do_unlink=True)
        for action in actions:bpy.data.actions.remove(action,do_unlink=True)
        export_path=OUT/(gender+'-baked-f.blend');bpy.ops.wm.save_as_mainfile(filepath=str(export_path))
        bpy.ops.object.select_all(action='DESELECT');deform.select_set(True)
        for ob in exports:ob.select_set(True)
        bpy.context.view_layer.objects.active=deform
        glb_path=OUT/(gender+'-rigged-f.glb')
        result=bpy.ops.export_scene.gltf(filepath=str(glb_path),export_format='GLB',use_selection=True,export_yup=True,export_apply=False,export_animations=True,export_animation_mode='ACTIONS',export_anim_single_armature=True,export_rest_position_armature=True,export_frame_range=True,export_frame_step=1,export_force_sampling=True,export_optimize_animation_size=False,export_skins=True,export_all_influences=False,export_cameras=False,export_lights=False,export_extras=True)
        assert 'FINISHED' in result
        doc=read_glb(glb_path);clips=[animation['name'] for animation in doc.get('animations',[])]
        assert sorted(clips)==sorted(r.CLIPS),clips
        assert doc.get('skins') and all(len(skin['joints'])==len(r.bone_spec(female)) for skin in doc['skins'])
        item={'gender':gender,'glb':glb_path.name,'glb_sha256':sha(glb_path),'bytes':glb_path.stat().st_size,'control_source':source_path.name,'control_source_sha256':sha(source_path),'baked_source':export_path.name,'baked_source_sha256':sha(export_path),'input_e_sha256':sha(INPUT),'fps':r.FPS,'frames':r.END,'duration_seconds':2,'clips':clips,'deform_bones':len(r.bone_spec(female)),'source_geometry_unchanged':True,'maximum_baked_scale_error':scale_error,'ik_goal_max_error':max(item['error'] for item in ik_errors),'calibration':calibration,'source_weights':weights,'export_weights':export_weights,'authored_samples':authored_samples}
        (EV/(gender+'-rig-audit.json')).write_text(json.dumps(item,ensure_ascii=False,indent=2)+'\n')
        (EV/(gender+'-ik-goals.json')).write_text(json.dumps(ik_errors,indent=2)+'\n')
        results.append({key:item[key] for key in ['gender','glb','glb_sha256','bytes','control_source','control_source_sha256','baked_source','baked_source_sha256','input_e_sha256','fps','frames','duration_seconds','clips','deform_bones','source_geometry_unchanged','ik_goal_max_error']})
        print('F_MODEL_COMPLETE '+gender+' '+str(item['ik_goal_max_error']),flush=True)
    previous=OUT/'manifest-f.json'
    old=json.loads(previous.read_text())['models'] if previous.exists() else []
    merged=[item for item in old if item['gender'] not in genders]+results
    previous.write_text(json.dumps({'stage':'F','models':sorted(merged,key=lambda item:item['gender']),'source':'Accepted E geometry with editable IK and standard skeletal skinning','owner_motion_acceptance':'OPEN','game_integration':False},ensure_ascii=False,indent=2)+'\n')


if __name__=='__main__':main()
