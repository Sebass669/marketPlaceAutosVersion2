"""Convierte fotos de carros a WebP livianas para el catálogo.

Uso (desde la carpeta del proyecto):
    python tools/optimizar_fotos.py ruta/a/fotos/*.jpg

Cada foto se reduce a 1200 px de ancho como máximo y se guarda como .webp
en assets/autos/ con el mismo nombre. Después usá esa ruta en data/autos.json.
Requiere Pillow: pip install pillow
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

ANCHO_MAX = 1200
CALIDAD = 76
DESTINO = Path(__file__).resolve().parent.parent / 'assets' / 'autos'


def optimizar(origen: Path) -> Path:
    im = ImageOps.exif_transpose(Image.open(origen)).convert('RGB')  # respeta la rotación del celular
    if im.width > ANCHO_MAX:
        im = im.resize((ANCHO_MAX, round(im.height * ANCHO_MAX / im.width)), Image.LANCZOS)
    salida = DESTINO / f'{origen.stem.lower().replace(" ", "-")}.webp'
    im.save(salida, 'WEBP', quality=CALIDAD, method=6)
    return salida


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    DESTINO.mkdir(parents=True, exist_ok=True)
    for ruta in sys.argv[1:]:
        origen = Path(ruta)
        salida = optimizar(origen)
        print(f'{origen.name} ({origen.stat().st_size // 1024} KB) -> {salida.name} ({salida.stat().st_size // 1024} KB)')
