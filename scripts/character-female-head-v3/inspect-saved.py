"""Read-only audit of the saved, completed V3 authoring artifact."""
from pathlib import Path
import sys, math, json, hashlib, importlib.util
sys.dont_write_bytecode=True
import bpy

ROOT=Path(__file__).resolve().parents[2]
EV=ROOT/'evidence/character-female-head-v3'
source=Path(__file__).with_name('build.py')
spec=importlib.util.spec_from_file_location('head_authoring',source)
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
path=ROOT/'art-source/character-female-head-v3/female-head-v3.blend'
bpy.ops.wm.open_mainfile(filepath=str(path))
head=a.FemaleHead.__new__(a.FemaleHead)
face=bpy.data.objects['Female V3 · face with connected eyelids and lips']
base_error=0
for j in range(81):
    z=1.522+.354*j/80
    for i in range(128):
        angle=i/128*math.tau;x=head.width(z)*math.sin(angle)
        y=head.center(z)-head.depth(z)*math.cos(angle)
        if math.cos(angle)>0:y=head.skin_surface(x,z)
        actual=face.data.vertices[j*128+i].co
        base_error=max(base_error,max(abs(actual[k]-v) for k,v in enumerate((x,y,z))))
eyes=[ob for ob in bpy.data.collections['Female V3 | authored head'].objects if 'almond eye white' in ob.name]
assert len(eyes)==2
eye_error=0
for ob in eyes:
    ex=ob.data.vertices[0].co.x;side=1 if ex>0 else -1
    for j in range(1,21):
        for i in range(80):
            angle=i/80*math.tau;r=j/20;sine=math.sin(angle)
            dx=.0275*math.cos(angle)*r
            dz=((.0158 if sine>=0 else .0105)*sine*abs(sine)+side*.0025*math.cos(angle))*r
            expected=(ex+dx,-.056-math.sqrt(max(.000001,.034**2-dx*dx-dz*dz)),1.712+dz)
            actual=ob.data.vertices[1+(j-1)*80+i].co
            eye_error=max(eye_error,max(abs(actual[k]-v) for k,v in enumerate(expected)))
assert base_error<1e-6 and eye_error<1e-6
context=json.loads((EV/'context-preservation.json').read_text())
changed=[name for name,sha in context['before'].items() if name not in bpy.data.objects or a.geometry_hash(bpy.data.objects[name])!=sha]
assert not changed,changed
receipt={'source_blend':str(path.relative_to(ROOT)),'source_blend_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'build_script_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'blend_saved_after_script':path.stat().st_mtime>=source.stat().st_mtime,'face_base_vertices_checked':81*128,'face_base_max_error':base_error,'almond_eye_vertices_checked':2*80*20,'almond_eye_max_error':eye_error,'unrelated_meshes_checked':len(context['before']),'unrelated_meshes_changed':changed,'blender':bpy.app.version_string,'save_or_rebuild_performed':False,'pass':True}
assert receipt['blend_saved_after_script']
(EV/'saved-artifact-audit.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2),flush=True)
