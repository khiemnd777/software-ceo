"""Hash rendered frames and assemble GIF/contact previews without altering art."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
EV = ROOT / 'evidence/character-f'
ART = ROOT / 'art-source/character-f'
CLIPS = ['idle', 'working', 'walk', 'stand-up', 'alert', 'meeting']
LABELS = ['Ngồi nghỉ', 'Gõ phím', 'Đi bộ', 'Đứng lên', 'Phản ứng', 'Trao đổi']


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    font_path = '/System/Library/Fonts/Supplemental/Arial.ttf'
    font = ImageFont.truetype(font_path, 17)
    small = ImageFont.truetype(font_path, 15)
    manifest = json.loads((ART / 'manifest-f.json').read_text())
    rendered = []
    for gender in ['male', 'female']:
        receipt = json.loads((EV / (gender + '-render-receipt.json')).read_text())
        item = next(m for m in manifest['models'] if m['gender'] == gender)
        assert receipt['settings']['glb_sha256'] == item['glb_sha256']
        assert len(receipt['renders']) == 211, (gender, len(receipt['renders']))
        for render in receipt['renders']:
            path = ROOT / render['file']
            assert sha(path) == render['sha256'], path
            with Image.open(path) as image:
                assert image.size == tuple(render['resolution'])
                image.verify()
        for clip in CLIPS:
            for view in ['three-quarter', 'side']:
                frames = [EV / 'frames' / gender / clip / view / f'{i:02d}.png' for i in range(17)]
                pixels = []
                for path in frames:
                    with Image.open(path) as image:
                        pixels.append(hashlib.sha256(image.convert('RGB').tobytes()).hexdigest())
                assert len(set(pixels)) > 1, (gender, clip, view, 'No visible frame changes')
                rendered.append({'gender': gender, 'clip': clip, 'view': view, 'frames': 17, 'unique_pixel_frames': len(set(pixels))})
    previews = []
    for clip, label in zip(CLIPS, LABELS):
        frames = []
        for i in range(17):
            canvas = Image.new('RGB', (768, 422), '#f2f1eb')
            draw = ImageDraw.Draw(canvas)
            for column, gender in enumerate(['male', 'female']):
                with Image.open(EV / 'frames' / gender / clip / 'side' / f'{i:02d}.png') as image:
                    canvas.paste(image.convert('RGB'), (column * 384, 38))
                draw.text((column * 384 + 17, 10), ('Nam' if gender == 'male' else 'Nữ') + ' · ' + label, font=font, fill='#314c40')
            frames.append(canvas)
        path = EV / ('preview-' + clip + '.gif')
        durations = [125] * 16 + [1000 if clip in ['walk', 'stand-up'] else 125]
        frames[0].save(path, save_all=True, append_images=frames[1:], duration=durations, loop=0, disposal=2, optimize=False)
        previews.append({'file': str(path.relative_to(ROOT)), 'sha256': sha(path), 'frames': 17, 'loop_for_review': True})
    sheet = Image.new('RGB', (1296, 6 * 248), '#f2f1eb')
    draw = ImageDraw.Draw(sheet)
    for row, (clip, label) in enumerate(zip(CLIPS, LABELS)):
        for column, (gender, frame) in enumerate((g, f) for g in ['male', 'female'] for f in [0, 8, 16]):
            path = EV / 'frames' / gender / clip / 'side' / f'{frame:02d}.png'
            with Image.open(path) as image:
                image = image.convert('RGB').resize((216, 216), Image.Resampling.LANCZOS)
                sheet.paste(image, (column * 216, row * 248 + 32))
            draw.text((column * 216 + 7, row * 248 + 8), f'{label} · {"Nam" if gender == "male" else "Nữ"} · {frame/8:g}s', font=small, fill='#314c40')
    sheet.save(EV / 'contact-sheet.png')
    result = {'pass': True, 'rendered_images': 422, 'sequence_frames': 408, 'high_resolution_stills': 14,
        'combinations': rendered, 'previews': previews, 'contact_sheet_sha256': sha(EV / 'contact-sheet.png'),
        'source': 'PNG frames rendered from exact exported GLBs reimported into Blender',
        'limits': ['8 fps image review, source GLB animation at 24 fps', 'GIF repeats after holding the last frame; not a claim of seamless walk/stand-up loops']}
    (EV / 'render-validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'pass': True, 'images': 422, 'combinations': len(rendered), 'gifs': len(previews)}))


if __name__ == '__main__':
    main()
