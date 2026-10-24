"""Female face/bob correction: original editable surfaces, static art review.

Loads V2 authoring context read-only and replaces female head objects only.
Eyelids and lips share the actual face boundary. Hair has a side part, a swept
front section and an ear tuck. No rig, game import, AI texture or body edits.
"""
from pathlib import Path
import sys, math, json, hashlib, struct, importlib.util
sys.dont_write_bytecode=True
import bpy, bmesh
from mathutils import Matrix, Vector

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art-source/character-female-head-v3'
EV=ROOT/'evidence/character-female-head-v3'
ARGS=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
PI=math.pi
spec=importlib.util.spec_from_file_location('v2_helpers',ROOT/'scripts/character-redesign-v2/build.py')
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)


def geometry_hash(ob):
    """Exact authoring mesh and transform receipt, before modifier evaluation."""
    h=hashlib.sha256();h.update(ob.type.encode());h.update(bytes(str(tuple(tuple(r) for r in ob.matrix_world)),'ascii'))
    if ob.type=='MESH':
        for v in ob.data.vertices:h.update(struct.pack('<3d',*v.co))
        for p in ob.data.polygons:h.update(struct.pack('<'+'I'*len(p.vertices),*p.vertices));h.update(struct.pack('<I?',p.material_index,p.use_smooth))
        h.update(json.dumps([(m.name,m.type) for m in ob.modifiers]).encode())
        h.update(json.dumps([m.name if m else None for m in ob.data.materials]).encode())
    return h.hexdigest()


def radial(name,fn,mat,segments=64,rings=14):
    vs=[fn(0,0)]+[fn(i/segments*2*PI,j/rings) for j in range(1,rings+1) for i in range(segments)]
    fs=[[0,1+i,1+(i+1)%segments] for i in range(segments)]
    for j in range(rings-1):
        for i in range(segments):
            p=1+j*segments+i;q=1+j*segments+(i+1)%segments;fs.append([p,q,q+segments,p+segments])
    return a.mesh(name,vs,fs,mat,0)


def outward(ob):
    center=Vector((0,.024,1.735))
    score=sum(p.normal.dot(p.center-center)*p.area for p in ob.data.polygons)
    if score<0:
        bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(ob.data);bm.free();ob.data.update()
    return ob


