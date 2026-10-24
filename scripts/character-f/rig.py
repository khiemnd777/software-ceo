"""Anatomical control rig, semantic skin weights and six authored motions.

All positions are metric Blender Z-up. Character rest faces -Y; the root turns
the complete rig by 180 degrees to face the original V4 desk at +Y.
"""
import math
import bpy
from mathutils import Vector, Matrix, Quaternion

CLIPS=['idle','working','walk','stand-up','alert','meeting']
FPS=24
END=49


def smooth(a,b,x):
    t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)


def lerp(a,b,t):return a*(1-t)+b*t


def bone_spec(female):
    z=.955 if female else 1;w=.87 if female else 1
    def p(x,y,h):return (x*w,y,h*z)
    specs={
        'DEF_root':((0,0,0),(0,0,.20),None),
        'DEF_pelvis':(p(0,.012,.93),p(0,.012,1.06),'DEF_root'),
        'DEF_spine':(p(0,.012,1.06),p(0,.008,1.18),'DEF_pelvis'),
        'DEF_chest':(p(0,.008,1.18),p(0,.008,1.36),'DEF_spine'),
        'DEF_neck':(p(0,.008,1.36),p(0,.012,1.46),'DEF_chest'),
        'DEF_head':(p(0,.012,1.46),p(0,.020,1.72),'DEF_neck'),
    }
    for sign,side in [(1,'L'),(-1,'R')]:
        specs.update({
            'DEF_clavicle.'+side:(p(0,.008,1.35),p(sign*.20,0,1.34),'DEF_chest'),
            'DEF_upper_arm.'+side:(p(sign*.20,0,1.34),p(sign*.264,-.004,1.12),'DEF_clavicle.'+side),
            'DEF_forearm.'+side:(p(sign*.264,-.004,1.12),p(sign*.275,-.008,.87),'DEF_upper_arm.'+side),
            'DEF_hand.'+side:(p(sign*.275,-.008,.87),p(sign*.275,-.020,.79),'DEF_forearm.'+side),
            'DEF_thigh.'+side:(p(sign*.100,.012,.93),p(sign*.105,.012,.51),'DEF_pelvis'),
            'DEF_shin.'+side:(p(sign*.105,.012,.51),p(sign*.102,.012,.105),'DEF_thigh.'+side),
            'DEF_foot.'+side:(p(sign*.102,.012,.105),p(sign*.102,-.140,.055),'DEF_shin.'+side),
            'DEF_toe.'+side:(p(sign*.102,-.140,.055),p(sign*.102,-.183,.040),'DEF_foot.'+side),
        })
    return specs


