"""Read the accepted E source and installed Blender export API; no saves."""
from pathlib import Path
import json
import bpy

ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art-source/character-eh/base-models-e.blend'))
result={'blender':bpy.app.version_string,'models':{},'gltf_animation_options':{}}
for gender in ['Male','Female']:
    result['models'][gender]=[]
    for ob in bpy.data.collections[gender+' | E normalized base'].objects:
        if ob.type!='MESH':continue
        coords=[ob.matrix_world@v.co for v in ob.data.vertices]
        result['models'][gender].append({'name':ob.name,'vertices':len(coords),'polygons':len(ob.data.polygons),'bounds':{'min':[min(p[i] for p in coords) for i in range(3)],'max':[max(p[i] for p in coords) for i in range(3)]},'modifiers':[{'name':m.name,'type':m.type} for m in ob.modifiers]})
for prop in bpy.ops.export_scene.gltf.get_rna_type().properties:
    if any(term in prop.identifier for term in ['animation','action','nla','sample','armature','deform','apply','skin']):
        item={'type':prop.type,'description':prop.description}
        if prop.type=='ENUM':item['items']=[(v.identifier,v.name) for v in prop.enum_items]
        result['gltf_animation_options'][prop.identifier]=item
(ROOT/'evidence/character-f/input-inspection.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result['gltf_animation_options'],indent=2))
