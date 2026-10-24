"""E: normalized full-body sources, preserving the approved female GLB head.

No rig, shipping sprites, or game writes before the planned full-body review.
The trouser cage has explicit quad loops and a connected crotch bridge instead
of treating the earlier sculpt voxel grid as deformation retopology.
"""
from pathlib import Path
import hashlib
import json
import math
import sys
import bpy
import bmesh
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'art-source/character-eh'
EV = ROOT / 'evidence/character-eh'
SOURCE = ROOT / 'art-source/character-female-head-v3/female-head-v3.blend'
APPROVED = ROOT / 'art-source/character-female-head-v3/female-head-v3.glb'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def mesh_hash(data):
    import struct
    h = hashlib.sha256()
    for v in data.vertices:
        h.update(struct.pack('<3f', *v.co))
    for face in data.polygons:
        h.update(struct.pack('<I', len(face.vertices)))
        for index in face.vertices:
            h.update(struct.pack('<I', index))
    return h.hexdigest()


def clean_normals(data):
    bm = bmesh.new()
    bm.from_mesh(data)
    # Do not weld facial surfaces or hair layers: coincident boundaries can
    # carry intentional discontinuities in the approved imported head.
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(data)
    bm.free()
    data.update()


def trouser_cage(source, collection, offset, female):
    scale = .955 if female else 1
    width = .87 if female else 1
    dg = bpy.context.evaluated_depsgraph_get()
    evaluated = source.evaluated_get(dg)
    original = bpy.data.meshes.new_from_object(evaluated, depsgraph=dg)
    transform = Matrix.Translation((-offset, 0, 0)) @ source.matrix_world
    points = [transform @ v.co for v in original.vertices]
    bvh = BVHTree.FromPolygons(points, [list(f.vertices) for f in original.polygons], all_triangles=False)
    vertices, faces, leg_tops = [], [], {}
    sides, ring_size = [-1, 1], 16
    # Five support rings around each knee; proximal rings support hip flexion.
    heights = [.105, .115, .15, .22, .31, .40, .455, .48, .505, .53, .555, .58, .64, .70, .76, .80, .84]
    for side in sides:
        rings = []
        for z in heights:
            t = (z - .105) / .815
            def lerp(values):
                f = t*(len(values)-1); k = min(int(f), len(values)-2); u = f-k
                return values[k]*(1-u) + values[k+1]*u
            cx = side*lerp([.102,.103,.105,.110,.100])*width
            rx = lerp([.054,.054,.061,.080,.090])*width
            ry = lerp([.057,.058,.064,.078,.092])
            ring = []
            for i in range(ring_size):
                a = i/ring_size*math.tau
                p = Vector((cx+rx*math.sin(a), .012-ry*math.cos(a), z*scale))
                nearest = bvh.find_nearest(p)
                # Project cage vertices to the authored sculpt in rest pose;
                # the coherent connectivity and knee loop layout stay manual.
                if nearest[0] is not None and nearest[3] < .035:
                    p = nearest[0]
                ring.append(len(vertices)); vertices.append(p)
            if rings:
                previous = rings[-1]
                for i in range(ring_size):
                    j = (i+1) % ring_size
                    faces.append((previous[i],previous[j],ring[j],ring[i]))
            rings.append(ring)
        leg_tops[side] = rings[-1]
        # Lower opening is intentionally covered by the shoe; no cap pole at
        # an ankle joint. Garment thickness closes the visible cloth edge.
    left, right = leg_tops[-1], leg_tops[1]
    half = ring_size//2
    for i in range(half):
        faces.append((left[i],left[i+1],right[ring_size-i-1],right[(ring_size-i)%ring_size]))
    perimeter = right[:half+1] + left[half:] + left[:1]
    # 18 vertices around the unified waist, with a front/back bridge at crotch.
    assert len(perimeter) == 18
    for z, rx, ry in [(.875,.185,.100),(.91,.181,.108),(.945,.177,.114),(.98,.174,.115),(1.01,.171,.111),(1.03,.169,.107)]:
        ring = []
        for i in range(18):
            a = (i+.5)/18*math.tau
            p = Vector((rx*width*math.sin(a), .015-ry*math.cos(a), z*scale))
            nearest = bvh.find_nearest(p)
            if nearest[0] is not None and nearest[3] < .035:
                p = nearest[0]
            ring.append(len(vertices)); vertices.append(p)
        for i in range(18):
            j = (i+1)%18
            faces.append((perimeter[i],perimeter[j],ring[j],ring[i]))
        perimeter = ring
    data = bpy.data.meshes.new(('Female' if female else 'Male')+' | quad trousers cage')
    data.from_pydata(vertices, [], faces);data.update();clean_normals(data)
    ob = bpy.data.objects.new(source.name+' | E retopology', data);collection.objects.link(ob)
    for mat in source.data.materials:
        data.materials.append(mat)
    for face in data.polygons:
        face.use_smooth = True
    sub = ob.modifiers.new('Quad-loop smoothing before rig', 'SUBSURF');sub.levels=2;sub.render_levels=2
    thickness = ob.modifiers.new('Cloth edge thickness', 'SOLIDIFY');thickness.thickness=.002;thickness.offset=-1
    ob['purpose'] = 'Connected quad rest cage; three-plus support loops at knee and hip. Weighting/deformation NOT TESTED.'
    bpy.data.meshes.remove(original)
    return ob