class FemaleHead:
    def __init__(self):
        self.skin=a.material('V3 · warm skin','D9AC90',.62,True)
        self.skin.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.28
        self.upperlip=a.material('V3 · upper lip','B77C6B',.57)
        self.lowerlip=a.material('V3 · lower lip','CB9380',.52)
        self.mouth=a.material('V3 · inner mouth','875747',.72)
        self.hair=a.material('V3 · soft chestnut','48352C',.72)
        self.hairlight=a.material('V3 · comb planes','4D392E',.72)
        self.hairroot=a.material('V3 · hair roots','443229',.67)
        self.brow=a.material('V3 · brow / lid','473027',.67)
        self.white=a.material('V3 · warm eye white','E5DFD2',.22)
        self.iris=a.material('V3 · deep brown iris','523321',.20)
        self.irislight=a.material('V3 · iris outer ring','63432D',.24)
        self.pupil=a.material('V3 · pupil','17110E',.13)
        for material in [self.iris,self.irislight,self.pupil]:
            p=material.node_tree.nodes.get('Principled BSDF');p.inputs['Coat Weight'].default_value=.32;p.inputs['Coat Roughness'].default_value=.12

    def width(self,z):
        return a.profiles(z,[(1.522,.009),(1.539,.043),(1.563,.072),(1.602,.105),(1.649,.127),(1.69,.133),(1.735,.130),(1.79,.124),(1.835,.099),(1.864,.052),(1.876,.002)])

    def depth(self,z):
        return a.profiles(z,[(1.522,.010),(1.547,.080),(1.58,.096),(1.62,.108),(1.69,.118),(1.75,.119),(1.81,.105),(1.85,.079),(1.876,.002)])

    def center(self,z):return a.profiles(z,[(1.522,.002),(1.62,.016),(1.76,.024),(1.876,.031)])

    def front(self,x,z):
        w=self.width(z);ratio=min(.999,abs(x)/max(.001,w));y=self.center(z)-self.depth(z)*math.sqrt(max(.002,1-ratio*ratio))
        g=a.gauss
        y+=.006*(g(x,z,-.055,1.712,.031,.024)+g(x,z,.055,1.712,.031,.024))
        y-=.005*(g(x,z,-.054,1.750,.035,.015)+g(x,z,.054,1.750,.035,.015))
        y-=.010*(g(x,z,-.079,1.663,.042,.034)+g(x,z,.079,1.663,.042,.034))
        y-=.004*(g(x,z,-.062,1.618,.041,.026)+g(x,z,.062,1.618,.041,.026))
        y-=.010*g(x,z,0,1.696,.020,.057)
        y-=.016*g(x,z,0,1.654,.021,.022)
        y-=.007*(g(x,z,-.017,1.644,.010,.010)+g(x,z,.017,1.644,.010,.010))
        y+=.004*(g(x,z,-.014,1.640,.005,.003)+g(x,z,.014,1.640,.005,.003))
        y-=.010*g(x,z,0,1.596,.046,.026)
        y-=.004*g(x,z,0,1.565,.031,.017)
        return y

    def skin_surface(self,x,z):
        ratio=min(.999,abs(x)/max(.001,self.width(z)))
        base=self.center(z)-self.depth(z)*math.sqrt(max(.002,1-ratio*ratio))
        return base+(self.front(x,z)-base)*(1-ratio*ratio)

    def face(self):
        nu=128;nz=81;vs=[];fs=[]
        for j in range(nz):
            z=1.522+.354*j/(nz-1)
            for i in range(nu):
                angle=i/nu*2*PI;x=self.width(z)*math.sin(angle);y=self.center(z)-self.depth(z)*math.cos(angle)
                if math.cos(angle)>0:
                    y=self.skin_surface(x,z)
                vs.append(Vector((x,y,z)))
        # Real eye and mouth openings, with shared outer vertices. All facial
        # additions below form a continuation of this cage, not decals over it.
        holes=[(1,19,36,53),(109,127,36,53),(120,136,12,23)]
        for j in range(nz-1):
            for i in range(nu):
                if any(lo<=((i-lo)%nu+lo)<hi and zl<=j<zh for lo,hi,zl,zh in holes):continue
                p=j*nu+i;q=j*nu+(i+1)%nu;fs.append([p,q,q+nu,p+nu])
        def boundary(lo,hi,zl,zh):
            return [zl*nu+i%nu for i in range(lo,hi+1)]+[j*nu+hi%nu for j in range(zl+1,zh+1)]+[zh*nu+i%nu for i in range(hi-1,lo-1,-1)]+[j*nu+lo%nu for j in range(zh-1,zl,-1)]
        for side,hole in zip([1,-1],holes[:2]):
            ex=side*.055;ez=1.712;cy=-.056;radius=.034
            outer=boundary(*hole);angles=[math.atan2((vs[i].z-ez)/.029,(vs[i].x-ex)/.035) for i in outer]
            ring=outer
            for step in range(1,13):
                t=step/12;new=[]
                for k,angle in enumerate(angles):
                    sine=math.sin(angle)
                    ix=.0275*math.cos(angle);iz=(.0158 if sine>=0 else .0105)*sine*abs(sine)+side*.0025*math.cos(angle)
                    inside=Vector((ex+ix,cy-math.sqrt(max(.000001,radius*radius-ix*ix-iz*iz))-.0008,ez+iz))
                    v=vs[outer[k]]*(1-t)+inside*t
                    skin_y=self.skin_surface(v.x,v.z)
                    dx=v.x-ex;dz=v.z-ez;rad=dx*dx+dz*dz
                    sphere_y=cy-math.sqrt(max(.000001,radius*radius-rad))-.0008
                    adjusted_dz=dz-side*.0025*(dx/.0275)
                    height=.0158 if adjusted_dz>=0 else .0105
                    q=max(0,min(1,(1.55-((dx/.0275)**2+abs(adjusted_dz)/height))/.55))
                    q=q*q*(3-2*q)
                    v.y=skin_y*(1-q)+sphere_y*q
                    new.append(len(vs));vs.append(v)
                for k in range(len(ring)):fs.append([ring[k],ring[(k+1)%len(ring)],new[(k+1)%len(ring)],new[k]])
                ring=new
            self.eye(side,ex,ez,cy,radius)
        # Lip opening, cupid bow and lower-lip volume continue from the face.
        outer=boundary(*holes[2]);angles=[math.atan2((vs[i].z-1.594)/.022,vs[i].x/.043) for i in outer];ring=outer
        lip_material_start=len(fs);lip_material_indices=[]
        for step in range(1,9):
            t=step/8;new=[]
            for k,angle in enumerate(angles):
                x=.033*math.cos(angle);curve=1.594+.005*(x/.033)**2
                opening_z=curve+.00035*math.sin(angle)
                # Outer skin -> lip border -> inner wet line.
                if t<=.5:
                    s=t*2;lip_height=(.0045 if math.sin(angle)>0 else .0065)*math.sin(angle)
                    bow=.0013*math.exp(-((abs(x)-.009)/.006)**2)*max(0,math.sin(angle))
                    border=Vector((x*1.09,self.skin_surface(x*1.09,curve+lip_height)-.0005,curve+lip_height+bow))
                    p=vs[outer[k]]*(1-s)+border*s
                else:
                    s=(t-.5)*2;lip_height=(.0045 if math.sin(angle)>0 else .0065)*math.sin(angle)
                    bow=.0013*math.exp(-((abs(x)-.009)/.006)**2)*max(0,math.sin(angle))
                    border=Vector((x*1.09,self.skin_surface(x*1.09,curve+lip_height)-.0005,curve+lip_height+bow))
                    inside=Vector((x,self.skin_surface(x,curve)-.0015,opening_z))
                    p=border*(1-s)+inside*s;p.y-=.0010*math.sin(PI*s)*abs(math.sin(angle))
                new.append(len(vs));vs.append(p)
            for k in range(len(ring)):
                fs.append([ring[k],ring[(k+1)%len(ring)],new[(k+1)%len(ring)],new[k]])
                lip_material_indices.append(0 if step<=4 else (1 if math.sin(angles[k])>0 else 2))
            ring=new
        ob=a.mesh('Female V3 · face with connected eyelids and lips',vs,fs,self.skin,1)
        ob.data.materials.append(self.upperlip);ob.data.materials.append(self.lowerlip)
        for p,mat in zip(list(ob.data.polygons)[lip_material_start:],lip_material_indices):p.material_index=mat
        radial('Female V3 · mouth cavity',lambda angle,r:(.034*math.cos(angle)*r,self.front(.034*math.cos(angle)*r,1.594)+.004,1.594+.005*(math.cos(angle)*r)**2+.0008*math.sin(angle)*r),self.mouth,64,5)
        self.brows();self.ears()

    def eye(self,side,ex,ez,cy,radius):
        def surface(dx,dz,offset=0):return (ex+dx,cy-math.sqrt(max(.000001,radius*radius-dx*dx-dz*dz))-offset,ez+dz)
        def visible(dx,dz):
            u=dx/.0275
            if abs(u)>1:return False
            slant=side*.0025*u;h=max(0,1-u*u)
            return -.0105*h+slant<=dz<=.0158*h+slant
        radial('Female V3 · almond eye white',lambda angle,r:surface(.0275*math.cos(angle)*r,((.0158 if math.sin(angle)>=0 else .0105)*math.sin(angle)*abs(math.sin(angle))+side*.0025*math.cos(angle))*r),self.white,80,20)
        gaze=.003
        def iris(angle,t):
            lo=0;hi=.0175
            for _ in range(22):
                mid=(lo+hi)/2
                if visible(math.cos(angle)*mid,gaze+math.sin(angle)*mid):lo=mid
                else:hi=mid
            r=lo*t;return surface(math.cos(angle)*r,gaze+math.sin(angle)*r,.00035)
        iris_ob=radial('Female V3 · clipped curved iris',iris,self.iris,96,18)
        iris_ob.data.materials.append(self.irislight)
        for p in iris_ob.data.polygons:
            c=p.center;dx=c.x-ex;dz=c.z-ez
            if math.hypot(dx,dz)>.013:p.material_index=1
        radial('Female V3 · pupil',lambda angle,t:surface(math.cos(angle)*.0070*t,gaze+math.sin(angle)*.0070*t,.00065),self.pupil,64,10)
        def lash(u,t):
            angle=.03+u*(PI-.06);x=.0275*math.cos(angle);z=.0158*math.sin(angle)**2+side*.0025*math.cos(angle)
            p=Vector(surface(x,z,.0010));p.z+=t*.0010*math.sin(angle)**.5
            return p
        a.surface('Female V3 · soft upper lash line',lash,40,3,self.brow,1,False)

    def brows(self):
        for side in [-1,1]:
            def brow(u,t,side=side):
                x=side*(.024+.064*u);z=1.741+.005*math.sin(PI*u)-.005*u
                thickness=.0040*math.sin(PI*(.07+.86*u))**.7
                z+=(t-.5)*thickness
                return (x,self.skin_surface(x,z)-.0014-.0006*math.sin(PI*t),z)
            a.surface('Female V3 · tapered expressive brow',brow,24,5,self.brow,1,False)

    def ears(self):
        for side in [-1,1]:
            a.uv('Female V3 · ear',(side*.133,.017,1.676),(.021,.029,.040),self.skin,32,24)
            mat=a.material('V3 · ear concha '+str(side),'BD8A74',.62)
            a.uv('Female V3 · inner ear',(side*.150,-.001,1.676),(.004,.014,.022),mat,24,16)

    def hair_style(self):
        def scalp(angle,t):
            front=max(0,math.cos(angle));end_z=1.65+.208*front**.35+.005*math.sin(angle)*front
            end=math.acos(max(-.99,min(.99,(end_z-1.747)/.156)))
            b=.006+(end-.006)*t
            return (.143*math.sin(b)*math.sin(angle),.025-.126*math.sin(b)*math.cos(angle),1.747+.156*math.cos(b))
        ob=outward(a.surface('Female V3 · fitted scalp below swept sections',scalp,80,36,self.hairroot,1));sol=ob.modifiers.new('Scalp thickness','SOLIDIFY');sol.thickness=.004;sol.offset=-1
        a.uv('Female V3 · covered part-root volume',(.053,-.023,1.865),(.025,.030,.019),self.hair,40,28)
        def back(u,t):
            z=1.914-.380*t*t
            right=.55+1.08*min(1,max(0,(1.83-z)/.13));left=.70+.25*t
            angle=right+u*(2*PI-right-left)
            rx=a.profiles(z,[(1.53,.126),(1.55,.148),(1.62,.165),(1.70,.163),(1.79,.152),(1.85,.128),(1.89,.083),(1.914,.001)])
            ry=a.profiles(z,[(1.53,.092),(1.55,.112),(1.62,.143),(1.70,.146),(1.79,.135),(1.85,.106),(1.89,.066),(1.914,.001)])
            if z>1.87:
                k=min(1,(z-1.87)/.015);sphere=math.sqrt(max(.00003,1-((z-1.754)/.160)**2))
                rx=rx*(1-k)+.149*sphere*k;ry=ry*(1-k)+.123*sphere*k
            flow=angle+.25*(1-t);relief=.0014*(.5+.5*math.cos(flow*22))**3*math.sin(PI*t)
            return ((rx+relief)*math.sin(angle),.027-(ry+relief)*math.cos(angle),z+.003*math.cos(angle*5)*t**8)
        ob=outward(a.surface('Female V3 · rounded bob back with ear tuck',back,78,42,self.hair,1,False));sol=ob.modifiers.new('Bob hem thickness','SOLIDIFY');sol.thickness=.007;sol.offset=-1
        left_outer=[(.067,.007,1.902),(-.025,-.028,1.913),(-.125,-.046,1.866),(-.166,-.039,1.768),(-.165,-.025,1.645),(-.147,-.010,1.565),(-.115,.002,1.539)]
        left_inner=[(.062,-.052,1.883),(.010,-.076,1.853),(-.064,-.090,1.805),(-.113,-.063,1.731),(-.133,-.042,1.635),(-.130,-.026,1.567),(-.111,-.006,1.542)]
        right_inner=[(.062,-.052,1.883),(.114,-.062,1.839),(.135,-.020,1.766),(.132,.038,1.689),(.132,.052,1.603),(.118,.033,1.542)]
        right_outer=[(.067,.007,1.902),(.143,-.017,1.850),(.165,.026,1.760),(.167,.062,1.667),(.159,.067,1.586),(.134,.042,1.536)]
        for name,outer,inner in [('side-swept fringe',left_outer,left_inner),('tucked temple section',right_outer,right_inner)]:
            def panel(v,u,outer=outer,inner=inner):
                p=a.catmull(outer,u)*(1-v)+a.catmull(inner,u)*v
                p.y-=.010*math.sin(PI*v)*math.sin(PI*u*.95)
                p.y-=.0018*(.5+.5*math.cos(v*6*PI+u*.8))**3*math.sin(PI*u)
                p.y-=.00035*(.5+.5*math.cos(v*18*PI+u*.8))**3*math.sin(PI*u)
                p.z+=.003*math.sin(PI*v)*math.sin(PI*u)
                return p
            ob=outward(a.surface('Female V3 · '+name,panel,22,46,self.hairlight if 'fringe' in name else self.hair,1,False))
            sol=ob.modifiers.new('Connected broad lock thickness','SOLIDIFY');sol.thickness=.007;sol.offset=-1


