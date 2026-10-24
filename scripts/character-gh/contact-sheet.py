"""Assemble verified real GLB renders without retouching the character images."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
EV = ROOT / 'evidence/character-gh'
catalog = json.loads((ROOT / 'src/characters/catalog.json').read_text())
records = []
for path in sorted(EV.glob('study-*.json')):
    records.extend(json.loads(path.read_text()))
assert len(records) == 32
for record in records:
    assert hashlib.sha256((ROOT / record['file']).read_bytes()).hexdigest() == record['sha256']
    assert record['glb_sha256'] == hashlib.sha256((ROOT / 'art-source/character-gh' / (record['id'] + '.glb')).read_bytes()).hexdigest()

sheet = Image.new('RGB', (1280, 1010), '#f1f0ea')
draw = ImageDraw.Draw(sheet)
font_path = '/System/Library/Fonts/Supplemental/Arial.ttf'
title = ImageFont.truetype(font_path, 32)
label = ImageFont.truetype(font_path, 17)
small = ImageFont.truetype(font_path, 16)
draw.text((28, 23), 'Nhân vật G–H · 8 ngoại hình', font=title, fill='#253b32')
draw.text((28, 66), 'Ảnh render từ GLB đã nhập lại · Nam 2 mẫu / Nữ 6 mẫu', font=small, fill='#627064')
sources = []
for index, (model_id, metadata) in enumerate(catalog.items()):
    x, y = 28 + index % 4 * 310, 108 + index // 4 * 430
    draw.rounded_rectangle((x, y, x + 294, y + 414), radius=10, fill='#fcfcf7')
    path = EV / 'studies' / (model_id + '-front.png')
    picture = Image.open(path).convert('RGB').resize((294, 339), Image.Resampling.LANCZOS)
    sheet.paste(picture, (x, y))
    parts = metadata['label'].split(' · ')
    draw.text((x + 13, y + 351), ' · '.join(parts[:2]), font=label, fill='#253b32')
    if len(parts) > 2:
        draw.text((x + 13, y + 376), parts[2], font=small, fill='#627064')
    sources.append({'file':str(path.relative_to(ROOT)), 'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
draw.text((28, 982), 'Chân váy rời · Mặt nữ / mái tóc theo bản duyệt · Chờ review mỹ thuật G–H', font=small, fill='#627064')
output = EV / 'contact-sheet.png'
sheet.save(output)
(EV / 'contact-sheet.json').write_text(json.dumps({'pass':True, 'verified_study_images':len(records), 'sources':sources,
    'output':str(output.relative_to(ROOT)), 'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
    'operations':['verified source hashes','uniform resize','layout and Vietnamese labels'], 'retouching':False}, ensure_ascii=False, indent=2)+'\n')
print('PASS: 32 study hashes; 8 real GLB renders assembled')
