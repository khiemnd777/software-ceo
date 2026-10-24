# Art QA — V4-derived production assets

## Decision and provenance

The approved baseline is the actual V4 kit, with the owner's approval preserved in docs/ART_BASELINE_APPROVAL.md. Historical UNAPPROVED filenames/readme are provenance, not the current approval state. Initial kit-integrity verification matched all 40 listed records. Seven original GLBs, their source and review images remain in art-source/v4.

## Delivered and verified

| Item | Status | Evidence and limits |
|---|---|---|
| Real V4 source geometry | PASS | GLB headers and original source hashes; no claimed nonexistent animation tracks |
| Orthographic projection and shared foot anchors | PASS | manifest.json, actual 384px/256px renders and Canvas comparison |
| Separate desks, chairs, workers and props | PASS | renderer depth order; original desk GLB; independently drawn object sprites |
| Five role palettes | PASS | five atlases; developer, QA, designer, growth, operations |
| Authored animation frames | PASS | 5 × 12 × 8 = 480 actual distinct decoded frames; geometry authoring script included |
| Frame padding, UVs, alpha crop and visible pixels | PASS | evidence/art-validation.json; all 480 crops checked; no clipped bounds detected |
| First-pose model files | PASS | 60 actual role/state GLBs plus prop/review models; not 480 animation GLBs |
| Working posture / desk-facing / hand/foot position | PASS for reviewed views | Actual side/iso renders and Canvas images inspected; hands align with keyboard, feet below knees, head/torso coherent |
| Walking / standing / turning | PASS for reviewed tracks | Geometry-generated cycles, side review, contact sheet and in-browser video; idle-to-walk-to-sit uses transitions |
| Meeting furniture | PASS for reviewed views | Chairs were repositioned/oriented outside the table footprint and rerendered |
| Two office compositions, 5 / 12 seats | PASS | W5 office captures at 1280×720 and 1920×1080 |
| Animation independent of business simulation | PASS | renderer owns cosmetic time only; clock/replay tests |
| Reduced motion, camera and selected markers | PASS | keyboard/scale E2E and production profiling |
| Skeletal rig / animated GLB clips | NOT PROVIDED | Equivalent authored 3D frame sequences were used, as allowed by the execution mandate |
| Exhaustive continuous collision certification | NOT TESTED | Pixel/source tests do not prove every joint/furniture relation for every intermediate pose |
| Native-browser color/display differences | NOT TESTED | Actual available test browser is Linux Chromium; native Safari/Firefox/Edge remain unverified |
| Human aesthetic and animation acceptance | NOT TESTED | V4 baseline was owner-approved; expanded assets still need owner/player review for final art lock |

## Actual rendering implementation

CanvasRenderingContext2D draws the isometric world. Offline 3D is used only to author sprites. The floor/wall layer is cached. All furniture and NPCs are sorted by world position; highlights and hit regions use the same projection. Sprite sources crop to visible alpha bounds. Identical visual frames are skipped; eight-frame-per-second pose cycles remain eight unique poses per second, while walking positions and camera interpolate with requestAnimationFrame.

Frame hashes normalize only RGB under fully transparent alpha. WebP can discard invisible RGB; all visible RGB and alpha were compared to the rendered source. Raw pre-normalization hashes remain for provenance. These checks do not substitute static copies for animation.

The shipped sprite payload is **2,695,535 bytes**. Browser transfer/memory measurements are recorded separately. Runtime has no glTF loader, Three.js, WebGL game engine or Blender requirement.

## Evidence to inspect

- evidence/W5-office-12-1280.png and W5-office-12-1920.png: real production browser captures.
- evidence/W5-final-office.png: actual office after the recorded browser walkthrough.
- evidence/W5-canvas-gameplay.webm: approximately 37.6 seconds of actual browser video; no fabricated frames. Browser video does not capture game audio.
- art-source/generated/review-working-side.png and review-walking-side.png: real offline geometry renders.
- art-source/generated/animation-contact-sheet.png and preview GIFs: authored frame sequences.
- public/assets/animation-frames.json and evidence/art-validation.json: frame metadata and automated checks.

Music Studio Hours and five cues were synthesized from project source with no external samples; source WAV and shipped MP3/Ogg are included. Actual music playback/mute was verified via browser media state. Mix quality and prolonged listening fatigue still require human review.
