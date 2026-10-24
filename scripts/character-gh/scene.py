"""Load one exact G binary into the accepted Blender review studio."""
from pathlib import Path
import json, hashlib, importlib.util
import bpy

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('review_scene',ROOT/'scripts/character-f/review-scene.py')
review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)


def load(model_id):
    art=ROOT/'art-source/character-gh';manifest=json.loads((art/'manifest-g.json').read_text())
    model=next(m for m in manifest['models'] if m['id']==model_id)
    assert hashlib.sha256((art/model['glb']).read_bytes()).hexdigest()==model['glb_sha256']
    bpy.ops.wm.open_mainfile(filepath=str(art/model['source']))
    for ob in list(bpy.data.objects):
        if ob.type=='ARMATURE' or (ob.type=='MESH' and ob.name!='Studio floor'):bpy.data.objects.remove(ob,do_unlink=True)
    for action in list(bpy.data.actions):bpy.data.actions.remove(action,do_unlink=True)
    bpy.ops.import_scene.gltf(filepath=str(art/model['glb']))
    rig=next(ob for ob in bpy.data.objects if ob.type=='ARMATURE')
    actions={}
    for track in rig.animation_data.nla_tracks:
        track.mute=True
        strip=track.strips[0];actions[track.name]=(strip.action,strip.action_slot)
    assert len(actions)==6
    rig.animation_data.action=None
    return model,rig,actions


def pose(rig,actions,clip,time):
    rig.data.pose_position='POSE'
    action,slot=actions[clip];rig.animation_data.action=action;rig.animation_data.action_slot=slot
    frame=1+time*24
    bpy.context.scene.frame_set(int(frame),subframe=frame-int(frame));bpy.context.view_layer.update()
