"""Software CEO - revised stylized low-poly single workstation review.
Real procedural 3D geometry -> GLB -> camera renders & transparent sprites.
Meters / Z-up. Character and monitor have correctly opposed facing normals.
Procedural asset, not a Blender-quality hand-sculpted model or a rig.
"""
from pathlib import Path
import math
import numpy as np
import trimesh
from scipy.spatial import ConvexHull
from trimesh.transformations import rotation_matrix

ROOT=Path(__file__).resolve().parents[1]
MODELS=ROOT/'models';MODELS.mkdir(exist_ok=True)
COL={
 'floor':'#E9E0D5','floor-line':'#D4C6B7','mat':'#DDDCD4','mat-edge':'#C6D3C8',
 'oak':'#BF8355','oak-top':'#E3B586','oak-lip':'#9D6342','oak-light':'#F5CEA0',
 'steel':'#4A5760','steel-dark':'#28333E','black':'#202937','glass':'#142637',
 'navy':'#23334B','ink':'#1B2836','screen':'#101D2C','screen-dark':'#17283C',
 'blue':'#6AADD7','azure':'#96C9EA','aqua':'#7BD3C7','gold':'#E8B66F','salmon':'#E5A1A1',
 'light':'#F5F3EC','white':'#FFFFFF','paper':'#F9F2E7','chair':'#465761',
 'chair-light':'#5F7181','chair-stitch':'#899CAA','hoodie':'#356B74','hoodie-light':'#49858B',
 'hoodie-dark':'#28575F','shirt':'#E5E6DD','jeans':'#354963','jean-detail':'#62748D',
 'shoe':'#F4EEE7','shoe-detail':'#E1D6C9','sole':'#243243',
 'skin':'#D9A481','skin-light':'#E7B89A','skin-shadow':'#B77C65','skin-blush':'#DC9384',
 'hair':'#2F2C35','hair-mid':'#49404B','hair-hi':'#5E5054',
 'eye-white':'#FBF8F5','eye-dark':'#24313C','eye-hi':'#FFFFFF',
 'pot':'#B96F58','pot-rim':'#DE9475','soil':'#574D43','leaf':'#487B60',
 'leaf-mid':'#659874','leaf-light':'#88B68A','warm':'#FFE3A4','mug':'#ECE8E0'
}
def color(s):
 s=COL.get(s,s).lstrip('#');return np.array([int(s[i:i+2],16) for i in (0,2,4)]+[255],dtype=np.uint8)

