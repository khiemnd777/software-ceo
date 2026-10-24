"""Render review frames from the exact exported F GLBs, after reimport.

The editable authoring rig is not used as an animation render substitute.
Source-to-reimport joint positions are checked before any review rendering.
"""
from pathlib import Path
import sys
import json
import hashlib
import importlib.util
import bpy
from mathutils import Vector

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art-source/character-f'
EV = ROOT / 'evidence/character-f'
spec = importlib.util.spec_from_file_location('review_scene', Path(__file__).with_name('review-scene.py'))
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)
CLIPS = ['idle', 'working', 'walk', 'stand-up', 'alert', 'meeting']
VIEWS = ['three-quarter', 'side']


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['female']
    gender = args[0]
    assert gender in ['female', 'male']
    mode = args[1] if len(args) > 1 else 'all'
    assert mode in ['all', 'stills', 'frames', 'walk-check']
    item = next(m for m in json.loads((ART / 'manifest-f.json').read_text())['models'] if m['gender'] == gender)
    glb = ART / item['glb']
    assert sha(glb) == item['glb_sha256']
    assert sha(ART / item['baked_source']) == item['baked_source_sha256']
    bpy.ops.wm.open_mainfile(filepath=str(ART / item['baked_source']))
    # Keep only the inherited review studio, then import the delivery binary.
    for ob in list(bpy.data.objects):
        if ob.type == 'ARMATURE' or (ob.type == 'MESH' and ob.name != 'Studio floor'):
            bpy.data.objects.remove(ob, do_unlink=True)
    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action, do_unlink=True)
    bpy.ops.import_scene.gltf(filepath=str(glb))
    rig = next(ob for ob in bpy.data.objects if ob.type == 'ARMATURE')
    assert len(rig.data.bones) == 22
    actions = {}
    for track in rig.animation_data.nla_tracks:
        track.mute = True
        assert len(track.strips) == 1
        strip = track.strips[0]
        actions[track.name] = (strip.action, strip.action_slot)
    assert set(actions) == set(CLIPS)

    def pose(clip, frame):
        action, slot = actions[clip]
        rig.animation_data.action = action
        rig.animation_data.action_slot = slot
        bpy.context.scene.frame_set(frame)
        bpy.context.view_layer.update()

    source = json.loads((EV / (gender + '-rig-audit.json')).read_text())
    errors = []
    for clip, samples in source['authored_samples'].items():
        for sample in samples:
            pose(clip, sample['frame'])
            for bone, expected in sample['joints'].items():
                actual = rig.matrix_world @ rig.pose.bones[bone].head
                errors.append((actual - Vector(expected)).length)
    maximum_error = max(errors)
    assert maximum_error < .00005, maximum_error
    scene = bpy.context.scene
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 49
    props = review.furniture()
    pose('working', 13)
    review.camera(scene, 'three-quarter', 2.55, (900, 900))
    scene.cycles.samples = 24
    bpy.ops.wm.save_as_mainfile(filepath=str(ART / (gender + '-reimported-f.blend')))

    settings = {
        'glb_sha256': sha(glb), 'render_script_sha256': sha(Path(__file__)),
        'scene_script_sha256': sha(Path(__file__).with_name('review-scene.py')),
        'furniture_sha256': sha(ROOT / 'art-source/v4/models/01_workstation_typing.glb'),
        'source_fps': 24, 'preview_fps': 8, 'duration_seconds': 2,
        'sequence_resolution': [384, 384], 'sequence_samples': 12,
        'still_resolution': [900, 900], 'still_samples': 24,
    }
    receipt_path = EV / (gender + '-render-receipt.json')
    old = json.loads(receipt_path.read_text()) if receipt_path.exists() else {}
    same_settings = old.get('settings') == settings
    renders = {r['file']: r for r in old.get('renders', [])} if same_settings else {}

    def render(clip, view, frame, path, high=False):
        relative = str(path.relative_to(ROOT))
        old_render = renders.get(relative)
        if old_render and path.exists() and sha(path) == old_render['sha256']:
            return
        pose(clip, frame)
        review.show_furniture(props, clip != 'walk')
        review.camera(scene, view, 2.55, (900, 900) if high else (384, 384), clip == 'walk')
        scene.cycles.samples = 24 if high else 12
        path.parent.mkdir(parents=True, exist_ok=True)
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        renders[relative] = {'file': relative, 'sha256': sha(path), 'clip': clip, 'view': view,
                             'frame': frame, 'time_seconds': (frame - 1) / 24,
                             'resolution': [900, 900] if high else [384, 384]}
        receipt_path.write_text(json.dumps({'gender': gender, 'source': 'reimported exact GLB',
            'joint_samples_checked': len(errors), 'joint_max_position_error_m': maximum_error,
            'settings': settings, 'renders': list(renders.values())}, indent=2) + '\n')
        print('F_RENDER ' + relative, flush=True)

    if mode == 'walk-check':
        for i in [0, 2, 4, 6]:
            render('walk', 'side', 1 + i * 3, EV / 'frames' / gender / 'walk' / 'side' / f'{i:02d}.png')
    if mode in ['all', 'stills']:
        for clip, view, frame in [
            ('working', 'three-quarter', 13), ('working', 'side', 13),
            ('stand-up', 'side', 25), ('stand-up', 'side', 49),
            ('walk', 'side', 19), ('alert', 'three-quarter', 13),
            ('meeting', 'three-quarter', 13),
        ]:
            render(clip, view, frame, EV / 'stills' / f'{gender}-{clip}-{view}-{frame}.png', True)
    if mode in ['all', 'frames']:
        for clip in CLIPS:
            for view in VIEWS:
                for i in range(17):
                    render(clip, view, 1 + i * 3, EV / 'frames' / gender / clip / view / f'{i:02d}.png')
    print('F_REIMPORT_RENDER_COMPLETE ' + gender + ' ' + mode, flush=True)


if __name__ == '__main__':
    main()
