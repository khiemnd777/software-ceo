"""Review images rendered from the two GLBs reimported by export.py."""
from pathlib import Path
import sys, math, importlib.util, json, hashlib
import bpy
from mathutils import Matrix, Vector

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art-source/character-redesign-v2'
EVIDENCE=ROOT/'evidence/character-redesign-v2'
ARGS=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
spec=importlib.util.spec_from_file_location('authoring',Path(__file__).with_name('build.py'))
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
bpy.ops.wm.open_mainfile(filepath=str(OUT/'export-review-v2.blend'))
s=bpy.context.scene;s.cycles.samples=32;s.render.threads=8
inputs=[{'file':file,'sha256':hashlib.sha256((OUT/file).read_bytes()).hexdigest()} for file in ['male-static-v2.glb','female-static-v2.glb']]
collections=[bpy.data.collections[g+' | imported GLB'] for g in ['Male','Female']]
base={ob:ob.matrix_world.copy() for c in collections for ob in c.objects}


def pose(degrees):
    for c,x in zip(collections,[-.45,.45]):
        origin=Vector((x,0,0));matrix=Matrix.Translation(origin)@Matrix.Rotation(math.radians(degrees),4,'Z')@Matrix.Translation(-origin)
        for ob in c.objects:ob.matrix_world=matrix@base[ob]
    bpy.context.view_layer.update()


def hide(index,value):
    for ob in collections[index].objects:ob.hide_render=value


def main():
    receipt=[]
    def shot(name,angle,eye,target,scale,size):
        pose(angle);a.render(s,name,eye,target,scale,size)
        path=EVIDENCE/(name+'.png');receipt.append({'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'size':size,'rotation_degrees':angle,'source':'reimported GLB static geometry; Blender Cycles CPU'})
        print('REVIEW RENDER '+name,flush=True)
    if '--turntable' in ARGS:
        s.cycles.samples=16;(EVIDENCE/'turntable').mkdir(exist_ok=True)
        for i in range(24):
            shot('turntable/frame-'+str(i).zfill(2),i*15,(0,-8,2.65),(0,0,.97),2.30,(720,840))
        (EVIDENCE/'turntable-receipt.json').write_text(json.dumps({'model_inputs':inputs,'frames':receipt,'samples':16},indent=2)+'\n')
        return
    shot('beauty',-20,(0,-8,2.55),(0,0,.98),2.25,(1300,1450))
    shot('front',0,(0,-8,1.01),(0,0,1.01),2.18,(1300,1450))
    shot('side',90,(0,-8,1.01),(0,0,1.01),2.18,(1300,1450))
    shot('back',180,(0,-8,1.01),(0,0,1.01),2.18,(1300,1450))
    shot('heads',-10,(0,-8,2.10),(0,0,1.66),1.25,(1300,820))
    for i,(gender,x,cz) in enumerate([('male',-.45,1.68),('female',.45,1.60)]):
        hide(1-i,True)
        shot(gender+'-portrait',-18,(x,-6,cz+.24),(x,0,cz),.56,(900,1000))
        hide(1-i,False)
    clay=a.material('Review clay','C0BCB4',.82);s.view_layers[0].material_override=clay
    shot('clay',-25,(0,-8,2.55),(0,0,.98),2.25,(1300,1450))
    shot('clay-profile',90,(0,-8,1.01),(0,0,1.01),2.18,(1300,1450))
    s.view_layers[0].material_override=None
    # Exact camera and meters-to-pixels from the existing asset projection.
    # This is isolated review rendering, not a screenshot of changed gameplay.
    production=json.loads((ROOT/'public/assets/manifest.json').read_text())
    pm=65*math.sqrt(2);size=round(2*production['projection']['parallelScale']*pm)
    s.use_nodes=False;bpy.data.objects['Studio floor'].hide_render=True
    for i,(gender,x) in enumerate([('male',-.45),('female',.45)]):
        hide(1-i,True)
        cam=list(production['projection']['camera']);target=list(production['projection']['target']);cam[0]+=x;target[0]+=x
        for zoom in [1,2]:shot(gender+'-game-'+str(zoom*100),0,cam,target,2*production['projection']['parallelScale'],(size*zoom,size*zoom))
        hide(1-i,False)
    s.use_nodes=True;bpy.data.objects['Studio floor'].hide_render=False;pose(0)
    (EVIDENCE/'render-receipt.json').write_text(json.dumps({'model_inputs':inputs,'samples':32,'stills':receipt,'game_scale':{'pixels_per_meter_at_zoom_1':pm,'canvas_px':size,'camera':production['projection']['camera'],'target':production['projection']['target'],'lighting':'Blender review studio; not the VTK shipping-lighting pipeline'}},indent=2)+'\n')


if __name__=='__main__':
    main()
    if '--all' in ARGS and '--turntable' not in ARGS:
        ARGS.append('--turntable');main()