class B:
 def __init__(self):self.scene=trimesh.Scene();self.counter=0;self.tris=0
 def add(self,tag,m,col):
  assert len(m.faces)>0,tag
  m.visual.vertex_colors=np.tile(color(col),[len(m.vertices),1]);
  self.scene.add_geometry(m,geom_name=f'{self.counter:04d}__{tag}');self.counter+=1;self.tris+=len(m.faces)
  return m
 def cube(self,tag,c,d,col):
  m=trimesh.creation.box(extents=d);m.apply_translation(c);return self.add(tag,m,col)
 def bevel(self,tag,c,d,r,col):
  # Convex hull of per-face inset corner vertices; controlled chamfers rather than raw cubes
  dx,dy,dz=np.asarray(d)*.5
  points=[]
  for sx in (-1,1):
   for sy in (-1,1):
    for sz in (-1,1):
     points += [[sx*dx,sy*(dy-r),sz*(dz-r)], [sx*(dx-r),sy*dy,sz*(dz-r)], [sx*(dx-r),sy*(dy-r),sz*dz]]
  points=np.asarray(points)+np.asarray(c)
  hull=ConvexHull(points)
  m=trimesh.Trimesh(vertices=points,faces=hull.simplices,process=True)
  m.fix_normals();return self.add(tag,m,col)
 def sphere(self,tag,c,d,col,sub=2):
  m=trimesh.creation.icosphere(subdivisions=sub,radius=1)
  m.apply_scale(d);m.apply_translation(c)
  return self.add(tag,m,col)
 def uv(self,tag,c,d,col,lat=14,lon=20):
  m=trimesh.creation.uv_sphere(radius=1,count=[lat,lon]);m.apply_scale(d);m.apply_translation(c)
  return self.add(tag,m,col)
 def seg(self,tag,a,b,r0,r1,col,edges=12):
  a=np.array(a,float);b=np.array(b,float);diff=b-a;length=float(np.linalg.norm(diff))
  if length<.00001:return None
  t=np.linspace(0,2*np.pi,edges,endpoint=False)
  verts=[[r*math.cos(z),r*math.sin(z),h] for h,r in [(0,r0),(length,r1)] for z in t]
  faces=[]
  for k in range(edges):
   j=(k+1)%edges;faces.extend([(k,j,j+edges),(k,j+edges,k+edges)])
  verts.extend([[0,0,0],[0,0,length]])
  for k in range(edges):
   j=(k+1)%edges;faces.extend([(2*edges,j,k),(2*edges+1,edges+k,edges+j)])
  m=trimesh.Trimesh(vertices=verts,faces=faces,process=False)
  m.apply_transform(trimesh.geometry.align_vectors([0,0,1],diff/length));m.apply_translation(a)
  return self.add(tag,m,col)
 def curve(self,tag,path,r,col,edges=8):
  # Tube along a smooth polyline; avoids disconnected noodles and makes purposeful forms.
  pts=np.asarray(path,float);vs=[];fs=[]
  for i,p in enumerate(pts):
   tangent=pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]
   tangent=tangent/(np.linalg.norm(tangent)+1e-15)
   test=np.array([0,0,1.]) if abs(tangent[2])<.88 else np.array([0,1,0.])
   n=np.cross(tangent,test);n/=np.linalg.norm(n)+1e-15
   binormal=np.cross(tangent,n)
   rad=(r[i] if isinstance(r,(tuple,list,np.ndarray)) else r)
   for k in range(edges):
    ang=2*math.pi*k/edges
    vs.append(p+rad*(n*math.cos(ang)+binormal*math.sin(ang)))
  for i in range(len(pts)-1):
   for k in range(edges):
    j=(k+1)%edges;fs.extend([(i*edges+k,i*edges+j,(i+1)*edges+j),(i*edges+k,(i+1)*edges+j,(i+1)*edges+k)])
  m=trimesh.Trimesh(vertices=np.asarray(vs),faces=np.asarray(fs),process=False)
  return self.add(tag,m,col)
 def leaf(self,tag,a,tip,width,col):
  a=np.array(a,float);tip=np.array(tip,float);v=tip-a
  side=np.cross(v,[0,0,1.]);side=side/(np.linalg.norm(side)+1e-12)
  mid=a+v*.57;crest=mid+np.array([0,0,.012])
  verts=np.array([a,mid+side*width,tip,mid-side*width,crest],dtype=float)
  faces=np.array([[0,1,4],[1,2,4],[2,3,4],[3,0,4],[0,4,1],[1,4,2],[2,4,3],[3,4,0]],dtype=int)
  m=trimesh.Trimesh(vertices=verts,faces=faces,process=False)
  return self.add(tag,m,col)
 def plate(self,tag,c,d,col):return self.bevel(tag,c,d,min(d)*.06,col)


def floor(b):
 b.bevel('STUDIO_floor',(0,.25,-.072),(2.65,2.56,.14),.045,'floor')
 b.bevel('FLOOR_front_edge',(0,-1.02,-.107),(2.55,.027,.08),.006,'oak-lip')
 # floor joint only, avoiding busy grid
 for xx in (-.65,.65):b.cube('tile_joint_x',(xx,.25,.0007),(.006,2.39,.001),'floor-line')
 b.cube('tile_joint_y',(0,.35,.0007),(2.45,.006,.001),'floor-line')
 b.bevel('mat_under_chair',(0,-.40,.009),(1.39,1.08,.013),.08,'mat-edge')
 b.bevel('mat_soft_center',(0,-.40,.019),(1.26,.99,.009),.06,'mat')


