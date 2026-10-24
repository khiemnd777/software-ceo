"""Original character authoring in isolated Blender 4.5 LTS.

Art-first static study. Editable quad cages, named material/feature objects,
subdivision and physical studio lighting. No production-game imports or writes.
No rigs, animation or image-generated textures in this review milestone.
"""
from pathlib import Path
import sys, math, json, hashlib
import bpy
import bmesh
from mathutils import Vector, Matrix

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art-source/character-redesign-v2'
EVIDENCE=ROOT/'evidence/character-redesign-v2'
ARGS=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
HEAD_ONLY='--head-only' in ARGS
DRAFT='--draft' in ARGS
PI=math.pi


def linear(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
def color(hexcode):return tuple(linear(int(hexcode[i:i+2],16)/255) for i in (0,2,4))+(1,)
def material(name,hexcode,rough=.5,skin=False):
    m=bpy.data.materials.new(name);m.diffuse_color=color(hexcode);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=m.diffuse_color;p.inputs['Roughness'].default_value=rough
    if skin:
        p.inputs['Subsurface Weight'].default_value=.025
        p.inputs['Subsurface Radius'].default_value=(1,.42,.22)
        p.inputs['Subsurface Scale'].default_value=.018
    return m


def mesh(name,verts,faces,mat,sub=1):
    data=bpy.data.meshes.new(name+' Cage');data.from_pydata(verts,[],faces);data.update()
    ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob)
    bm=bmesh.new();bm.from_mesh(data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(data);bm.free()
    for p in data.polygons:p.use_smooth=True
    ob.data.materials.append(mat)
    if sub:
        mod=ob.modifiers.new('Controlled smooth surface','SUBSURF');mod.subdivision_type='CATMULL_CLARK';mod.levels=sub;mod.render_levels=sub
    return ob


def surface(name,fn,nu,nv,mat,sub=1,wrap=True):
    vs=[fn((i/nu*2*PI if wrap else i/(nu-1)),j/(nv-1)) for j in range(nv) for i in range(nu)]
    fs=[]
    for j in range(nv-1):
        for i in range(nu if wrap else nu-1):
            a=j*nu+i;b=j*nu+(i+1)%nu;fs.append([a,b,b+nu,a+nu])
    return mesh(name,vs,fs,mat,sub)


def uv(name,loc,scale,mat,segments=32,rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc)
    ob=bpy.context.object;ob.name=name;ob.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    ob.data.materials.append(mat)
    for p in ob.data.polygons:p.use_smooth=True
    return ob


def catmull(points,t):
    points=[Vector(p) for p in points];f=t*(len(points)-1);i=min(int(f),len(points)-2);u=f-i
    a,b,c,d=points[max(0,i-1)],points[i],points[i+1],points[min(len(points)-1,i+2)]
    return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u)


def sweep(name,points,widths,heights,mat,sub=1,n=12,steps=20):
    def fn(a,t):
        c=catmull(points,t);lo=catmull(points,max(0,t-.001));hi=catmull(points,min(1,t+.001));tan=(hi-lo).normalized()
        side=tan.cross(Vector((0,0,1))).normalized()
        if side.length<.1:side=Vector((1,0,0))
        up=side.cross(tan).normalized();w=interp(t,widths);h=interp(t,heights)
        return c+side*(math.sin(a)*w)+up*(math.cos(a)*h)
    return surface(name,fn,n,steps,mat,sub)


def interp(t,values):
    f=max(0,min(1,t))*(len(values)-1);i=min(int(f),len(values)-2);s=f-i
    return values[i]*(1-s)+values[i+1]*s


def profiles(z,points):
    if z<=points[0][0]:return points[0][1]
    for i in range(len(points)-1):
        if z<=points[i+1][0]:
            h=points[i+1][0]-points[i][0];t=(z-points[i][0])/h
            slopes=[(points[k+1][1]-points[k][1])/(points[k+1][0]-points[k][0]) for k in range(len(points)-1)]
            def tangent(k):
                if k==0:return slopes[0]
                if k==len(points)-1:return slopes[-1]
                a,b=slopes[k-1],slopes[k]
                return 2*a*b/(a+b) if a*b>0 else 0
            a,b=points[i][1],points[i+1][1]
            return (2*t**3-3*t*t+1)*a+(t**3-2*t*t+t)*h*tangent(i)+(-2*t**3+3*t*t)*b+(t**3-t*t)*h*tangent(i+1)
    return points[-1][1]


