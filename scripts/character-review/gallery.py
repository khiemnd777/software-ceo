"""Lay out actual GLB screenshots with Vietnamese labels; no image synthesis."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'evidence/character-redesign-ac'
SRC=OUT/'final'
FONT='/System/Library/Fonts/Supplemental/Arial Unicode.ttf'
def font(size):return ImageFont.truetype(FONT,size)
def sheet(name,title,items,cols,cell=(380,500)):
    rows=(len(items)+cols-1)//cols;w,h=cell
    image=Image.new('RGB',(cols*w,110+rows*h),'#e6e3dc');draw=ImageDraw.Draw(image)
    draw.text((24,18),title,font=font(28),fill='#27333b')
    draw.text((24,61),'Render từ GLB thật · Mẫu A–C · Chờ Khiêm review tại D',font=font(18),fill='#52626a')
    for i,(path,label) in enumerate(items):
        x=(i%cols)*w;y=110+(i//cols)*h
        im=Image.open(SRC/path).convert('RGB');bg=Image.new('RGB',im.size,im.getpixel((0,0)))
        diff=ImageChops.difference(im,bg).convert('L').point(lambda a:255 if a>20 else 0)
        box=diff.getbbox()
        if box:im=im.crop((max(0,box[0]-16),max(0,box[1]-16),min(im.width,box[2]+16),min(im.height,box[3]+16)))
        im.thumbnail((w-28,h-80),Image.Resampling.LANCZOS)
        image.paste(im,(x+(w-im.width)//2,y+(h-80-im.height)//2))
        draw.multiline_text((x+16,y+h-67),label,font=font(17),fill='#27333b',spacing=5)
    image.save(OUT/name)

def main():
    names=[('male-trousers','Nam · quần dài'),('male-shorts','Nam · quần đùi'),('female-short-long','Nữ tóc ngắn · chân váy dài'),('female-short-short','Nữ tóc ngắn · chân váy ngắn'),('female-short-trousers','Nữ tóc ngắn · quần dài'),('female-long-long','Nữ tóc dài · chân váy dài'),('female-long-short','Nữ tóc dài · chân váy ngắn'),('female-long-trousers','Nữ tóc dài · quần dài')]
    sheet('model-overview.png','TÁM TỔ HỢP NGOẠI HÌNH THỬ',[(n+'-rest-beauty.png',label) for n,label in names],4)
    items=[]
    for n,label in [('male-trousers','Nam'),('female-long-long','Nữ tóc dài / chân váy dài')]:
        for clip,camera,desc in [('working','side','Ngồi làm việc'),('walk','beauty','Đi bộ tại chỗ'),('stand-up','side','Đứng lên — giữa chuyển động'),('rest','face','Cận mặt')]:
            items.append((f'{n}-{clip}-{camera}.png',label+'\n'+desc))
    sheet('pose-review.png','KIỂM TRA TƯ THẾ VÀ BỀ MẶT',items,4)
    print('Created model-overview.png and pose-review.png from real GLB screenshots')

if __name__=='__main__':main()
