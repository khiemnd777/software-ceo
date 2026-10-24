"""H: real skeletal GLB frames, V4 camera/scale and normalized walk roots."""
from pathlib import Path
import sys,json,hashlib,math,struct,importlib.util
import bpy
from mathutils import Matrix,Vector

sys.dont_write_bytecode=True
spec=importlib.util.spec_from_file_location('g_scene',Path(__file__).with_name('scene.py'))
s=importlib.util.module_from_spec(spec);spec.loader.exec_module(s)
ROOT=s.ROOT;ART=ROOT/'art-source/character-gh';EV=ROOT/'evidence/character-gh'
TRACKS=['idle','working','meeting','alert','stand','turnRight','walkRight','turnLeft','walkLeft']
SIZE=192;PPM=256/2.9;ANCHOR=[SIZE/2,SIZE/2+.8*math.cos(math.pi/6)*PPM]


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def signature(rig):
    values=[round(float(x),5) for bone in rig.pose.bones for row in (rig.matrix_world@bone.matrix) for x in row]
    return hashlib.sha256(struct.pack('<'+'f'*len(values),*values)).hexdigest()


def main():
    args=sys.argv[sys.argv.index('--')+1:]
    probe='probe' in args
    requested=[x for x in args if x!='probe']
    for model_id in requested:
        model,rig,actions=s.load(model_id);scene=bpy.context.scene
        base=rig.matrix_world.copy();centre=Vector((0,-.08,0))
        s.pose(rig,actions,'stand-up',2)
        standing={b.name:b.matrix_basis.copy() for b in rig.pose.bones}
        s.pose(rig,actions,'walk',0)
        rig.animation_data.action=None
        root=rig.pose.bones['DEF_root'];root.matrix=Matrix.Translation(centre)@root.matrix
        bpy.context.view_layer.update()
        walk_start={b.name:b.matrix_basis.copy() for b in rig.pose.bones}
        camera=scene.camera;camera.location=(6,-6,5.698979486)
        camera.rotation_euler=(Vector((0,0,.8))-camera.location).to_track_quat('-Z','Y').to_euler()
        camera.data.ortho_scale=SIZE/PPM
        scene.render.resolution_x=SIZE;scene.render.resolution_y=SIZE;scene.render.resolution_percentage=100
        scene.render.film_transparent=True;scene.use_nodes=False
        bpy.data.objects['Studio floor'].hide_render=True
        scene.render.threads_mode='FIXED';scene.render.threads=8;scene.cycles.device='CPU'
        scene.cycles.samples=12;scene.cycles.use_denoising=True;scene.cycles.use_animated_seed=False;scene.cycles.seed=13
        settings={'glb_sha256':model['glb_sha256'],'script_sha256':sha(Path(__file__)),
            'scene_script_sha256':sha(Path(__file__).with_name('scene.py')),'size':SIZE,'samples':12,
            'camera':[6,-6,5.698979486],'target':[0,0,.8],'pixels_per_meter':PPM,'anchor':ANCHOR,
            'frame_count':16,'fps':8,'walk_root_normalized':True,'turn_recipe':'F stand end -> F walk start skeletal blend; whole-body yaw about standing centre'}
        receipt_path=EV/(model_id+'-sprite-receipt.json')
        previous=json.loads(receipt_path.read_text()) if receipt_path.exists() else {}
        frames={item['key']:item for item in previous.get('frames',[])} if previous.get('settings')==settings else {}
        for track in TRACKS:
            for i in range(16):
                if probe and (track,i) not in [('idle',0),('working',0),('stand',15),('walkRight',2),('walkLeft',2)]:continue
                key=track+'/'+str(i);path=EV/'sprite-frames'/model_id/track/f'{i:02d}.png'
                old=frames.get(key)
                if old and path.is_file() and sha(path)==old['sha256']:continue
                rig.matrix_world=base
                if track.startswith('turn'):
                    u=i/15;t=max(0,min(1,(u-.65)/.35));blend=t*t*(3-2*t)
                    rig.animation_data.action=None
                    for bone in rig.pose.bones:
                        a,q,scale=standing[bone.name].decompose();b,r,other_scale=walk_start[bone.name].decompose()
                        if q.dot(r)<0:r.negate()
                        bone.matrix_basis=Matrix.LocRotScale(a.lerp(b,blend),q.slerp(r,blend),scale.lerp(other_scale,blend))
                    angle=(-1 if track=='turnRight' else 1)*math.pi/2*u
                    transform=Matrix.Translation(centre)@Matrix.Rotation(angle,4,'Z')@Matrix.Translation(-centre)
                    source_clip='stand-up + walk';source_time=2
                else:
                    source_clip='stand-up' if track=='stand' else 'walk' if track.startswith('walk') else track
                    source_time=2*i/(15 if track=='stand' else 16)
                    s.pose(rig,actions,source_clip,source_time)
                    transform=Matrix.Identity(4)
                    if track.startswith('walk'):
                        angle=(-1 if track=='walkRight' else 1)*math.pi/2
                        transform=Matrix.Translation(centre)@Matrix.Rotation(angle,4,'Z')@Matrix.Translation((0,-.46*source_time,0))
                rig.matrix_world=transform@base;bpy.context.view_layer.update()
                root_position=list(rig.matrix_world@rig.pose.bones['DEF_root'].head)
                if track.startswith('walk'):assert (Vector(root_position)-centre).length<.0001,root_position
                pose_hash=signature(rig)
                path.parent.mkdir(parents=True,exist_ok=True);scene.render.filepath=str(path)
                bpy.ops.render.render(write_still=True)
                frames[key]={'key':key,'file':str(path.relative_to(ROOT)),'sha256':sha(path),
                    'pose_sha256':pose_hash,'source_clip':source_clip,'source_time':source_time,'root_position':root_position}
                receipt_path.write_text(json.dumps({'id':model_id,'settings':settings,'frames':list(frames.values())},indent=2)+'\n')
                print('H_SPRITE '+model_id+' '+key,flush=True)
        if not probe:
            assert len(frames)==144,(model_id,len(frames))
            for track in TRACKS:
                hashes={row['pose_sha256'] for row in frames.values() if row['key'].split('/')[0]==track}
                assert len(hashes)>=8,(model_id,track,'Insufficient real 3D pose variation',len(hashes))
        print('H_SPRITE_MODEL_COMPLETE '+model_id,flush=True)


if __name__=='__main__':main()