def gauss(x,z,cx,cz,sx,sz):return math.exp(-((x-cx)/sx)**2-((z-cz)/sz)**2)


def seal(ob):
    bm=bmesh.new();bm.from_mesh(ob.data)
    boundary=[e for e in bm.edges if e.is_boundary]
    if boundary:bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    bm.to_mesh(ob.data);bm.free()


class Character:
    def __init__(self,female=False):
        self.female=female
        self.prefix='Female' if female else 'Male'
        self.objects=[]
        self.skin=material(self.prefix+' · skin','DAB091' if female else 'CFA180',.50,True)
        self.lip=material(self.prefix+' · lip','BF826F' if female else 'AF7967',.58)
        self.crease=material(self.prefix+' · soft facial crease','845449',.65)
        self.hair=material(self.prefix+' · chestnut hair','49382F' if female else '382D29',.55)
        self.hair_mid=material(self.prefix+' · hair secondary plane','514036' if female else '42352E',.56)
        self.hair_dark=material(self.prefix+' · hair roots','3E3029' if female else '342921',.56)
        self.eye=material(self.prefix+' · eye white','EBE5D9',.24)
        self.iris=material(self.prefix+' · brown iris','624333',.24)
        self.pupil=material(self.prefix+' · pupil','171512',.17)
        self.shirt=material(self.prefix+' · muted teal overshirt','527378',.78)
        self.trim=material(self.prefix+' · overshirt edges','49676B',.80)
        self.tee=material(self.prefix+' · cream undershirt','E6E2D8',.83)
        self.pants=material(self.prefix+' · charcoal trousers','474B4B',.83)
        self.pant_seam=material(self.prefix+' · trouser stitching','3E4242',.88)
        self.sole=material(self.prefix+' · warm white outsole','E6E0D5',.70)
        self.shoe=material(self.prefix+' · sneaker upper','E9E3D8',.74)
        self.seam=material(self.prefix+' · sneaker seam','C6BFB3',.76)

    def front(self,x,z):
        w=self.head_width(z);r=max(.001,min(.999,abs(x)/max(w,.001)));d=self.head_depth(z)
        y=self.center(z)-d*math.sqrt(max(.002,1-r*r))
        eye_z=1.716 if self.female else 1.710
        # Orbital recesses, cheek planes, nose bridge, tip and alar wings are
        # authored in the same face surface. Eye/lip details sit in this form.
        y+=.007*(gauss(x,z,.057,eye_z,.033,.024)+gauss(x,z,-.057,eye_z,.033,.024))
        y-=.009*(gauss(x,z,.084,1.657,.045,.036)+gauss(x,z,-.084,1.657,.045,.036))
        y-=.018*gauss(x,z,0,1.692,.022,.063)
        y-=.027*gauss(x,z,0,1.650,.025,.021)
        y-=.007*(gauss(x,z,.020,1.640,.012,.012)+gauss(x,z,-.020,1.640,.012,.012))
        y-=.009*gauss(x,z,0,1.599,.043,.037)
        y+=.006*gauss(x,z,0,1.624,.021,.010)
        y-=.005*gauss(x,z,0,1.591,.035,.010)
        y-=.004*gauss(x,z,0,1.573,.034,.010)
        return y

    def head_width(self,z):
        return profiles(z,[(1.529,.009),(1.544,.035 if self.female else .044),(1.57,.068 if self.female else .082),(1.61,.104 if self.female else .118),(1.67,.131),(1.72,.135),(1.78,.129),(1.825,.110),(1.858,.062),(1.870,.004)])

    def head_depth(self,z):return profiles(z,[(1.529,.012),(1.553,.063),(1.60,.101),(1.68,.111),(1.75,.116),(1.81,.108),(1.85,.073),(1.870,.003)])
    def center(self,z):return profiles(z,[(1.51,.0),(1.60,.012),(1.75,.022),(1.87,.035)])

    def head(self):
        start=set(bpy.data.objects)
        def face(a,t):
            z=1.529+.341*t;x=self.head_width(z)*math.sin(a);cy=self.center(z);d=self.head_depth(z);y=cy-d*math.cos(a)
            if math.cos(a)>0:
                basic=cy-d*math.sqrt(max(.002,1-(x/max(.001,self.head_width(z)))**2))
                y+=(self.front(x,z)-basic)*math.cos(a)**3
            return (x,y,z)
        surface(self.prefix+' · continuous face / nose / cheeks',face,64,56,self.skin,1)
        # Neck is sculpted with a jaw insertion and shoulder flare; the
        # visible length is kept to reference, not a cylinder between parts.
        surface(self.prefix+' · shaped neck',lambda a,t:(interp(t,[.078,.061,.052,.040])*math.sin(a),.018-interp(t,[.061,.048,.044,.032])*math.cos(a),1.385+.195*t),24,10,self.skin,2)
        for side in [-1,1]:
            ex=side*.057;ez=1.716 if self.female else 1.710;cy=-.055;radius=.032 if self.female else .031
            def sclera(a,t,ex=ex,ez=ez,cy=cy,radius=radius):
                r=.001+.999*t;x=.0275*math.cos(a)*r;z=(.0130*math.sin(a)+.002*math.cos(a))*r
                return (ex+x,cy-math.sqrt(max(.00001,radius*radius-x*x-z*z)),ez+z)
            surface(self.prefix+' · shaped scleral surface',sclera,40,12,self.eye,1)
            uv(self.prefix+' · iris',(ex,cy-radius+.001,ez),(.015,.002,.0155),self.iris)
            uv(self.prefix+' · pupil',(ex,cy-radius-.001,ez),(.007,.001,.008),self.pupil,24,16)
            def lid(a,t,ex=ex,ez=ez,cy=cy,radius=radius):
                ix=.0275*math.cos(a);iz=.0130*math.sin(a)+.002*math.cos(a)
                ox=.037*math.cos(a);oz=.021*math.sin(a)+.002*math.cos(a)
                x=ex+ix*(1-t)+ox*t;z=ez+iz*(1-t)+oz*t
                inner=cy-math.sqrt(max(.00001,radius*radius-ix*ix-iz*iz))-.0008
                outer=self.front(ex+ox,ez+oz)-.0003
                s=t*t*(3-2*t);y=inner*(1-s)+outer*s-.0008*math.sin(PI*t)
                return (x,y,z)
            surface(self.prefix+' · integrated eyelid loops',lid,36,6,self.skin,1)
            def upper_lid(u,t,ex=ex,ez=ez,cy=cy,radius=radius):
                angle=.08+u*(PI-.16);ix=.0275*math.cos(angle);iz=.0130*math.sin(angle)+.002*math.cos(angle)
                x=ex+ix;z=ez+iz+t*.0012
                return (x,cy-math.sqrt(max(.00001,radius*radius-ix*ix-iz*iz))-.0011,z)
            surface(self.prefix+' · fine upper eyelid',upper_lid,30,3,self.hair_dark,1,False)
            points=[]
            for j in range(6):
                t=j/5;x=ex+side*(-.030+.061*t);z=ez+.034+.007*math.sin(PI*t)-.008*t
                points.append((x,self.front(x,z)-.004,z))
            sweep(self.prefix+' · tapered eyebrow',points,[.0003,.0025,.002,.0002],[.001,.005 if self.female else .006,.004,.0004],self.hair,1,8,16)
            uv(self.prefix+' · ear outer',(side*.132,.016,1.672),(.023,.030,.043),self.skin,24,20)
            ear_mat=material(self.prefix+' · ear concha '+str(side),'BF8B70',.64,True)
            uv(self.prefix+' · ear concha',(side*.149,.002,1.675),(.005,.016,.023),ear_mat,20,16)
        lippts=[]
        for j in range(9):
            x=-.034+.068*j/8;z=1.585+.006*(x/.034)**2;lippts.append((x,self.front(x,z)-.0015,z))
        sweep(self.prefix+' · lip line',lippts,[.0001,.0011,.0012,.001,.0001],[.0004,.0014,.0017,.0012,.0002],self.crease,1,8,24)
        lower=[(x,y+.0001,z-.004) for x,y,z in lippts]
        sweep(self.prefix+' · lower lip volume',lower,[.0001,.002,.0028,.002,.0001],[.0002,.003,.0035,.002,.0001],self.lip,1,8,24)
        for side in [-1,1]:
            x=side*.015;z=1.639
            uv(self.prefix+' · soft nostril',(x,self.front(x,z)-.0005,z),(.0032,.001,.0013),self.crease,16,10)
        if self.female:self.bob()
        else:self.short_hair()
        self.objects.extend(set(bpy.data.objects)-start)

    def short_hair(self):
        # One connected sculpted mass. Hair flow is shallow relief in the
        # surface, so broad locks cannot float like disconnected plastic fins.
        def cap(a,t):
            signed=(a+PI)%(2*PI)-PI;f=max(math.cos(a),0)
            fringe=.008*math.exp(-((signed+.38)/.20)**2)
            end_z=1.652+.160*max(0,math.cos(a-.20))**1.35-fringe
            end=math.acos(max(-.99,min(.99,(end_z-1.746)/.178)))
            b=.006+(end-.006)*t
            x=.145*math.sin(b)*math.sin(a);y=.021-.128*math.sin(b)*math.cos(a);z=1.746+.178*math.cos(b)
            y-=.032*math.exp(-((z-1.868)/.055)**2)*f*f
            # Side part travels from the forehead toward the crown. Each
            # side has a coherent comb direction and restrained broad ridges.
            part=.067-.37*(y+.11)
            flow=y+.20*x+.75*(x-part)**2
            wave=(.5+.5*math.cos(flow*2*PI/.045))**3
            relief=.0065*wave*math.sin(PI*t*.88)**.7
            relief+=.0009*(.5+.5*math.cos(flow*2*PI/.009))**5*math.sin(PI*t)
            quiff=.014*math.exp(-((x+.035)/.10)**2-((y+.065)/.095)**2)
            normal=Vector((x/.148,(y-.021)/.132,(z-1.746)/.178)).normalized()
            p=Vector((x-.013*math.sin(b)**2*f,y,z+quiff))
            p+=normal*relief
            p.z-=.007*math.exp(-((x-part)/.008)**2)*max(0,1-t*.6)
            return p
        ob=surface(self.prefix+' · continuous swept hair volume',cap,144,72,self.hair,1)
        thick=ob.modifiers.new('Solid sculpted hair edge','SOLIDIFY');thick.thickness=.004;thick.offset=-1
        for side in [-1,1]:
            sweep(self.prefix+' · tapered sideburn',[(side*.137,-.008,1.721),(side*.139,-.008,1.688),(side*.130,-.009,1.648)],[.012,.013,.001],[.004,.004,.001],self.hair,1,10,14)

    def bob(self):
        def shell(a,t):
            signed=(a+PI)%(2*PI)-PI
            window=math.exp(-(abs(signed-.14)/.90)**4)
            end_z=1.515+.283*window+.028*math.sin(a)*window
            z=1.929-(1.929-end_z)*t*t
            rx=profiles(z,[(1.51,.143),(1.57,.171),(1.65,.176),(1.74,.163),(1.81,.145),(1.865,.114),(1.90,.075),(1.929,.001)])
            ry=profiles(z,[(1.51,.120),(1.57,.143),(1.65,.146),(1.74,.139),(1.81,.127),(1.865,.099),(1.90,.064),(1.929,.001)])
            if z>1.865:
                blend=min(1,(z-1.865)/.02)
                rx=rx*(1-blend)+.148*math.sqrt(max(.00005,1-((z-1.760)/.169)**2))*blend
                ry=ry*(1-blend)+.128*math.sqrt(max(.00005,1-((z-1.760)/.169)**2))*blend
            # Long uninterrupted flow from a side part to the tucked-under
            # edge. Relief is millimetres rather than separated strands.
            flow=a+.36*(1-t)**1.5
            groove=.0022*(.5+.5*math.cos(flow*15+.8*math.sin(PI*t)))**3*math.sin(PI*t*.95)
            x=(rx+groove)*math.sin(a)-.010*math.sin(PI*t)*window
            y=.026-(ry+groove)*math.cos(a)
            z+=.004*math.cos(flow*7)*t**7
            return (x,y,z)
        ob=surface(self.prefix+' · continuous side-swept bob',shell,112,64,self.hair,1)
        sol=ob.modifiers.new('Rounded bob edge','SOLIDIFY');sol.thickness=.006;sol.offset=-1

    def body(self):
        start=set(bpy.data.objects);female=self.female;width=.87 if female else 1
        # Cream inner tee with a physical crew neckline.
        surface(self.prefix+' · inner tee',lambda a,t:(interp(t,[.153,.160,.182,.174,.066])*width*math.sin(a),.008-interp(t,[.100,.105,.111,.103,.052])*math.cos(a),.987+.446*t),32,14,self.tee,2)
        self.jacket(width)
        self.trousers(width)
        for side in [-1,1]:
            self.hand(side,width)
            self.sneaker(side,width)
        self.objects.extend(set(bpy.data.objects)-start)

    def jacket(self,width):
        zs=[.979,.986,1.006,1.065,1.135,1.205,1.27,1.325,1.37,1.402,1.439]
        rxs=[.184,.189,.190,.181,.181,.189,.203,.210,.202,.179,.080]
        rys=[.132,.135,.135,.129,.124,.125,.125,.124,.114,.087,.066]
        nu=33;verts=[]
        for r,z in enumerate(zs):
            for i in range(nu):
                opening=.13+.50*max(0,(z-1.30)/.139)**1.4
                a=opening+i/(nu-1)*(2*PI-2*opening)
                # Sparse, low-amplitude folds at the hem and armpit, not noise.
                fold=.0035*math.sin(a*7)*math.exp(-((z-1.025)/.06)**2)
                fold+=.0022*math.sin(a*6+z*15)*math.exp(-((z-1.14)/.13)**2)*abs(math.sin(a))**3
                verts.append((width*rxs[r]*math.sin(a),.008-(rys[r]+fold)*math.cos(a),z))
        faces=[];holes=[(6,10),(22,26)]
        for r in range(len(zs)-1):
            for i in range(nu-1):
                if 6<=r<9 and any(lo<=i<hi for lo,hi in holes):continue
                a=r*nu+i;faces.append([a,a+1,a+nu+1,a+nu])
        for side,(lo,hi) in zip([1,-1],holes):
            ring=[6*nu+i for i in range(lo,hi+1)]+[r*nu+hi for r in range(7,10)]+[9*nu+i for i in range(hi-1,lo-1,-1)]+[r*nu+lo for r in range(8,6,-1)]
            origin=sum((Vector(verts[i]) for i in ring),Vector())/len(ring)
            initial=Vector((0,0,side));vaxis=Vector((0,1,0))
            angles=[math.atan2((Vector(verts[i])-origin).dot(vaxis),(Vector(verts[i])-origin).dot(initial)) for i in ring]
            points=[origin,(side*.231*width,0,1.332),(side*.250*width,0,1.285),(side*.258*width,-.002,1.220),(side*.264*width,-.004,1.150),(side*.265*width,-.005,1.120)]
            radii=[.061,.061,.060,.057,.051,.050]
            for j in range(1,13):
                t=j/12;c=catmull(points,t);tan=(catmull(points,min(1,t+.001))-catmull(points,max(0,t-.001))).normalized();uaxis=tan.cross(vaxis).normalized();radius=interp(t,radii)*(.94 if self.female else 1)
                new=[]
                for angle in angles:
                    new.append(len(verts));verts.append(c+uaxis*(math.cos(angle)*radius)+vaxis*(math.sin(angle)*radius))
                for k in range(len(ring)):faces.append([ring[k],ring[(k+1)%len(ring)],new[(k+1)%len(ring)],new[k]])
                ring=new
            end=Vector(points[-1]);tan=(end-Vector(points[-2])).normalized();uaxis=tan.cross(vaxis).normalized()
            def cuff(a,t):return end+tan*(.016*t-.008)+uaxis*(math.cos(a)*(.056*width))+vaxis*(math.sin(a)*(.056*width))
            cuff_ob=surface(self.prefix+' · rolled cuff',cuff,24,5,self.trim,1)
            thick=cuff_ob.modifiers.new('Turned cloth edge','SOLIDIFY');thick.thickness=.003
        ob=mesh(self.prefix+' · continuous tailored overshirt',verts,faces,self.shirt,2)
        thick=ob.modifiers.new('Cloth thickness','SOLIDIFY');thick.thickness=.0035;thick.offset=0
        def back_collar(u,t):
            angle=1.20+u*(2*PI-2.40)
            return (.076*math.sin(angle),.014-.064*math.cos(angle),1.436+.030*t)
        ob=surface(self.prefix+' · back collar band',back_collar,24,5,self.shirt,1,False)
        solid=ob.modifiers.new('Collar stand thickness','SOLIDIFY');solid.thickness=.003
        # Folded collar follows the neck; rounded quad panels keep a clean edge.
        for side in [-1,1]:
            def collar(u,t,side=side):
                inner=catmull([(side*.069,.041,1.446),(side*.068,-.025,1.450),(side*.053,-.058,1.432),(side*.032,-.084,1.381)],u)
                outer=catmull([(side*.087,.050,1.415),(side*.124,-.032,1.407),(side*.110,-.102,1.389),(side*.068,-.128,1.346)],u)
                return inner*(1-t)+outer*t+Vector((0,-.005*math.sin(PI*t),.006*math.sin(PI*t)))
            ob=surface(self.prefix+' · folded collar',collar,18,6,self.shirt,1,False)
            solid=ob.modifiers.new('Collar fabric thickness','SOLIDIFY');solid.thickness=.003
            edgepts=[]
            for k in range(9):
                z=.995+k/8*.37;rx=profiles(z,list(zip(zs,rxs)))*width;ry=profiles(z,list(zip(zs,rys)));edgepts.append((side*rx*math.sin(.13),.008-ry*math.cos(.13)-.001,z))
            sweep(self.prefix+' · front placket',edgepts,[.003,.003,.003],[.004,.004,.003],self.trim,1,8,20)
            for z in [1.03,1.105,1.18,1.255]:
                x=side*profiles(z,list(zip(zs,rxs)))*width*math.sin(.13)
                y=.008-profiles(z,list(zip(zs,rys)))*math.cos(.13)-.004
                uv(self.prefix+' · matte shirt button',(x,y,z),(.0045,.002,.0045),self.trim,12,8)
        # A single useful breast pocket; broad seam, no distracting microdetail.
        cx=-.11*width
        def pocket(u,t):
            x=cx+(u-.5)*.065*width;z=1.215+t*.085
            y=.008-.125*math.sqrt(max(.1,1-(x/(.205*width))**2))-.004
            return (x,y,z)
        ob=surface(self.prefix+' · chest pocket',pocket,6,6,self.shirt,1,False)
        solid=ob.modifiers.new('Pocket cloth','SOLIDIFY');solid.thickness=.002

    def trousers(self,width):
        parts=[]
        # Sculpt sources use shaped cross-sections rather than joint spheres.
        def pelvis(a,t):
            z=.84+.190*t
            rx=profiles(z,[(.84,.012),(.88,.100),(.94,.177),(1.00,.174),(1.03,.169)])*width
            ry=profiles(z,[(.84,.020),(.88,.070),(.94,.114),(1.,.116),(1.03,.107)])
            return (rx*math.sin(a),.015-ry*math.cos(a),z)
        parts.append(surface(self.prefix+' · trouser hip sculpt',pelvis,32,12,self.pants,1))
        for side in [-1,1]:
            def leg(a,t,side=side):
                z=.105+.815*t;cx=side*interp(t,[.102,.103,.105,.110,.100])*width
                rx=interp(t,[.054,.054,.061,.080,.090])*width;ry=interp(t,[.057,.058,.064,.078,.092])
                fold=.0018*math.cos(3*a+1)*math.exp(-((z-.19)/.06)**2)
                return (cx+(rx+fold)*math.sin(a),.012-ry*math.cos(a),z)
            parts.append(surface(self.prefix+' · trouser leg sculpt',leg,24,24,self.pants,1))
        # Convert evaluated sculpt sources, seal and remesh the crotch union.
        bpy.ops.object.select_all(action='DESELECT')
        for ob in parts:
            ob.select_set(True);bpy.context.view_layer.objects.active=ob
            for mod in list(ob.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
            bm=bmesh.new();bm.from_mesh(ob.data);boundary=[e for e in bm.edges if e.is_boundary]
            if boundary:bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
            bm.to_mesh(ob.data);bm.free()
        bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();ob=parts[0];ob.name=self.prefix+' · continuous trousers'
        mod=ob.modifiers.new('Unified garment volume','REMESH');mod.mode='VOXEL';mod.voxel_size=.006;mod.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=mod.name)
        smooth=ob.modifiers.new('Garment surface cleanup','SMOOTH');smooth.factor=.6;smooth.iterations=4;bpy.ops.object.modifier_apply(modifier=smooth.name)
        # Keep editable, cleaned sculpt mesh for static art review. Deformation
        # retopology is a later milestone, not claimed from this remesh.
        for p in ob.data.polygons:p.use_smooth=True
        belt=surface(self.prefix+' · trouser waistband',lambda a,t:(.170*width*math.sin(a),.014-.108*math.cos(a),1.004+.025*t),32,4,self.pants,1)
        sol=belt.modifiers.new('Waistband thickness','SOLIDIFY');sol.thickness=.003
        # Clear front fly and two functional pockets, very restrained.
        sweep(self.prefix+' · trouser fly',[(0,-.097,.92),(0,-.106,.96),(0,-.098,1.016)],[.0008,.001,.0007],[.001,.001,.0007],self.pant_seam,1,8,12)
        for side in [-1,1]:
            points=[(side*.108*width,-.077,1.013),(side*.131*width,-.068,.977),(side*.149*width,-.047,.945)]
            sweep(self.prefix+' · slanted trouser pocket',points,[.0008,.001,.0005],[.001,.001,.0005],self.pant_seam,1,8,14)

    def hand(self,side,width):
        parts=[];x=side*.265*width
        def arm(a,t):
            z=.875+.27*t;cx=x+side*.008*math.sin(PI*t)
            rx=interp(t,[.026,.032,.042,.042,.042])*width;ry=interp(t,[.024,.026,.035,.038,.038])
            return (cx+rx*math.sin(a),-.007-ry*math.cos(a),z)
        parts.append(surface(self.prefix+' · forearm sculpt',arm,20,16,self.skin,1))
        parts.append(uv(self.prefix+' · palm sculpt',(x,-.008,.847),(.034*width,.023,.050),self.skin,24,16))
        for i,(dx,length) in enumerate([(-.023,.052),(-.008,.074),(.008,.078),(.023,.062)]):
            dx*=side*width;points=[(x+dx,-.012,.826),(x+dx,-.014,.808),(x+dx,-.024,.826-length*.73),(x+dx,-.032,.826-length)]
            parts.append(sweep(self.prefix+' · finger sculpt '+str(i),points,[.009*width,.0095*width,.007*width,.005],[.010,.010,.008,.005],self.skin,1,10,16))
        parts.append(sweep(self.prefix+' · thumb sculpt',[(x-side*.023,-.011,.866),(x-side*.043,-.017,.844),(x-side*.046,-.028,.821)],[.013,.012,.003],[.013,.011,.003],self.skin,1,12,16))
        bpy.ops.object.select_all(action='DESELECT')
        for ob in parts:
            ob.select_set(True);bpy.context.view_layer.objects.active=ob
            for mod in list(ob.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
            seal(ob)
        bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();ob=parts[0];ob.name=self.prefix+' · continuous forearm hand fingers'
        mod=ob.modifiers.new('Sculpt fused palm and fingers','REMESH');mod.mode='VOXEL';mod.voxel_size=.0028;mod.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=mod.name)
        smooth=ob.modifiers.new('Hand volume polish','SMOOTH');smooth.factor=.6;smooth.iterations=3;bpy.ops.object.modifier_apply(modifier=smooth.name)
        for p in ob.data.polygons:p.use_smooth=True

    def sneaker(self,side,width):
        x=side*.102*width
        ys=[.075,.064,.025,-.04,-.10,-.16,-.185]
        ws=[.002,.048,.056,.060,.060,.044,.002]
        hs=[.026,.052,.073,.071,.052,.029,.008]
        def upper(a,t):
            y=interp(t,ys);w=interp(t,ws);h=interp(t,hs)
            return (x+w*math.sin(a),y,.033+h*max(0,math.cos(a))**.75)
        ob=surface(self.prefix+' · shaped sneaker upper',upper,28,30,self.shoe,2);seal(ob)
        def sole(a,t):
            y=-.055+.136*math.cos(a);w=profiles(y,list(reversed(list(zip(ys,ws)))))+.003
            px=math.copysign(w,math.sin(a));z=interp(t,[.004,.005,.008,.030,.035,.036])
            return (x+px,y,z)
        ob=surface(self.prefix+' · rubber outsole',sole,64,8,self.sole,1);seal(ob)
        for k in range(4):
            y=-.025-k*.024;z=.100-k*.004
            sweep(self.prefix+' · cotton lace',[(x-.032,y,z),(x,y-.004,z+.004),(x+.032,y,z)],[.0024,.0024,.0024],[.0014,.0014,.0014],self.sole,1,8,12)
        # Low toe seam defines the sneaker without decorative noise.
        pts=[(x+.051*math.sin(a),-.112-.057*math.cos(a),.057+.006*math.cos(a)) for a in [k/10*PI-PI/2 for k in range(11)]]
        sweep(self.prefix+' · toe seam',pts,[.0008,.0008,.0008],[.0009,.0009,.0009],self.seam,1,8,16)

    def finish(self,offset=0):
        for ob in self.objects:
            ob.location.x+=offset
            if self.female:
                ob.location.z*=.955;ob.scale.z*=.955
        collection=bpy.data.collections.new(self.prefix+' | authored model');bpy.context.scene.collection.children.link(collection)
        for ob in self.objects:
            for old in list(ob.users_collection):old.objects.unlink(ob)
            collection.objects.link(ob)
        return collection


