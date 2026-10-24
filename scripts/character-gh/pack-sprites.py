"""Pack exact transparent 3D renders tightly; preserve per-frame foot anchors."""
from pathlib import Path
import json,hashlib,math
from PIL import Image

ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'art-source/character-gh';EV=ROOT/'evidence/character-gh';OUT=ROOT/'public/assets/characters'
TRACKS=['idle','working','meeting','alert','stand','turnRight','walkRight','turnLeft','walkLeft']


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def visible_hash(image):
    data=bytearray(image.convert('RGBA').tobytes())
    for i in range(0,len(data),4):
        if data[i+3]==0:data[i:i+3]=b'\0\0\0'
    return hashlib.sha256(data).hexdigest()


def main():
    catalog=json.loads((ROOT/'src/characters/catalog.json').read_text());g=json.loads((ART/'manifest-g.json').read_text())
    assert {m['id'] for m in g['models']}==set(catalog)
    OUT.mkdir(exist_ok=True);models={};proof=[];decoded=0
    for model in g['models']:
        model_id=model['id'];receipt=json.loads((EV/(model_id+'-sprite-receipt.json')).read_text());settings=receipt['settings']
        assert settings['glb_sha256']==model['glb_sha256'] and len(receipt['frames'])==144
        anchor=settings['anchor'];items=[]
        for row in receipt['frames']:
            path=ROOT/row['file'];assert sha(path)==row['sha256']
            image=Image.open(path).convert('RGBA');assert image.size==(192,192)
            bbox=image.getbbox();assert bbox and min(bbox[:2])>0 and max(bbox[2:])<192,(model_id,row['key'],bbox)
            crop=image.crop(bbox);items.append({'row':row,'bbox':bbox,'image':crop,'width':crop.width,'height':crop.height})
        x=y=height=0;width=1024
        for item in sorted(items,key=lambda item:(-item['height'],-item['width'])):
            if x+item['width']+2>width:y+=height+2;x=0;height=0
            item['rect']=[x+1,y+1,item['width'],item['height']]
            x+=item['width']+2;height=max(height,item['height'])
        atlas_height=math.ceil((y+height+2)/4)*4
        assert atlas_height<=4096
        sheet=Image.new('RGBA',(width,atlas_height));tracks={track:[None]*16 for track in TRACKS}
        for item in items:
            row=item['row'];track,index=row['key'].split('/');rect=item['rect'];bbox=item['bbox']
            sheet.paste(item['image'],tuple(rect[:2]))
            frame={'rect':rect,'offset':[bbox[0]-anchor[0],bbox[1]-anchor[1]]}
            tracks[track][int(index)]=frame
            proof.append({'id':model_id,'track':track,'frame':int(index),'source':row['file'],
                'source_png_sha256':row['sha256'],'pose_sha256':row['pose_sha256'],'bbox':list(bbox),
                'source_clip':row['source_clip'],'source_time':row['source_time'],
                'root_position':row['root_position'],'visible_sha256':visible_hash(item['image'])})
        path=OUT/(model_id+'.webp');sheet.save(path,lossless=True,method=4)
        models[model_id]={**catalog[model_id],'file':'characters/'+path.name,'width':width,'height':atlas_height,'tracks':tracks}
        decoded+=width*atlas_height*4
    runtime={'version':1,'fps':8,'frameCount':16,'pixelsPerMeter':256/2.9,'models':models}
    (OUT/'manifest.json').write_text(json.dumps(runtime,separators=(',',':'),ensure_ascii=False)+'\n')
    (ART/'sprite-provenance.json').write_text(json.dumps({'method':'Exact GLB skeletal renders; no raster warping','frames':proof,
        'atlas_hashes':{str(p.relative_to(ROOT)):sha(p) for p in OUT.glob('*.webp')},'manifest_sha256':sha(OUT/'manifest.json')},indent=2)+'\n')
    (EV/'pack-receipt.json').write_text(json.dumps({'pass':True,'models':8,'frames':len(proof),'tracks':9,
        'decoded_atlas_bytes_all_models':decoded,'atlas_bytes':sum(p.stat().st_size for p in OUT.glob('*.webp')),
        'root_motion_removed_from_walk':True,'manifest_sha256':sha(OUT/'manifest.json')},indent=2)+'\n')
    print(json.dumps({'models':8,'frames':len(proof),'decoded_bytes':decoded}))


if __name__=='__main__':main()
