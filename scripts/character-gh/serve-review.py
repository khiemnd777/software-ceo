"""Fixed-file G/H review on loopback; never serve repository directories."""
from pathlib import Path
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlsplit
import json,mimetypes,re

ROOT=Path(__file__).resolve().parents[2];PAGE='/art-source/character-gh/review.html'
routes=[PAGE,'/art-source/character-gh/manifest-g.json','/public/assets/characters/manifest.json']
for model_id in json.loads((ROOT/'src/characters/catalog.json').read_text()):
    assert re.fullmatch('[a-z-]+',model_id)
    routes.extend('/art-source/character-gh/'+model_id+suffix for suffix in ['.glb','-controls.blend'])
    routes.extend('/evidence/character-gh/studies/'+model_id+'-'+view+'.png' for view in ['front','back','seated','walk'])
    routes.append('/public/assets/characters/'+model_id+'.webp')
FILES={route:ROOT/route.lstrip('/') for route in routes}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):self.respond(True)
    def do_HEAD(self):self.respond(False)
    def respond(self,body):
        path=urlsplit(self.path).path
        if path=='/':
            self.send_response(302);self.send_header('Location',PAGE);self.end_headers();return
        file=FILES.get(path)
        if file is None or not file.is_file():self.send_error(404);return
        self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(file.name)[0] or 'application/octet-stream')
        self.send_header('Content-Length',str(file.stat().st_size));self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','no-referrer')
        if file.suffix in ['.blend','.glb']:self.send_header('Content-Disposition','attachment; filename="'+file.name+'"')
        self.end_headers()
        if body:
            with file.open('rb') as stream:
                while chunk:=stream.read(256*1024):self.wfile.write(chunk)


if __name__=='__main__':
    assert all(path.is_file() for path in FILES.values())
    print('G/H review http://127.0.0.1:4195'+PAGE+'; '+str(len(FILES))+' fixed files',flush=True)
    ThreadingHTTPServer(('127.0.0.1',4195),Handler).serve_forever()
