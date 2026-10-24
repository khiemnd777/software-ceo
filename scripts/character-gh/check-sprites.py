"""Read-only decoded shipping-frame/provenance check, including root motion."""
from pathlib import Path
import json,hashlib,math
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]


def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def visible_hash(image):
    data=bytearray(image.convert('RGBA').tobytes())
    for i in range(0,len(data),4):
        if data[i+3]==0:data[i:i+3]=b'\0\0\0'
    return hashlib.sha256(data).hexdigest()


def check(output):
    runtime_path=ROOT/'public/assets/characters/manifest.json';runtime=json.loads(runtime_path.read_text())
    catalog=json.loads((ROOT/'src/characters/catalog.json').read_text())
    provenance=json.loads((ROOT/'art-source/character-gh/sprite-provenance.json').read_text())
    assert set(runtime['models'])==set(catalog) and runtime['fps']==8 and runtime['frameCount']==16
    assert abs(runtime['pixelsPerMeter']-256/2.9)<1e-9
    assert digest(runtime_path)==provenance['manifest_sha256']
    source={(r['id'],r['track'],r['frame']):r for r in provenance['frames']};count=0;decoded=0;tracks=[]
    for model_id,model in runtime['models'].items():
        assert {k:model[k] for k in ['gender','bottom','hair','label']}==catalog[model_id]
        path=ROOT/'public/assets'/model['file'];assert digest(path)==provenance['atlas_hashes'][str(path.relative_to(ROOT))]
        image=Image.open(path).convert('RGBA');assert image.size==(model['width'],model['height'])
        decoded+=image.width*image.height*4
        for track,frames in model['tracks'].items():
            assert len(frames)==16;pixels=set();poses=set()
            for i,frame in enumerate(frames):
                row=source[(model_id,track,i)];x,y,w,h=frame['rect']
                assert x>=1 and y>=1 and w>0 and h>0 and x+w<image.width and y+h<image.height
                assert len(frame['offset'])==2 and all(math.isfinite(n) for n in frame['offset'])
                crop=image.crop((x,y,x+w,y+h));value=visible_hash(crop)
                assert value==row['visible_sha256'],(model_id,track,i)
                source_path=ROOT/row['source'];assert digest(source_path)==row['source_png_sha256']
                with Image.open(source_path) as source_image:
                    assert value==visible_hash(source_image.crop(row['bbox']))
                if track.startswith('walk'):
                    assert sum((a-b)**2 for a,b in zip(row['root_position'],[0,-.08,0]))<1e-8
                pixels.add(value);poses.add(row['pose_sha256']);count+=1
            assert len(pixels)>=8 and len(poses)>=8,(model_id,track,len(pixels),len(poses))
            tracks.append({'model':model_id,'track':track,'pixel_variations':len(pixels),'skeletal_pose_variations':len(poses)})
    assert count==1152 and decoded<=96*1024*1024,(count,decoded)
    result={'pass':True,'skeletalRig':True,'models':8,'frameCount':count,'tracks':tracks,'decodedAtlasBytes':decoded,
        'scope':'Decoded shipped pixels equal exact reimported GLB renders; >=8 real skeletal poses per track; root motion removed; does not replace runtime/visual acceptance.'}
    output=Path(output);output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'character_art':'PASS','models':8,'frames':count,'decoded_bytes':decoded}))
    return result


if __name__=='__main__':check(ROOT/'evidence/character-gh/sprite-validation.json')
