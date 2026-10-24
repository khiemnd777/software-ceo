"""Validate the exported static head and its review provenance without Blender."""
from pathlib import Path
import hashlib
import json
import math
import struct

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art-source/character-female-head-v3'
EVIDENCE = ROOT / 'evidence/character-female-head-v3'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate_glb(manifest):
    data = (ART / manifest['file']).read_bytes()
    assert len(data) == manifest['bytes']
    assert hashlib.sha256(data).hexdigest() == manifest['sha256']
    magic, version, length = struct.unpack_from('<4sII', data)
    assert magic == b'glTF' and version == 2 and length == len(data)
    offset, chunks = 12, []
    while offset < length:
        assert offset + 8 <= length
        size, kind = struct.unpack_from('<II', data, offset)
        offset += 8
        assert size % 4 == 0 and offset + size <= length
        chunks.append((kind, data[offset:offset + size]))
        offset += size
    assert offset == length
    assert [kind for kind, _ in chunks] == [0x4E4F534A, 0x004E4942]
    doc, blob = json.loads(chunks[0][1]), chunks[1][1]
    assert doc['asset']['version'] == '2.0'
    assert len(doc['buffers']) == 1 and 'uri' not in doc['buffers'][0]
    buffer_size = doc['buffers'][0]['byteLength']
    assert buffer_size <= len(blob) < buffer_size + 4
    assert not any(doc.get(k) for k in ['skins', 'animations', 'cameras', 'images', 'textures'])
    assert not doc.get('extensions', {}).get('KHR_lights_punctual')
    assert all(n.get('name', '').startswith('Female V3 · ') for n in doc['nodes'])
    assert all(not any(k in n for k in ['matrix', 'translation', 'rotation', 'scale', 'skin', 'children']) for n in doc['nodes'])
    assert sorted(n['mesh'] for n in doc['nodes']) == list(range(len(doc['meshes'])))
    assert sorted(doc['scenes'][doc.get('scene', 0)]['nodes']) == list(range(len(doc['nodes'])))
    for view in doc['bufferViews']:
        assert view['buffer'] == 0
        assert view.get('byteOffset', 0) >= 0 and view['byteLength'] > 0
        assert view.get('byteOffset', 0) + view['byteLength'] <= buffer_size

    formats = {5121: ('B', 1), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
    components = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}
    cache = {}

    def accessor(index):
        if index in cache:
            return cache[index]
        a = doc['accessors'][index]
        assert 'sparse' not in a and not a.get('normalized', False)
        view = doc['bufferViews'][a['bufferView']]
        fmt, size = formats[a['componentType']]
        count = components[a['type']]
        stride = view.get('byteStride', count * size)
        local_offset = a.get('byteOffset', 0)
        assert a['count'] > 0 and stride >= count * size
        assert local_offset >= 0 and local_offset % size == 0
        assert local_offset + (a['count'] - 1) * stride + count * size <= view['byteLength']
        start = view.get('byteOffset', 0) + local_offset
        rows = [struct.unpack_from('<' + fmt * count, blob, start + k * stride) for k in range(a['count'])]
        assert all(math.isfinite(v) for row in rows for v in row)
        cache[index] = rows
        return rows

    # Also validate unused accessors, if an exporter ever introduces them.
    for index in range(len(doc['accessors'])):
        accessor(index)
    points, triangles, zero_area, normal_error = [], 0, 0, 0
    for mesh in doc['meshes']:
        for primitive in mesh['primitives']:
            assert primitive.get('mode', 4) == 4 and not primitive.get('targets')
            attrs = primitive['attributes']
            assert not any(k.startswith(('JOINTS_', 'WEIGHTS_')) for k in attrs)
            positions, normals = accessor(attrs['POSITION']), accessor(attrs['NORMAL'])
            assert len(positions) == len(normals)
            assert doc['accessors'][attrs['POSITION']]['type'] == 'VEC3'
            assert doc['accessors'][attrs['NORMAL']]['type'] == 'VEC3'
            normal_error = max(normal_error, max(abs(math.sqrt(sum(v * v for v in n)) - 1) for n in normals))
            ia = doc['accessors'][primitive['indices']]
            assert ia['type'] == 'SCALAR' and ia['componentType'] in [5121, 5123, 5125]
            indices = [row[0] for row in accessor(primitive['indices'])]
            assert len(indices) % 3 == 0 and min(indices) >= 0 and max(indices) < len(positions)
            triangles += len(indices) // 3
            for start in range(0, len(indices), 3):
                p, q, r = [positions[i] for i in indices[start:start + 3]]
                u, v = [q[i] - p[i] for i in range(3)], [r[i] - p[i] for i in range(3)]
                cross = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]
                zero_area += sum(c*c for c in cross) < 1e-20
            points.extend(positions)
    lo = [min(p[i] for p in points) for i in range(3)]
    hi = [max(p[i] for p in points) for i in range(3)]
    assert triangles == manifest['triangles'] and zero_area == 0
    assert normal_error < .002
    assert abs((lo[0] + hi[0]) / 2) < .02
    assert 1.3 < lo[1] < 1.6 and 1.6 < hi[1] < 1.85
    assert .15 < hi[1] - lo[1] < .45
    assert all(.1 < hi[i] - lo[i] < .45 for i in [0, 2])
    return {'file': manifest['file'], 'sha256': manifest['sha256'], 'nodes': len(doc['nodes']),
            'triangles': triangles, 'bounds_gltf_y_up': {'min': lo, 'max': hi},
            'zero_area_triangles': zero_area, 'unit_normal_max_error': normal_error,
            'external_resources': False, 'rig_or_animation': False, 'pass': True}


