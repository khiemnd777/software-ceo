"""Inspect key poses from editable F control actions before bulk renders."""
from pathlib import Path
import sys,json,hashlib,importlib.util
import bpy

ROOT=Path(__file__).resolve().parents[2];EV=ROOT/'evidence/character-f';ART=ROOT/'art-source/character-f'
spec=importlib.util.spec_from_file_location('review_scene',Path(__file__).with_name('review-scene.py'));s=importlib.util.module_from_spec(spec);spec.loader.exec_module(s)
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else ['male']
gender=args[0];bpy.ops.wm.open_mainfile(filepath=str(ART/(gender+'-controls-f.blend')))
rig=next(ob for ob in bpy.data.objects if ob.type=='ARMATURE');scene=bpy.context.scene;props=s.furniture();scene.cycles.samples=24
studies=[]
for clip,frame in [('working',13),('idle',1),('walk',19),('stand-up',25),('stand-up',49),('alert',13),('meeting',13)]:
    if len(args)>1 and clip not in args[1:]:continue
    rig.animation_data.action=bpy.data.actions['CONTROL | '+clip];scene.frame_set(frame);bpy.context.view_layer.update()
    s.show_furniture(props,clip!='walk');s.camera(scene,'side',2.45,(1000,900),clip=='walk')
    path=EV/(gender+'-'+clip+'-'+str(frame)+'-study.png');scene.render.filepath=str(path);bpy.ops.render.render(write_still=True)
    studies.append({'clip':clip,'frame':frame,'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    print('F_STUDY '+path.name,flush=True)
(EV/(gender+'-study-receipt.json')).write_text(json.dumps({'source':'editable IK control source','renders':studies},indent=2)+'\n')
