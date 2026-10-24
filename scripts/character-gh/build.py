"""G wardrobe variants reuse accepted F control actions without editing F."""
from pathlib import Path
import sys, json, hashlib, math, importlib.util
import bpy, bmesh
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art-source/character-gh'
EV = ROOT / 'evidence/character-gh'
spec = importlib.util.spec_from_file_location('f_build', ROOT / 'scripts/character-f/build.py')
f = importlib.util.module_from_spec(spec); spec.loader.exec_module(f)
CATALOG = json.loads((ROOT / 'src/characters/catalog.json').read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normals(data):
    bm = bmesh.new(); bm.from_mesh(data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(data); bm.free(); data.update()
    for polygon in data.polygons: polygon.use_smooth = True


def crop_trousers(ob, height, label):
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < height], context='VERTS')
    bm.to_mesh(ob.data); bm.free(); ob.data.update()
    ob.name = label
    normals(ob.data)


def mesh(name, vertices, faces, material, rig, female, skirt=False):
    data = bpy.data.meshes.new(name); data.from_pydata(vertices, [], faces); data.update(); normals(data)
    ob = bpy.data.objects.new(name, data); bpy.context.scene.collection.objects.link(ob)
    data.materials.append(material)
    sub = ob.modifiers.new('G | continuous quad smoothing', 'SUBSURF'); sub.levels = 2; sub.render_levels = 2
    if skirt:
        solid = ob.modifiers.new('G | fabric thickness', 'SOLIDIFY'); solid.thickness = .003; solid.offset = -1
    groups = {name: ob.vertex_groups.new(name=name) for name in f.r.bone_spec(female)}
    scale = .955 if female else 1
    for v in data.vertices:
        if skirt:
            z = v.co.z / scale
            pelvis = f.r.smooth(.79, .93, z)
            right = f.r.smooth(-.065, .065, v.co.x)
            thigh = f.r.smooth(.46, .59, z)
            weights = {'DEF_pelvis': pelvis,
                'DEF_thigh.L': (1-pelvis)*right*thigh,
                'DEF_thigh.R': (1-pelvis)*(1-right)*thigh,
                'DEF_shin.L': (1-pelvis)*right*(1-thigh),
                'DEF_shin.R': (1-pelvis)*(1-right)*(1-thigh)}
        else:
            # Continuous exposed legs use the same knee support as F trousers.
            weights = f.r.weights_for('G trouser anatomical leg', v.co, female)
        total = sum(weights.values())
        for name, value in weights.items():
            if value > 1e-8: groups[name].add([v.index], value/total, 'REPLACE')
    mod = ob.modifiers.new('G | standard linear skin', 'ARMATURE'); mod.object = rig
    mod.use_deform_preserve_volume = False; ob.parent = rig; ob.matrix_parent_inverse = Matrix.Identity(4)
    return ob


def legs(material, rig, female):
    scale = .955 if female else 1; width = .87 if female else 1
    result = []
    levels = [(.10,.034,.040),(.12,.035,.041),(.16,.038,.043),(.25,.050,.052),
        (.34,.054,.056),(.43,.051,.052),(.47,.052,.054),(.49,.054,.055),
        (.51,.055,.057),(.53,.056,.058),(.55,.057,.059),(.59,.061,.063),
        (.67,.059,.059),(.75,.058,.058),(.84,.050,.050),(.90,.045,.045)]
    for side in [-1,1]:
        verts=[]; faces=[]; count=16
        for j,(z,rx,ry) in enumerate(levels):
            centre=side*(.102+.004*math.sin((z-.1)/.8*math.pi))*width
            for i in range(count):
                a=i/count*math.tau
                verts.append((centre+rx*width*math.sin(a),.012-ry*math.cos(a),z*scale))
                if j:
                    q=j*count+i; previous=(j-1)*count+i
                    faces.append((previous,(j-1)*count+(i+1)%count,j*count+(i+1)%count,q))
        result.append(mesh('G | continuous exposed leg '+str(side),verts,faces,material,rig,female))
    return result


