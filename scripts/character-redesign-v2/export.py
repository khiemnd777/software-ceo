"""Bake a bounded static mesh for review, export GLB, then reimport it.

The authored quad cages remain in characters-v2.blend. These reduced static
exports are not claimed to have animation retopology, skinning or a final LOD.
"""
from pathlib import Path
import bpy, json, hashlib, math
from mathutils import Vector, Matrix

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art-source/character-redesign-v2'
EVIDENCE=ROOT/'evidence/character-redesign-v2'


def triangles(data):
    data.calc_loop_triangles();return len(data.loop_triangles)


def budget(name):
    if 'continuous face' in name:return 5000
    if 'hair volume' in name or 'side-swept bob' in name:return 4500
    if 'continuous tailored' in name:return 4000
    if 'continuous trousers' in name:return 3500
    if 'forearm hand' in name:return 1800
    if 'shaped neck' in name:return 600
    if 'eyelid loops' in name:return 500
    if 'scleral' in name:return 350
    if 'sneaker upper' in name:return 700
    if 'rubber outsole' in name:return 350
    if 'collar' in name:return 350
    if 'ear outer' in name:return 300
    if 'inner tee' in name:return 600
    return 180


def validate_model(objects):
    coords=[];finite=True;counts={'vertices':0,'triangles':0,'objects':len(objects),'armatures':0}
    for ob in objects:
        if ob.type=='ARMATURE':counts['armatures']+=1
        if ob.type!='MESH':continue
        counts['vertices']+=len(ob.data.vertices);counts['triangles']+=triangles(ob.data)
        coords.extend(ob.matrix_world@v.co for v in ob.data.vertices)
        finite &= all(math.isfinite(x) for v in ob.data.vertices for x in v.co)
    lo=[min(v[i] for v in coords) for i in range(3)];hi=[max(v[i] for v in coords) for i in range(3)]
    assert finite and counts['vertices']>0
    assert all(hi[i]-lo[i]<2.1 for i in range(3)),(lo,hi)
    assert 1.7<hi[2]-lo[2]<2.1,(lo,hi)
    assert abs((hi[0]+lo[0])/2)<.01,'GLB must be centred on its own feet'
    assert -.005<=lo[2]<=.015,'Feet must remain on the metric ground plane'
    assert counts['armatures']==0
    return {**counts,'bounds_blender_z_up':{'min':lo,'max':hi},'finite_positions':finite}


def main():
    bpy.ops.wm.open_mainfile(filepath=str(OUT/'characters-v2.blend'))
    dg=bpy.context.evaluated_depsgraph_get();manifest=[]
    for gender,offset in [('Male',-.45),('Female',.45)]:
        collection=bpy.data.collections[gender+' | authored model'];copies=[];before=0
        bpy.ops.object.select_all(action='DESELECT')
        for src in sorted(collection.objects,key=lambda ob:ob.name):
            if src.type!='MESH':continue
            data=bpy.data.meshes.new_from_object(src.evaluated_get(dg),preserve_all_data_layers=True,depsgraph=dg)
            before+=triangles(data)
            ob=bpy.data.objects.new(src.name+' [static]',data);bpy.context.scene.collection.objects.link(ob)
            transform=Matrix.Translation(Vector((-offset,0,0)))@src.matrix_world
            for v in data.vertices:v.co=transform@v.co
            ob.matrix_world.identity();bpy.context.view_layer.objects.active=ob
            n=triangles(data);target=budget(src.name)
            if n>target:
                mod=ob.modifiers.new('Static review triangle budget','DECIMATE');mod.ratio=target/n;mod.use_collapse_triangulate=True
                bpy.ops.object.modifier_apply(modifier=mod.name)
            for p in data.polygons:p.use_smooth=True
            copies.append(ob)
        bpy.ops.object.select_all(action='DESELECT')
        for ob in copies:ob.select_set(True)
        bpy.context.view_layer.objects.active=copies[0]
        filename=gender.lower()+'-static-v2.glb'
        result=bpy.ops.export_scene.gltf(filepath=str(OUT/filename),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_animations=False,export_cameras=False,export_lights=False,export_extras=True)
        assert 'FINISHED' in result
        metadata=validate_model(copies)
        metadata.update({'gender':gender,'file':filename,'bytes':(OUT/filename).stat().st_size,'sha256':hashlib.sha256((OUT/filename).read_bytes()).hexdigest(),'source_evaluated_triangles':before,'pose':'static standing; no rig','reduction':'per-feature collapse; source cages preserved'})
        manifest.append(metadata)
        for ob in copies:bpy.data.objects.remove(ob,do_unlink=True)
    # Replace authoring objects in this in-memory review scene by real imports.
    for gender in ['Male','Female']:
        for ob in list(bpy.data.collections[gender+' | authored model'].objects):bpy.data.objects.remove(ob,do_unlink=True)
    for metadata,offset in zip(manifest,[-.45,.45]):
        previous=set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=str(OUT/metadata['file']))
        imported=list(set(bpy.data.objects)-previous)
        actual=validate_model(imported)
        assert actual['triangles']==metadata['triangles'],(actual,metadata)
        collection=bpy.data.collections.new(metadata['gender']+' | imported GLB');bpy.context.scene.collection.children.link(collection)
        for ob in imported:
            ob.location.x+=offset
            for old in list(ob.users_collection):old.objects.unlink(ob)
            collection.objects.link(ob)
        metadata['roundtrip']=actual
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'export-review-v2.blend'))
    receipt={'blender':bpy.app.version_string,'scope':'two static models, separate trousers, male short hair and female bob; no rig or game integration','models':manifest,'owner_art_acceptance':'OPEN','technical_limits':['static collapse meshes are not deformation retopology','no motion, skirt, long hair or other wardrobe variant acceptance','no performance or shipping acceptance']}
    (OUT/'manifest.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(receipt,ensure_ascii=False,indent=2),flush=True)


if __name__=='__main__':main()
