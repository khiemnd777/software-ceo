"""Serve only the review bundle and existing office image files on loopback."""
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import mimetypes

ROOT = Path(__file__).resolve().parents[3]
PAGE = '/docs/mockups/compact-hud/'
FILES = {PAGE + name: ROOT / PAGE.lstrip('/') / name for name in ['index.html', 'app.js', 'app.css', 'viewport.html', 'viewport.js']}
FILES[PAGE] = FILES[PAGE + 'index.html']
for file in (ROOT / 'public/assets').rglob('*'):
    if file.suffix in ['.webp', '.png']:
        FILES['/assets/' + file.relative_to(ROOT / 'public/assets').as_posix()] = file

class Handler(BaseHTTPRequestHandler):
    def do_GET(self): self.respond(True)
    def do_HEAD(self): self.respond(False)
    def respond(self, body):
        route = urlsplit(self.path).path
        if route == '/':
            self.send_response(302); self.send_header('Location', PAGE); self.end_headers(); return
        file = FILES.get(route)
        if file is None or not file.is_file(): self.send_error(404); return
        data = file.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', mimetypes.guess_type(file.name)[0] or 'application/octet-stream')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'")
        self.end_headers()
        if body: self.wfile.write(data)

if __name__ == '__main__':
    assert all(file.is_file() for file in FILES.values())
    print('Compact HUD mockup http://127.0.0.1:4203' + PAGE + '; ' + str(len(FILES)) + ' fixed routes', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 4203), Handler).serve_forever()
