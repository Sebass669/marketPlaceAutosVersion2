"""Genera las ilustraciones SVG de Solera (autos clásicos de perfil sobre un atardecer).

Uso (desde version2/):
    python tools/ilustraciones.py

Escribe:
    assets/ilustraciones/escena.svg          fondo del hero (cielo, colinas, carretera)
    assets/ilustraciones/atardecer.svg       escena con sol y sedán crema (sección conócenos)
    assets/ilustraciones/persona.svg         avatar genérico del equipo
    assets/ilustraciones/autos/<ID>.svg      una portada por auto de data/autos.json, según su
                                             tipo (sedán, SUV, pickup, hatchback) y su color
    index.html                               reemplaza <!--sedan--> ... <!--/sedan--> con el sedán
                                             en línea (para animar las ruedas con CSS)

Si agregás un auto nuevo al JSON, volvé a correr este script para crear su portada.
Si no existe la portada, el sitio usa automáticamente la primera foto del auto.
"""
import hashlib
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / 'assets' / 'ilustraciones'

# Colores del JSON (en minúscula, sin tildes) a tonos de pintura apagados, como en las maquetas.
COLORES = {
    'blanco': '#e4ded0', 'blanco perla': '#e9e3d4', 'crema': '#d8d0bd', 'beige': '#cdbb98',
    'gris': '#7d8083', 'gris oscuro': '#4f5355', 'gris metalico': '#8a8d8e', 'plateado': '#aeb0ac',
    'negro': '#26282a', 'azul': '#47607f', 'azul marino': '#33415c', 'rojo': '#8f3b2e', 'vino': '#5e2a2c',
    'verde': '#4f6b5c', 'cafe': '#6b4f3a', 'cafe oscuro': '#523d30', 'dorado': '#b8975e', 'amarillo': '#c9a24a',
    'naranja': '#b0643a',
}
RESERVA = ['#4f6b5c', '#47607f', '#8f3b2e', '#d8d0bd', '#b8975e', '#5e2a2c']


def color_pintura(nombre, semilla):
    clave = (nombre or '').lower()
    for a, b in (('á', 'a'), ('é', 'e'), ('í', 'i'), ('ó', 'o'), ('ú', 'u')):
        clave = clave.replace(a, b)
    if clave in COLORES:
        return COLORES[clave]
    for k in sorted(COLORES, key=len, reverse=True):
        if k in clave:
            return COLORES[k]
    return RESERVA[int(hashlib.md5(semilla.encode()).hexdigest(), 16) % len(RESERVA)]


# Grano: ruido fino recortado a la forma del dibujo y mezclado ENCIMA del original.
def grano(ancho, alto):
    return f"""<filter id="grano" filterUnits="userSpaceOnUse" x="0" y="0" width="{ancho}" height="{alto}">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="ruido"/>
  <feColorMatrix in="ruido" values="0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0 0.04  0 0 0 0.35 -0.05" result="ruidoA"/>
  <feComposite in="ruidoA" in2="SourceGraphic" operator="in" result="ruidoC"/>
  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="ruidoC"/></feMerge>
</filter>"""


TONOS = {
    # cielo arriba, cielo abajo, halo, colina lejos (arriba/abajo), colina cerca (arriba/abajo)
    'calido': ('#3a2e22', '#8a6c48', '#f0cf98', '#9a7c58', '#6e5640', '#5e4a37', '#3a2f25'),
    'crema': ('#47463a', '#9a9078', '#ece4c8', '#9d9077', '#71654f', '#5b5242', '#38322a'),
    'noche': ('#1b1714', '#4a3a2c', '#c99a62', '#5f4a36', '#3f3226', '#33281f', '#1f1914'),
}