def source_copy(source, collection, offset):
    ob = source.copy();ob.data=source.data.copy();collection.objects.link(ob)
    ob.name = source.name+' | E base'
    transform = Matrix.Translation((-offset, 0, 0)) @ source.matrix_world
    ob.data.transform(transform);ob.matrix_world=Matrix.Identity(4)
    # Subdivision stays editable. Do not collapse-decemate joint support loops.
    for modifier in ob.modifiers:
        if modifier.type == 'SUBSURF':
            modifier.levels = min(modifier.levels, 2)
            modifier.render_levels = modifier.levels
    return ob


def export_model(collection, label):
    bpy.ops.object.select_all(action='DESELECT')
    copies=[];dg=bpy.context.evaluated_depsgraph_get()
    for source in list(collection.objects):
        if source.type != 'MESH':
            continue
        data=bpy.data.meshes.new_from_object(source.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
        ob=bpy.data.objects.new('E export '+str(len(copies)), data);bpy.context.scene.collection.objects.link(ob)
        ob['source_part']=source.name.split(' [static head')[0] if source.name.startswith('Female V3 · ') else source.name
        for polygon in data.polygons:
            polygon.use_smooth=True
        ob.select_set(True);copies.append(ob)
    bpy.context.view_layer.objects.active=copies[0]
    path=OUT/(label+'-base-e.glb')
    result=bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_cameras=False,export_lights=False,export_extras=True)
    assert 'FINISHED' in result
    tris=0;positions=[]
    for ob in copies:
        ob.data.calc_loop_triangles();tris+=len(ob.data.loop_triangles)
        positions.extend(v.co.copy() for v in ob.data.vertices)
    lo=[min(p[i] for p in positions) for i in range(3)];hi=[max(p[i] for p in positions) for i in range(3)]
    for ob in copies:
        data=ob.data;bpy.data.objects.remove(ob,do_unlink=True);bpy.data.meshes.remove(data)
    return {'file':path.name,'gender':label,'sha256':digest(path),'bytes':path.stat().st_size,'triangles':tris,'bounds_z_up':{'min':lo,'max':hi},'rig':False}


def main():
    OUT.mkdir(exist_ok=True);EV.mkdir(exist_ok=True)
    approved_manifest=json.loads((APPROVED.parent/'manifest.json').read_text())
    assert digest(SOURCE)==approved_manifest['source_blend_sha256']
    assert digest(APPROVED)==approved_manifest['sha256']
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
    scene=bpy.context.scene
    original=set(bpy.data.objects)
    sources={gender:list(bpy.data.collections[gender+' | authored model'].objects) for gender in ['Male','Female']}
    collections={};retopo=[]
    for gender,offset in [('Male',-.45),('Female',.45)]:
        collection=bpy.data.collections.new(gender+' | E normalized base');scene.collection.children.link(collection);collections[gender]=collection
        for source in sources[gender]:
            if source.type != 'MESH':
                continue
            if 'trouser fly' in source.name:
                # This old floating tube follows the sculpt, not the new
                # garment surface. Remove it rather than leave a loose line
                # ahead of the cloth in the side-view silhouette.
                continue
            if source.name.endswith('continuous trousers'):
                ob=trouser_cage(source,collection,offset,gender=='Female')
                retopo.append({'object':ob.name,'vertices':len(ob.data.vertices),'faces':len(ob.data.polygons),'all_quads':all(len(p.vertices)==4 for p in ob.data.polygons),'knee_support_rings':5})
            else:
                source_copy(source,collection,offset)
    # Exact approved export becomes the rigid head region in the rig source.
    before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(APPROVED));head=list(set(bpy.data.objects)-before)
    head_hashes={}
    for ob in head:
        if ob.type!='MESH':
            continue
        assert all(abs(ob.matrix_world[i][j]-(1 if i==j else 0))<1e-6 for i in range(4) for j in range(4))
        for c in list(ob.users_collection):
            c.objects.unlink(ob)
        collections['Female'].objects.link(ob)
        head_hashes[ob.name]=mesh_hash(ob.data)
        ob['approved_head_source_sha256']=approved_manifest['sha256']
    # The source has male+body context and new female head. Remove originals
    # from this new working file only, never overwrite either accepted source.
    for ob in original:
        if ob.type=='MESH' and not ob.name.startswith('Studio floor'):
            bpy.data.objects.remove(ob,do_unlink=True)
    for collection in collections.values():
        for ob in collection.objects:
            ob.hide_render=False;ob.hide_set(False)
    # Hide the second base during single exports/renders via collection flags.
    for ob in bpy.context.selected_objects:
        ob.select_set(False)
    scene.render.threads_mode='FIXED';scene.render.threads=8
    scene.cycles.samples=32
    scene['approval_scope']='Owner approved E-H; stop at planned E full-body visual review before F.'
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'base-models-e.blend'))
    models=[]
    for gender in ['Male','Female']:
        models.append(export_model(collections[gender],gender.lower()))
    assert all(mesh_hash(ob.data)==head_hashes[ob.name] for ob in head if ob.type=='MESH')
    manifest={'stage':'E','blender':bpy.app.version_string,'source_blend_sha256':digest(SOURCE),'approved_female_head_glb_sha256':digest(APPROVED),'approved_head_mesh_hashes':head_hashes,'approved_head_geometry_changed':False,'source_file':'base-models-e.blend','source_sha256':digest(OUT/'base-models-e.blend'),'models':models,'trouser_retopology':retopo,'rig':False,'deformation_tested':False,'full_body_owner_review':'OPEN','next_authorized_scope':'F-H, after planned review gates'}
    (OUT/'manifest-e.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(manifest,ensure_ascii=False,indent=2),flush=True)


if __name__=='__main__':
    main()
