"""Export only the corrected female head; render exact before/after cameras."""
from pathlib import Path
import sys, math, json, hashlib, importlib.util
sys.dont_write_bytecode=True
import bpy
from mathutils import Matrix,Vector

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art-source/character-female-head-v3'
EV=ROOT/'evidence/character-female-head-v3'
spec=importlib.util.spec_from_file_location('female_head',Path(__file__).with_name('build.py'))
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)


def triangles(data):data.calc_loop_triangles();return len(data.loop_triangles)


def budget(name):
    if 'face with' in name:return 8000
    if 'bob back' in name:return 2200
    if 'side-swept fringe' in name:return 1800
    if 'temple section' in name:return 1200
    if 'fitted scalp' in name:return 1000
    if 'iris' in name or 'eye white' in name:return 900
    if 'pupil' in name:return 280
    if 'ear' in name:return 400
    return 250


def main():
    bpy.ops.wm.open_mainfile(filepath=str(OUT/'female-head-v3.blend'))
    scene=bpy.context.scene;scene.cycles.samples=48
    source=bpy.data.collections['Female V3 | authored head'];copies=[];before_count=0
    dg=bpy.context.evaluated_depsgraph_get()
    for src in sorted(source.objects,key=lambda ob:ob.name):
        data=bpy.data.meshes.new_from_object(src.evaluated_get(dg),preserve_all_data_layers=True,depsgraph=dg)
        before_count+=triangles(data)
        transform=Matrix.Translation(Vector((-.45,0,0)))@src.matrix_world
        for v in data.vertices:v.co=transform@v.co
        ob=bpy.data.objects.new(src.name+' [static head]',data);scene.collection.objects.link(ob);bpy.context.view_layer.objects.active=ob
        total=triangles(data)
        if total>budget(src.name):
            mod=ob.modifiers.new('Static art-review reduction','DECIMATE');mod.ratio=budget(src.name)/total;mod.use_collapse_triangulate=True;bpy.ops.object.modifier_apply(modifier=mod.name)
        for p in ob.data.polygons:p.use_smooth=True
        copies.append(ob)
    bpy.ops.object.select_all(action='DESELECT')
    for ob in copies:ob.select_set(True)
    bpy.context.view_layer.objects.active=copies[0]
    path=OUT/'female-head-v3.glb'
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_animations=False,export_cameras=False,export_lights=False)
    expected_triangles=sum(triangles(ob.data) for ob in copies)
    for ob in copies:bpy.data.objects.remove(ob,do_unlink=True)
    for ob in list(source.objects):bpy.data.objects.remove(ob,do_unlink=True)
    previous=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(path));new=list(set(bpy.data.objects)-previous)
    assert sum(triangles(ob.data) for ob in new if ob.type=='MESH')==expected_triangles
    collection=bpy.data.collections.new('Female V3 | imported GLB head');scene.collection.children.link(collection)
    for ob in new:
        ob.location.x+=.45
        for c in list(ob.users_collection):c.objects.unlink(ob)
        collection.objects.link(ob)
    # Original V2 head, imported from its already-delivered GLB. Body objects
    # from that import are discarded; the unchanged source body is the context.
    before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(ROOT/'art-source/character-redesign-v2/female-static-v2.glb'));old_all=list(set(bpy.data.objects)-before)
    keywords=['continuous face','shaped scleral','iris','pupil','integrated eyelid','fine upper','tapered eyebrow','ear outer','ear concha','lip line','lower lip','soft nostril','side-swept bob']
    old_collection=bpy.data.collections.new('Female V2 | before comparison');scene.collection.children.link(old_collection)
    old=[]
    for ob in old_all:
        if not any(k in ob.name for k in keywords):bpy.data.objects.remove(ob,do_unlink=True);continue
        ob.location.x+=.45
        for c in list(ob.users_collection):c.objects.unlink(ob)
        old_collection.objects.link(ob);ob.hide_render=True;old.append(ob)
    bpy.context.view_layer.update()
    inputs={'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'triangles':expected_triangles,'source_evaluated_triangles':before_count,'source_blend_sha256':hashlib.sha256((OUT/'female-head-v3.blend').read_bytes()).hexdigest(),'scope':'Head only. Original body and male are not exported or changed.','rig':False}
    (OUT/'manifest.json').write_text(json.dumps(inputs,indent=2)+'\n')
    camera=scene.camera;camera.data.ortho_scale=.46;scene.render.resolution_x=1000;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
    target=Vector((.45,0,1.555));poses=[('front',(.45,-5,1.555)),('three-quarter',(4,-4,1.65)),('profile',(5,0,1.555))]
    receipt=[]
    def shoot(name,eye):
        camera.location=eye;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(EV/(name+'.png'));bpy.ops.render.render(write_still=True)
        p=EV/(name+'.png');receipt.append({'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'eye':eye,'target':list(target),'ortho_scale':.46,'render_size':[1000,1100]})
        print('REVIEW '+name,flush=True)
    for name,eye in poses:shoot('new-'+name,eye)
    clay=a.a.material('V3 review clay','BCB8B0',.86);scene.view_layers[0].material_override=clay
    for name,eye in poses:shoot('new-'+name+'-clay',eye)
    scene.view_layers[0].material_override=None
    for ob in new:ob.hide_render=True
    for ob in old:ob.hide_render=False
    for name,eye in poses:shoot('previous-'+name,eye)
    for ob in new:ob.hide_render=False
    for ob in old:ob.hide_render=True
    camera.location=poses[1][1];camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'head-review-reimported.blend'))
    (EV/'render-receipt.json').write_text(json.dumps({'input':inputs,'samples':48,'renders':receipt,'lighting':'Identical existing V2 Blender studio for all new and previous heads','comparison':'V2 and V3 GLB heads reimported; same body context, camera, framing and lights','owner_art_acceptance':'OPEN'},indent=2)+'\n')
    print(json.dumps(inputs,indent=2),flush=True)


if __name__=='__main__':main()