def shorts_coverage(trouser, exposed, rig):
    rig.data.pose_position='REST';bpy.context.view_layer.update()
    dg=bpy.context.evaluated_depsgraph_get()
    def tree(objects):
        points=[];faces=[]
        for ob in objects:
            data=bpy.data.meshes.new_from_object(ob.evaluated_get(dg),depsgraph=dg)
            offset=len(points);points.extend(v.co.copy() for v in data.vertices)
            faces.extend(tuple(offset+i for i in p.vertices) for p in data.polygons)
            bpy.data.meshes.remove(data)
        return BVHTree.FromPolygons(points,faces),points
    fabric,_=tree([trouser]);skin,points=tree(exposed)
    checked=0;bad=[]
    for p in points[::7]:
        if not .69<p.z<.89:continue
        origin=Vector((p.x,-3,p.z));direction=Vector((0,1,0))
        skin_hit=skin.ray_cast(origin,direction,6);fabric_hit=fabric.ray_cast(origin,direction,6)
        if skin_hit[0] is None:continue
        checked+=1
        if fabric_hit[0] is None or skin_hit[3]<fabric_hit[3]-.001:
            bad.append([float(p.x),float(p.z)])
    rig.data.pose_position='POSE';bpy.context.view_layer.update()
    assert checked>50 and not bad,('Exposed skin above shorts hem',checked,bad[:10])
    return checked


def skirt(material, rig, short):
    hem=.65 if short else .34
    levels=sorted(set([hem,hem+.012]+[z for z in [.39,.45,.48,.505,.53,.555,.58,.64,.70,.76,.80,.84,.88,.93,.98,1.025] if z>hem+.02]))
    verts=[];faces=[];count=32
    for j,z in enumerate(levels):
        flare=(1.025-z)/(1.025-hem)
        rx=(.178+.060*flare)*.87
        front=.108+.020*flare;back=.118+.025*flare
        for i in range(count):
            a=i/count*math.tau; c=math.cos(a)
            # Subtle vertical cloth channels, not separate blocks or joints.
            fold=1+.010*flare*math.cos(a*8)
            verts.append((rx*math.sin(a)*fold,.015-(front if c>=0 else back)*c*fold,z*.955))
            if j:
                faces.append(((j-1)*count+i,(j-1)*count+(i+1)%count,j*count+(i+1)%count,j*count+i))
    return mesh('G | separate A-line '+('short' if short else 'long')+' skirt',verts,faces,material,rig,True,True)


def long_hair(objects):
    hair=next(ob for ob in objects if 'rounded bob back' in ob.name)
    hair.data=hair.data.copy()
    for vertex in hair.data.vertices:
        p=vertex.co; weight=1-f.r.smooth(1.43,1.565,p.z)
        p.z-=.235*weight
        p.x*=1-.055*weight
        p.y+=(max(.17,p.y)-p.y)*weight
    if hair.data.has_custom_normals:
        hair.data.normals_split_custom_set([(0,0,0)]*len(hair.data.loops))
    hair.data.update()
    hair['wardrobe_change']='Long back layers; accepted face, fringe and ear tuck retained'
    return hair.name


