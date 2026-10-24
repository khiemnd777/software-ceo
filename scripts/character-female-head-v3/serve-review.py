"""Loopback-only review server with a fixed file allowlist; no repo browsing."""
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import mimetypes

ROOT=Path(__file__).resolve().parents[2]
PAGE='/art-source/character-female-head-v3/review.html'
FILES={PAGE:ROOT/PAGE.lstrip('/')}
for name in ['female-head-v3.blend','female-head-v3.glb','manifest.json']:
    route='/art-source/character-female-head-v3/'+name;FILES[route]=ROOT/route.lstrip('/')
for angle in ['front','three-quarter','profile']:
    for filename in ['new-'+angle+'.png','new-'+angle+'-clay.png','previous-'+angle+'.png']:
        route='/evidence/character-female-head-v3/'+filename;FILES[route]=ROOT/route.lstrip('/')
REFERENCE='/art-source/character-redesign-ac/references/approved-body.png'
FILES[REFERENCE]=ROOT/REFERENCE.lstrip('/')


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):self.respond(True)
    def do_HEAD(self):self.respond(False)
    def respond(self,body):
        path=urlsplit(self.path).path
        if path=='/':
            self.send_response(302);self.send_header('Location',PAGE);self.end_headers();return
        file=FILES.get(path)
        if file is None or not file.is_file():self.send_error(404);return
        content=file.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type',mimetypes.guess_type(file.name)[0] or 'application/octet-stream')
        self.send_header('Content-Length',str(len(content)))
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        if file.suffix in ['.blend','.glb']:self.send_header('Content-Disposition','attachment; filename="'+file.name+'"')
        self.end_headers()
        if body:self.wfile.write(content)


if __name__=='__main__':
    print('Female-head review only: http://127.0.0.1:4191'+PAGE,flush=True)
    print(str(len(FILES))+' explicit file routes; all other paths return 404',flush=True)
    ThreadingHTTPServer(('127.0.0.1',4191),Handler).serve_forever()
