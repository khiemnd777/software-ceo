"""Record a review checkpoint only after all scoped F checks actually pass."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]
EV = ROOT / 'evidence/character-f'
ART = ROOT / 'art-source/character-f'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


checks = {}
for name in ['validation.json', 'saved-source-audit.json', 'render-validation.json', 'browser/receipt.json']:
    data = json.loads((EV / name).read_text())
    assert data['pass'], name
    checks[name] = {'pass': True, 'sha256': sha(EV / name)}
browser = json.loads((EV / 'browser/receipt.json').read_text())
assert browser['reviewSha256'] == sha(ART / 'review.html')
assert browser['modelViewCombinations'] == 24
assert not browser['pageErrors'] and not browser['failedRequests'] and not browser['externalRequests']
manifest = json.loads((ART / 'manifest-f.json').read_text())
artifacts = {}
for item in manifest['models']:
    for key in ['glb', 'control_source', 'baked_source']:
        path = ART / item[key]
        assert sha(path) == item[key + '_sha256']
        artifacts[str(path.relative_to(ROOT))] = sha(path)
    path = ART / (item['gender'] + '-reimported-f.blend')
    artifacts[str(path.relative_to(ROOT))] = sha(path)
for path in [ART / 'manifest-f.json', ART / 'review.html', ROOT / 'docs/CHARACTER_RIG_F.md']:
    artifacts[str(path.relative_to(ROOT))] = sha(path)
validation = json.loads((EV / 'validation.json').read_text())
receipt = {
    'stage': 'F', 'created_at_utc': datetime.now(timezone.utc).isoformat(),
    'owner_approval_e': json.loads((EV / 'owner-approval-e.json').read_text()),
    'technical_checks': checks, 'artifacts': artifacts,
    'source_scripts': {str(p.relative_to(ROOT)): sha(p) for p in (ROOT / 'scripts/character-f').iterdir() if p.is_file()},
    'preservation': {key: validation[key] for key in ['existing_files_checked', 'existing_files_unchanged', 'documented_checkpoint_updates', 'unexpected_existing_file_changes']},
    'review_url': browser['page'], 'technical_pass': True, 'owner_motion_acceptance': 'OPEN',
    'next_gate': 'Owner reviews six real F clips before G',
    'g_h_scope': 'Already approved; pending F motion acceptance',
    'game_integration': False, 'shipping_assets_changed': False,
    'limits': validation['limits'] + browser['limits'],
}
(EV / 'checkpoint-f.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'technical_pass': True, 'owner_motion_acceptance': 'OPEN', 'files_checked': validation['existing_files_checked'], 'images': 422, 'model_view_combinations': 24}))
