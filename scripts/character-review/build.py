"""A–C isolated character study: real indexed meshes, weighted joints and GLB clips.

Only NumPy/Pillow already bundled on this host are required. Does not import or
write the production asset pipeline. Coordinates are metres, +Z up, +Y forward;
one glTF root converts to glTF +Y up. Geometry is original, not image-generated.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math
import struct
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "art-source/character-redesign-ac"
TEAL = [.23, .40, .41, 1]
CLOTH = [.15, .18, .21, 1]
SKIN = [.72, .46, .30, 1]
HAIR = [.13, .085, .065, 1]
WHITE = [.88, .86, .80, 1]


def unit(a):
    return a / np.maximum(np.linalg.norm(a, axis=-1, keepdims=True), 1e-12)


def smin(a, b, k=.045):
    h = np.maximum(k - np.abs(a - b), 0) / k
    return np.minimum(a, b) - h * h * k * .25


def capsule(p, a, b, ra, rb=None):
    a, b = np.array(a), np.array(b)
    ab = b - a
    h = np.clip(((p - a) * ab).sum(-1) / (ab @ ab), 0, 1)
    return np.linalg.norm(p - a - h[..., None] * ab, axis=-1) - (ra + h * ((rb or ra) - ra))


def ellipse(p, center, radii):
    q = (p - center) / radii
    # Consistent zero surface; conservative approximate signed distance.
    return (np.linalg.norm(q, axis=-1) - 1) * min(radii)


def loft_sdf(p, z, rx, ry, center_y=0):
    h = p[..., 2]
    xrad, yrad = np.interp(h, z, rx), np.interp(h, z, ry)
    d = (np.sqrt((p[..., 0] / xrad) ** 2 + ((p[..., 1] - center_y) / yrad) ** 2) - 1) * np.minimum(xrad, yrad)
    return np.maximum(d, np.maximum(z[0] - h, h - z[-1]))


def implicit(name, fn, lo, hi, step, color):
    """Marching tetrahedra, globally welded edges, gradient vertex normals.

    Unlike separate ball/cylinder joints, the shirt/arms and pelvis/trousers
    are single connected isosurfaces before deformation.
    """
    axes = [np.arange(a, b + step, step) for a, b in zip(lo, hi)]
    xyz = np.stack(np.meshgrid(*axes, indexing="ij"), -1)
    values = fn(xyz)
    shape = np.array(values.shape)
    corners = np.array([[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]])
    samples = np.stack([values[c[0]:shape[0]-1+c[0],c[1]:shape[1]-1+c[1],c[2]:shape[2]-1+c[2]] for c in corners], -1)
    active = np.argwhere((samples.min(-1) < 0) & (samples.max(-1) >= 0))
    tets = [[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]]
    verts, faces, cache = [], [], {}
    def edge(a,b,pa,pb,va,vb):
        key = tuple(sorted((a,b)))
        if key not in cache:
            cache[key] = len(verts)
            verts.append(pa + (pb-pa) * (va / (va-vb)))
        return cache[key]
    for cell in active:
        ijk = corners + cell
        ids = np.ravel_multi_index(ijk.T, values.shape)
        ps = xyz[tuple(ijk.T)]
        vs = values[tuple(ijk.T)]
        for tet in tets:
            inside = [i for i in tet if vs[i] < 0]
            outside = [i for i in tet if vs[i] >= 0]
            if not inside or not outside:
                continue
            def e(a,b): return edge(int(ids[a]), int(ids[b]), ps[a],ps[b],vs[a],vs[b])
            if len(inside) == 1:
                a = inside[0]; faces.append([e(a,b) for b in outside])
            elif len(inside) == 3:
                b = outside[0]; faces.append([e(a,b) for a in inside])
            else:
                a,b = inside; c,d = outside
                ac,ad,bc,bd = e(a,c),e(a,d),e(b,c),e(b,d)
                faces.extend([[ac,ad,bc],[ad,bd,bc]])
    v, f = np.array(verts), np.array(faces)
    eps = .0003
    n = unit(np.stack([fn(v + np.eye(3)[k]*eps)-fn(v-np.eye(3)[k]*eps) for k in range(3)],-1))
    cross = np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]])
    flip = (cross * n[f].mean(1)).sum(1) < 0
    f[flip] = f[flip][:,[0,2,1]]
    # Taubin smoothing removes tetrahedral sampling scallops without replacing
    # the connected mesh by separate smooth-shaded primitives.
    edges=np.concatenate([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]])
    edges=np.concatenate([edges,edges[:,::-1]])
    counts=np.bincount(edges[:,0],minlength=len(v))[:,None]
    for _ in range(4):
        for rate in [.38,-.39]:
            total=np.zeros_like(v);np.add.at(total,edges[:,0],v[edges[:,1]])
            v+=rate*(total/np.maximum(counts,1)-v)
    n=np.zeros_like(v);face_n=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]])
    for k in range(3):np.add.at(n,f[:,k],face_n)
    return dict(name=name, v=v, n=unit(n), f=f, color=color)


def parametric(name, fn, nu, nv, color, wrap=True):
    us = np.linspace(0, 2*math.pi, nu, endpoint=False) if wrap else np.linspace(0,1,nu)
    vs = np.linspace(0,1,nv)
    v = np.array([fn(u,t) for t in vs for u in us])
    f = []
    for j in range(nv-1):
        for i in range(nu if wrap else nu-1):
            a,b = j*nu+i, j*nu+(i+1)%nu
            c,d = a+nu,b+nu
            f.extend([[a,b,c],[b,d,c]])
    f=np.array(f); n=np.zeros_like(v)
    face_n=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]])
    for k in range(3): np.add.at(n,f[:,k],face_n)
    return dict(name=name,v=v,n=unit(n),f=f,color=color)


def oval(name, center, radii, color, nu=24,nv=16):
    def fn(a,t):
        b=.001+(math.pi-.002)*t
        return np.array(center)+np.array(radii)*[math.sin(b)*math.sin(a),math.sin(b)*math.cos(a),math.cos(b)]
    return parametric(name,fn,nu,nv,color)


def strip(name, points, radius, color):
    points=np.array(points)
    def fn(a,t):
        pos=t*(len(points)-1);i=min(int(pos),len(points)-2);f=pos-i
        c=points[i]*(1-f)+points[i+1]*f
        tangent=unit(points[i+1]-points[i]);side=unit(np.cross(tangent,[0,1,.01]));up=np.cross(side,tangent)
        return c+radius*(math.cos(a)*side+math.sin(a)*up)
    return parametric(name,fn,8,max(4,len(points)*3),color)


def skeleton(female=False):
    sh=.187 if female else .215
    hip=.096 if female else .105
    return [
        ('pelvis',[0,0,.90],[0,0,1.10]),
        ('chest',[0,0,1.10],[0,0,1.39]),
        ('head',[0,0,1.46],[0,0,1.78]),
        ('upper.L',[-sh,0,1.36],[-sh-.058,0,1.115]),
        ('fore.L',[-sh-.058,0,1.115],[-sh-.075,.005,.892]),
        ('hand.L',[-sh-.075,.005,.892],[-sh-.075,.012,.797]),
        ('upper.R',[sh,0,1.36],[sh+.058,0,1.115]),
        ('fore.R',[sh+.058,0,1.115],[sh+.075,.005,.892]),
        ('hand.R',[sh+.075,.005,.892],[sh+.075,.012,.797]),
        ('thigh.L',[-hip,0,.90],[-hip,.01,.50]),
        ('shin.L',[-hip,.01,.50],[-hip,0,.095]),
        ('foot.L',[-hip,0,.095],[-hip,.14,.045]),
        ('thigh.R',[hip,0,.90],[hip,.01,.50]),
        ('shin.R',[hip,.01,.50],[hip,0,.095]),
        ('foot.R',[hip,0,.095],[hip,.14,.045]),
    ]


def attach(m, bones, region):
    v=m['v'];weights=np.zeros((len(v),len(bones)))
    def blend(a,b,f):
        f=np.clip(f,0,1);f=f*f*(3-2*f)
        weights[:,a]+=1-f;weights[:,b]+=f
    if region=='head': weights[:,2]=1
    elif region=='body':
        t=np.clip((v[:,2]-1.05)/.22,0,1);blend(0,1,t)
        for sign,upper in [(-1,3),(1,6)]:
            reach=sign*v[:,0]
            shoulder=bones[upper][1][0]*sign
            t=np.clip((reach-(shoulder-.09))/.13,0,1);t=t*t*(3-2*t)
            weights[:,:3]*=(1-t[:,None])
            flex=np.clip((1.21-v[:,2])/.18,0,1);flex=flex*flex*(3-2*flex)
            weights[:,upper]+=t*(1-flex);weights[:,upper+1]+=t*flex
    elif region in ('arm.L','arm.R'):
        u=3 if region.endswith('L') else 6
        elbow=np.clip((1.19-v[:,2])/.15,0,1)
        blend(u,u+1,elbow)
        t=np.clip((.94-v[:,2])/.075,0,1);t=t*t*(3-2*t)
        weights[:,u:u+2]*=1-t[:,None];weights[:,u+2]=t
    elif region=='neck': blend(1,2,(v[:,2]-1.43)/.075)
    elif region=='legs':
        weights[:,0]=1
        for sign,thigh in [(-1,9),(1,12)]:
            t=np.clip((1.01-v[:,2])/.19,0,1)
            side=np.clip((sign*v[:,0]+.025)/.05,0,1)
            amount=t*side
            weights[:,0]-=amount
            knee=np.clip((.57-v[:,2])/.14,0,1);knee=knee*knee*(3-2*knee)
            weights[:,thigh]+=amount*(1-knee);weights[:,thigh+1]+=amount*knee
    elif region.startswith('shoe'):
        weights[:,11 if region.endswith('L') else 14]=1
    elif region=='skirt':
        # Start with the same hip/knee envelopes as the covered body to avoid
        # pelvis intersections. The single skirt surface bridges both legs.
        return attach(m,bones,'legs')
    weights=np.maximum(weights,0)
    order=np.argsort(-weights,axis=1)[:,:4]
    w=np.take_along_axis(weights,order,axis=1)
    w/=np.maximum(w.sum(1,keepdims=True),1e-12)
    m['j']=order.astype(np.uint16);m['w']=w.astype(np.float32)
    return m


def character(female=False,shorts=False,skirt=None,longhair=False):
    bones=skeleton(female); meshes=[]
    sh=abs(bones[3][1][0]);hip=abs(bones[9][1][0])
    def add(m,r): meshes.append(attach(m,bones,r))
    def shirt(p):
        d=loft_sdf(p,[.925,1.00,1.10,1.26,1.35,1.40],[.155,.16,.145 if female else .17,.18 if female else .205,.18 if female else .20,.135],[.09,.10,.085,.115,.10,.065])
        for sign in [-1,1]:
            d=smin(d,capsule(p,[sign*(sh-.035),0,1.32],[sign*(sh+.032),0,1.20],.069 if female else .074,.059),.06)
        return d
    add(implicit('shirt-continuous-shoulders',shirt,[-.35,-.17,.90],[.35,.17,1.45],.028,TEAL),'body')
    # Collar: two clean garment panels, restrained opening and buttons.
    for sign in [-1,1]:
        pts=[[sign*.035,.076,1.40],[sign*.085,.093,1.34],[sign*.11,.075,1.39]]
        m=dict(name='collar',v=np.array(pts),n=np.tile([0,1,.3],(3,1)),f=np.array([[0,1,2]]),color=[.27,.45,.46,1])
        add(m,'body')
    for z in [1.31,1.22,1.13,1.04]:
        add(oval('shirt-button',[0,.114 if z>1.18 else .096,z],[.008,.004,.008],[.16,.25,.26,1],12,8),'body')
    add(implicit('neck',lambda p:capsule(p,[0,0,1.375],[0,0,1.525],.055,.047),[-.09,-.09,1.35],[.09,.09,1.60],.022,SKIN),'neck')
    for sign,label in [(-1,'L'),(1,'R')]:
        def arm(p,sign=sign):
            d=capsule(p,[sign*(sh+.02),0,1.235],[sign*(sh+.058),0,1.115],.052,.041)
            d=smin(d,capsule(p,[sign*(sh+.058),0,1.115],[sign*(sh+.075),.005,.89],.041,.030),.034)
            return smin(d,ellipse(p,[sign*(sh+.075),.008,.849],[.034,.023,.060]),.025)
        add(implicit('skin-arm-'+label,arm,[-.37,-.075,.77],[.37,.075,1.28],.020,SKIN),'arm.'+label)
        # Fingers as a continuous mitten-like hand silhouette at gameplay size.
        add(oval('thumb-'+label,[sign*(sh+.048),.014,.852],[.018,.023,.033],SKIN,14,10),'arm.'+label)
    def legs(p,covered=False):
        d=ellipse(p,[0,0,.884],[.175 if female else .17,.112,.125])
        for sign in [-1,1]:
            d=smin(d,capsule(p,[sign*hip,0,.88],[sign*hip,.01,.50],.076 if covered else .070,.062 if covered else .048),.048)
            d=smin(d,capsule(p,[sign*hip,.01,.50],[sign*hip,0,.115],.062 if covered else .048,.049 if covered else .032),.032)
        return d
    if not skirt and not shorts:
        add(implicit('trousers-connected-pelvis',lambda p:legs(p,True),[-.24,-.16,.09],[.24,.16,1.02],.027,CLOTH),'legs')
    else:
        skin=implicit('legs-under-garment',lambda p:legs(p,False),[-.23,-.15,.09],[.23,.15,1.0],.025,SKIN)
        # Hidden body geometry is omitted with overlap under the garment hem;
        # clothing owns the outer surface at the hips and upper thighs.
        cutoff=(.43 if skirt=='long' else .67 if skirt else .565)+(.025 if skirt else .035)
        skin['f']=skin['f'][np.any(skin['v'][skin['f'],2]<cutoff,axis=1)]
        used,remap=np.unique(skin['f'],return_inverse=True)
        skin['v']=skin['v'][used];skin['n']=skin['n'][used];skin['f']=remap.reshape(-1,3)
        add(skin,'legs')
        if shorts:
            add(implicit('shorts-connected-pelvis',lambda p:np.maximum(legs(p,True),.565-p[...,2]),[-.24,-.16,.54],[.24,.16,1.02],.025,CLOTH),'legs')
    if skirt:
        hem=.43 if skirt=='long' else .67
        def skirtfn(a,t):
            z=.988*(1-t)+hem*t
            rx=np.interp(t,[0,.12,.3,1],[.169,.191,.206,.25 if skirt=='long' else .223])
            ry=np.interp(t,[0,.12,.3,1],[.116,.130,.142,.162])
            fold=1+.012*math.cos(a*8)*t*t
            return [rx*math.sin(a)*fold,ry*math.cos(a)*fold,z]
        m=parametric('separate-skirt-'+skirt,skirtfn,48,24,CLOTH)
        # Authored seated corrective: cloth over thighs is flattened rather
        # than rotating the standing skirt tube as a rigid cross-section.
        # This is one glTF morph target, not a cloth physics claim.
        factor=np.clip((.98-m['v'][:,2])/.17,0,1)
        if skirt=='long':factor*=np.clip((m['v'][:,2]-.42)/.15,0,1)
        m['seated_delta']=np.zeros_like(m['v']);m['seated_delta'][:,1]=-.43*m['v'][:,1]*factor
        add(m,'skirt')
    # Separate waistband makes the garment a skirt, not a one-piece dress.
    def waist(a,t): return [.168*math.sin(a),.114*math.cos(a),.955+.035*t]
    belt=parametric('waistband',waist,40,3,[.12,.15,.18,1])
    belt['f']=belt['f'][:,[0,2,1]];belt['n']=-belt['n']
    add(belt,'legs' if not skirt else 'skirt')
    for sign,label in [(-1,'L'),(1,'R')]:
        add(oval('sneaker-'+label,[sign*hip,.064,.073],[.059,.139,.065],WHITE,24,14),'shoe.'+label)
        def sole(a,t):return [sign*hip+.060*math.sin(a),.065+.142*math.cos(a),.016+.023*t]
        add(parametric('sole-'+label,sole,32,3,[.74,.74,.70,1]),'shoe.'+label)
        for k in range(3):
            add(strip('lace',[[sign*hip-.025,.08+.022*k,.125],[sign*hip+.025,.08+.022*k,.125]],.0025,WHITE),'shoe.'+label)
    # One shaped head surface: cheek/jaw profiles and nose are in the mesh,
    # rather than balls glued onto an ellipsoid face.
    def face(a,t):
        z=1.49+.315*t
        widths=np.interp(t,[0,.08,.18,.36,.58,.78,.94,1],[.012,.060,.094,.116 if female else .122,.123,.123,.075,.003])
        depth=np.interp(t,[0,.1,.35,.6,.85,1],[.008,.065,.093,.097,.090,.003])
        x=widths*math.sin(a);y=depth*math.cos(a)-.007
        front=max(math.cos(a),0)**12
        # Broad integrated bridge/tip, cheeks and lower lip.
        y+=front*(.024*math.exp(-((z-1.625)/.035)**2)+.014*math.exp(-((z-1.64)/.065)**2))
        y+=max(math.cos(a),0)**3*.004*math.exp(-((z-1.58)/.03)**2)
        return [x,y,z]
    # Reverse the ring winding because rings progress upward.
    m=parametric('face-integrated-nose',face,32,24,SKIN)
    m['f']=m['f'][:,[0,2,1]];m['n']=-m['n'];add(m,'head')
    for sign in [-1,1]:
        add(oval('ear',[sign*.123,-.005,1.637],[.020,.025,.036],SKIN,18,14),'head')
        ex=sign*.051
        add(oval('eye-white',[ex,.080,1.670],[.021,.005,.012],[.91,.87,.79,1],20,12),'head')
        add(oval('iris',[ex,.085,1.669],[.008,.002,.009],[.18,.105,.065,1],18,12),'head')
        add(oval('pupil',[ex,.087,1.669],[.0045,.001,.006],[.035,.028,.025,1],16,10),'head')
        add(oval('eye-glint',[ex-.003,.088,1.673],[.002,.001,.002],[1,1,1,1],10,8),'head')
        add(strip('eyebrow',[[ex-sign*.022,.092,1.698],[ex,.099,1.704],[ex+sign*.021,.090,1.699]],.004,HAIR),'head')
    add(strip('mouth',[[-.025,.085,1.575],[0,.096,1.571],[.025,.085,1.575]],.0027,[.37,.20,.17,1]),'head')
    # Unified cap with a designed hairline and a broad side-swept fringe.
    def haircap(a,t):
        front=max(math.cos(a),0)
        hairline=1.60+.112*front+.035*math.sin(a)*front
        end=math.acos(np.clip((hairline-1.675)/.17,-1,1))
        b=.005+(end-.005)*t
        broad=1+.018*math.sin(3*a+2*b)*math.sin(b)**2
        x=.145*math.sin(b)*math.sin(a)*broad
        y=.128*math.sin(b)*math.cos(a)*broad-.012
        z=1.675+.17*math.cos(b)
        z+=.009*math.sin(a+.5)*math.sin(b)
        return [x,y,z]
    add(parametric('hair-unified-cap',haircap,32,16,HAIR),'head')
    if female:
        def curtain(a,t):
            # Open front U-shaped hair shell: never covers the face/chest.
            angle=.90+a*(2*math.pi-1.8)
            rx=.132+.012*math.sin(math.pi*t)-(.008 if longhair else .005)*t*t
            ry=.108+.018*t
            z=1.72-(.56 if longhair else .22)*t
            z+=.025*math.sin(angle)**2*t*t
            x=rx*math.sin(angle)
            y=ry*math.cos(angle)-.035-.015*t
            return [x,y,z+.008*math.cos(2*angle)*t]
        m=parametric('hair-long' if longhair else 'hair-bob',curtain,48,22,HAIR,wrap=False)
        # Hair remains head-weighted for this A–C test; collision is reviewed
        # in sampled poses, not certified for arbitrary secondary motion.
        add(m,'head')
    for m in meshes:
        if np.all(m['j'][:,0]==2) and np.all(m['w'][:,0]>.999):
            m['v'][:,0]*=1.07;m['v'][:,1]*=1.07;m['v'][:,2]-=.025
    return meshes,bones


def q_between(a,b):
    a,b=unit(np.array(a)),unit(np.array(b));dot=float(a@b)
    if dot < -.9999:
        axis=unit(np.cross(a,[1,0,0] if abs(a[0])<.9 else [0,1,0]));return np.r_[axis,0.]
    return unit(np.r_[np.cross(a,b),1+dot])


def pose(bones,kind,t):
    p={name:[np.array(a,float),np.array(b,float)] for name,a,b in bones}
    phase=t*2*math.pi
    sit=kind in ('working','meeting')
    amount=(1-np.clip(t,0,1)) if kind=='stand-up' else 1 if sit else 0
    shift=np.array([0,-.36*amount,-.32*amount])
    for name in p:
        p[name]=[v+shift for v in p[name]]
    if amount:
        p['chest'][1][1]+=.06*amount
        p['head']=[v+[0,.06*amount,0] for v in p['head']]
        for label in ['L','R']:p['upper.'+label][0][1]+=.06*amount
    for sign,label in [(-1,'L'),(1,'R')]:
        thigh,shin,foot='thigh.'+label,'shin.'+label,'foot.'+label
        hip=p[thigh][0];x=hip[0]
        if amount:
            knee=np.array([x,.035,.48]);ankle=np.array([x,.02,.095]);toe=np.array([x,.16,.045])
            a=np.array(bones[9 if sign<0 else 12][2]);b=np.array(bones[10 if sign<0 else 13][2]);c=np.array(bones[11 if sign<0 else 14][2])
            knee=a*(1-amount)+knee*amount;ankle=b*(1-amount)+ankle*amount;toe=c*(1-amount)+toe*amount
            p[thigh]=[hip,knee];p[shin]=[knee,ankle];p[foot]=[ankle,toe]
        if kind=='walk':
            stride=math.sin(phase+(0 if sign>0 else math.pi))
            hip=p[thigh][0];knee=p[thigh][1]+[0,.13*stride,.025*max(0,-stride)]
            ankle=p[shin][1]+[0,.21*stride,.065*max(0,-stride)];toe=p[foot][1]+[0,.21*stride,.065*max(0,-stride)]
            p[thigh]=[hip,knee];p[shin]=[knee,ankle];p[foot]=[ankle,toe]
        upper,fore,hand='upper.'+label,'fore.'+label,'hand.'+label
        if amount:
            sh=p[upper][0];el=np.array([sign*.25,-.13,.93]);wr=np.array([sign*.163,.105,.845]);tip=np.array([sign*.14,.17,.832])
            if kind=='working':wr[2]+=.003*math.sin(phase+sign);tip[2]+=.003*math.sin(phase+sign)
            el=np.array(bones[3 if sign<0 else 6][2])*(1-amount)+el*amount
            wr=np.array(bones[4 if sign<0 else 7][2])*(1-amount)+wr*amount
            tip=np.array(bones[5 if sign<0 else 8][2])*(1-amount)+tip*amount
            p[upper]=[sh,el];p[fore]=[el,wr];p[hand]=[wr,tip]
        if kind=='walk':
            swing=-sign*.10*math.sin(phase)
            sh=p[upper][0];el=p[upper][1]+[0,swing*.5,0];wr=p[fore][1]+[0,swing,0];tip=p[hand][1]+[0,swing,0]
            p[upper]=[sh,el];p[fore]=[el,wr];p[hand]=[wr,tip]
        if kind in ('alert','meeting') and sign==1:
            sh=p[upper][0];el_goal=sh+[.035,.08,-.16];wr_goal=el_goal+[-.02,.04,.23];tip_goal=wr_goal+[-.015,.025,.08]
            gesture=(.5-.5*math.cos(phase)) if kind=='alert' else .88+.09*math.sin(phase)
            el=p[upper][1]*(1-gesture)+el_goal*gesture
            wr=p[fore][1]*(1-gesture)+wr_goal*gesture
            tip=p[hand][1]*(1-gesture)+tip_goal*gesture
            p[upper]=[sh,el];p[fore]=[el,wr];p[hand]=[wr,tip]
    if kind=='idle':
        p['chest'][1][1]+=.002*math.sin(phase)
    tr=[];qr=[]
    for name,a,b in bones:
        x,y=p[name];tr.append(x.tolist());qr.append(q_between(np.array(b)-a,y-x).tolist())
    return tr,qr


class GLB:
    def __init__(self):
        self.bin=bytearray();self.doc=dict(asset=dict(version='2.0',generator='Software CEO A-C original mesh study'),buffers=[dict(byteLength=0)],bufferViews=[],accessors=[],materials=[],meshes=[],nodes=[],skins=[],animations=[],scenes=[dict(nodes=[0])],scene=0)
    def acc(self,data,typ,component=5126):
        dtype={5126:'<f4',5123:'<u2',5125:'<u4'}[component];a=np.asarray(data,dtype=dtype)
        while len(self.bin)%4:self.bin.append(0)
        offset=len(self.bin);self.bin.extend(a.tobytes());view=len(self.doc['bufferViews'])
        self.doc['bufferViews'].append(dict(buffer=0,byteOffset=offset,byteLength=a.nbytes))
        acc=dict(bufferView=view,componentType=component,count=len(a),type=typ)
        if typ in ('VEC3','SCALAR'):acc.update(min=np.min(a,axis=0).reshape(-1).tolist(),max=np.max(a,axis=0).reshape(-1).tolist())
        self.doc['accessors'].append(acc);return len(self.doc['accessors'])-1
    def write(self,path):
        self.doc['buffers'][0]['byteLength']=len(self.bin)
        raw=json.dumps(self.doc,separators=(',',':'),ensure_ascii=False).encode();raw+=b' '*((-len(raw))%4)
        b=bytes(self.bin);b+=b'\0'*((-len(b))%4)
        path.write_bytes(struct.pack('<III',0x46546c67,2,12+8+len(raw)+8+len(b))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(b),0x004e4942)+b)


def export(path,meshes,bones):
    g=GLB();d=g.doc
    d['nodes'].append(dict(name='Z-up to glTF Y-up',rotation=[-math.sqrt(.5),0,0,math.sqrt(.5)],children=[]))
    d['nodes'][0]['children']=list(range(1,len(bones)+1))
    for name,a,b in bones:d['nodes'].append(dict(name=name,translation=a))
    inv=np.tile(np.eye(4),(len(bones),1,1))
    for i,(_,a,_) in enumerate(bones):inv[i,:3,3]=-np.array(a)
    d['skins'].append(dict(name='A-C weighted pose skeleton',joints=list(range(1,len(bones)+1)),inverseBindMatrices=g.acc(inv.transpose(0,2,1).reshape(-1,16),'MAT4')))
    stats=[];morph_nodes=[]
    for m in meshes:
        mat=len(d['materials']);d['materials'].append(dict(name=m['name'],pbrMetallicRoughness=dict(baseColorFactor=m['color'],metallicFactor=0,roughnessFactor=.85),doubleSided=True))
        attrs=dict(POSITION=g.acc(m['v'],'VEC3'),NORMAL=g.acc(unit(m['n']),'VEC3'),JOINTS_0=g.acc(m['j'],'VEC4',5123),WEIGHTS_0=g.acc(m['w'],'VEC4'))
        primitive=dict(attributes=attrs,indices=g.acc(m['f'].reshape(-1),'SCALAR',5125),material=mat)
        mesh=dict(name=m['name'],primitives=[primitive])
        if 'seated_delta' in m:
            primitive['targets']=[dict(POSITION=g.acc(m['seated_delta'],'VEC3'))];mesh['weights']=[0]
        d['meshes'].append(mesh)
        node=len(d['nodes']);d['nodes'].append(dict(name=m['name'],mesh=len(d['meshes'])-1,skin=0));d['nodes'][0]['children'].append(node)
        if 'seated_delta' in m:morph_nodes.append(node)
        stats.append(dict(name=m['name'],vertices=len(m['v']),triangles=len(m['f'])))
    for kind in ['idle','working','walk','stand-up','alert','meeting']:
        frames=25;duration=1.5 if kind=='stand-up' else 2
        times=np.linspace(0,duration,frames);ts=g.acc(times,'SCALAR');poses=[pose(bones,kind,t/duration) for t in times]
        anim=dict(name=kind,samplers=[],channels=[])
        for j in range(len(bones)):
            for path_,idx,typ in [('translation',0,'VEC3'),('rotation',1,'VEC4')]:
                value=np.array([p[idx][j] for p in poses])
                if idx==1:
                    for k in range(1,len(value)):
                        if value[k]@value[k-1]<0:value[k]*=-1
                sampler=len(anim['samplers']);anim['samplers'].append(dict(input=ts,output=g.acc(value,typ),interpolation='LINEAR'))
                anim['channels'].append(dict(sampler=sampler,target=dict(node=j+1,path=path_)))
        for node in morph_nodes:
            values=np.linspace(1,0,frames) if kind=='stand-up' else np.ones(frames) if kind in ('working','meeting') else np.zeros(frames)
            sampler=len(anim['samplers']);anim['samplers'].append(dict(input=ts,output=g.acc(values,'SCALAR'),interpolation='LINEAR'))
            anim['channels'].append(dict(sampler=sampler,target=dict(node=node,path='weights')))
        d['animations'].append(anim)
    g.write(path)
    return dict(file=path.name,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),bytes=path.stat().st_size,vertices=sum(s['vertices'] for s in stats),triangles=sum(s['triangles'] for s in stats),meshes=stats,joints=len(bones),clips=[a['name'] for a in d['animations']])


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--only',default='');args=parser.parse_args()
    (OUT/'models').mkdir(parents=True,exist_ok=True)
    specs=[('male-trousers',False,False,None,False),('male-shorts',False,True,None,False)]
    specs += [(f'female-{hair}-{outfit}',True,False,None if outfit=='trousers' else outfit,hair=='long') for hair in ['short','long'] for outfit in ['long','short','trousers']]
    stats=[]
    for name,female,shorts,skirt,longhair in specs:
        if args.only and args.only!=name:continue
        meshes,bones=character(female,shorts,skirt,longhair)
        result=export(OUT/'models'/f'{name}.glb',meshes,bones);stats.append(result)
        print(name,result['triangles'],'triangles',result['bytes'],'bytes',flush=True)
    (OUT/('models-manifest.json' if not args.only else 'sample-manifest.json')).write_text(json.dumps(dict(stage='A-C ONLY; owner model review D OPEN',generator='scripts/character-review/build.py',dependencies=['numpy'],rig='15 independently driven glTF joints, four-weight linear skinning; no IK solver or cloth physics',models=stats),indent=2))


if __name__=='__main__':main()
