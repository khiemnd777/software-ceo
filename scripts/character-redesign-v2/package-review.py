"""Encode the real rendered turntable frames as one locally viewable GIF."""
from pathlib import Path
import hashlib,json
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'evidence/character-redesign-v2'
paths=sorted((OUT/'turntable').glob('frame-*.png'))
assert len(paths)==24
assert len({hashlib.sha256(p.read_bytes()).hexdigest() for p in paths})==24,'Each review angle must have distinct rendered pixels'
frames=[Image.open(path).convert('RGB') for path in paths]
assert all(f.size==(720,840) for f in frames)
palette_sheet=Image.new('RGB',(720*6,840*4))
for i,frame in enumerate(frames):palette_sheet.paste(frame,((i%6)*720,(i//6)*840))
palette=palette_sheet.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
encoded=[frame.quantize(palette=palette,dither=Image.Dither.NONE) for frame in frames]
dest=OUT/'turntable.gif'
encoded[0].save(dest,save_all=True,append_images=encoded[1:],duration=170,loop=0,optimize=False,disposal=2)
with Image.open(dest) as check:
    assert check.n_frames==24 and check.size==(720,840)
receipt={'file':dest.name,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'frames':24,'frame_duration_ms':170,'source':'24 actual Cycles renders from reimported static GLB; palette encoding only; no rig motion','inputs':[{'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]}
(OUT/'package-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