def create_rig(female):
    label='Female' if female else 'Male'
    specs=bone_spec(female)
    data=bpy.data.armatures.new(label+' F anatomy')
    rig=bpy.data.objects.new(label+' F | controls and deformation',data)
    bpy.context.scene.collection.objects.link(rig)
    bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
    bpy.ops.object.mode_set(mode='EDIT')
    for name,(head,tail,parent) in specs.items():
        bone=data.edit_bones.new(name);bone.head=head;bone.tail=tail
        if parent:bone.parent=data.edit_bones[parent]
        bone.use_deform=True
    controls={}
    for name in ['root','pelvis','spine','chest','neck','head']:
        controls['CTRL_'+name]=specs['DEF_'+name][:2]
    for sign,side in [(1,'L'),(-1,'R')]:
        for name in ['hand','foot']:
            controls['CTRL_'+name+'.'+side]=specs['DEF_'+name+'.'+side][:2]
        z=.955 if female else 1;w=.87 if female else 1
        controls['CTRL_elbow.'+side]=((sign*.65*w,-.004,1.12*z),(sign*.65*w,-.004,1.20*z))
        controls['CTRL_knee.'+side]=((sign*.105*w,-.65,.51*z),(sign*.105*w,-.65,.59*z))
    for name,(head,tail) in controls.items():
        bone=data.edit_bones.new(name);bone.head=head;bone.tail=tail;bone.use_deform=False
        if name!='CTRL_root':bone.parent=data.edit_bones['CTRL_root']
    bpy.ops.object.mode_set(mode='OBJECT')
    for bone in data.bones:
        bone.color.palette='THEME04' if bone.name.startswith('CTRL_') else 'THEME03'
        rig.pose.bones[bone.name].rotation_mode='QUATERNION'
    rig.show_in_front=True;data.display_type='OCTAHEDRAL'
    for name in ['root','pelvis','spine','chest','neck','head']:
        con=rig.pose.bones['DEF_'+name].constraints.new('COPY_TRANSFORMS');con.name='Follow editable '+name
        con.target=rig;con.subtarget='CTRL_'+name;con.owner_space='POSE';con.target_space='POSE'
    iks=[]
    for side in ['L','R']:
        for joint,target,pole in [('forearm','hand','elbow'),('shin','foot','knee')]:
            con=rig.pose.bones['DEF_'+joint+'.'+side].constraints.new('IK')
            con.name='Two-bone '+joint+' IK';con.target=rig;con.subtarget='CTRL_'+target+'.'+side
            con.pole_target=rig;con.pole_subtarget='CTRL_'+pole+'.'+side;con.chain_count=2;con.use_stretch=False
            iks.append((joint,side,con))
        for name in ['hand','foot']:
            con=rig.pose.bones['DEF_'+name+'.'+side].constraints.new('COPY_ROTATION')
            con.name='World orientation of '+name;con.target=rig;con.subtarget='CTRL_'+name+'.'+side
            con.owner_space='POSE';con.target_space='POSE'
    bpy.context.view_layer.update()
    calibration=[]
    # Fit pole roll in a bent working pose, where the intended bend plane is
    # well-defined. Fitting a nearly straight rest leg can rotate the seated
    # knee sideways while still producing a tiny rest-position error.
    set_pose(rig,female,'working',0)
    for joint,side,con in iks:
        lower=rig.pose.bones['DEF_'+joint+'.'+side];upper=lower.parent
        target=rig.pose.bones['CTRL_'+('hand' if joint=='forearm' else 'foot')+'.'+side].head.copy()
        pole=rig.pose.bones['CTRL_'+('elbow' if joint=='forearm' else 'knee')+'.'+side].head.copy()
        start=upper.head.copy();delta=target-start;distance=delta.length;axis=delta.normalized()
        along=(upper.length**2-lower.length**2+distance**2)/(2*distance)
        height=math.sqrt(max(0,upper.length**2-along**2))
        bend=(pole-start)-axis*(pole-start).dot(axis);bend.normalize()
        expected=start+axis*along+bend*height
        candidates=[]
        for i in range(36):
            angle=-math.pi+i*math.tau/36;con.pole_angle=angle;bpy.context.view_layer.update()
            error=(rig.pose.bones['DEF_'+joint+'.'+side].head-expected).length
            candidates.append((error,angle))
        best=min(candidates)
        for i in range(-10,11):
            angle=best[1]+i*math.pi/180;con.pole_angle=angle;bpy.context.view_layer.update()
            candidates.append(((rig.pose.bones['DEF_'+joint+'.'+side].head-expected).length,angle))
        error,angle=min(candidates);con.pole_angle=angle
        calibration.append({'joint':joint+'.'+side,'pole_angle':angle,'working_joint_fit_error':error})
    rig['description']='Editable root/body/head controls; hand and foot IK with elbow/knee poles. No facial or cloth simulation.'
    rig['rest_geometry']='Accepted E, unchanged vertex positions; armature modifier uses standard linear blend skinning.'
    return rig,calibration


def weights_for(name,point,female):
    w=.87 if female else 1;scale=.955 if female else 1
    x,y,z=point.x,point.y,point.z/scale
    side='L' if x>=0 else 'R';ax=abs(x)/w
    if 'shaped neck' in name:
        t=smooth(1.385,1.49,z);return {'DEF_chest':1-t,'DEF_head':t}
    if name.startswith('Female V3') or any(k in name for k in ['face /','scleral','iris','pupil','eyelid','eyebrow','ear outer','ear concha','lip line','lip volume','nostril','hair volume','sideburn']):
        return {'DEF_head':1}
    if any(k in name for k in ['sneaker','outsole','cotton lace','toe seam']):return {'DEF_foot.'+side:1}
    if any(k in name for k in ['trousers','trouser']):
        if z>=.91:return {'DEF_pelvis':1}
        if z>.78:
            t=smooth(.78,.91,z)
            if ax<.035 and z>.80:
                return {'DEF_pelvis':max(.6,t),'DEF_thigh.L':(1-max(.6,t))*.5,'DEF_thigh.R':(1-max(.6,t))*.5}
            return {'DEF_pelvis':t,'DEF_thigh.'+side:1-t}
        t=smooth(.46,.56,z)
        return {'DEF_thigh.'+side:t,'DEF_shin.'+side:1-t}
    def arm():
        if z<.92:
            h=1-smooth(.825,.915,z)
            return {'DEF_hand.'+side:h,'DEF_forearm.'+side:1-h}
        upper=smooth(1.075,1.165,z)
        return {'DEF_upper_arm.'+side:upper,'DEF_forearm.'+side:1-upper}
    if 'forearm hand' in name or 'rolled cuff' in name:return arm()
    if z<1.08:body={'DEF_pelvis':1}
    elif z<1.21:
        t=smooth(1.08,1.21,z);body={'DEF_spine':1-t,'DEF_chest':t}
    else:body={'DEF_chest':1}
    if 'continuous tailored overshirt' in name and z>1.095:
        t=smooth(.17,.225,ax)
        result={k:v*(1-t) for k,v in body.items()}
        for k,v in arm().items():result[k]=result.get(k,0)+v*t
        return result
    return body