def desk(b):
 # desk top ~0.765 m, front (+Y) design expected here has near edge y=+0.08
 b.bevel('desk_solid_oak_top',(0,.472,.737),(1.65,.81,.063),.033,'oak-top')
 b.bevel('desk_beveled_oak_rim',(0,.473,.712),(1.67,.832,.039),.017,'oak-lip')
 b.cube('desk_wood_edge_flash',(0,.061,.745),(1.49,.014,.016),'oak')
 for x in (-.70,.70):
  for y in (.17,.77):
   b.bevel('powder_coated_leg',(x,y,.345),(.065,.07,.68),.012,'steel')
 for xx in (-.70,.70):b.seg('leg_foot', (xx,.17,.035),(xx,.17,.061),.06,.06,'steel-dark')
 b.seg('crossbar',(-.70,.76,.27),(.70,.76,.27),.021,.021,'steel')
 b.bevel('cable_management',(0,.795,.62),(1.16,.075,.055),.012,'steel-dark')
 # Side drawer to prevent floating desk visually
 b.bevel('drawer_shell',(.618,.51,.545),(.28,.40,.32),.026,'oak')
 b.bevel('drawer_front',(.615,.305,.56),(.255,.015,.12),.004,'oak-top')
 b.seg('drawer_pull',(.57,.29,.56),(.66,.29,.56),.007,.007,'steel')
 # monitor: front faces -Y; eye y=-.20, display front y=.48
 b.bevel('monitor_27_bezel',(-.05,.54,1.228),(.71,.054,.445),.018,'steel-dark')
 b.bevel('monitor_glass',(-.05,.509,1.228),(.665,.006,.395),.011,'screen')
 b.bevel('monitor_sidebar',(-.330,.503,1.227),(.095,.003,.348),.001,'screen-dark')
 b.cube('editor_topbar',(-.05,.501,1.404),(.66,.003,.027),'navy')
 b.cube('statusbar',(-.05,.500,1.040),(.66,.003,.019),'hoodie')
 for i,(cl,w) in enumerate([('aqua',.26),('salmon',.18),('azure',.35),('gold',.21),('aqua',.24),('azure',.31),('gold',.18),('salmon',.28)]):
  b.bevel('code_visual_line_'+str(i),(-.218+w/2,.496,1.371-i*.037),(w,.002,.007),.0005,cl)
 for j in range(4):b.cube('file_tree',(-.345,.500,1.36-j*.065),(.058,.002,.010),'blue' if j%2 else 'steel')
 b.seg('monitor_mount',(-.05,.58,1.017),(-.05,.64,.803),.025,.022,'steel')
 b.bevel('monitor_base',(-.05,.63,.782),(.23,.20,.022),.013,'steel-dark')
 # LED cyan monitor accent, front bezel left/right not crossing monitor
 b.cube('monitor_power',(.282,.500,1.025),(.014,.004,.006),'aqua')
 # keyboard & keys, keycap position under fingers
 b.bevel('keyboard_75percent',(0,.20,.788),(.50,.19,.035),.012,'steel-dark')
 for row in range(4):
  for col in range(13):
   x=-.226+col*.0375; y=.137+row*.037
   if row==0 and col>10:continue
   b.bevel('keyboard_keycap',(x,y,.811),(.025,.027,.011),.002,'chair-light' if (row*13+col)%8 else 'light')
 b.bevel('keyboard_space',(0,.135,.816),(.165,.023,.012),.002,'light')
 # ergonomic mouse
 b.sphere('mouse',(.46,.20,.789),(.059,.083,.026),'steel-dark',sub=2)
 b.cube('mouse_wheel',(.46,.20,.817),(.008,.028,.004),'chair-light')
 b.bevel('mousepad',(.46,.20,.774),(.19,.23,.006),.010,'mat')
 # desk objects carefully outside arm path
 b.bevel('notebook',(-.612,.49,.771),(.20,.265,.016),.006,'paper')
 for n in range(3):b.cube('notebook_lines',(-.612,.40+n*.064,.783),(.14,.003,.002),'floor-line')
 b.seg('pen',(-.64,.52,.782),(-.58,.71,.782),.009,.007,'blue')
 b.seg('mug_ceramic',(-.635,.165,.771),(-.635,.165,.852),.047,.043,'mug',edges=18)
 b.sphere('mug_coffee',(-.635,.165,.858),(.036,.034,.003),'oak-lip')
 b.curve('mug_handle',[(-.685,.16,.827),(-.722,.163,.846),(-.732,.165,.812),(-.690,.165,.80)],.010,'mug')
 # brass task lamp, rear-left for balanced silhouette
 b.seg('lamp_arm_A',(-.66,.78,.79),(-.66,.77,1.13),.017,.014,'steel')
 b.seg('lamp_arm_B',(-.66,.77,1.13),(-.47,.70,1.34),.014,.014,'steel')
 b.sphere('lamp_shade',(-.44,.686,1.31),(.105,.105,.060),'gold',sub=2)
 b.sphere('lamp_glow',(-.44,.662,1.273),(.064,.064,.015),'warm')
 # cable curve on desktop towards rear edge
 b.curve('monitor_cable',[(-.05,.65,.79),(-.05,.74,.74),(-.20,.80,.70),(-.35,.80,.65)],.006,'steel-dark')
 # ceramic planter at back right
 b.seg('planter',(.64,.73,.769),(.64,.73,.91),.080,.092,'pot',edges=16)
 b.sphere('planter_rim',(.64,.73,.918),(.091,.091,.018),'pot-rim',sub=2)
 b.sphere('soil',(.64,.73,.924),(.070,.070,.007),'soil')
 for k in range(10):
  a=k*math.pi*2/10;L=.16+.04*(k%3);zz=1.075+.022*(k%3)
  target=(.64+L*math.cos(a),.73+L*math.sin(a),zz)
  b.curve('pothos_stem',[(.64,.73,.93),(.64+.04*math.cos(a),.73+.04*math.sin(a),1.01),target],[.005,.004,.003],'leaf')
  b.leaf('pothos_leaf',(.64+.055*math.cos(a),.73+.055*math.sin(a),1.018),(.64+(L+.07)*math.cos(a),.73+(L+.07)*math.sin(a),zz+.01),.055,'leaf-mid' if k%2 else 'leaf-light')