def escena(ancho=800, alto=500, horizonte=330, centro=(560, 150), sol=None, tono='calido'):
    """Cielo con halos concéntricos, colinas en capas y carretera en perspectiva."""
    cx, cy = centro
    c_arriba, c_abajo, halo, lj1, lj2, cr1, cr2 = TONOS[tono]
    anillos = '\n'.join(
        f'<circle cx="{cx}" cy="{cy}" r="{60 + i * 42}" fill="{halo}" opacity="0.13"/>' for i in range(12, -1, -1)
    )
    sol_svg = ''
    if sol:
        sx, sy, sr = sol
        sol_svg = f'<circle cx="{sx}" cy="{sy}" r="{sr * 1.6}" fill="#fff4d6" opacity="0.25"/><circle cx="{sx}" cy="{sy}" r="{sr}" fill="#f6e6c0"/>'
    vp = ancho / 2
    lineas = '\n'.join(
        f'<line x1="{vp}" y1="{horizonte}" x2="{x}" y2="{alto}" stroke="#fff" stroke-opacity="0.045" stroke-width="1.5"/>'
        for x in range(-800, ancho + 801, 200)
    )
    guiones = '\n'.join(
        f'<rect x="{x}" y="{alto - 36}" width="38" height="3" rx="1.5" fill="#fff" opacity="0.12"/>' for x in range(20, ancho, 76)
    )
    return f"""<defs>
  <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{c_arriba}"/><stop offset="1" stop-color="{c_abajo}"/>
  </linearGradient>
  <linearGradient id="colina-lejos" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{lj1}"/><stop offset="1" stop-color="{lj2}"/>
  </linearGradient>
  <linearGradient id="colina-cerca" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{cr1}"/><stop offset="1" stop-color="{cr2}"/>
  </linearGradient>
  <linearGradient id="suelo" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2b2520"/><stop offset="1" stop-color="#121110"/>
  </linearGradient>
  {grano(ancho, alto)}
  <clipPath id="cielo-recorte"><rect width="{ancho}" height="{horizonte + 2}"/></clipPath>
</defs>
<g filter="url(#grano)">
  <rect width="{ancho}" height="{horizonte + 2}" fill="url(#cielo)"/>
  <g clip-path="url(#cielo-recorte)">{anillos}
  {sol_svg}</g>
  <path d="M0 {horizonte - 52} C {ancho * .18} {horizonte - 96}, {ancho * .32} {horizonte - 70}, {ancho * .48} {horizonte - 58} S {ancho * .8} {horizonte - 104}, {ancho} {horizonte - 66} V {horizonte} H 0 Z" fill="url(#colina-lejos)"/>
  <path d="M0 {horizonte - 18} C {ancho * .22} {horizonte - 52}, {ancho * .4} {horizonte - 20}, {ancho * .62} {horizonte - 34} S {ancho * .9} {horizonte - 46}, {ancho} {horizonte - 22} V {horizonte} H 0 Z" fill="url(#colina-cerca)"/>
  <rect y="{horizonte}" width="{ancho}" height="{alto - horizonte}" fill="url(#suelo)"/>
  <rect y="{horizonte}" width="{ancho}" height="1.5" fill="#f3e2c0" opacity="0.18"/>
  {lineas}
  {guiones}
</g>"""


def rueda(cx, cy=136, r=38):
    rayos = ''.join(
        f'<rect x="{cx - 1.5}" y="{cy - r * .53}" width="3" height="{r * .21}" rx="1" fill="#6f6a60" transform="rotate({a} {cx} {cy})"/>'
        for a in range(0, 360, 45)
    )
    return (
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#141413"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{r * .63}" fill="#cfc8b8"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{r * .45}" fill="#9b958a"/>'
        f'{rayos}'
        f'<circle cx="{cx}" cy="{cy}" r="{r * .21}" fill="#e9e3d5"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{r * .08}" fill="#2a2926"/>'
    )


def _defs_carro(color, id_):
    return f"""<defs>
  <linearGradient id="{id_}-carro" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{color}"/><stop offset=".55" stop-color="{color}"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>
  </linearGradient>
  <linearGradient id="{id_}-luz" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="{id_}-vidrio" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2c3b3a"/><stop offset=".55" stop-color="#1b2423"/><stop offset="1" stop-color="#3b4a47"/>
  </linearGradient>
</defs>"""


