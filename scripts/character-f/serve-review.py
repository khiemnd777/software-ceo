"""Loopback F gallery; serve a fixed allowlist only, never the repo root."""
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import mimetypes

ROOT = Path(__file__).resolve().parents[2]
PAGE = '/art-source/character-f/review.html'
ROUTES = [PAGE] + ['/art-source/character-f/' + file for file in [
    'male-controls-f.blend', 'female-controls-f.blend',
    'male-rigged-f.glb', 'female-rigged-f.glb', 'manifest-f.json',
]]
for gender in ['male', 'female']:
    for clip in ['idle', 'working', 'walk', 'stand-up', 'alert', 'meeting']:
        for view in ['three-quarter', 'side']:
            ROUTES += [f'/evidence/character-f/frames/{gender}/{clip}/{view}/{i:02d}.png' for i in range(17)]
    for clip, view, frame in [('working', 'three-quarter', 13), ('working', 'side', 13),
        ('stand-up', 'side', 25), ('stand-up', 'side', 49), ('walk', 'side', 19),
        ('alert', 'three-quarter', 13), ('meeting', 'three-quarter', 13)]:
        ROUTES.append(f'/evidence/character-f/stills/{gender}-{clip}-{view}-{frame}.png')
FILES = {route: ROOT / route.lstrip('/') for route in ROUTES}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.respond(True)

    def do_HEAD(self):
        self.respond(False)

    def respond(self, body):
        path = urlsplit(self.path).path
        if path == '/':
            self.send_response(302)
            self.send_header('Location', PAGE)
            self.end_headers()
            return
        file = FILES.get(path)
        if file is None or not file.is_file():
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header('Content-Type', mimetypes.guess_type(file.name)[0] or 'application/octet-stream')
        self.send_header('Content-Length', str(file.stat().st_size))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        if file.suffix in ['.blend', '.glb']:
            self.send_header('Content-Disposition', 'attachment; filename="' + file.name + '"')
        self.end_headers()
        if body:
            with file.open('rb') as stream:
                while chunk := stream.read(1024 * 256):
                    self.wfile.write(chunk)


if __name__ == '__main__':
    assert all(file.is_file() for file in FILES.values()), 'Finish all renders before opening review.'
    print(f'F review: http://127.0.0.1:4193{PAGE}; {len(FILES)} fixed routes', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 4193), Handler).serve_forever()
