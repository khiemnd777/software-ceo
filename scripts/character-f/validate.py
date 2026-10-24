"""Independent glTF decoder: skin weights, bind pose and actual vertex motion.

The workstation tests use conservative interior boxes, not a claim that all
furniture/cloth collisions have been certified. Art acceptance is a human gate.
"""
from pathlib import Path
import hashlib,json,math,struct
import numpy as np

ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'art-source/character-f';EV=ROOT/'evidence/character-f'
CLIPS={'idle','working','walk','stand-up','alert','meeting'}


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def rotation(q):
    x,y,z,w=q;length=np.linalg.norm(q);assert abs(length-1)<.002
    x,y,z,w=np.asarray(q)/length
    return np.array([[1-2*y*y-2*z*z,2*x*y-2*z*w,2*x*z+2*y*w],[2*x*y+2*z*w,1-2*x*x-2*z*z,2*y*z-2*x*w],[2*x*z-2*y*w,2*y*z+2*x*w,1-2*x*x-2*y*y]])


def trs(t,q,s):
    result=np.eye(4);result[:3,:3]=rotation(q)@np.diag(s);result[:3,3]=t;return result


def slerp(a,b,t):
    a=a/np.linalg.norm(a);b=b/np.linalg.norm(b);dot=float(a@b)
    if dot<0:b=-b;dot=-dot
    if dot>.9995:
        v=a+(b-a)*t;return v/np.linalg.norm(v)
    theta=math.acos(min(1,dot));return (math.sin((1-t)*theta)*a+math.sin(t*theta)*b)/math.sin(theta)


