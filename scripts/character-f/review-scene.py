"""Original V4 furniture and camera setup for motion review only."""
from pathlib import Path
import json,struct,math
import bpy
from mathutils import Matrix,Vector

ROOT=Path(__file__).resolve().parents[2]


def furniture():
    path=ROOT/'art-source/v4/models/01_workstation_typing.glb'
    data=path.read_bytes();length=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+length])
    cutoff=next(i for i,node in enumerate(doc['nodes']) if 'hoodie_main_torso' in node.get('name',''))
    names={node['name'] for node in doc['nodes'][:cutoff] if 'mesh' in node}
    before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(path));imported=list(set(bpy.data.objects)-before);keep=[]
    restore_z_up=Matrix.Rotation(-math.pi/2,4,'X')
    for ob in imported:
        if ob.type!='MESH' or ob.name not in names:continue
        ob.data=ob.data.copy();transform=restore_z_up@ob.matrix_world
        ob.data.transform(transform);ob.parent=None;ob.matrix_world=Matrix.Identity(4);ob.hide_render=False;keep.append(ob)
    for ob in imported:
        if ob not in keep:bpy.data.objects.remove(ob,do_unlink=True)
    desk=next(ob for ob in keep if 'desk_solid_oak_top' in ob.name)
    bounds=[v.co for v in desk.data.vertices];height=(min(v.z for v in bounds)+max(v.z for v in bounds))/2
    assert abs(height-.737)<.01,height
    return keep


def camera(scene,name,scale=2.5,size=(900,1000),walking=False):
    target=Vector((0,.40 if walking else 0,.90))
    eye={'three-quarter':Vector((4,5,3)),'side':Vector((5,0,1.2)),'front':Vector((0,6,1.2))}[name]
    if walking:eye.y+=.4
    scene.camera.location=eye;scene.camera.rotation_euler=(target-eye).to_track_quat('-Z','Y').to_euler();scene.camera.data.ortho_scale=scale
    scene.render.resolution_x=size[0];scene.render.resolution_y=size[1];scene.render.resolution_percentage=100
    scene.render.film_transparent=False;scene.use_nodes=True
    scene.render.threads_mode='FIXED';scene.render.threads=8;scene.cycles.device='CPU';scene.cycles.use_denoising=True


def show_furniture(objects,visible):
    for ob in objects:ob.hide_render=not visible
