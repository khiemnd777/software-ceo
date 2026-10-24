"""G rest silhouettes and worst-case seated/walking views from reimported GLBs."""
from pathlib import Path
import sys,json,hashlib,importlib.util
import bpy
spec=importlib.util.spec_from_file_location('g_scene',Path(__file__).with_name('scene.py'));s=importlib.util.module_from_spec(spec);spec.loader.exec_module(s)
ROOT=s.ROOT;EV=ROOT/'evidence/character-gh';args=sys.argv[sys.argv.index('--')+1:]
records=[]
for model_id in args:
    model,rig,actions=s.load(model_id);scene=bpy.context.scene;props=s.review.furniture()
    for view,clip,time in [('front','rest',0),('back','rest',0),('seated','working',.5),('walk','walk',.25)]:
        if clip=='rest':
            rig.data.pose_position='REST';s.review.show_furniture(props,False)
            eye=(2.5,-7,2.5) if view=='front' else (0,6,1.0)
            from mathutils import Vector
            scene.camera.location=eye;scene.camera.rotation_euler=(Vector((0,0,.92))-scene.camera.location).to_track_quat('-Z','Y').to_euler();scene.camera.data.ortho_scale=2.15
            scene.render.resolution_x=650;scene.render.resolution_y=750;scene.render.resolution_percentage=100
        else:
            s.pose(rig,actions,clip,time);s.review.show_furniture(props,clip!='walk')
            s.review.camera(scene,'side',2.45,(750,700),clip=='walk')
        scene.render.threads_mode='FIXED';scene.render.threads=8;scene.cycles.device='CPU';scene.cycles.samples=16;scene.cycles.use_denoising=True
        scene.render.film_transparent=False;scene.use_nodes=True
        path=EV/'studies'/(model_id+'-'+view+'.png');path.parent.mkdir(exist_ok=True)
        scene.render.filepath=str(path);bpy.ops.render.render(write_still=True)
        records.append({'id':model_id,'view':view,'glb_sha256':model['glb_sha256'],'file':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
        print('G_STUDY '+model_id+' '+view,flush=True)
(EV/('study-'+args[0]+'.json')).write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
