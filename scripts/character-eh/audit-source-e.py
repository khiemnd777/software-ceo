"""Read saved E source without saving; inspect actual cage connectivity."""
from pathlib import Path
import json
import hashlib
import bpy
import bmesh

ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'art-source/character-eh'
EV=ROOT/'evidence/character-eh'
path=ART/'base-models-e.blend'
before=hashlib.sha256(path.read_bytes()).hexdigest()
bpy.ops.wm.open_mainfile(filepath=str(path))
meshes=[]
for collection in [bpy.data.collections['Male | E normalized base'],bpy.data.collections['Female | E normalized base']]:
    assert all(ob.type=='MESH' for ob in collection.objects)
    for ob in collection.objects:
        assert all(abs(ob.matrix_world[i][j]-(1 if i==j else 0))<1e-6 for i in range(4) for j in range(4)),ob.name
        if 'E retopology' not in ob.name:continue
        bm=bmesh.new();bm.from_mesh(ob.data)
        assert all(len(face.verts)==4 for face in bm.faces)
        components=0;remaining=set(bm.verts)
        while remaining:
            components+=1;stack=[remaining.pop()]
            while stack:
                vertex=stack.pop()
                for edge in vertex.link_edges:
                    other=edge.other_vert(vertex)
                    if other in remaining:remaining.remove(other);stack.append(other)
        boundary=[edge for edge in bm.edges if edge.is_boundary]
        assert all(len(edge.link_faces) in [1,2] for edge in bm.edges)
        assert components==1
        boundary_vertices={vertex for edge in boundary for vertex in edge.verts}
        assert all(sum(edge.is_boundary for edge in vertex.link_edges)==2 for vertex in boundary_vertices)
        loops=0;remaining=set(boundary_vertices)
        while remaining:
            loops+=1;stack=[remaining.pop()]
            while stack:
                vertex=stack.pop()
                for edge in vertex.link_edges:
                    other=edge.other_vert(vertex)
                    if edge.is_boundary and other in remaining:remaining.remove(other);stack.append(other)
        assert loops==3,(ob.name,loops)
        meshes.append({'object':ob.name,'vertices':len(bm.verts),'faces':len(bm.faces),'all_quads':True,'connected_components':components,'boundary_loops':loops,'intentional_boundaries':['waist','left cuff','right cuff'],'non_manifold_junctions':0})
        bm.free()
assert len(meshes)==2
assert hashlib.sha256(path.read_bytes()).hexdigest()==before
result={'source_sha256':before,'save_or_rebuild_performed':False,'normalized_mesh_transforms':True,'trouser_cages':meshes,'rig_or_deformation_tested':False,'pass':True}
(EV/'source-e-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
