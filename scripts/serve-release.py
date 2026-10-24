"""Local-only static production smoke server with the proposed security headers."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]/'dist'
CSP="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def end_headers(self):
  self.send_header('Content-Security-Policy',CSP)
  self.send_header('X-Content-Type-Options','nosniff')
  self.send_header('Referrer-Policy','no-referrer')
  self.send_header('Permissions-Policy','camera=(), microphone=(), geolocation=()')
  self.send_header('Cache-Control','no-cache' if self.path.split('?')[0] in ('/','/index.html') else 'public, max-age=3600')
  super().end_headers()
if __name__=='__main__':
 port=int(sys.argv[1]) if len(sys.argv)>1 else 4174
 print(f'Local release smoke server: http://127.0.0.1:{port}',flush=True)
 ThreadingHTTPServer(('127.0.0.1',port),Handler).serve_forever()