def studio():
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=32 if DRAFT else 64;scene.cycles.use_denoising=True
    scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
    scene.render.threads_mode='FIXED';scene.render.threads=8
    scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=True
    scene.world.color=(.25,.25,.25)
    scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=color('E5E4DF');scene.world.node_tree.nodes['Background'].inputs[1].default_value=.25
    scene.view_settings.view_transform='AgX'
    scene.view_settings.look='AgX - Medium High Contrast'
    floor=material('Studio · warm grey floor','D7D5CE',.9)
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,0));bpy.context.object.name='Studio floor';bpy.context.object.data.materials.append(floor);bpy.context.object.is_shadow_catcher=True
    scene.use_nodes=True;tree=scene.node_tree;tree.nodes.clear();rl=tree.nodes.new('CompositorNodeRLayers');bg=tree.nodes.new('CompositorNodeRGB');bg.outputs[0].default_value=color('E4E1DA');over=tree.nodes.new('CompositorNodeAlphaOver');over.inputs[0].default_value=1;tree.links.new(bg.outputs[0],over.inputs[1]);tree.links.new(rl.outputs['Image'],over.inputs[2]);comp=tree.nodes.new('CompositorNodeComposite');tree.links.new(over.outputs[0],comp.inputs[0])
    def area(name,loc,power,size,tint):
        data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=tint
        ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=loc;ob.rotation_euler=(Vector((0,0,1.3))-ob.location).to_track_quat('-Z','Y').to_euler()
    area('Studio key',(-3,-4,5),400,3,(1,.90,.81));area('Studio fill',(4,-2,3.2),110,3,(.80,.88,1));area('Studio rim',(2,3,4),300,3,(1,.94,.86))
    data=bpy.data.cameras.new('Review camera');camera=bpy.data.objects.new('Review camera',data);scene.collection.objects.link(camera);scene.camera=camera;data.type='ORTHO';data.lens=65;data.clip_start=.01;data.clip_end=300
    return scene


