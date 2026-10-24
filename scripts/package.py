"""Create and validate a portable archive outside the recursively archived project."""
from pathlib import Path
import argparse
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('name', nargs='?', default='Software_CEO_Local_Playable_Checkpoint.zip')
parser.add_argument('--output-dir', type=Path, default=ROOT.parent / 'checkpoints')
args = parser.parse_args()
if Path(args.name).name != args.name or not args.name.endswith('.zip'):
    parser.error('Expected a ZIP filename, without directories.')
output = args.output_dir.resolve()
if output == ROOT or ROOT in output.parents:
    parser.error('Output directory must be outside the project to prevent archive self-inclusion.')
output.mkdir(parents=True, exist_ok=True)
dest = output / args.name
if dest.exists():
    parser.error(f'Refusing to overwrite an existing delivery: {dest}')
excluded = {'node_modules', '.git', 'test-results', '__pycache__', 'checkpoints', 'release', '.cache', '.pytest_cache'}
files = [p for p in ROOT.rglob('*') if p.is_file() and not p.is_symlink()
         and not excluded.intersection(p.relative_to(ROOT).parts)
         and p.suffix != '.zip' and not p.name.startswith('core.')
         and p.name not in ('core', 'tsconfig.tsbuildinfo')]
with zipfile.ZipFile(dest, 'x', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for path in sorted(files):
        archive.write(path, 'software-ceo/' + path.relative_to(ROOT).as_posix())
with zipfile.ZipFile(dest) as archive:
    bad = archive.testzip()
    if bad is not None:
        raise RuntimeError(f'CRC failure: {bad}')
    for required in ['package.json', 'dist/index.html', 'PLAY_SOFTWARE_CEO.html', 'SESSION_HANDOFF.md', 'PROJECT_STATE.md', 'RELEASE_CHECKLIST.md', 'TASKS.md']:
        if 'software-ceo/' + required not in archive.namelist():
            raise RuntimeError(f'Missing required entry: {required}')
sha256 = hashlib.sha256(dest.read_bytes()).hexdigest()
dest.with_suffix('.zip.sha256').write_text(f'{sha256}  {dest.name}\n')
report = {'result': 'PASS', 'path': str(dest), 'files': len(files), 'bytes': dest.stat().st_size, 'sha256': sha256, 'crc': 'PASS', 'scope': 'LOCAL portable archive only; no upload, publication or deployment.'}
dest.with_suffix('.zip.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