def _carroceria(cuerpo, ventanas, detalles, ruedas, color, id_, sombra=(262, 272)):
    """Arma un vehículo: sombra, cuerpo con luz y sombra, vidrios, detalles y ruedas con pasarruedas."""
    cx_sombra, rx_sombra = sombra
    vidrios = ''.join(f'<path d="{v}" fill="url(#{id_}-vidrio)"/>' for v in ventanas)
    pasos = ''.join(f'<circle cx="{x}" cy="{y}" r="{r + 8}" fill="#0d0d0c"/>' for x, y, r in ruedas)
    llantas = ''.join(f'<g class="rueda" style="transform-origin:{x}px {y}px">{rueda(x, y, r)}</g>' for x, y, r in ruedas)
    return f"""{_defs_carro(color, id_)}
<ellipse cx="{cx_sombra}" cy="164" rx="{rx_sombra}" ry="11" fill="#000" opacity=".5"/>
<path d="{cuerpo}" fill="{color}"/>
<path d="{cuerpo}" fill="url(#{id_}-carro)" opacity=".55"/>
<path d="{cuerpo}" fill="url(#{id_}-luz)"/>
{vidrios}
{detalles}
{pasos}
{llantas}"""


def sedan(color='#4f6b5c', id_='s'):
    """Sedán clásico de perfil, mirando a la izquierda. Ancho 520, suelo en y=164."""
    detalles = """<path d="M190 44 L214 44 L176 68 L160 68 Z" fill="#fff" opacity=".06"/>
<rect x="255" y="28" width="6" height="104" fill="#000" opacity=".35"/>
<path d="M28 92 L498 92" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
<path d="M18 112 L508 112" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/>
<rect x="222" y="98" width="16" height="4" rx="2" fill="#000" opacity=".4"/>
<rect x="298" y="98" width="16" height="4" rx="2" fill="#000" opacity=".4"/>
<rect x="15" y="90" width="16" height="11" rx="2.5" fill="#efe6cf"/>
<rect x="498" y="88" width="13" height="14" rx="2.5" fill="#a9583a"/>
<rect x="2" y="116" width="44" height="9" rx="4" fill="#161514"/>
<rect x="478" y="116" width="44" height="9" rx="4" fill="#161514"/>"""
    return _carroceria(
        'M14 98 Q10 84 24 80 L124 74 L174 33 Q181 27 191 27 L333 27 Q343 27 351 33 L414 74 L496 80 Q512 82 512 98 L512 126 Q512 136 502 136 L24 136 Q14 136 14 126 Z',
        ['M181 40 L252 40 L252 72 L141 72 Z', 'M264 40 L338 40 L396 72 L264 72 Z'],
        detalles, [(110, 136, 38), (414, 136, 38)], color, id_,
    )


def suv(color='#47607f', id_='u'):
    """SUV / todoterreno: techo alto, tres ventanas y rieles de techo."""
    detalles = """<rect x="168" y="5" width="290" height="5" rx="2.5" fill="#1a1a19"/>
<rect x="200" y="8" width="5" height="7" fill="#1a1a19"/><rect x="420" y="8" width="5" height="7" fill="#1a1a19"/>
<rect x="234" y="24" width="7" height="110" fill="#000" opacity=".35"/>
<rect x="342" y="24" width="7" height="110" fill="#000" opacity=".3"/>
<path d="M24 94 L506 94" stroke="#fff" stroke-opacity=".16" stroke-width="2"/>
<path d="M18 116 L510 116" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/>
<rect x="210" y="102" width="16" height="4" rx="2" fill="#000" opacity=".4"/>
<rect x="318" y="102" width="16" height="4" rx="2" fill="#000" opacity=".4"/>
<rect x="15" y="92" width="18" height="12" rx="2.5" fill="#efe6cf"/>
<rect x="500" y="86" width="13" height="18" rx="2.5" fill="#a9583a"/>
<rect x="2" y="120" width="46" height="10" rx="4" fill="#161514"/>
<rect x="476" y="120" width="46" height="10" rx="4" fill="#161514"/>"""
    return _carroceria(
        'M14 104 Q10 88 26 84 L92 78 L140 24 Q147 15 160 15 L460 15 Q474 15 480 27 L506 76 Q514 82 514 98 L514 130 Q514 140 504 140 L24 140 Q14 140 14 130 Z',
        ['M154 28 L228 28 L228 74 L112 74 Z', 'M247 28 L336 28 L336 74 L247 74 Z', 'M355 28 L456 28 Q464 28 468 36 L488 74 L355 74 Z'],
        detalles, [(112, 140, 40), (412, 140, 40)], color, id_,
    )


