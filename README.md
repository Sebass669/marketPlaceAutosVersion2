# Solera · versión 2

Marketplace estático de carros usados de dueño a dueño en Costa Rica.
No tiene backend: el catálogo vive en `data/autos.json` y todo contacto pasa por tu WhatsApp.

## Antes de publicar

1. Abrí `js/config.js` y poné tu número en `whatsapp` (formato `506XXXXXXXX`, sin `+` ni espacios).
2. Reemplazá los carros de ejemplo de `data/autos.json` por los reales.
3. Borrá las fotos de ejemplo de `assets/autos/` y `CREDITOS.md` cuando ya no las uses
   (y quitá la línea "Fotos de ejemplo" del footer en `index.html`).

## Agregar un carro

1. Subí las fotos a `assets/autos/` (JPG o WebP horizontal, idealmente 1200 px de ancho y menos de 200 KB; ver "Optimizar fotos").
2. Copiá un bloque `{ ... }` dentro de `"autos"` en `data/autos.json`, cambiá los datos y separalo con coma.
3. Actualizá `"actualizado"` con la fecha del día (`AAAA-MM-DD`).

```json
{
  "id": "MV-010",
  "marca": "Nissan",
  "modelo": "Sentra",
  "version": "SR",
  "anio": 2017,
  "precio": 7900000,
  "kilometraje": 98000,
  "tipo": "Sedán",
  "transmision": "Automática",
  "combustible": "Gasolina",
  "motor": "1.8 L",
  "traccion": "4x2",
  "color": "Gris",
  "provincia": "Heredia",
  "canton": "Belén",
  "estado": "disponible",
  "destacado": false,
  "publicado": "2026-10-12",
  "fotos": ["assets/autos/sentra-1.webp", "assets/autos/sentra-2.webp"],
  "extras": ["Cámara de retroceso", "Bluetooth"],
  "descripcion": "Texto libre que escribe el vendedor."
}
```

### Optimizar fotos

Las fotos del celular pesan varios MB. Antes de subirlas, convertilas a WebP:

```bash
python tools/optimizar_fotos.py "C:/ruta/a/las/fotos/sentra-1.jpg" "C:/ruta/a/las/fotos/sentra-2.jpg"
```

Quedan en `assets/autos/sentra-1.webp`, `sentra-2.webp` (unos 100 KB cada una) y ya se pueden usar en el JSON.

### Campos

| Campo | Obligatorio | Notas |
|---|---|---|
| `id` | sí | Único. Es el código que llega en el mensaje de WhatsApp y el link del carro (`#carro/MV-010`). |
| `marca`, `modelo` | sí | |
| `anio`, `precio`, `kilometraje` | sí | Números **sin comillas ni puntos**: `7900000`, no `"7.900.000"`. |
| `tipo` | sí | `SUV`, `Pickup`, `Sedán`, `Hatchback`, `Van`, `Coupé` o `Moto`. Crea los botones de filtro. |
| `transmision`, `combustible`, `provincia` | sí | Provincia con tilde exacta: `San José`, `Limón`. |
| `fotos` | sí | Al menos una. La primera es la portada. |
| `estado` | no | `disponible` (por defecto), `reservado` o `vendido`. Los vendidos quedan al final, en gris. |
| `destacado` | no | `true` lo muestra en el hero. Si ninguno lo tiene, sale el disponible más reciente. |
| `publicado` | no | `AAAA-MM-DD`. Ordena "Más recientes". |
| `version`, `motor`, `traccion`, `color`, `canton`, `extras`, `descripcion` | no | Si faltan, simplemente no se muestran. |

Si te equivocás en un carro, ese carro no aparece y la consola del navegador (F12) dice cuál y por qué.
Si el JSON entero tiene un error de comas o comillas, la página lo avisa. Podés validarlo en https://jsonlint.com.

## Ver el sitio en tu compu

El navegador no deja leer el JSON si abrís `index.html` con doble clic. Usá un servidor local desde esta carpeta:

```bash
python tools/servidor.py
```

(No uses `python -m http.server` en Windows: no reconoce las fotos `.webp` y algunos navegadores no las muestran.)

y entrá a http://localhost:5173.

## Publicar

Subí la carpeta completa (sin `referencias/`, `tools/`, `.claude/`, `.agents/` ni `.playwright/`) a cualquier hosting estático:
Netlify (arrastrar la carpeta), GitHub Pages, Cloudflare Pages o el hosting que ya tengás.

## Estructura

```
index.html                  Estructura y textos fijos de la página
data/autos.json             Catálogo (lo único que editás seguido)
js/config.js                Nombre, WhatsApp y opciones de filtros
js/main.js                  Arranque: conecta todos los módulos
js/data/autosRepository.js  Carga y valida el JSON
js/features/catalog/        Filtros, tarjetas y grilla
js/features/detail/         Ficha del carro (diálogo)
js/features/hero/           Carro destacado del inicio
js/features/sell/           Formulario "Vender mi carro"
js/features/ui/             Menú móvil, selector de tema, revelados y scroll suave
js/features/destacados/     Carrusel de autos destacados
js/features/contact/        Formulario de contacto (compradores) y datos del negocio
js/utils/                   Formato de colones, DOM seguro, links de WhatsApp
css/tokens.css              Los tres temas, tipografía, radios y espaciado
css/base.css, components.css, sections.css
assets/autos/               Fotos de los carros
assets/ilustraciones/       Escenas de atardecer y autos/<ID>.svg
tools/ilustraciones.py      Genera las ilustraciones SVG (hero, conócenos y una por auto)
tools/optimizar_fotos.py    Convierte fotos a WebP livianas para el catálogo
assets/icons.svg            Sprite de íconos (Phosphor, solo los que se usan)
```

## Diseño

Basado en las maquetas de Solera (`referencias/`) y su logo: títulos extendidos en cursiva
(Michroma) con texto en Inter, superficies redondeadas, botones pill, acento dorado e
ilustraciones de autos clásicos sobre un atardecer con grano.

**Tres temas** (negro, hueso y dorado): el visitante los elige con los tres puntos del header
y queda guardado en su navegador. Los colores están en `css/tokens.css`.

**Secciones:** inicio, autos destacados (carrusel), por qué Solera, inventario con filtros,
conócenos (equipo y cifras), testimonios, preguntas y contacto (comprar / vender).

**Datos de ejemplo a reemplazar** en `index.html`: nombres del equipo, cifras y testimonios.
Teléfono, correo, horario, dirección y redes se cambian en `js/config.js`.

## Ilustraciones de los autos

Cada auto muestra una ilustración (según su `tipo` y su `color` del JSON) y, en la galería
de la ficha, también sus fotos reales. Al agregar un auto nuevo, generá su ilustración:

```bash
python tools/ilustraciones.py
```

Si un auto no tiene ilustración, se usa su primera foto automáticamente. Para mostrar
siempre las fotos en vez de ilustraciones, poné `portadas: 'foto'` en `js/config.js`.

Las animaciones son CSS (entrada del hero, revelado al hacer scroll) y respetan la
preferencia de reducir movimiento. Los favoritos (corazón) se guardan en el navegador.
