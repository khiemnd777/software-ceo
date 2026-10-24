# Origin and third-party inventory

This delivery preserves the user-supplied GDD and V4 source. Local use and expansion of V4 are authorized by the owner decision in ART_BASELINE_APPROVAL.md. The old UNAPPROVED label remains historical provenance. No project-wide open-source license or broader third-party redistribution rights are invented by this delivery; the owner has not supplied a separate publication license.

## Runtime dependencies

| Package | Version | Declared license |
|---|---|---|
| react | 19.3.1 | MIT |
| react-dom | 19.3.1 | MIT |
| scheduler | 0.28.0 | MIT |
| zod | 4.1.12 | MIT |

## Complete inventory

The package-lock contains 267 dependency entries; 217 are installed on this Linux host, including development tools. See ../evidence/dependency-inventory.json for versions, integrity, origin URLs and optional-platform status. THIRD_PARTY_NOTICES.txt contains available upstream license/notice files verbatim. Optional binaries for other platforms are listed by lockfile but their notices were not extracted from packages absent on this host.

## Project assets

- V4 geometry, original renders, sprites and authoring scripts: supplied in the Software CEO kit, retained under art-source/v4. Original source integrity was checked before edits; evidence/kit-integrity.json has 40 passing records.
- New poses, five role palettes, furniture and Canvas atlases: generated locally from the approved geometry plus original project geometry, with source scripts and review renders included. No external asset marketplace or image generation service was used for these assets.
- Music Studio Hours and five sound cues: original procedural compositions from scripts/build-audio.py; source WAV and shipped MP3/Ogg files retained.
- UI icons: small project-authored inline SVG paths. Fonts: system font stack, no redistributed webfont.

## Offline authoring tools

VTK 9.5.2, trimesh 4.11.0, networkx 3.5, numpy, scipy and Pillow were used offline for geometry/rendering; FFmpeg encoded audio. These tools are not included in the web runtime. Install them separately if rebuilding art. The generated artifact does not embed their Python binaries.

## Security snapshot

The actual npm audit JSON is in ../evidence/npm-audit.json. A zero-advisory snapshot does not establish absence of all defects. No telemetry, external API, login, payment service or backend is part of the production bundle.