class GLB:
    def __init__(self,path):
        b=path.read_bytes();magic,version,length=struct.unpack_from('<4sII',b)
        assert magic==b'glTF' and version==2 and length==len(b)
        pos=12;chunks=[]
        while pos<len(b):
            assert pos+8<=len(b);n,kind=struct.unpack_from('<II',b,pos);pos+=8
            assert n%4==0 and pos+n<=len(b);chunks.append((kind,b[pos:pos+n]));pos+=n
        assert [kind for kind,_ in chunks]==[0x4e4f534a,0x004e4942]
        self.doc=json.loads(chunks[0][1]);self.blob=chunks[1][1];self.cache={}
        d=self.doc;assert len(d['buffers'])==1 and 'uri' not in d['buffers'][0]
        assert d['buffers'][0]['byteLength']<=len(self.blob)<d['buffers'][0]['byteLength']+4
        assert not any(d.get(k) for k in ['images','textures','cameras'])
        assert not d.get('extensions',{}).get('KHR_lights_punctual')
        for i in range(len(d['accessors'])):self.accessor(i)
        self.clips={animation['name']:animation for animation in d.get('animations',[])}

    def accessor(self,index):
        if index in self.cache:return self.cache[index]
        a=self.doc['accessors'][index];view=self.doc['bufferViews'][a['bufferView']]
        assert 'sparse' not in a and view['buffer']==0
        dtype={5121:'<u1',5123:'<u2',5125:'<u4',5126:'<f4'}[a['componentType']]
        components={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
        size=np.dtype(dtype).itemsize;stride=view.get('byteStride',components*size);offset=a.get('byteOffset',0)
        assert a['count']>0 and stride>=components*size
        assert offset>=0 and offset+(a['count']-1)*stride+components*size<=view['byteLength']
        start=view.get('byteOffset',0)+offset
        assert view.get('byteOffset',0)+view['byteLength']<=self.doc['buffers'][0]['byteLength']
        values=np.ndarray((a['count'],components),dtype=dtype,buffer=self.blob,offset=start,strides=(stride,size)).copy()
        assert np.isfinite(values).all()
        if a.get('normalized',False):values=values.astype(np.float64)/np.iinfo(dtype).max
        self.cache[index]=values;return values

    def worlds(self,clip=None,time=0):
        nodes=self.doc['nodes'];translations=[np.array(n.get('translation',[0,0,0]),dtype=float) for n in nodes];rotations=[np.array(n.get('rotation',[0,0,0,1]),dtype=float) for n in nodes];scales=[np.array(n.get('scale',[1,1,1]),dtype=float) for n in nodes]
        if clip:
            for channel in self.clips[clip]['channels']:
                sampler=self.clips[clip]['samplers'][channel['sampler']]
                times=self.accessor(sampler['input'])[:,0];values=self.accessor(sampler['output'])
                assert np.all(np.diff(times)>0) and sampler.get('interpolation','LINEAR') in ['LINEAR','STEP']
                k=max(0,min(len(times)-2,int(np.searchsorted(times,time,side='right'))-1))
                blend=max(0,min(1,float((time-times[k])/(times[k+1]-times[k]))))
                if sampler.get('interpolation')=='STEP':blend=0
                path=channel['target']['path'];node=channel['target']['node']
                if path=='rotation':rotations[node]=slerp(values[k],values[k+1],blend)
                elif path=='translation':translations[node]=values[k]*(1-blend)+values[k+1]*blend
                elif path=='scale':scales[node]=values[k]*(1-blend)+values[k+1]*blend
                else:raise AssertionError('Unexpected animation path '+path)
        result={};active=set()
        def visit(i,parent):
            assert i not in active and i not in result,'Invalid node hierarchy'
            active.add(i);n=nodes[i]
            local=np.array(n['matrix']).reshape((4,4),order='F') if 'matrix' in n else trs(translations[i],rotations[i],scales[i])
            result[i]=parent@local
            for child in n.get('children',[]):visit(child,result[i])
            active.remove(i)
        for i in self.doc['scenes'][self.doc.get('scene',0)]['nodes']:visit(i,np.eye(4))
        return result

    def parts(self):
        for node in self.doc['nodes']:
            if 'mesh' not in node:continue
            for primitive in self.doc['meshes'][node['mesh']]['primitives']:
                yield node,primitive

    def skin(self,node,primitive,worlds,step=1):
        attrs=primitive['attributes'];points=self.accessor(attrs['POSITION'])[::step]
        joints=self.accessor(attrs['JOINTS_0'])[::step].astype(int);weights=self.accessor(attrs['WEIGHTS_0'])[::step]
        skin=self.doc['skins'][node['skin']];inverse=self.accessor(skin['inverseBindMatrices'])
        matrices=np.stack([worlds[j]@inverse[i].reshape((4,4),order='F') for i,j in enumerate(skin['joints'])])
        homogeneous=np.column_stack([points,np.ones(len(points))]);output=np.zeros((len(points),3))
        for k in range(4):output+=np.einsum('nij,nj->ni',matrices[joints[:,k]],homogeneous)[:,:3]*weights[:,k,None]
        return output

    def head_triangles(self):
        result={}
        for node,primitive in self.parts():
            name=node.get('extras',{}).get('source_part',node.get('name',''))
            if not name.startswith('Female V3 · '):continue
            key=name.split(' [static head')[0]
            points=self.accessor(primitive['attributes']['POSITION']);indices=self.accessor(primitive['indices'])[:,0].astype(int)
            result.setdefault(key,[]).extend(tuple(sorted(tuple(float(v) for v in points[i]) for i in indices[j:j+3])) for j in range(0,len(indices),3))
        return {key:np.array(sorted(triangles)) for key,triangles in result.items()}


def check_model(item):
    path=ART/item['glb'];assert sha(path)==item['glb_sha256'];asset=GLB(path);d=asset.doc
    assert set(asset.clips)==CLIPS
    assert len(d['skins'])==1 and len(d['skins'][0]['joints'])==22
    assert all(d['nodes'][i]['name'].startswith('DEF_') for i in d['skins'][0]['joints'])
    assert not any(n.get('name','').startswith('CTRL_') for n in d['nodes'])
    vertices=0;triangles=0;rest_error=0;normal_error=0;parts=list(asset.parts());rest=asset.worlds()
    for node,primitive in parts:
        assert primitive.get('mode',4)==4 and 'skin' in node and not primitive.get('targets')
        attrs=primitive['attributes'];points=asset.accessor(attrs['POSITION']);normals=asset.accessor(attrs['NORMAL']);joints=asset.accessor(attrs['JOINTS_0']);weights=asset.accessor(attrs['WEIGHTS_0'])
        indices=asset.accessor(primitive['indices'])[:,0].astype(int)
        assert joints.shape==weights.shape==(len(points),4) and np.all(joints<22)
        assert np.all(weights>=0) and np.all(np.abs(weights.sum(axis=1)-1)<.0001)
        assert len(indices)%3==0 and indices.min()>=0 and indices.max()<len(points)
        normal_error=max(normal_error,float(np.max(np.abs(np.linalg.norm(normals,axis=1)-1))))
        rest_error=max(rest_error,float(np.max(np.abs(asset.skin(node,primitive,rest,37)-points[::37]))))
        vertices+=len(points);triangles+=len(indices)//3
    assert normal_error<.002 and rest_error<.00005,(normal_error,rest_error)
    head_error=None
    if item['gender']=='female':
        accepted=GLB(ROOT/'art-source/character-female-head-v3/female-head-v3.glb')
        before,after=accepted.head_triangles(),asset.head_triangles()
        assert len(after)==21 and before.keys()==after.keys()
        assert all(before[key].shape==after[key].shape for key in before)
        head_error=max(float(np.max(np.abs(before[key]-after[key]))) for key in before)
        assert head_error<=.000001,head_error
    clips=[];collision_failures=[];ground_failures=[]
    for clip,animation in asset.clips.items():
        inputs=[asset.accessor(s['input'])[:,0] for s in animation['samplers']]
        start=min(float(t[0]) for t in inputs);end=max(float(t[-1]) for t in inputs)
        assert abs(end-start-2)<.002,(clip,start,end)
        samples=[];relative=[];first=None;foot_mins=[]
        for sample in range(17):
            time=start+(end-start)*sample/16;worlds=asset.worlds(clip,time);all_points=[];soles=[]
            for node,primitive in parts:
                label=node.get('extras',{}).get('source_part','')
                points=asset.skin(node,primitive,worlds,1 if 'rubber outsole' in label else 43)
                all_points.append(points)
                if 'rubber outsole' in label:soles.append(points)
                if clip!='walk':
                    forward=-points[:,2]  # glTF +Z is Blender -Y.
                    inside=(np.abs(points[:,0])<.78)&(forward>.10)&(forward<.84)&(points[:,1]>.714)&(points[:,1]<.759)
                    if np.any(inside):collision_failures.append({'clip':clip,'sample':sample,'part':label,'points_inside_desk_interior':int(inside.sum())})
            cloud=np.concatenate(all_points)
            assert np.isfinite(cloud).all() and np.max(np.abs(cloud))<4
            root_node=next(i for i,n in enumerate(d['nodes']) if n.get('name')=='DEF_root');root_position=worlds[root_node][:3,3]
            if first is None:first=cloud
            samples.append(float(np.max(np.linalg.norm(cloud-first,axis=1))))
            relative.append(cloud-root_position)
            mins=[float(p[:,1].min()) for p in soles];foot_mins.append(mins)
            if min(mins)<-.004:ground_failures.append({'clip':clip,'sample':sample,'sole_min_y':mins})
        assert max(samples)>.0005,(clip,'No real vertex motion')
        local_motion=max(float(np.max(np.linalg.norm(p-relative[0],axis=1))) for p in relative)
        assert local_motion>.0005,(clip,'Root-only motion')
        clips.append({'clip':clip,'duration_seconds':end-start,'samples':17,'max_vertex_motion':max(samples),'max_motion_after_root_translation_removed':local_motion,'minimum_sole_y':min(v for row in foot_mins for v in row)})
    # Gait regression: arm and foot controls must repeat at the same 1 s
    # period, with the same-side arm behind the forward foot at contact.
    nodes={node.get('name'):i for i,node in enumerate(d['nodes'])}
    walk_start=min(float(asset.accessor(s['input'])[0,0]) for s in asset.clips['walk']['samplers'])
    def relative_joint(time,name):
        worlds=asset.worlds('walk',walk_start+time)
        return worlds[nodes[name]][:3,3]-worlds[nodes['DEF_root']][:3,3]
    gait_error=max(float(np.linalg.norm(relative_joint(t,name)-relative_joint(t+1,name)))
        for t in [0,.125,.25,.375,.5,.625,.75,.875,1]
        for name in ['DEF_hand.L','DEF_hand.R','DEF_foot.L','DEF_foot.R'])
    assert gait_error<.001,('Arm/leg gait period mismatch',gait_error)
    for time in [0,.5,1,1.5,2]:
        for side in ['L','R']:
            hand=relative_joint(time,'DEF_hand.'+side);foot=relative_joint(time,'DEF_foot.'+side)
            assert hand[2]*foot[2]<-.005,('Same-side arm must oppose forward foot',time,side)
    worlds0,worlds2=asset.worlds('walk',walk_start),asset.worlds('walk',walk_start+2)
    root_travel=float(np.linalg.norm(worlds2[nodes['DEF_root']][:3,3]-worlds0[nodes['DEF_root']][:3,3]))
    assert abs(root_travel-.92)<.001,root_travel
    midstance_rise=float(relative_joint(.25,'DEF_pelvis')[1]-relative_joint(0,'DEF_pelvis')[1])
    assert .005<midstance_rise<.025,('Pelvis must rise over support leg',midstance_rise)
    result={'gender':item['gender'],'file':item['glb'],'sha256':item['glb_sha256'],'vertices':vertices,'triangles':triangles,'skin_joints':22,'clips':clips,'bind_pose_max_error':rest_error,'approved_head_max_coordinate_error':head_error,'normal_max_error':normal_error,'walking_gait':{'limb_period_seconds':1,'repeat_position_max_error_m':gait_error,'opposed_same_side_arm_and_foot_at_contact':True,'root_travel_m':root_travel,'pelvis_midstance_rise_m':midstance_rise},'ground_penetrations':ground_failures,'desk_interior_penetrations':collision_failures,'geometry_and_motion_pass':True,'contact_pass':not collision_failures and not ground_failures}
    return result


def main():
    manifest=json.loads((ART/'manifest-f.json').read_text());models=[check_model(item) for item in manifest['models']]
    baseline=json.loads((EV/'preservation-baseline.json').read_text())['files']
    changed=[p for p,h in baseline.items() if not (ROOT/p).is_file() or sha(ROOT/p)!=h]
    # Only checkpoint prose may change in the existing tree at F. The
    # independent before/after record cannot exempt application or art files.
    docs_record=EV/'checkpoint-doc-updates.json'
    docs=json.loads(docs_record.read_text())['files'] if docs_record.exists() else {}
    permitted={'PROJECT_STATE.md','SESSION_HANDOFF.md','RELEASE_CHECKLIST.md','TASKS.md',
        'docs/CHARACTER_COMPLETION_EH.md','docs/LOCAL_CHECKPOINTS.md'}
    assert set(docs)<=permitted,set(docs)-permitted
    for path,record in docs.items():
        assert record['before_sha256']==baseline[path] and sha(ROOT/path)==record['after_sha256'],path
    assert set(changed)==set(docs),(changed,list(docs))
    result={'models':models,'existing_files_checked':len(baseline),'existing_files_unchanged':len(baseline)-len(changed),'documented_checkpoint_updates':changed,'unexpected_existing_file_changes':[],'pass':all(m['contact_pass'] for m in models),'owner_motion_acceptance':'OPEN','limits':['Custom glTF evaluator, not official Khronos certification','Conservative desk interior and ground tests, not exhaustive collisions','No face/finger rig or cloth/hair physics','No shipping LOD, runtime integration or game performance proof']}
    (EV/'validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False,indent=2))
    assert result['pass'],'Contact checks failed; see validation.json'


if __name__=='__main__':main()
