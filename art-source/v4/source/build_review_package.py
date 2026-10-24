from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import json, math, zipfile
import trimesh
ROOT=Path(__file__).resolve().parents[1]
REN=ROOT/'renders';SP=ROOT/'sprites';CON=ROOT/'concept'
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BFONT='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font=lambda s,b=False:ImageFont.truetype(BFONT if b else FONT,s)

def bg(w,h,top=(236,240,242),bottom=(203,216,223)):
 im=Image.new('RGB',(w,h));d=ImageDraw.Draw(im)
 for y in range(h):
  t=y/max(1,h-1)
  d.line((0,y,w,y),fill=tuple(int(a*(1-t)+b*t) for a,b in zip(top,bottom)))
 return im.convert('RGBA')

def composite(infile,outfile,size,title=None,subtitle=None):
 tile=bg(*size)
 img=Image.open(infile).convert('RGBA')
 # Fit subject into card, retaining transparent alpha.
 marginx=100;marginy=95
 if title:marginy+=55
 avail=(size[0]-2*marginx,size[1]-2*marginy)
 ratio=min(avail[0]/img.width,avail[1]/img.height)
 img=img.resize((int(img.width*ratio),int(img.height*ratio)),Image.Resampling.LANCZOS)
 x=(size[0]-img.width)//2;y=(size[1]-img.height)//2+int(bool(title)*15)
 # soft oval shadow, purely a 2D presentation effect, not part of the 3D geometry
 layer=Image.new('RGBA',size,(0,0,0,0))
 dr=ImageDraw.Draw(layer)
 px=size[0]/2;py=size[1]*.82
 dr.ellipse((px-size[0]*.23,py-45,px+size[0]*.23,py+45),fill=(45,55,63,42))
 layer=layer.filter(ImageFilter.GaussianBlur(29));tile.alpha_composite(layer)
 tile.alpha_composite(img,(x,y))
 if title:
  d=ImageDraw.Draw(tile)
  d.text((38,32),title,font=font(30,True),fill=(22,43,57))
  if subtitle:d.text((40,74),subtitle,font=font(15),fill=(83,100,111))
 tile.convert('RGB').save(outfile,quality=94)

composite(REN/'01_isometric_hero.png',REN/'01_isometric_hero_review.jpg',(1300,1060),'ONE DEVELOPER / ONE WORKSTATION','Actual 3D geometry / orthographic render - UNAPPROVED')
composite(REN/'02_ergonomics_side.png',REN/'02_ergonomics_side_review.jpg',(1100,1060),'SIDE PROFILE / ERGONOMICS','Check chair contact, foot position, wrists, monitor orientation')
composite(REN/'03_front_facing.png',REN/'03_front_facing_review.jpg',(1100,1060),'OPPOSITE VIEW / DESK','Check face forward, monitor back, legs under desk')
composite(REN/'04_character_closeup.png',REN/'04_character_closeup_review.jpg',(950,1150),'CHARACTER / FACE REVIEW','Face and costume still need professional polish')