def chair(b):
 # center y=-0.38, seat cushion top=0.532
 b.seg('chair_piston',(0,-.385,.095),(0,-.385,.447),.039,.039,'steel')
 for k in range(5):
  a=math.pi*2*k/5
  p=(.34*math.sin(a),-.385+.34*math.cos(a),.084)
  b.seg('caster_foot_spoke',(0,-.385,.11),p,.025,.018,'steel')
  b.sphere('rolling_caster',(p[0],p[1],.041),(.043,.045,.041),'steel-dark',sub=1)
 b.bevel('chair_base_seat',(0,-.388,.46),(.58,.55,.11),.04,'chair')
 b.bevel('cushion_contoured',(0,-.362,.518),(.53,.52,.04),.025,'chair-light')
 b.bevel('seat_front_stitch',(0,-.08,.515),(.42,.008,.008),.003,'chair-stitch')
 # backrest sits behind spine y -0.64, tapered/curved silhouette
 b.sphere('lumbar_support',(0,-.638,.86),(.265,.062,.29),'chair-light',sub=3)
 b.sphere('backrest_upper',(0,-.675,1.02),(.265,.076,.32),'chair',sub=3)
 b.sphere('backrest_soft_headrest',(0,-.680,1.305),(.188,.055,.08),'chair-light',sub=2)
 b.seg('backrest_spine',(0,-.73,.49),(0,-.738,.97),.028,.030,'steel-dark')
 for s in (-1,1):
  b.seg('arm_support',(s*.331,-.48,.53),(s*.331,-.41,.74),.020,.020,'steel')
  b.bevel('armrest_cushion',(s*.334,-.35,.752),(.12,.37,.052),.018,'chair')


def torso_body(b):
 # Stylized jacket silhouette: layered shirt / panels rather than a raw icosphere
 b.uv('hoodie_main_torso',(0,-.355,1.032),(.268,.181,.284),'hoodie',lat=17,lon=20)
 b.uv('inner_cream_tshirt_neckline',(0,-.187,1.231),(.093,.013,.067),'shirt',lat=12,lon=15)
 # chest lapels on forward +Y side
 for s in (-1,1):
  b.curve('jacket_opening_edge',[(s*.086,-.186,1.244),(s*.032,-.180,1.175),(s*.018,-.179,1.090)],.008,'hoodie-light')
  b.seg('hood_drawcord',(s*.065,-.165,1.245),(s*.075,-.169,1.102),.004,.004,'light')
  b.sphere('hood_drawcord_tip',(s*.075,-.170,1.10),(.007,.007,.015),'gold',sub=1)
  b.uv('hood_folds',(s*.155,-.485,1.21),(.126,.093,.120),'hoodie-dark',lat=12,lon=16)
 b.uv('hoodie_collar',(0,-.37,1.279),(.144,.123,.063),'hoodie-dark',lat=11,lon=14)
 b.seg('zipper',(0,-.174,.912),(0,-.173,1.162),.003,.003,'hoodie-light')
 for s in (-1,1):b.bevel('hoodie_pocket',(s*.13,-.172,.916),(.095,.013,.06),.012,'hoodie-dark')
 b.uv('pants_pelvis',(0,-.356,.684),(.226,.18,.176),'jeans',lat=14,lon=18)
 b.cube('hoodie_hem',(0,-.355,.803),(.38,.265,.044),'hoodie-dark')