def skin_objects(objects,rig,female):
    report=[]
    for ob in objects:
        for group in list(ob.vertex_groups):ob.vertex_groups.remove(group)
        groups={name:ob.vertex_groups.new(name=name) for name in bone_spec(female)}
        max_influences=0
        for vertex in ob.data.vertices:
            weights={k:v for k,v in weights_for(ob.name,vertex.co,female).items() if v>1e-7}
            total=sum(weights.values());assert total>0
            max_influences=max(max_influences,len(weights))
            for name,value in weights.items():groups[name].add([vertex.index],value/total,'REPLACE')
        modifier=ob.modifiers.new('F | linear blend skeletal deformation','ARMATURE');modifier.object=rig;modifier.use_deform_preserve_volume=False
        ob.parent=rig;ob.matrix_parent_inverse=Matrix.Identity(4)
        report.append({'object':ob.name,'vertices':len(ob.data.vertices),'max_source_influences':max_influences})
    return report


def oriented_target(rest,position,direction=None,pitch=0):
    rotation=rest.to_3x3().to_4x4()
    if direction is not None:
        original=rest.to_3x3()@Vector((0,1,0))
        rotation=original.rotation_difference(Vector(direction).normalized()).to_matrix().to_4x4()@rotation
    if pitch:rotation=Matrix.Rotation(pitch,4,'X')@rotation
    return Matrix.Translation(position)@rotation