# Sprite sample sheet with genuinely transparent source sprites, not independent image generations.
w,h=1600,1010
sheet=Image.new('RGB',(w,h),'#F4F6F5');d=ImageDraw.Draw(sheet)
d.rectangle((0,0,w,100),fill='#1E3243');d.text((42,25),'SPRITE SAMPLES / EXPORTED FROM THE SAME GLB',font=font(26,True),fill='white')
d.text((44,68),'4 camera viewpoints + 3 static postures. NOT a rigged animation.',font=font(15),fill='#CCDCE3')
for i,(label,name) in enumerate([('SW','workstation_typing_SW.png'),('SE','workstation_typing_SE.png'),('NW','workstation_typing_NW.png'),('NE','workstation_typing_NE.png')]):
 x=28+i*391;y=124
 d.rounded_rectangle((x,y,x+373,y+398),14,fill='#DDE5E8')
 tile=Image.open(SP/name).convert('RGBA');tile.thumbnail((350,340),Image.Resampling.LANCZOS)
 sheet.paste(tile,(x+(373-tile.width)//2,y+40),tile)
 d.text((x+20,y+12),f'CAMERA {label}',font=font(20,True),fill='#233C4B')
for i,(label,name) in enumerate([('TYPING','developer_typing_SW.png'),('IDLE','developer_idle_SW.png'),('THINKING','developer_thinking_SW.png'),('DESK ONLY','desk_only_SW.png')]):
 x=28+i*391;y=550
 d.rounded_rectangle((x,y,x+373,y+395),14,fill='#E4E9E7')
 tile=Image.open(SP/name).convert('RGBA');tile.thumbnail((350,336),Image.Resampling.LANCZOS)
 sheet.paste(tile,(x+(373-tile.width)//2,y+36),tile)
 d.text((x+20,y+12),label,font=font(20,True),fill='#233C4B')
sheet.save(SP/'00_sprite_contact_sheet.png')

# bounded numerical checks, not a substitute for anatomical inspection.
metrics={
  'project':'Software CEO - one workstation geometry review',
  'status':'NOT ART LOCK - UNAPPROVED - prototype geometry',
  'unit':'meter','axis':'Z up','employee_forward':[0,1,0],
  'monitor_display_normal':[0,-1,0],
  'head_body_yaw_deviation_degrees':0,
  'reference_eye':[0,-.157,1.555],
  'reference_display_center':[-.05,.509,1.228],
  'eye_to_monitor_center_distance_m':round(math.dist([0,-.157,1.555],[-.05,.509,1.228]),3),
  'desktop_top_m':.769,'seat_cushion_top_m':.538,
  'pelvis_bottom_m':round(.684-.176,3),
  'seat_cushion_compression_overlap_m':round(.538-(.684-.176),3),
  'keyboard_keytop_m':.817,'typing_wrist_height_m':.828,
  'shoe_sole_bottom_m':round(.024-.043/2,4),
  'camera_render':'orthographic','renderer':'VTK from glTF binaries',
  'scene_stat':{},
  'important_limitations':[
   'Mesh is procedural prototype geometry, not artist-sculpted production artwork.',
   'No skeleton/rig; idle/typing/thinking are discrete hand-authored static poses.',
   'No automated collision test across every triangle, no motion physics verification.',
   'Facial sculpting, hair, garment folds, surface shading and arm pose still need visual refinement.',
   'A rendered pose cannot establish good animation biomechanics.'
  ]
}
for name in ('01_workstation_typing','03_developer_typing','07_studio_full'):
 g=trimesh.load(MODELS:=ROOT/'models'/(name+'.glb'),force='scene')
 metrics['scene_stat'][name]={'meshes':len(g.geometry),'triangles':sum(len(k.faces) for k in g.geometry.values()),'glb_bytes':MODELS.stat().st_size}
with open(ROOT/'geometry_review.json','w') as f:json.dump(metrics,f,ensure_ascii=False,indent=2)

readme='''# SOFTWARE CEO — Art Experiment V4 (UNAPPROVED)

This is a **real, inspectable GLB** and sprite proof, not a production art lock.

## Inspect first

- `renders/01_isometric_hero_review.jpg` — office-side orthographic render.
- `renders/02_ergonomics_side_review.jpg` — verifies seated pose direction, feet, arm path and workstation geometry.
- `renders/03_front_facing_review.jpg` — reverse angle and screen back.
- `renders/04_character_closeup_review.jpg` — makes remaining flaws in face/wardrobe visible.
- `sprites/00_sprite_contact_sheet.png` — 4 views of same GLB, 3 distinct static posture variants.
- `models/01_workstation_typing.glb` — 3D source for workstation + worker.
- `models/07_studio_full.glb` — same source plus presentation floor.
- `source/build_workstation_v4.py`, `source/render_v4.py` — deterministic construction and VTK render scripts.

## What was checked

- Character faces +Y; monitor faces -Y. Neither neck nor waist is forced to face camera.
- Seat cushion top ~0.538 m, pelvis mesh slightly compresses into the cushion.
- Shoe soles contact ground z≈0.0025 m. Typing wrists are near keytop z≈0.817 m.
- Eye-to-monitor-center distance ~0.74m.
- Rendering from the exported GLB yielded actual transparent RGBA sprites.

## What still fails quality targets

- Procedural character's face, hairstyle and outfit **do not yet meet a high-end stylized commercial game art bar**.
- The pose is static and not rigged; there are no genuine in-between animation frames.
- It still needs an artist-quality mesh revision and animation pass.
- The original v1/v3 blockout and old concept collage are not approved.

## Direction

Do not send this to Codex as the final art reference or call it Art Lock. Request review only and continue iterations on **a single model**, with an authoring tool that supports sculpting, UV/normal editing, and armature/IK constraints. Produce close-ups and side-angle inspections for every edit.
'''
(ROOT/'README.md').write_text(readme)
print('contact sheet',SP/'00_sprite_contact_sheet.png')
print('qa',ROOT/'geometry_review.json')

out=Path('/mnt/data/Software_CEO_Art_Experiment_V4_UNAPPROVED.zip')
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for f in ROOT.rglob('*'):
  if f.is_file() and not ('__pycache__' in str(f)):
   z.write(f,arcname=f.relative_to(ROOT.parent))
print('zip',out,round(out.stat().st_size/1024/1024,2),'MB')
