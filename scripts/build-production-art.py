"""V4-derived authored 3D animation frames and furniture; deterministic, reproducible.
Requires numpy, scipy, trimesh 4.11 and VTK >=9.5 with EGL or Xvfb.
No raster warping. Every animation frame is rendered from changed 3D geometry.
"""
from pathlib import Path
import sys,os,math,json,importlib.util,hashlib
if Path('/tmp/software-ceo-python').exists():sys.path.insert(0,'/tmp/software-ceo-python')
os.environ.setdefault('VTK_DEFAULT_OPENGL_WINDOW','vtkEGLRenderWindow')
import numpy as np
import trimesh
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('v4',ROOT/'art-source/v4/source/build_workstation_v4.py');v4=importlib.util.module_from_spec(spec);spec.loader.exec_module(v4)
spec2=importlib.util.spec_from_file_location('render',ROOT/'scripts/build-assets.py');render=importlib.util.module_from_spec(spec2);spec2.loader.exec_module(render)
OUT=ROOT/'public/assets';GEN=ROOT/'art-source/generated';TMP=Path('/tmp/software-ceo-art-frames');TMP.mkdir(exist_ok=True);GEN.mkdir(exist_ok=True)
SIZE=256;render.SIZE=SIZE;render.SCALE=1.45
anchor=[SIZE/2,SIZE/2+.8*math.cos(math.pi/6)*SIZE/(2*1.45)]
BASE=dict(v4.COL)
ROLES={'developer':('#356B74','#49858B','#28575F','#2F2C35','#E7B89A'),'qa':('#687B52','#8B9E6A','#495B3A','#584433','#DDB08D'),'designer':('#8B6581','#B38DA3','#704D69','#3E3034','#DFAB86'),'growth':('#B27C4D','#C99A66','#8D633E','#684B35','#EBC3A2'),'ops':('#526C8C','#8095B5','#3E5671','#38313D','#C68C6D')}
STATES=['idle','working','meeting','alert','walk','walkBack','stand','turn','walkRight','walkLeft','turnRight','turnLeft']

def visible_bytes(im):
 data=bytearray(im.convert('RGBA').tobytes())
 for j in range(0,len(data),4):
  if data[j+3]==0:data[j:j+3]=b'\0\0\0'
 return bytes(data)

def new_transform(b,previous,matrix):
 for name in list(b.scene.geometry.keys())[previous:]:b.scene.geometry[name].apply_transform(matrix)

def limb(b,s,sh,el,wr,tip):
 b.uv('hoodie_shoulder',sh,(.098,.10,.110),'hoodie',lat=12,lon=14)
 b.seg('sleeve_upper',sh,el,.098,.081,'hoodie',edges=16);b.sphere('elbow_fold',el,(.092,.092,.093),'hoodie',sub=2)
 b.seg('sleeve_forearm',el,wr,.082,.058,'hoodie-light',edges=16)
 cuff=np.asarray(wr)+(np.asarray(el)-np.asarray(wr))*.15
 b.seg('ribbed_cuff',cuff,wr,.060,.054,'hoodie-dark',edges=12)
 b.uv('palm',wr,(.054,.047,.030),'skin-light',lat=12,lon=15)
 for j in range(3):
  start=np.asarray(wr)+[s*j*.014,0,0];end=np.asarray(tip)+[s*j*.020,.008*j,0]
  b.seg('fingers',start,end,.010,.007,'skin-light',edges=8)

