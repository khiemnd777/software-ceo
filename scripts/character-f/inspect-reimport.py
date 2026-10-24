"""Inspect actual imported animation actions/tracks before render playback."""
from pathlib import Path
import bpy,json
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'art-source/character-f/female-rigged-f.glb'))
rig=next(ob for ob in bpy.data.objects if ob.type=='ARMATURE')
result={'rig':rig.name,'actions':[{'name':a.name,'range':list(a.frame_range),'slots':[s.identifier for s in a.slots]} for a in bpy.data.actions], 'tracks':[]}
for track in rig.animation_data.nla_tracks:
    result['tracks'].append({'name':track.name,'mute':track.mute,'strips':[{'name':s.name,'action':s.action.name,'slot':s.action_slot.identifier if s.action_slot else None,'start':s.frame_start,'end':s.frame_end} for s in track.strips]})
(ROOT/'evidence/character-f/reimport-inspection.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