def head(b):
 # Anatomically coherent forward +Y. No neck overrotation.
 b.seg('neck',(0,-.330,1.275),(0,-.330,1.389),.073,.068,'skin')
 b.uv('face_head',(0,-.334,1.526),(.205,.176,.244),'skin-light',lat=21,lon=26)
 # Head mesh already has a complete chin and jaw; do not overlay an extra protruding oval.
 for side in (-1,1):
  b.uv('ear',(side*.208,-.323,1.515),(.041,.045,.072),'skin-light',lat=12,lon=14)
  b.uv('inner_ear',(side*.236,-.286,1.51),(.012,.012,.032),'skin-shadow',lat=10,lon=12)
 # hair behind skull, dark auburn layers, styled asymmetric fringe
 b.uv('hair_crown',(0,-.359,1.686),(.223,.189,.126),'hair',lat=18,lon=24)
 b.uv('hair_back',(0,-.435,1.548),(.211,.104,.172),'hair',lat=15,lon=20)
 for side in (-1,1):
  b.uv('temple_side',(side*.18,-.323,1.629),(.069,.118,.136),'hair',lat=12,lon=16)
 # distinct swept angular hair clumps with tapered bezier tubes not primitive cap alone
 hair_specs=[
  ([(-.19,-.345,1.722),(-.11,-.246,1.761),(-.03,-.188,1.732),(.047,-.205,1.677)], [.069,.067,.053,.017]),
  ([(-.16,-.339,1.756),(-.045,-.275,1.792),(.053,-.215,1.750),(.095,-.225,1.680)],[.073,.064,.045,.012]),
  ([(.03,-.355,1.780),(.139,-.285,1.783),(.182,-.225,1.730),(.13,-.218,1.646)],[.069,.057,.037,.009]),
  ([(-.12,-.474,1.742),(-.207,-.404,1.717),(-.23,-.309,1.652)],[.066,.052,.009]),
  ([(.05,-.495,1.749),(.170,-.461,1.726),(.231,-.346,1.656)],[.068,.052,.009]),
 ]
 for i,(p,r) in enumerate(hair_specs):b.curve('hair_lock_'+str(i),p,r,'hair-mid' if i%3==0 else 'hair',edges=10)
 # eyes face +Y, gaze at monitor forward and slightly downward
 for s in (-1,1):
  x=s*.084
  b.uv('eye_white',(x,-.156,1.555),(.033,.010,.022),'eye-white',lat=12,lon=16)
  b.uv('iris',(x,-.145,1.552),(.016,.008,.018),'eye-dark',lat=12,lon=16)
  b.sphere('eye_catchlight',(x-.005,-.135,1.561),(.004,.003,.005),'eye-hi',sub=1)
  b.curve('brow',[ (x-.045,-.16,1.610),(x,-.150,1.625),(x+.043,-.163,1.615)],.009,'hair',edges=8)
  # No protruding 'sticker cheeks' - skin tone remains continuous in the reviewed mesh.
  # glasses 3D bridge/rims realistically in front of eye, subtle matte metal
  rim=[(x+.049*math.cos(k*2*math.pi/16),-.133,1.553+.039*math.sin(k*2*math.pi/16)) for k in range(17)]
  b.curve('glasses_rim',rim,.0065,'steel-dark',edges=7)
  b.seg('glasses_temple',(s*.135,-.146,1.56),(s*.202,-.268,1.564),.005,.005,'steel-dark')
 b.seg('glasses_bridge',(-.039,-.130,1.555),(.039,-.130,1.555),.005,.005,'steel-dark')
 b.uv('nose',(0,-.143,1.488),(.022,.018,.031),'skin-light',lat=12,lon=14)
 b.curve('smile',[(-.037,-.166,1.418),(-.01,-.173,1.415),(.015,-.173,1.415),(.038,-.164,1.418)],.0048,'skin-shadow',edges=8)