def main():
    requested=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else list(CATALOG)
    f_manifest=json.loads((ROOT/'art-source/character-f/manifest-f.json').read_text())
    report=[]
    for model_id in requested:
        meta=CATALOG[model_id];gender=meta['gender'];female=gender=='female'
        item=next(item for item in f_manifest['models'] if item['gender']==gender)
        source=ROOT/'art-source/character-f'/item['control_source']
        assert sha(source)==item['control_source_sha256']
        bpy.ops.wm.open_mainfile(filepath=str(source))
        rig=next(ob for ob in bpy.data.objects if ob.type=='ARMATURE')
        objects=[ob for ob in bpy.data.objects if ob.type=='MESH' and ob.name!='Studio floor']
        before={ob.name:f.geometry_hash(ob) for ob in objects}
        allowed=set()
        trouser=next(ob for ob in objects if 'continuous trousers' in ob.name)
        cloth=trouser.data.materials[0]
        skin=next(ob for ob in objects if 'continuous forearm hand' in ob.name).data.materials[0]
        if meta['bottom']!='trousers':
            allowed.add(trouser.name)
            if meta['bottom']=='shorts':
                crop_trousers(trouser,.62,'G | tailored trouser shorts')
            else:
                crop_trousers(trouser,.79*.955,'G | concealed trouser lining')
                for ob in list(objects):
                    if 'slanted trouser pocket' in ob.name:
                        allowed.add(ob.name);objects.remove(ob);bpy.data.objects.remove(ob,do_unlink=True)
                objects.append(skirt(cloth,rig,meta['bottom']=='skirt-short'))
            objects.extend(legs(skin,rig,female))
        coverage_rays=shorts_coverage(trouser,[ob for ob in objects if 'continuous exposed leg' in ob.name],rig) if meta['bottom']=='shorts' else None
        if meta['hair']=='long':allowed.add(long_hair(objects))
        for ob in objects:
            if ob.name in before and ob.name not in allowed:assert f.geometry_hash(ob)==before[ob.name],ob.name
        actions=[bpy.data.actions['CONTROL | '+clip] for clip in f.r.CLIPS]
        samples,errors=f.sample_actions(rig,actions)
        assert max(row['error'] for row in errors)<.001
        controls=ART/(model_id+'-controls.blend')
        rig['appearance_id']=model_id
        bpy.ops.wm.save_as_mainfile(filepath=str(controls))
        deform=f.make_deform_rig(rig,female)
        exports,weights=f.export_meshes(objects,rig,deform)
        f.bake_actions(deform,samples)
        for ob in objects:bpy.data.objects.remove(ob,do_unlink=True)
        bpy.data.objects.remove(rig,do_unlink=True)
        for action in actions:bpy.data.actions.remove(action,do_unlink=True)
        bpy.ops.object.select_all(action='DESELECT');deform.select_set(True)
        for ob in exports:ob.select_set(True)
        bpy.context.view_layer.objects.active=deform
        glb=ART/(model_id+'.glb')
        bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,export_yup=True,
            export_animations=True,export_animation_mode='ACTIONS',export_anim_single_armature=True,
            export_rest_position_armature=True,export_frame_range=True,export_frame_step=1,
            export_force_sampling=True,export_optimize_animation_size=False,export_skins=True,
            export_all_influences=False,export_cameras=False,export_lights=False,export_extras=True)
        doc=f.read_glb(glb)
        assert sorted(a['name'] for a in doc['animations'])==sorted(f.r.CLIPS)
        result={'id':model_id,**meta,'source':controls.name,'source_sha256':sha(controls),
            'glb':glb.name,'glb_sha256':sha(glb),'input_f_sha256':item['control_source_sha256'],
            'clips':sorted(f.r.CLIPS),'skin_joints':22,'changed_parts':sorted(allowed),
            'unchanged_original_parts':len(before)-len(allowed),'max_skin_influences':max(r['max_influences'] for r in weights)}
        result['shorts_coverage_rays']=coverage_rays
        report.append(result)
        old=ART/'manifest-g.json'
        previous=json.loads(old.read_text())['models'] if old.exists() else []
        previous=[row for row in previous if row['id']!=model_id]+[result]
        old.write_text(json.dumps({'stage':'G','models':sorted(previous,key=lambda x:list(CATALOG).index(x['id']))},ensure_ascii=False,indent=2)+'\n')
        print('G_MODEL_COMPLETE '+model_id,flush=True)


if __name__=='__main__':main()
