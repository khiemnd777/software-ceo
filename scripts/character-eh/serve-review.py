"""Serve only fixed E review artifacts on loopback; keep V3 server untouched."""
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import mimetypes

ROOT=Path(__file__).resolve().parents[2]
PAGE='/art-source/character-eh/review-e.html'
ROUTES=[PAGE]+['/art-source/character-eh/'+name for name in ['base-models-e.blend','male-base-e.glb','female-base-e.glb','manifest-e.json']]
ROUTES+=['/evidence/character-eh/'+gender+'-'+view+'.png' for gender in ['male','female'] for view in ['front','three-quarter','profile','back','clay','head','game']]
ROUTES+=['/evidence/character-eh/lineup-e.png','/evidence/character-female-head-v3/new-three-quarter.png','/art-source/character-redesign-ac/references/approved-body.png']
FILES={route:ROOT/route.lstrip('/') for route in ROUTES}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):self.respond(True)
    def do_HEAD(self):self.respond(False)
    def respond(self,body):
        path=urlsplit(self.path).path
        if path=='/':
            self.send_response(302);self.send_header('Location',PAGE);self.end_headers();return
        file=FILES.get(path)
        if file is None or not file.is_file():self.send_error(404);return
        data=file.read_bytes();self.send_response(200)
        self.send_header('Content-Type',mimetypes.guess_type(file.name)[0] or 'application/octet-stream')
        self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','no-referrer')
        if file.suffix in ['.blend','.glb']:self.send_header('Content-Disposition','attachment; filename="'+file.name+'"')
        self.end_headers()
        if body:self.wfile.write(data)


if __name__=='__main__':
    print('E review: http://127.0.0.1:4192'+PAGE,flush=True)
    print(str(len(FILES))+' fixed file routes; other paths return 404',flush=True)
    ThreadingHTTPServer(('127.0.0.1',4192),Handler).serve_forever()