def seated_character(b,pose):
 torso_body(b);head(b)
 for s in (-1,1):
  x=s*.145
  # Thighs extend forward +Y, knees lower and closer to desktop front edge.
  b.seg('jeans_thigh',(x,-.33,.628),(x,.012,.487),.111,.087,'jeans',edges=16)
  b.sphere('knee_fold',(x,.012,.48),(.093,.095,.105),'jeans',sub=2)
  b.seg('jeans_shin',(x,.013,.455),(x,-.010,.132),.078,.060,'jeans',edges=14)
  b.bevel('jean_cuff',(x,-.013,.136),(.131,.128,.053),.013,'jean-detail')
  b.uv('sneaker',(x,.073,.073),(.110,.174,.066),'shoe',lat=14,lon=18)
  b.bevel('rubber_sole',(x,.081,.024),(.205,.299,.043),.017,'sole')
  b.bevel('shoe_side_stripe',(x+s*.066,.073,.084),(.011,.135,.016),.005,'shoe-detail')
  # Short shoelace accents
  for k in range(3):b.seg('sneaker_lace',(x-.033,.11+.029*k,.129),(x+.033,.11+.029*k,.129),.004,.004,'steel',edges=7)
 for s in (-1,1):
  sh=(s*.240,-.36,1.188)
  if pose=='typing':
   el=(s*.305,-.135,.940);wr=(s*.185,.133,.828);tip=(s*.151,.183,.823)
  elif pose=='idle':
   el=(s*.316,-.170,.95);wr=(s*.29,-.130,.776);tip=(s*.28,-.125,.744)
  elif pose=='thinking' and s==1:
   el=(s*.30,-.07,.91);wr=(s*.132,-.148,1.29);tip=(s*.111,-.144,1.36)
  else:
   el=(s*.306,-.132,.943);wr=(s*.187,.143,.826);tip=(s*.155,.190,.820)
  b.uv('hoodie_shoulder',sh,(.098,.10,.110),'hoodie',lat=12,lon=14)
  b.seg('sleeve_upper',sh,el,.098,.081,'hoodie',edges=16)
  b.sphere('elbow_fold',el,(.092,.092,.093),'hoodie',sub=2)
  b.seg('sleeve_forearm',el,wr,.082,.058,'hoodie-light',edges=16)
  b.seg('ribbed_cuff',(s*.18,.115,.852),wr,.060,.054,'hoodie-dark',edges=12)
  b.uv('palm',wr,(.056,.049,.034),'skin-light',lat=12,lon=15)
  b.seg('index_finger',wr,tip,.020,.012,'skin-light',edges=10)
  if pose=='typing' or (pose=='thinking' and s==-1):
   for j in (1,2):
    fingertip=(tip[0]+s*j*.022,tip[1]+.017,tip[2]-.007)
    b.seg('fingers_touching_keys',(wr[0]+s*j*.010,wr[1],wr[2]),fingertip,.011,.008,'skin-light',edges=8)


def build(pose='typing',category='full'):
 b=B()
 if category=='full':floor(b)
 if category in ('full','workstation'):desk(b)
 if category in ('full','workstation','avatar'):
  chair(b);seated_character(b,pose)
 if category=='desk':desk(b)
 if category not in ('full','workstation','avatar','desk'):raise ValueError(category)
 return b.scene,b

if __name__=='__main__':
 for name,pose,cat in [('01_workstation_typing','typing','workstation'),('02_workstation_thinking','thinking','workstation'),('03_developer_typing','typing','avatar'),('04_developer_idle','idle','avatar'),('05_developer_thinking','thinking','avatar'),('06_desk_only','typing','desk'),('07_studio_full','typing','full')]:
  scene,b=build(pose,cat)
  dest=MODELS/(name+'.glb');scene.export(str(dest));print(name,b.counter,b.tris,round(dest.stat().st_size/1024),scene.bounds,flush=True)
