// Isolated LOCAL authoring viewer. No imports into the game's Canvas runtime.
const $=id=>document.getElementById(id),canvas=$('stage');
const gl=canvas.getContext('webgl2',{antialias:true,preserveDrawingBuffer:true});
if(!gl)throw Error('Cần WebGL2 cho công cụ review offline này.');
const vs=`#version 300 es
in vec3 aPos;in vec3 aNorm;in vec4 aColor;uniform mat4 uView;out vec3 normal;out vec3 world;out vec4 vertexColor;
void main(){world=aPos;normal=aNorm;vertexColor=aColor;gl_Position=uView*vec4(aPos,1.);}`;
const fs=`#version 300 es
precision highp float;in vec3 normal;in vec3 world;in vec4 vertexColor;uniform vec4 uColor;out vec4 color;
void main(){vec3 n=normalize(normal);if(!gl_FrontFacing)n=-n;
float key=max(dot(n,normalize(vec3(-.4,.7,-.8))),0.);float fill=max(dot(n,normalize(vec3(.7,.3,.6))),0.);
float light=.40+.50*key+.10*fill;vec3 c=uColor.rgb*vertexColor.rgb*light;
color=vec4(pow(c,vec3(1./2.2)),uColor.a);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
const pos=gl.getAttribLocation(program,'aPos'),norm=gl.getAttribLocation(program,'aNorm'),col=gl.getAttribLocation(program,'aColor'),uView=gl.getUniformLocation(program,'uView'),uColor=gl.getUniformLocation(program,'uColor');
const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const multiply=(a,b)=>{const o=Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;};
const normalize=v=>{const d=Math.hypot(...v)||1;return v.map(x=>x/d);};
const sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
function matrix(t=[0,0,0],q=[0,0,0,1],s=[1,1,1]){const [x,y,z,w]=q;return [(1-2*y*y-2*z*z)*s[0],(2*x*y+2*z*w)*s[0],(2*x*z-2*y*w)*s[0],0,(2*x*y-2*z*w)*s[1],(1-2*x*x-2*z*z)*s[1],(2*y*z+2*x*w)*s[1],0,(2*x*z+2*y*w)*s[2],(2*y*z-2*x*w)*s[2],(1-2*x*x-2*y*y)*s[2],0,...t,1];}
function look(eye,at){const z=normalize(sub(eye,at)),x=normalize(cross([0,1,0],z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];}
function ortho(l,r,b,t,n,f){return [2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1];}
async function loadGLB(url){
 const response=await fetch(url);if(!response.ok)throw Error(url+' '+response.status);const bytes=await response.arrayBuffer(),dv=new DataView(bytes);
 if(dv.getUint32(0,true)!==0x46546c67)throw Error('Not GLB');const jl=dv.getUint32(12,true),doc=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,jl))),offset=20+jl+8;
 function accessor(i){const a=doc.accessors[i],v=doc.bufferViews[a.bufferView],components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type],ctor={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
  const off=offset+(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||components*ctor.BYTES_PER_ELEMENT;
  if(stride===components*ctor.BYTES_PER_ELEMENT)return new ctor(bytes,off,a.count*components).slice();
  const out=new ctor(a.count*components);for(let j=0;j<a.count;j++)out.set(new ctor(bytes,off+j*stride,components),j*components);return out;
 }
 const primitives=[];
 for(let ni=0;ni<doc.nodes.length;ni++){const node=doc.nodes[ni];if(node.mesh===undefined)continue;
  for(const p of doc.meshes[node.mesh].primitives){
   const P=accessor(p.attributes.POSITION),N=p.attributes.NORMAL===undefined?new Float32Array(P.length):accessor(p.attributes.NORMAL),indices=p.indices===undefined?Uint32Array.from({length:P.length/3},(_,i)=>i):Uint32Array.from(accessor(p.indices));
   const primitive={node:ni,P,N,indices,morph:p.targets?.[0]?.POSITION===undefined?null:accessor(p.targets[0].POSITION),J:p.attributes.JOINTS_0===undefined?null:accessor(p.attributes.JOINTS_0),W:p.attributes.WEIGHTS_0===undefined?null:accessor(p.attributes.WEIGHTS_0),skin:node.skin,color:doc.materials?.[p.material]?.pbrMetallicRoughness?.baseColorFactor||[1,1,1,1]};
   if(p.attributes.NORMAL===undefined){for(let k=0;k<indices.length;k+=3){const ids=[indices[k],indices[k+1],indices[k+2]],v=ids.map(i=>Array.from(P.slice(i*3,i*3+3))),n=cross(sub(v[1],v[0]),sub(v[2],v[0]));for(const i of ids)for(let a=0;a<3;a++)N[i*3+a]+=n[a];}}
   if(p.attributes.COLOR_0!==undefined){const raw=accessor(p.attributes.COLOR_0),a=doc.accessors[p.attributes.COLOR_0],div=a.normalized?(a.componentType===5121?255:65535):1;primitive.C=Float32Array.from(raw,x=>x/div);}
   primitive.pb=gl.createBuffer();primitive.nb=gl.createBuffer();primitive.cb=gl.createBuffer();primitive.ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,primitive.ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
   const lines=new Uint32Array(indices.length*2);for(let k=0;k<indices.length;k+=3)lines.set([indices[k],indices[k+1],indices[k+1],indices[k+2],indices[k+2],indices[k]],k*2);primitive.wb=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,primitive.wb);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,lines,gl.STATIC_DRAW);primitives.push(primitive);
  }
 }
 const clips=(doc.animations||[]).map(a=>({name:a.name,tracks:a.channels.map(c=>({node:c.target.node,path:c.target.path,time:accessor(a.samplers[c.sampler].input),value:accessor(a.samplers[c.sampler].output)}))}));
 const skins=(doc.skins||[]).map(s=>({...s,inv:accessor(s.inverseBindMatrices)}));
 return {doc,primitives,clips,skins,triangles:primitives.reduce((a,p)=>a+p.indices.length/3,0)};
}
function destroy(model){if(!model)return;for(const p of model.primitives){gl.deleteBuffer(p.pb);gl.deleteBuffer(p.nb);gl.deleteBuffer(p.cb);gl.deleteBuffer(p.ib);gl.deleteBuffer(p.wb);}}
let model,desk,paused=false,time=0,last=0,yaw=0,pitch=0,scale=1,loadToken=0;
function worlds(asset,clipName,t){
 const {doc}=asset,trans=doc.nodes.map(n=>[...(n.translation||[0,0,0])]),rot=doc.nodes.map(n=>[...(n.rotation||[0,0,0,1])]),weights=doc.nodes.map(n=>[...(n.weights||doc.meshes?.[n.mesh]?.weights||[0])]);
 const clip=asset.clips.find(c=>c.name===clipName);
 if(clip)for(const tr of clip.tracks){const size=tr.path==='rotation'?4:tr.path==='weights'?1:3,target=tr.path==='rotation'?rot:tr.path==='weights'?weights:trans;const tm=t*tr.time.at(-1);let k=0;while(k<tr.time.length-2&&tr.time[k+1]<tm)k++;
 const f=Math.max(0,Math.min(1,(tm-tr.time[k])/(tr.time[k+1]-tr.time[k]))),a=Array.from(tr.value.slice(k*size,(k+1)*size)),b=Array.from(tr.value.slice((k+1)*size,(k+2)*size));if(size===4&&dot(a,b)<0)for(let i=0;i<4;i++)b[i]*=-1;
 target[tr.node]=a.map((v,i)=>v*(1-f)+b[i]*f);if(size===4)target[tr.node]=normalize(target[tr.node]);}
 const out=Array(doc.nodes.length);
 function walk(i,parent){const n=doc.nodes[i],m=multiply(parent,n.matrix||matrix(trans[i],rot[i],n.scale));out[i]=m;for(const j of n.children||[])walk(j,m);}
 for(const n of doc.scenes[doc.scene||0].nodes)walk(n,asset===desk?matrix([0,0,0],[-Math.SQRT1_2,0,0,Math.SQRT1_2]):identity());out.morphWeights=weights;return out;
}
function draw(asset,clipName,t){
 const world=worlds(asset,clipName,t),skins=asset.skins.map(s=>s.joints.map((j,i)=>multiply(world[j],Array.from(s.inv.slice(i*16,(i+1)*16)))));
 for(const p of asset.primitives){const out=new Float32Array(p.P.length),normal=new Float32Array(p.N.length);
  for(let i=0;i<p.P.length/3;i++){
   const v=Array.from(p.P.subarray(i*3,i*3+3)),n=p.N.subarray(i*3,i*3+3);
   if(p.morph){const weight=world.morphWeights[p.node][0];for(let r=0;r<3;r++)v[r]+=p.morph[i*3+r]*weight;}
   for(let k=0;k<(p.J?4:1);k++){
    const weight=p.J?p.W[i*4+k]:1;if(weight===0)continue;const m=p.J?skins[p.skin][p.J[i*4+k]]:world[p.node];
    for(let r=0;r<3;r++){out[i*3+r]+=weight*(m[r]*v[0]+m[4+r]*v[1]+m[8+r]*v[2]+m[12+r]);normal[i*3+r]+=weight*(m[r]*n[0]+m[4+r]*n[1]+m[8+r]*n[2]);}
   }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,p.pb);gl.bufferData(gl.ARRAY_BUFFER,out,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,p.nb);gl.bufferData(gl.ARRAY_BUFFER,normal,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(norm);gl.vertexAttribPointer(norm,3,gl.FLOAT,false,0,0);
  if(p.C){gl.bindBuffer(gl.ARRAY_BUFFER,p.cb);gl.bufferData(gl.ARRAY_BUFFER,p.C,gl.STATIC_DRAW);gl.enableVertexAttribArray(col);gl.vertexAttribPointer(col,4,gl.FLOAT,false,0,0);}else{gl.disableVertexAttribArray(col);gl.vertexAttrib4f(col,1,1,1,1);}
  const wire=$('wire').checked;gl.uniform4fv(uColor,wire?[.1,.15,.16,1]:p.color);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,wire?p.wb:p.ib);gl.drawElements(wire?gl.LINES:gl.TRIANGLES,wire?p.indices.length*2:p.indices.length,gl.UNSIGNED_INT,0);
 }
}
const cameras={beauty:[3,2.7,-6,0,.92,0,1.08],front:[0,1.05,-6,0,.92,0,1.08],side:[6,1.3,0,0,.92,0,1.08],back:[0,1.3,6,0,.92,0,1.08],game:[6,5.69898,6,0,.8,0,1.45],face:[1.5,1.8,-6,0,1.65,0,.26],shoulder:[3,2,-6,0,1.21,0,.46]};
function render(now){
 if(!last)last=now;if(!paused)time=(time+(now-last)/2000)%1;last=now;
 const w=Math.round(canvas.clientWidth*devicePixelRatio),h=Math.round(canvas.clientHeight*devicePixelRatio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(.89,.88,.85,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const c=cameras[$('camera').value],at=c.slice(3,6),radius=Math.hypot(c[0],c[2]);let eye=[radius*Math.sin(Math.atan2(c[0],c[2])+yaw),c[1]+pitch,radius*Math.cos(Math.atan2(c[0],c[2])+yaw)];
 const s=c[6]*scale,aspect=w/h;gl.uniformMatrix4fv(uView,false,new Float32Array(multiply(ortho(-s*aspect,s*aspect,-s,s,.01,100),look(eye,at))));
 if(model){draw(model,$('clip').value,time);if($('desk').checked&&desk)draw(desk,'rest',0);}
 $('time').value=time;window.reviewState={loaded:!!model,model:$('model').value,clip:$('clip').value,time,triangles:model?.triangles,webglError:gl.getError()};
 requestAnimationFrame(render);
}
const names={'male-trousers':'Nam · quần dài','male-shorts':'Nam · quần đùi','female-short-long':'Nữ tóc ngắn · chân váy dài','female-short-short':'Nữ tóc ngắn · chân váy ngắn','female-short-trousers':'Nữ tóc ngắn · quần dài','female-long-long':'Nữ tóc dài · chân váy dài','female-long-short':'Nữ tóc dài · chân váy ngắn','female-long-trousers':'Nữ tóc dài · quần dài'};
const manifest=await(await fetch('models-manifest.json')).json();
for(const m of manifest.models){const option=document.createElement('option');option.value=m.file;option.textContent=names[m.file.replace('.glb','')]||m.file;$('model').append(option);}
async function change(){const token=++loadToken,asset=await loadGLB('models/'+$('model').value);if(token!==loadToken){destroy(asset);return;}destroy(model);model=asset;$('info').textContent=`${model.triangles.toLocaleString('vi')} tam giác · ${model.skins[0].joints.length} khớp xương · ${model.clips.length} clip thử. Chất lượng chờ review.`;}
$('model').onchange=change;$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'Phát chuyển động':'Tạm dừng';};$('time').oninput=()=>{paused=true;time=+$('time').value;$('pause').textContent='Phát chuyển động';};$('camera').onchange=()=>{yaw=0;pitch=0;scale=1;};$('clip').onchange=()=>{time=0;$('desk').checked=['working','meeting'].includes($('clip').value);};
let drag;canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);drag=[e.clientX,e.clientY];};canvas.onpointerup=()=>drag=null;canvas.onpointermove=e=>{if(drag){yaw+=(e.clientX-drag[0])*.01;pitch+=(e.clientY-drag[1])*.015;drag=[e.clientX,e.clientY];}};canvas.onwheel=e=>{e.preventDefault();scale=Math.max(.2,Math.min(3,scale*Math.exp(e.deltaY*.001)));};
await change();desk=await loadGLB('../v4/models/01_workstation_typing.glb');
// Keep real furniture from the supplied workstation; remove its old character.
const firstOriginalPerson=desk.doc.nodes.findIndex(n=>n.name?.endsWith('__hoodie_main_torso'));
if(firstOriginalPerson<0)throw Error('Không xác định được ranh giới nội thất/nhân vật V4.');
const removed=desk.primitives.filter(p=>p.node>=firstOriginalPerson);destroy({primitives:removed});desk.primitives=desk.primitives.filter(p=>p.node<firstOriginalPerson);
requestAnimationFrame(render);
window.reviewControl={setTime(t){paused=true;time=t;$('pause').textContent='Phát chuyển động';},play(){paused=false;$('pause').textContent='Tạm dừng';},setCamera(name){$('camera').value=name;yaw=0;pitch=0;scale=1;},async setModel(file){$('model').value=file;await change();},setClip(name){$('clip').value=name;time=0;$('desk').checked=['working','meeting'].includes(name);},setDesk(value){$('desk').checked=value;}};