def pickup(color='#4f5355', id_='p'):
    """Pickup doble cabina con cajón."""
    detalles = """<rect x="306" y="78" width="210" height="6" rx="2" fill="#000" opacity=".35"/>
<rect x="228" y="30" width="7" height="104" fill="#000" opacity=".35"/>
<rect x="302" y="30" width="5" height="106" fill="#000" opacity=".3"/>
<path d="M24 96 L512 96" stroke="#fff" stroke-opacity=".16" stroke-width="2"/>
<path d="M18 116 L514 116" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/>
<rect x="196" y="102" width="16" height="4" rx="2" fill="#000" opacity=".4"/>
<rect x="268" y="102" width="16" height="4" rx="2" fill="#000" opacity=".4"/>
<rect x="15" y="92" width="18" height="12" rx="2.5" fill="#efe6cf"/>
<rect x="504" y="88" width="12" height="16" rx="2.5" fill="#a9583a"/>
<rect x="2" y="120" width="46" height="10" rx="4" fill="#161514"/>
<rect x="490" y="120" width="34" height="10" rx="4" fill="#161514"/>
<rect x="150" y="136" width="230" height="5" rx="2" fill="#8d8a84"/>"""
    return _carroceria(
        'M14 104 Q10 88 26 84 L104 78 L150 30 Q157 22 168 22 L292 22 Q301 22 303 31 L307 80 L512 80 Q518 80 518 88 L518 130 Q518 140 508 140 L24 140 Q14 140 14 130 Z',
        ['M164 34 L224 34 L224 74 L124 74 Z', 'M239 34 L292 34 L295 74 L239 74 Z'],
        detalles, [(112, 140, 40), (424, 140, 40)], color, id_, sombra=(266, 276),
    )


def hatchback(color='#8f3b2e', id_='h'):
    """Hatchback compacto (centrado en el mismo ancho de 520)."""
    detalles = """<rect x="244" y="24" width="6" height="110" fill="#000" opacity=".35"/>
<path d="M30 94 L442 94" stroke="#fff" stroke-opacity=".16" stroke-width="2"/>
<path d="M22 116 L448 116" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/>
<rect x="212" y="100" width="16" height="4" rx="2" fill="#000" opacity=".4"/>
<rect x="19" y="92" width="18" height="12" rx="2.5" fill="#efe6cf"/>
<rect x="440" y="80" width="12" height="20" rx="2.5" fill="#a9583a"/>
<rect x="6" y="118" width="44" height="10" rx="4" fill="#161514"/>
<rect x="418" y="118" width="42" height="10" rx="4" fill="#161514"/>"""
    cuerpo = _carroceria(
        'M18 106 Q16 90 32 86 L100 80 L154 30 Q162 22 174 22 L362 22 Q378 22 388 36 L440 84 Q456 90 456 108 L456 128 Q456 138 446 138 L28 138 Q18 138 18 128 Z',
        ['M170 34 L240 34 L240 76 L124 76 Z', 'M254 34 L360 34 Q372 34 380 46 L408 76 L254 76 Z'],
        detalles, [(108, 138, 38), (366, 138, 38)], color, id_, sombra=(236, 236),
    )
    return f'<g transform="translate(32 0)">{cuerpo}</g>'