def render(scene,name,eye,target,scale,size):
    scene.camera.location=eye;scene.camera.rotation_euler=(Vector(target)-scene.camera.location).to_track_quat('-Z','Y').to_euler();scene.camera.data.ortho_scale=scale
    scene.render.resolution_x=size[0];scene.render.resolution_y=size[1];scene.render.filepath=str(EVIDENCE/(name+'.png'))
    bpy.ops.render.render(write_still=True)


def main():
    OUT.mkdir(exist_ok=True);EVIDENCE.mkdir(exist_ok=True);scene=studio();models=[]
    for female in [False,True]:
        c=Character(female);c.head()
        for ob in c.objects:ob.location.z-=.035
        bpy.context.view_layer.update()
        pivot=Vector((0,0,1.49))
        head_scale=Matrix.Translation(pivot)@Matrix.Diagonal((.80,.80,.80,1))@Matrix.Translation(-pivot)
        for ob in c.objects:
            if 'shaped neck' not in ob.name:ob.matrix_world=head_scale@ob.matrix_world
        if not HEAD_ONLY:c.body()
        c.finish(-.45 if not female else .45);models.append(c)
    if '--source-only' not in ARGS:
        render(scene,'head-study',(2,-7,2.3),(0,0,1.63),1.25,(1100,700))
        if not HEAD_ONLY:
            render(scene,'body-study',(2.4,-8,3.0),(0,0,.96),2.30,(1200,1300))
            render(scene,'front-study',(0,-8,1.01),(0,0,1.01),2.18,(1200,1300))
    scene.camera.location=(2.4,-8,3.0);scene.camera.rotation_euler=(Vector((0,0,.96))-scene.camera.location).to_track_quat('-Z','Y').to_euler();scene.camera.data.ortho_scale=2.30
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'characters-v2.blend'))
    print('CHARACTER V2 source saved'+('; studies rendered' if '--source-only' not in ARGS else ''),flush=True)


if __name__=='__main__':main()