def main():
    OUT.mkdir(exist_ok=True);EV.mkdir(exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art-source/character-redesign-v2/characters-v2.blend'))
    scene=bpy.context.scene;scene.cycles.samples=24 if '--draft' in ARGS else 48
    old_head=['continuous face','shaped scleral','iris','pupil','integrated eyelid','fine upper','tapered eyebrow','ear outer','ear concha','lip line','lower lip','soft nostril','side-swept bob']
    to_remove=[ob for ob in bpy.data.collections['Female | authored model'].objects if any(s in ob.name for s in old_head)]
    preserved={ob.name:geometry_hash(ob) for ob in bpy.data.objects if ob.type=='MESH' and ob not in to_remove}
    for ob in to_remove:bpy.data.objects.remove(ob,do_unlink=True)
    before=set(bpy.data.objects);head=FemaleHead();head.face();head.hair_style();new=list(set(bpy.data.objects)-before)
    pivot=Vector((0,0,1.49));transform=Matrix.Translation(Vector((.45,0,0)))@Matrix.Diagonal((1,1,.955,1))@Matrix.Translation(pivot)@Matrix.Diagonal((.8,.8,.8,1))@Matrix.Translation(-pivot)@Matrix.Translation(Vector((0,0,-.035)))
    bpy.context.view_layer.update()
    collection=bpy.data.collections.new('Female V3 | authored head');scene.collection.children.link(collection)
    for ob in new:
        ob.matrix_world=transform@ob.matrix_world
        for c in list(ob.users_collection):c.objects.unlink(ob)
        collection.objects.link(ob)
    bpy.context.view_layer.update()
    after={name:geometry_hash(bpy.data.objects[name]) for name in preserved}
    assert after==preserved,'Unrelated authoring geometry changed'
    (EV/'context-preservation.json').write_text(json.dumps({'objects_checked':len(preserved),'before':preserved,'after':after,'pass':True},indent=2)+'\n')
    for ob in bpy.data.collections['Male | authored model'].objects:ob.hide_render=True
    camera=scene.camera;camera.data.ortho_scale=.46;camera.location=(.45,-5,1.65);camera.rotation_euler=(Vector((.45,0,1.555))-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.resolution_x=900;scene.render.resolution_y=1000
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'female-head-v3.blend'))
    if '--source-only' not in ARGS:
        for name,eye in [('front-study',(.45,-5,1.555)),('three-quarter-study',(4,-4,1.65)),('profile-study',(5,.0,1.555))]:
            camera.location=eye;camera.rotation_euler=(Vector((.45,0,1.555))-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(EV/(name+'.png'));bpy.ops.render.render(write_still=True)
    print('FEMALE HEAD V3 authored; other geometry preserved',flush=True)


if __name__=='__main__':main()