def person(role,state,index):
 b=v4.B();phase=index/8*math.tau
 standing=state.startswith('walk') or state.startswith('turn');rise=index/7 if state=='stand' else 1 if standing else 0
 bob=.009*math.sin(phase*2) if standing else .003*math.sin(phase)
 dy=.25*rise;dz=.22*rise+bob
 start=len(b.scene.geometry);v4.torso_body(b);v4.head(b)
 m=trimesh.transformations.translation_matrix([0,dy,dz]);new_transform(b,start,m)
 # Head nod is around the anatomical neck root, never toward the camera.
 headtags=('neck','face_head','ear','inner_ear','hair','temple','eye','iris','brow','glasses','nose','smile')
 for name,mesh in b.scene.geometry.items():
  if any(name.split('__',1)[-1].startswith(t) for t in headtags):mesh.apply_transform(trimesh.transformations.rotation_matrix(math.radians(.7*math.cos(phase)),[1,0,0],[0,-.33+dy,1.30+dz]))
 for side in (-1,1):
  x=side*.145;walkphase=phase+(0 if side==1 else math.pi)
  stride=.22*math.sin(walkphase) if state.startswith('walk') else 0
  lift=.065*max(0,math.cos(walkphase)) if state.startswith('walk') else 0
  footY=.073+stride
  hip=(x,-.33+dy,.628+dz);knee=(x,.012+stride*.45,.487+lift*.35)
  if rise:knee=(x,.012+stride*.45-.035*rise,.487+lift*.35)
  ankle=(x,-.010+stride,.132+lift)
  b.seg('jeans_thigh',hip,knee,.111,.087,'jeans',edges=16);b.sphere('knee_fold',knee,(.093,.095,.105),'jeans',sub=2)
  b.seg('jeans_shin',knee,ankle,.078,.060,'jeans',edges=14)
  b.bevel('jean_cuff',(x,-.013+stride,.136+lift),(.131,.128,.053),.013,'jean-detail')
  b.uv('sneaker',(x,footY,.073+lift),(.110,.174,.066),'shoe',lat=14,lon=18)
  b.bevel('rubber_sole',(x,.081+stride,.024+lift),(.205,.299,.043),.017,'sole')
  b.bevel('shoe_side_stripe',(x+side*.066,footY,.084+lift),(.011,.135,.016),.005,'shoe-detail')
  for k in range(3):b.seg('sneaker_lace',(x-.033,.11+stride+.029*k,.129+lift),(x+.033,.11+stride+.029*k,.129+lift),.004,.004,'steel',edges=7)
  sh=(side*.240,-.36+dy,1.188+dz)
  if rise>0:
   el0=np.array([side*.316,-.170,.95]);wr0=np.array([side*.29,-.130,.795]);tip0=np.array([side*.28,-.125,.76]);swing=.13*math.sin(walkphase+math.pi) if state.startswith('walk') else 0
   el=(1-rise)*el0+rise*np.array([side*.29,-.11+swing,1.12+bob]);wr=(1-rise)*wr0+rise*np.array([side*.32,-.02+swing,.93+bob]);tip=(1-rise)*tip0+rise*np.array([side*.32,.005+swing,.87+bob])
  elif state=='working':
   wave=math.sin(phase+(0 if side==1 else 1.3));el=(side*.305,-.135,.94);wr=(side*.185,.133+.004*math.cos(phase),.842+.005*wave);tip=(side*.151,.183,.831+.005*wave)
  elif state=='meeting' and side==1:
   el=(.31,-.12,1.02);wr=(.30,.09+.025*math.sin(phase),1.13+.025*math.cos(phase));tip=(.28,.16+.025*math.sin(phase),1.15+.025*math.cos(phase))
  elif state=='alert' and side==1:
   el=(.32,-.20,1.05);wr=(.35,-.16,1.37+.025*math.sin(phase));tip=(.34,-.13,1.44+.025*math.sin(phase))
  else:el=(side*.316,-.17,.95);wr=(side*.29,-.13,.795+.003*math.sin(phase));tip=(side*.28,-.125,.76+.003*math.sin(phase))
  limb(b,side,sh,el,wr,tip)
 # A stitched back panel is a small authored garment detail, not a pasted image.
 b.bevel('back_label',(0,-.531+dy,1.09+dz),(.09,.007,.03),.003,'shirt')
 if state=='walkBack':b.scene.apply_transform(trimesh.transformations.rotation_matrix(math.pi,[0,0,1]))
 if state=='walkRight':b.scene.apply_transform(trimesh.transformations.rotation_matrix(-math.pi/2,[0,0,1]))
 if state=='walkLeft':b.scene.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,0,1]))
 if state=='turnRight':b.scene.apply_transform(trimesh.transformations.rotation_matrix(-math.pi/2*index/7,[0,0,1]))
 if state=='turnLeft':b.scene.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2*index/7,[0,0,1]))
 if state=='turn':b.scene.apply_transform(trimesh.transformations.rotation_matrix(math.pi*index/7,[0,0,1]))
 return b