def set_pose(rig,female,clip,u,keyframe=None):
    scale=.955 if female else 1;w=.87 if female else 1
    phase=u*math.tau;t=u*2
    standing=clip=='walk'
    rise=smooth(.05,.90,u) if clip=='stand-up' else (1 if standing else 0)
    seated_z=.54-.84*scale
    hip_dy=lerp(.33,.08,rise) if clip=='stand-up' else (0 if standing else .33)
    hip_dz=lerp(seated_z,-.004,rise)
    forward=0
    if standing:
        # The centre of mass rises over the straight support leg at
        # midstance and lowers slightly at double support, not vice versa.
        hip_dz=-.011-.006*math.cos(phase*4);forward=.46*t
    elif clip!='stand-up':hip_dz+=.0015*math.sin(phase)
    root=Matrix.Translation((0,forward,0))@Matrix.Rotation(math.pi,4,'Z')
    rest={bone.name:bone.matrix_local.copy() for bone in rig.data.bones if bone.name.startswith('CTRL_')}
    rig.pose.bones['CTRL_root'].matrix=root@rest['CTRL_root'];bpy.context.view_layer.update()
    shift=Matrix.Translation((0,hip_dy,hip_dz))
    pivot=Vector((0,.012,.93*scale))
    lean=(.026+.004*math.sin(phase)) if clip in ['working','walk'] else (.015*math.sin(math.pi*rise) if clip=='stand-up' else .008)
    torso=shift@Matrix.Translation(pivot)@Matrix.Rotation(lean,4,'X')@Matrix.Translation(-pivot)
    for name in ['pelvis','spine','chest']:
        rig.pose.bones['CTRL_'+name].matrix=root@(shift if name=='pelvis' else torso)@rest['CTRL_'+name]
    neck_pivot=Vector((0,.012,1.43*scale))
    nod=(.07 if clip=='working' else .025)+.009*math.sin(phase)
    for name,factor in [('neck',.35),('head',1)]:
        motion=torso@Matrix.Translation(neck_pivot)@Matrix.Rotation(nod*factor,4,'X')@Matrix.Translation(-neck_pivot)
        rig.pose.bones['CTRL_'+name].matrix=root@motion@rest['CTRL_'+name]
    targets={}
    for sign,side in [(1,'L'),(-1,'R')]:
        wp=phase+(0 if side=='L' else math.pi)
        # Feet complete one gait cycle per second. Swing the same-side arm
        # backward when that foot is forward, at the same cycle frequency.
        if standing:wp=math.tau*t+math.pi/2+(0 if side=='L' else math.pi)
        wrist=Vector((sign*.145*w,.14,.705));direction=Vector((0,-.10,-.015))
        if clip=='working':
            wrist=Vector((sign*(.14 if female else .155),-(.065 if female else .09)+.003*math.cos(wp*4),.852+.003*math.sin(wp*4)))
            direction=Vector((0,-.10,-.012-.003*math.sin(wp*4)))
        if clip=='meeting' and side=='L':
            wrist=Vector((.28+.02*math.sin(phase),-.015-.025*math.cos(phase),1.035+.025*math.sin(phase)))
            direction=Vector((.01,-.10,.025))
        if clip=='alert' and side=='L':
            wrist=Vector((.255+.012*math.sin(phase),.16,1.29+.02*math.cos(phase)))
            direction=Vector((.01,-.02,.10))
        if clip in ['stand-up','walk']:
            standing_wrist=Vector((sign*.275*w,-.008+(.095*math.sin(wp) if standing else .088),(.892 if standing else .87)*scale+(hip_dz if standing else -.004)))
            wrist=wrist.lerp(standing_wrist,rise)
            direction=direction.lerp(Vector((0,-.012,-.10)),rise)
        elbow=Vector((sign*.58*w,.08,1.00*scale+hip_dz))
        if clip in ['working','meeting','alert']:elbow.z=.94;elbow.y=.1
        foot_x=sign*(.125 if female else .13)
        ankle_z=.105*scale;foot_y=-.04;lift=0;pitch=0
        if standing:
            p=(t+(0 if side=='L' else .5))%1
            if p<.5:
                foot_y=-.115+.46*p
                pitch=math.radians(-6)*(1-smooth(0,.12,p))+math.radians(8)*smooth(.38,.5,p)
            else:
                swing=(p-.5)*2;foot_y=lerp(.115,-.115,smooth(0,1,swing));lift=.065*math.sin(math.pi*swing)
                pitch=math.radians(-5)*math.sin(math.pi*swing)
        elif clip=='stand-up':
            step=smooth(.56,.77,u) if side=='L' else smooth(.76,.97,u)
            foot_y=lerp(-.04,.08,step);lift=.032*math.sin(math.pi*step)
        # Compensate rigid sole pitch against a conservative lower corner.
        if pitch:
            local_y=(-.191-.012) if pitch>0 else (.081-.012)
            minimum=(.004*scale-ankle_z)*math.cos(pitch)+local_y*math.sin(pitch)+ankle_z
            ankle_z+=max(0,.003-minimum)
        ankle=Vector((foot_x,foot_y,ankle_z+lift))
        knee=Vector((sign*.13,-.70,.48))
        for name,position,aim,angle in [('hand',wrist,direction,0),('foot',ankle,None,pitch),('elbow',elbow,None,0),('knee',knee,None,0)]:
            key='CTRL_'+name+'.'+side
            rig.pose.bones[key].matrix=root@oriented_target(rest[key],position,aim,angle)
        targets[side]={'wrist':list(root@wrist),'ankle':list(root@ankle)}
    bpy.context.view_layer.update()
    if keyframe is not None:
        for name in rest:
            bone=rig.pose.bones[name];bone.keyframe_insert('location',frame=keyframe,group=name);bone.keyframe_insert('rotation_quaternion',frame=keyframe,group=name)
    return targets


def author_actions(rig,female):
    rig.animation_data_create();actions=[];samples={}
    for clip in CLIPS:
        action=bpy.data.actions.new('CONTROL | '+clip);action.use_fake_user=True;rig.animation_data.action=action
        for frame in range(1,END+1):
            bpy.context.scene.frame_set(frame)
            targets=set_pose(rig,female,clip,(frame-1)/(END-1),frame)
            if frame in [1,13,25,37,49]:
                samples.setdefault(clip,[]).append({'frame':frame,'targets':targets,'joints':{name:list(rig.pose.bones[name].head) for name in ['DEF_pelvis','DEF_head','DEF_hand.L','DEF_hand.R','DEF_foot.L','DEF_foot.R']}})
        actions.append(action)
    rig.animation_data.action=actions[1]
    bpy.context.scene.frame_set(1)
    return actions,samples
