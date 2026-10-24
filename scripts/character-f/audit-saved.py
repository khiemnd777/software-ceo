"""Read-only audit of saved editable Blender sources, not authoring memory."""
from pathlib import Path
import json
import hashlib
import bpy

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art-source/character-f'
EV = ROOT / 'evidence/character-f'
CLIPS = {'idle', 'working', 'walk', 'stand-up', 'alert', 'meeting'}
report = []
for item in json.loads((ART / 'manifest-f.json').read_text())['models']:
    path = ART / item['control_source']
    assert hashlib.sha256(path.read_bytes()).hexdigest() == item['control_source_sha256']
    bpy.ops.wm.open_mainfile(filepath=str(path))
    rigs = [ob for ob in bpy.data.objects if ob.type == 'ARMATURE']
    assert len(rigs) == 1
    rig = rigs[0]
    deform = [b for b in rig.data.bones if b.name.startswith('DEF_')]
    control = [b for b in rig.data.bones if b.name.startswith('CTRL_')]
    assert len(deform) == 22 and len(control) == 14
    assert all(b.use_deform for b in deform) and not any(b.use_deform for b in control)
    actions = {a.name.split('CONTROL | ', 1)[1]: a for a in bpy.data.actions if a.name.startswith('CONTROL | ')}
    assert set(actions) == CLIPS
    assert all(tuple(a.frame_range) == (1, 49) for a in actions.values())
    ik = [c for b in rig.pose.bones for c in b.constraints if c.type == 'IK']
    assert len(ik) == 4 and all(c.chain_count == 2 and not c.use_stretch for c in ik)
    meshes = [ob for ob in bpy.data.objects if ob.type == 'MESH' and ob.name != 'Studio floor']
    count = 0
    for ob in meshes:
        modifiers = [m for m in ob.modifiers if m.type == 'ARMATURE']
        assert len(modifiers) == 1 and modifiers[0].object == rig and not modifiers[0].use_deform_preserve_volume
        for vertex in ob.data.vertices:
            weights = [g.weight for g in vertex.groups]
            assert weights and abs(sum(weights) - 1) < .0001 and min(weights) >= 0, ob.name
            count += 1
    maximum_error = 0
    for action in actions.values():
        rig.animation_data.action = action
        for frame in [1, 25, 49]:
            bpy.context.scene.frame_set(frame)
            bpy.context.view_layer.update()
            for side in ['L', 'R']:
                for joint, control_name in [('forearm', 'hand'), ('shin', 'foot')]:
                    error = (rig.pose.bones[f'DEF_{joint}.{side}'].tail - rig.pose.bones[f'CTRL_{control_name}.{side}'].head).length
                    maximum_error = max(maximum_error, error)
    assert maximum_error < .001
    report.append({'gender': item['gender'], 'source': path.name, 'deform_bones': len(deform),
        'control_bones': len(control), 'ik_chains': len(ik), 'saved_actions': sorted(actions),
        'weighted_source_vertices': count, 'ik_max_error_m': maximum_error})
(EV / 'saved-source-audit.json').write_text(json.dumps({'pass': True, 'models': report, 'read_only': True}, indent=2) + '\n')
print('F_SAVED_SOURCE_AUDIT_PASS', flush=True)