def render_model(b,name,keep=False):
 path=TMP/(name+'.glb');b.scene.export(str(path));dest=TMP/(name+'.png');render.render(path,dest)
 if keep:(GEN/(name+'.glb')).write_bytes(path.read_bytes())
 return Image.open(dest).convert('RGBA')

def add_plant(b,x=0,y=0,z=0,scale=1):
 b.seg('ceramic_planter',(x,y,z),(x,y,z+.36*scale),.22*scale,.25*scale,'pot',edges=20)
 b.sphere('planter_lip',(x,y,z+.365*scale),(.25*scale,.25*scale,.035*scale),'pot-rim',sub=2)
 b.sphere('plant_soil',(x,y,z+.38*scale),(.21*scale,.21*scale,.015*scale),'soil')
 for i in range(14):
  a=i*math.tau/14;tip=(x+(.30+.06*(i%3))*math.cos(a)*scale,y+(.30+.06*(i%3))*math.sin(a)*scale,z+(.75+.12*(i%4))*scale)
  b.curve('plant_stem',[(x,y,z+.38*scale),(x+.07*math.cos(a)*scale,y+.07*math.sin(a)*scale,z+.65*scale),tip],.008*scale,'leaf')
  b.leaf('sculpted_leaf',(x+.06*math.cos(a)*scale,y+.06*math.sin(a)*scale,z+.62*scale),tip,.09*scale,'leaf-light' if i%3 else 'leaf-mid')

