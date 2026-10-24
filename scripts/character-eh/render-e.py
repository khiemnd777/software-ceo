"""Render E review from the two normalized GLBs after actual reimport."""
from pathlib import Path
import hashlib
import json
import math
import sys
import bpy
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art-source/character-eh'
EV=ROOT/'evidence/character-eh'


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    manifest=json.loads((OUT/'manifest-e.json').read_text())
    assert sha(OUT/'base-models-e.blend')==manifest['source_sha256']
    bpy.ops.wm.open_mainfile(filepath=str(OUT/'base-models-e.blend'))
    scene=bpy.context.scene;camera=scene.camera
    for ob in list(bpy.data.objects):
        if ob.type=='MESH' and ob.name!='Studio floor':bpy.data.objects.remove(ob,do_unlink=True)
    groups={}
    for item in manifest['models']:
        path=OUT/item['file'];assert sha(path)==item['sha256']
        before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(path));groups[item['gender']]=list(set(bpy.data.objects)-before)
    for group in groups.values():
        for ob in group:ob.hide_render=True
    scene.render.threads_mode='FIXED';scene.render.threads=8
    scene.cycles.samples=32;receipt=[]
    if '--lineup-only' in sys.argv:
        old=json.loads((EV/'render-e-receipt.json').read_text())
        assert old['input_models']==manifest['models']
        receipt=[item for item in old['renders'] if item['file']!='lineup-e.png']
        for item in receipt:
            if 'ortho_scale_vertical' in item:item['ortho_scale']=item.pop('ortho_scale_vertical')
    def shoot(label,eye,target,scale,size=(900,1050),transparent=False):
        camera.location=eye;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=scale
        scene.render.resolution_x=size[0];scene.render.resolution_y=size[1];scene.render.resolution_percentage=100
        scene.render.film_transparent=transparent;scene.use_nodes=not transparent
        bpy.data.objects['Studio floor'].hide_render=transparent
        dest=EV/(label+'.png');scene.render.filepath=str(dest);bpy.ops.render.render(write_still=True)
        receipt.append({'file':dest.name,'sha256':sha(dest),'camera':list(eye),'target':list(target),'ortho_scale':scale,'size':list(size),'transparent':transparent})
        print('RENDER '+label,flush=True)
    clay=bpy.data.materials.new('E neutral clay');clay.diffuse_color=(.45,.43,.39,1);clay.use_nodes=True
    shader=clay.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=clay.diffuse_color;shader.inputs['Roughness'].default_value=.85
    for gender,group in groups.items():
        if '--lineup-only' in sys.argv:continue
        for ob in group:ob.hide_render=False
        if '--study' in sys.argv:
            shoot(gender+'-study-e',(2.5,-7,2.5),(0,0,.94),2.12)
            for ob in group:ob.hide_render=True
            continue
        views=[('front',(0,-6,.95),(0,0,.95),2.10),('three-quarter',(2.5,-7,2.5),(0,0,.94),2.12),('profile',(6,0,.95),(0,0,.95),2.10),('back',(0,6,.95),(0,0,.95),2.10)]
        for name,eye,target,scale in views:shoot(gender+'-'+name,eye,target,scale)
        scene.view_layers[0].material_override=clay
        shoot(gender+'-clay',(2.5,-7,2.5),(0,0,.94),2.12)
        scene.view_layers[0].material_override=None
        z=1.63 if gender=='male' else 1.555
        shoot(gender+'-head',(3.55,-4,z+.095),(0,0,z),.46,(1000,1100))
        # V4 projection: same camera/target, parallelScale 1.45 -> Blender
        # vertical ortho scale 2.9. PPM=256/2.9. Runtime draws at 65*sqrt(2).
        shoot(gender+'-game',(6,-6,5.698979486),(0,0,.8),2.90,(256,256),True)
        for ob in group:ob.hide_render=True
    if '--study' in sys.argv:
        (EV/'study-e-receipt.json').write_text(json.dumps({'input_models':manifest['models'],'renders':receipt},indent=2)+'\n')
        return
    for gender,group in groups.items():
        offset=-.43 if gender=='male' else .43
        for ob in group:ob.hide_render=False;ob.location.x+=offset
    shoot('lineup-e',(2.5,-7,2.5),(0,0,.94),2.68,(1300,1100))
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'review-reimported-e.blend'))
    result={'stage':'E','input_models':manifest['models'],'rendered_from':'Reimported exact GLBs','samples':32,'renders':receipt,'approved_female_head_preserved':True,'full_body_owner_review':'OPEN','rig_or_deformation_tested':False}
    (EV/'render-e-receipt.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('E_RENDERS_COMPLETE '+str(len(receipt)),flush=True)


if __name__=='__main__':main()
