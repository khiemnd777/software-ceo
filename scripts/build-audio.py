"""Original Software CEO composition and UI cues. No samples or external music."""
from pathlib import Path
import json, wave, subprocess
import numpy as np
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/assets/audio';SRC=ROOT/'art-source/audio';OUT.mkdir(parents=True,exist_ok=True);SRC.mkdir(parents=True,exist_ok=True)
SR=32000

def freq(m):return 440*2**((m-69)/12)
def tone(m,d,amp=.15,soft=False):
 t=np.arange(int(d*SR))/SR;f=freq(m)
 body=np.sin(2*np.pi*f*t)+.19*np.sin(2*np.pi*f*2*t)+.05*np.sin(2*np.pi*f*3*t)
 env=(1-np.exp(-t/(.2 if soft else .012)))*np.exp(-t/(2.5 if soft else .6))*np.minimum(1,(d-t)/.12)
 return amp*body*env

def save(name,data):
 data=np.asarray(data);data=np.tanh(data);pcm=(data*26000).astype('<i2')
 wav=SRC/(name+'.wav')
 with wave.open(str(wav),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','libvorbis','-q:a','3',str(OUT/(name+'.ogg'))],check=True)
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','libmp3lame','-q:a','5',str(OUT/(name+'.mp3'))],check=True)
 return {'file':name+'.mp3','alternate':name+'.ogg','durationSeconds':round(len(data)/SR,3),'origin':'original procedural composition; no external samples','source':'scripts/build-audio.py'}
beat=60/92;duration=beat*64;music=np.zeros(int(duration*SR));chords=[[45,52,60,64],[41,48,57,60],[48,55,60,64],[43,50,59,62]]
for bar in range(16):
 notes=chords[(bar//2)%4];start=bar*4*beat
 for n in notes:
  sound=tone(n,4*beat,.035,True);at=int(start*SR);end=min(len(music),at+len(sound));music[at:end]+=sound[:end-at]
 for b in range(4):
  n=notes[(bar+b)%4]+12;sound=tone(n,beat*1.8,.045);at=int((start+b*beat)*SR);end=min(len(music),at+len(sound));music[at:end]+=sound[:end-at]
fade=int(.35*SR);music[:fade]*=np.linspace(0,1,fade);music[-fade:]*=np.linspace(1,0,fade)
metadata=[save('studio-hours',music)]
for name,notes in {'click':[76],'decision':[64,69],'cash':[72,76,79],'release':[60,64,67,72],'alert':[64,62]}.items():
 data=np.zeros(int((.2*len(notes)+.4)*SR))
 for i,n in enumerate(notes):
  s=tone(n,.45,.08);a=int(i*.16*SR);data[a:a+len(s)]+=s
 metadata.append(save(name,data))
(OUT/'manifest.json').write_text(json.dumps({'title':'Studio Hours','composer':'Software CEO project; original authored score','license':'Provided as part of this project; no third-party recordings','tracks':metadata},indent=2))
print(json.dumps(metadata,indent=2))