CARROCERIAS = {'sedan': sedan, 'suv': suv, 'van': suv, 'pickup': pickup, 'hatchback': hatchback, 'coupe': sedan}


def carroceria_para(tipo):
    clave = (tipo or '').lower().replace('á', 'a').replace('é', 'e')
    return CARROCERIAS.get(clave, sedan)


def svg(contenido, ancho=800, alto=500, extra=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho} {alto}" {extra}>\n{contenido}\n</svg>\n'


def portada(auto, indice):
    """Portada 4:3 de un auto: escena variada + la carrocería de su tipo en su color."""
    variantes = [
        dict(tono='crema', centro=(400, 250), sol=(250, 330, 34)),
        dict(tono='calido', centro=(560, 230), sol=(560, 330, 30)),
        dict(tono='noche', centro=(420, 280), sol=None),
        dict(tono='calido', centro=(300, 240), sol=(620, 330, 28)),
    ]
    v = variantes[indice % len(variantes)]
    color = color_pintura(auto.get('color'), auto['id'])
    fondo = escena(800, 600, horizonte=360, centro=v['centro'], sol=v['sol'], tono=v['tono'])
    vehiculo = carroceria_para(auto.get('tipo'))(color, f"a{indice}")
    return svg(f'{fondo}\n<g transform="translate(118 300) scale(1.08)">{vehiculo}</g>', 800, 600)


def persona():
    """Avatar genérico para el equipo (silueta sobre fondo cálido)."""
    return svg("""<defs>
  <radialGradient id="fondo" cx=".5" cy=".35" r=".8">
    <stop offset="0" stop-color="#8a6a48"/><stop offset="1" stop-color="#3a2b1f"/>
  </radialGradient>
</defs>
<rect width="120" height="120" rx="22" fill="url(#fondo)"/>
<circle cx="60" cy="48" r="20" fill="#d7b98c"/>
<path d="M50 64 L70 64 L68 76 L52 76 Z" fill="#c6a679"/>
<path d="M20 120 C 22 92, 40 78, 60 78 C 80 78, 98 92, 100 120 Z" fill="#4a382a"/>
<path d="M52 78 L60 92 L68 78 Z" fill="#c6a679"/>""", 120, 120)


if __name__ == '__main__':
    (SALIDA / 'autos').mkdir(parents=True, exist_ok=True)

    (SALIDA / 'escena.svg').write_text(
        svg(escena(1200, 600, horizonte=400, centro=(860, 180)), 1200, 600, 'preserveAspectRatio="xMidYMid slice"'),
        encoding='utf-8',
    )
    atardecer = escena(800, 640, horizonte=430, centro=(320, 260), sol=(230, 360, 48), tono='crema')
    atardecer += f'\n<g transform="translate(140 400)">{sedan("#d8d0bd", "cr")}</g>'
    (SALIDA / 'atardecer.svg').write_text(svg(atardecer, 800, 640), encoding='utf-8')
    (SALIDA / 'persona.svg').write_text(persona(), encoding='utf-8')

    datos = json.loads((RAIZ / 'data' / 'autos.json').read_text(encoding='utf-8'))
    for i, auto in enumerate(datos.get('autos', [])):
        (SALIDA / 'autos' / f"{auto['id']}.svg").write_text(portada(auto, i), encoding='utf-8')

    html = RAIZ / 'index.html'
    texto = html.read_text(encoding='utf-8')
    bloque = (
        '<!--sedan-->\n'
        '          <svg class="hero__carro" viewBox="-6 0 532 178" aria-hidden="true" data-carro>'
        f'{sedan("#4f6b5c", "hv")}</svg>\n'
        '          <!--/sedan-->'
    )
    nuevo, n = re.subn(r'<!--sedan-->.*?<!--/sedan-->', bloque, texto, flags=re.S)
    if n:
        html.write_text(nuevo, encoding='utf-8')
    print(f"ilustraciones listas: {len(datos.get('autos', []))} portadas de autos; sedán del hero actualizado: {bool(n)}")
