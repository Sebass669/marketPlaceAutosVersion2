"""Servidor local para ver MONTEVER en tu compu.

Uso (desde la carpeta del proyecto):
    python tools/servidor.py          -> http://localhost:5173
    python tools/servidor.py 8080     -> otro puerto

Por qué no basta con `python -m http.server`: en Windows, Python toma los tipos de
archivo del registro del sistema, que no conoce .webp (lo manda como archivo genérico
y algunos navegadores no muestran la foto) y a veces sirve .js como texto plano.
Aquí los tipos se declaran a mano y se desactiva la caché para ver cada cambio al recargar.
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

TIPOS = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.md': 'text/markdown; charset=utf-8',
}


class Manejador(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, **TIPOS}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


if __name__ == '__main__':
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    servidor = ThreadingHTTPServer(('127.0.0.1', puerto), partial(Manejador, directory=str(RAIZ)))
    print(f'MONTEVER en http://localhost:{puerto}  (Ctrl+C para detener)')
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