def furniture(name):
 b=v4.B()
 if name=='chair':v4.chair(b)
 elif name=='plant':add_plant(b)
 elif name=='meeting':
  b.bevel('meeting_oak_top',(0,0,.75),(1.9,1.18,.09),.14,'oak-top');b.bevel('meeting_edge',(0,0,.705),(1.92,1.2,.04),.035,'oak-lip')
  for x in (-.68,.68):
   for y in (-.35,.35):b.seg('meeting_leg',(x,y,.05),(x,y,.71),.04,.05,'steel')
  b.bevel('notebook',(-.55,.1,.812),(.25,.32,.025),.008,'paper');b.bevel('laptop_base',(.42,.2,.82),(.45,.30,.025),.009,'steel');b.bevel('laptop_screen',(.42,.36,.98),(.45,.025,.30),.01,'steel-dark');b.bevel('laptop_display',(.42,.343,.98),(.40,.003,.25),.003,'blue')
  for x,y,angle in [(-.96,0,-math.pi/2),(.96,0,math.pi/2),(0,.65,math.pi),(0,-.65,0)]:
   before=len(b.scene.geometry);v4.chair(b);m=trimesh.transformations.rotation_matrix(angle,[0,0,1]);m[:3,3]=[x,y,.0];new_transform(b,before,m)
 elif name=='pantry':
  b.bevel('pantry_cabinet',(0,0,.45),(1.6,.65,.9),.025,'oak');b.bevel('stone_counter',(0,0,.94),(1.68,.70,.07),.02,'light')
  for x in (-.5,0,.5):
   b.bevel('cabinet_door',(x,-.34,.47),(.46,.025,.78),.008,'oak-top');b.seg('cabinet_handle',(x+.13,-.36,.42),(x+.13,-.36,.59),.009,.009,'steel')
  b.bevel('coffee_machine',(-.39,.02,1.15),(.40,.38,.35),.035,'steel-dark');b.bevel('coffee_front',(-.39,-.18,1.15),(.33,.016,.23),.008,'chair-light');b.bevel('coffee_drip',(-.39,-.23,.99),(.32,.20,.025),.01,'black')
  for x in (-.46,-.34):b.sphere('coffee_button',(x,-.194,1.24),(.016,.006,.016),'gold')
  b.seg('coffee_cup',(-.39,-.23,1.01),(-.39,-.23,1.10),.045,.055,'mug',edges=20)
  for x in (.25,.45,.65):b.seg('pantry_jar',(x,.12,.99),(x,.12,1.17),.07,.07,'paper',edges=16);b.sphere('jar_lid',(x,.12,1.18),(.071,.071,.02),'gold')
 elif name=='sofa':
  for x in (-.65,.65):
   for y in (-.25,.25):b.seg('sofa_foot',(x,y,.03),(x,y,.22),.035,.03,'oak-lip')
  b.bevel('sofa_base',(0,0,.29),(1.65,.72,.3),.09,'hoodie-dark');b.bevel('sofa_back',(0,.33,.65),(1.65,.17,.6),.07,'hoodie')
  for x in (-.77,.77):b.bevel('sofa_arm',(x,0,.48),(.18,.74,.55),.07,'hoodie')
  for x in (-.36,.36):b.bevel('seat_cushion',(x,-.05,.5),(.68,.58,.15),.06,'hoodie-light');b.bevel('sofa_pillow',(x,.20,.72),(.52,.15,.42),.07,'hoodie-light')
 elif name=='finance':
  b.bevel('finance_cabinet',(0,0,.60),(1.25,.50,1.2),.025,'oak');b.bevel('cabinet_top',(0,0,1.23),(1.31,.56,.06),.015,'oak-top')
  for z in (.28,.65,1.0):
   b.bevel('drawer',(0,-.265,z),(1.13,.025,.30),.009,'oak-top');b.seg('drawer_handle',(-.13,-.29,z),(.13,-.29,z),.009,.009,'steel')
  for i in range(5):b.bevel('ledger_book',(-.43+i*.13,0,1.42),(.09,.31,.31),.004,['navy','hoodie','gold','pot','chair'][i])
  b.bevel('finance_frame',(.38,.03,1.45),(.30,.04,.38),.01,'steel');b.bevel('frame_chart',(.38,-.0,1.45),(.25,.004,.32),.005,'paper')
 elif name=='entry':
  b.bevel('entry_table',(0,0,.76),(1.05,.42,.07),.02,'oak-top')
  for x in (-.43,.43):b.seg('entry_leg',(x,0,.03),(x,0,.73),.032,.03,'steel')
  b.bevel('tablet',(-.15,.07,.99),(.35,.05,.35),.01,'steel-dark');b.bevel('tablet_glass',(-.15,.038,.99),(.30,.005,.30),.01,'aqua');add_plant(b,.32,0,.81,.32)
 if name=='meeting':b.scene.apply_scale(.9)
 return b