def main():
    manifest = json.loads((ART / 'manifest.json').read_text())
    model = validate_glb(manifest)
    audit = json.loads((EVIDENCE / 'saved-artifact-audit.json').read_text())
    assert audit['pass'] and not audit['save_or_rebuild_performed']
    assert sha(ART / 'female-head-v3.blend') == audit['source_blend_sha256'] == manifest['source_blend_sha256']
    assert sha(ROOT / 'scripts/character-female-head-v3/build.py') == audit['build_script_sha256']
    context = json.loads((EVIDENCE / 'context-preservation.json').read_text())
    assert context['pass'] and context['before'] == context['after']
    assert len(context['before']) == context['objects_checked'] == audit['unrelated_meshes_checked']
    assert audit['unrelated_meshes_changed'] == []
    renders = json.loads((EVIDENCE / 'render-receipt.json').read_text())
    assert renders['input'] == manifest
    expected = {prefix + angle + suffix + '.png' for angle in ['front', 'three-quarter', 'profile']
                for prefix, suffix in [('new-', ''), ('new-', '-clay'), ('previous-', '')]}
    assert {r['file'] for r in renders['renders']} == expected
    for item in renders['renders']:
        path = EVIDENCE / item['file']
        assert sha(path) == item['sha256']
        assert path.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
        assert list(struct.unpack_from('>II', path.read_bytes(), 16)) == item['render_size'] == [1000, 1100]
    baseline = json.loads((EVIDENCE / 'resume-preservation-baseline.json').read_text())
    differences = [p for p, digest in baseline['files'].items() if not (ROOT / p).is_file() or sha(ROOT / p) != digest]
    assert not differences, differences
    result = {'model': model, 'saved_source_audit': audit, 'preservation': {
        'files_checked_since_resume': len(baseline['files']), 'differences': differences,
        'in_scene_context_meshes_unchanged': context['objects_checked'],
        'preexisting_drift_paths_retained': baseline['previous_baseline_drift_present_before_resume'], 'pass': True},
        'render_hashes_checked': len(expected), 'pass': True,
        'limits': ['Custom binary checks, not the Khronos validator',
                   'Static head only; no rig, collision, deformation or game integration acceptance',
                   'Art acceptance remains OPEN; technical checks do not assess beauty']}
    (EVIDENCE / 'validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
