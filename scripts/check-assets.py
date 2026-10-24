"""Decode shipped atlases and verify every real frame, transparent bounds, sources and metadata."""
from pathlib import Path
import json,hashlib,sys,argparse,runpy
parser=argparse.ArgumentParser()
parser.add_argument('--update-metadata',action='store_true')
parser.add_argument('--output-dir',default='evidence')
args=parser.parse_args()
UPDATE=args.update_metadata
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];M=json.loads((ROOT/'public/assets/manifest.json').read_text());A=M['animation'];hashes=json.loads((ROOT/'art-source/generated/frame-hashes.json').read_text());frames=[];errors=[];sources=[]
REPORT=ROOT/args.output_dir;REPORT.mkdir(parents=True,exist_ok=True)
def visible_bytes(im):
 data=bytearray(im.convert('RGBA').tobytes())
 for j in range(0,len(data),4):
  if data[j+3]==0:data[j:j+3]=b'\0\0\0'
 return bytes(data)
for role in A['roles']:
 path=ROOT/f'public/assets/people-{role}.webp';im=Image.open(path).convert('RGBA');expected=(A['frameSize']*8,A['frameSize']*len(A['states']))
 if im.size!=expected:errors.append(f'{role}: dimensions {im.size} != {expected}')
 for row,state in enumerate(A['states']):
  actual=[]
  for i in range(8):
   fs=A['frameSize'];f=im.crop((i*fs,row*fs,(i+1)*fs,(row+1)*fs));digest=hashlib.sha256(visible_bytes(f)).hexdigest();actual.append(digest);bbox=f.getbbox()
   if not bbox or bbox[0]<=0 or bbox[1]<=0 or bbox[2]>=fs or bbox[3]>=fs:errors.append(f'clipped or empty: {role}/{state}/{i}: {bbox}')
   frames.append({'id':f'{role}/{state}/{i}','file':path.name,'rect':[i*fs,row*fs,fs,fs],'anchor':A['anchor'],'bbox':bbox,'durationMs':125,'directionDegrees':-90 if state=='walkRight' else 90 if state=='walkLeft' else 180 if state=='walkBack' else 0,'sha256':digest})
  if len(set(actual))!=8:errors.append(f'repeated frames: {role}/{state}')
  if actual!=hashes[role+'/'+state]:errors.append(f'authored-render hash mismatch: {role}/{state}')
  source=ROOT/f'art-source/generated/{role}_{state}_0.glb'
  if source.read_bytes()[:4]!=b'glTF':errors.append(f'missing GLB: {source}')
  sources.append(str(source.relative_to(ROOT)))
for key,meta in M['sprites'].items():
 path=ROOT/'public/assets'/meta['file'];im=Image.open(path).convert('RGBA')
 if im.size!=(meta['width'],meta['height']):errors.append('sprite size mismatch: '+key)
 if tuple(meta['bbox'])!=im.getbbox():errors.append('sprite bounds mismatch: '+key)
 source=ROOT/meta['source']
 if source.read_bytes()[:4]!=b'glTF':errors.append('invalid 3D source: '+key)
shipped_bounds=M['animation']['bounds']
M['animation']['bounds']={}
for state in A['states']:
 b=[f['bbox'] for f in frames if f['id'].split('/')[1]==state];M['animation']['bounds'][state]=[min(x[0] for x in b),min(x[1] for x in b),max(x[2] for x in b),max(x[3] for x in b)]
if not UPDATE and M['animation']['bounds']!=shipped_bounds:errors.append('animation bounds metadata differs from shipped pixels')
if UPDATE:(ROOT/'public/assets/manifest.json').write_text(json.dumps(M,indent=2))
preview=Image.new('RGB',(1280,310),'#e8ede6');draw=ImageDraw.Draw(preview)
for i,role in enumerate(A['roles']):
 im=Image.open(ROOT/f'public/assets/people-{role}.webp').convert('RGBA').crop((0,256,256,512));preview.paste(im,(i*256,0),im);draw.text((i*256+24,275),role,fill='#214738')
preview.save(REPORT/'W4-role-sprites.png')
expected_metadata={'frameCount':len(frames),'frames':frames}
if UPDATE:(ROOT/'public/assets/animation-frames.json').write_text(json.dumps(expected_metadata,indent=2))
elif json.loads((ROOT/'public/assets/animation-frames.json').read_text())!=json.loads(json.dumps(expected_metadata)):errors.append('animation frame metadata differs from shipped pixels')
report={'result':'PASS' if not errors else 'FAIL','frameCount':len(frames),'stateCount':len(A['states']),'roles':A['roles'],'allFramesUniqueWithinEachTrack':not errors,'explicitGeometryFrameSequences':True,'skeletalRig':False,'spriteBytes':sum(p.stat().st_size for p in (ROOT/'public/assets').glob('*') if p.suffix in ('.webp','.png')),'sourceCount':len(sources),'errors':errors,'scope':'Decoded shipped atlases, visible-RGB and alpha-identical rendered frames (fully transparent RGB normalized), unique-frame hashes, transparent bounds and actual source GLB headers. Side-view anatomy/occlusion require visual review; this does not claim collision-free animation in all views.'}
(REPORT/'art-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
if errors:raise SystemExit(1)
if (ROOT/'public/assets/characters/manifest.json').exists():
 runpy.run_path(str(ROOT/'scripts/character-gh/check-sprites.py'))['check'](REPORT/'characters-art-validation.json')