def main():
 manifest=json.loads((OUT/'manifest.json').read_text());manifest['version']=2;manifest['animation']={'frameSize':SIZE,'anchor':anchor,'pixelsPerMeter':SIZE/2.9,'framesPerState':8,'frameDurationMs':125,'states':STATES,'roles':list(ROLES),'source':'scripts/build-production-art.py','method':'authored 3D geometry frame sequences rendered with VTK; not a skeletal rig'};hashes={};review=[]
 for role,cols in ROLES.items():
  v4.COL.update(BASE);v4.COL.update(dict(zip(['hoodie','hoodie-light','hoodie-dark','hair','skin-light'],cols)))
  sheet=Image.new('RGBA',(SIZE*8,SIZE*len(STATES)))
  for row,state in enumerate(STATES):
   hashes[role+'/'+state]=[]
   for i in range(8):
    b=person(role,state,i);im=render_model(b,f'{role}_{state}_{i}',i==0);sheet.alpha_composite(im,(i*SIZE,row*SIZE));hashes[role+'/'+state].append(hashlib.sha256(visible_bytes(im)).hexdigest())
    if role=='developer' and i in (0,3,6) and state in ('working','walk','stand','meeting','alert'):review.append((state+str(i),im.copy()))
   print('ANIMATION',role,state,'unique',len(set(hashes[role+'/'+state])),flush=True)
  sheet.save(OUT/f'people-{role}.webp',lossless=True,method=4)
  # Real rendered animated preview, not static pictures relabeled as motion.
  if role=='developer':
   for row,state in enumerate(STATES):
    frames=[]
    for i in range(8):
     frame=Image.new('RGBA',(SIZE,SIZE),'#e8ede6');frame.alpha_composite(sheet.crop((i*SIZE,row*SIZE,(i+1)*SIZE,(row+1)*SIZE)));frames.append(frame.convert('RGB'))
    frames[0].save(GEN/f'preview-{state}.gif',save_all=True,append_images=frames[1:],duration=125,loop=0)
 v4.COL.update(BASE)
 for name in ['chair','plant','meeting','pantry','sofa','finance','entry']:
  render.SIZE=512;render.SCALE=1.9 if name=='meeting' else 1.45
  b=furniture(name);im=render_model(b,'prop-'+name,True);im.save(OUT/(name+'.webp'),lossless=True,method=4)
  manifest['sprites'][name]={'file':name+'.webp','width':512,'height':512,'anchor':[256,256+.8*math.cos(math.pi/6)*512/(2*render.SCALE)],'bbox':im.getbbox(),'frames':1,'durationMs':1000,'pixelsPerMeter':512/(2*render.SCALE),'source':'art-source/generated/prop-'+name+'.glb'}
 render.SIZE=256;render.SCALE=1.45
 # Side view renders from exact exported geometry for seated and walking posture inspection.
 import vtk
 def side(model,name):
  win=vtk.vtkRenderWindow();win.SetOffScreenRendering(True);win.SetAlphaBitPlanes(1);win.SetSize(800,800);ren=vtk.vtkRenderer();win.AddRenderer(ren);ren.SetBackground(.89,.93,.90)
  imp=vtk.vtkGLTFImporter();imp.SetFileName(str(model));imp.SetRenderWindow(win);imp.Update();cam=ren.GetActiveCamera();cam.SetPosition(6,-.2,2.5);cam.SetFocalPoint(0,.1,.95);cam.SetViewUp(0,0,1);cam.ParallelProjectionOn();cam.SetParallelScale(1.28)
  light=vtk.vtkLight();light.SetPosition(5,-5,10);light.SetFocalPoint(0,0,1);light.SetIntensity(.9);ren.AddLight(light);win.Render();f=vtk.vtkWindowToImageFilter();f.SetInput(win);f.Update();writer=vtk.vtkPNGWriter();writer.SetFileName(str(GEN/name));writer.SetInputConnection(f.GetOutputPort());writer.Write();win.Finalize()
 combined=v4.B();v4.desk(combined);v4.chair(combined);worker=person('developer','working',3)
 for name,mesh in worker.scene.geometry.items():combined.scene.add_geometry(mesh.copy(),geom_name='animated_'+name)
 combined.scene.export(str(GEN/'ergonomics-working.glb'));side(GEN/'ergonomics-working.glb','review-working-side.png');side(GEN/'developer_walk_0.glb','review-walking-side.png')
 contact=Image.new('RGB',(256*5,290*3),'#e8ede6');d=ImageDraw.Draw(contact)
 for i,(label,im) in enumerate(review[:15]):x=i%5*256;y=i//5*290;contact.paste(im,(x,y),im);d.text((x+12,y+258),label,fill='#214738')
 contact.save(GEN/'animation-contact-sheet.png')
 (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2));(GEN/'frame-hashes.json').write_text(json.dumps(hashes,indent=2));(GEN/'ANIMATION_SOURCE.json').write_text(json.dumps({'roles':ROLES,'states':STATES,'frames':8,'fps':8,'projection':manifest['animation'],'preservedBaseline':'V4','rig':'none; explicit pose construction, smooth joint endpoints','footMinZ':.0025,'authoringSource':'scripts/build-production-art.py'},indent=2))
 print('PRODUCTION ASSETS COMPLETE',flush=True)
if __name__=='__main__':main()
