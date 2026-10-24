# SOFTWARE CEO — Art Experiment V4 (UNAPPROVED)

This is a **real, inspectable GLB** and sprite proof, not a production art lock.

## Inspect first

- `renders/01_isometric_hero_review.jpg` — office-side orthographic render.
- `renders/02_ergonomics_side_review.jpg` — verifies seated pose direction, feet, arm path and workstation geometry.
- `renders/03_front_facing_review.jpg` — reverse angle and screen back.
- `renders/04_character_closeup_review.jpg` — makes remaining flaws in face/wardrobe visible.
- `sprites/00_sprite_contact_sheet.png` — 4 views of same GLB, 3 distinct static posture variants.
- `models/01_workstation_typing.glb` — 3D source for workstation + worker.
- `models/07_studio_full.glb` — same source plus presentation floor.
- `source/build_workstation_v4.py`, `source/render_v4.py` — deterministic construction and VTK render scripts.

## What was checked

- Character faces +Y; monitor faces -Y. Neither neck nor waist is forced to face camera.
- Seat cushion top ~0.538 m, pelvis mesh slightly compresses into the cushion.
- Shoe soles contact ground z≈0.0025 m. Typing wrists are near keytop z≈0.817 m.
- Eye-to-monitor-center distance ~0.74m.
- Rendering from the exported GLB yielded actual transparent RGBA sprites.

## What still fails quality targets

- Procedural character's face, hairstyle and outfit **do not yet meet a high-end stylized commercial game art bar**.
- The pose is static and not rigged; there are no genuine in-between animation frames.
- It still needs an artist-quality mesh revision and animation pass.
- The original v1/v3 blockout and old concept collage are not approved.

## Direction

Do not send this to Codex as the final art reference or call it Art Lock. Request review only and continue iterations on **a single model**, with an authoring tool that supports sculpting, UV/normal editing, and armature/IK constraints. Produce close-ups and side-angle inspections for every edit.
