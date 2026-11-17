# Propuesta de rediseño web ASDER — demo estática (pieza B1)

Sitio estático (HTML + CSS + JS, sin frameworks) listo para GitHub Pages o Vercel. Ejercicio
académico de la Universidad Central; no es comunicación oficial de ASDER Colombia.

## Estructura

```
index.html                    Home: hero con selector de tres rutas (Escuelas / Empresas / Coliseo), coliseo, familias, agenda, empresas, prueba social
escuelas/index.html           B1 · Landing de escuelas: vacacional, programas, calendario de clase de prueba (acción principal), formulario HubSpot, FAQ
empresas/index.html           Torneos, pausas activas, sede para organizadores, team building; calendario de visita/llamada + formulario HubSpot
coliseo/index.html            Ficha técnica, galería, mapa, reserva de práctica libre por franja
contacto/index.html           Dos entradas (familias / empresas), NAP único, mapa
politica-de-datos/index.html  Política de tratamiento de datos (Ley 1581/2012, Decreto 1377/2013)
gracias/index.html            Confirmación del formulario: qué pasa ahora, resumen y botón al chat (noindex)
assets/css/styles.css         Un solo CSS; variables en :root
assets/js/config.js           TODO lo configurable (SITE_URL, canal de chat, bot de Telegram, WhatsApp, HubSpot, hoja de Google, GA4)
assets/js/main.js             Widget de chat, enlaces por canal con payload, UTM, nav, calendario, formularios, analítica
assets/img/                   Fotos reales de asder.co: JPEG originales + variantes WebP (480/800/1200/1600) y logos
data/disponibilidad.json      Franjas del calendario
sitemap.xml · robots.txt · 404.html · .nojekyll
SUPUESTOS.md                  Cada valor no confirmado por ASDER, con justificación y dato real que lo reemplaza
```

## Publicar en GitHub Pages (5 minutos)

1. Crea un repositorio público, por ejemplo `asder-rediseno`, y sube el contenido de esta carpeta a la raíz (o a la rama `gh-pages`).
2. En *Settings → Pages* elige la rama y la carpeta raíz. La URL quedará como `https://tiagsa.github.io/ASDER_DEMO/`.
3. Pon esa URL en `SITE_URL` de `assets/js/config.js` y busca y reemplaza `https://tiagsa.github.io/ASDER_DEMO/`
   por la misma URL en todos los `.html`, `sitemap.xml` y `robots.txt` (canonical, Open Graph y JSON-LD son estáticos).
4. En `404.html` ajusta la ruta `/asder-rediseno/` del CSS y de los scripts si el nombre del repositorio es distinto.
5. Abre la URL en el celular y en escritorio; prueba cada botón.

Para Vercel: *Add New → Project → Import* la carpeta; no necesita build (framework "Other").

## Canal de chat: Telegram (ejercicio) o WhatsApp (producción)

Todo se decide en `assets/js/config.js`:

- `CHAT_CHANNEL_PRIMARY`: `"telegram"` durante el ejercicio, `"whatsapp"` en producción.
- `TELEGRAM_BOT_USERNAME`: username del bot sin `@` (placeholder `asder_ejercicio_bot` hasta que Santiago lo cree en BotFather). Si queda vacío y el canal es Telegram, todos los enlaces caen a WhatsApp.
- `WHATSAPP_NUMBER`: número de pruebas `573125122873`; en producción el oficial de ASDER (`573132195733`).

Ningún HTML tiene username ni número: `main.js` construye los enlaces. Un botón lleva `data-chat="<payload>"`
y `data-text="mensaje humano"`; `data-chat-alt` genera el enlace al otro canal. Los textos "te confirmamos
por WhatsApp/Telegram" usan `<span data-channel-name>` y se rellenan con el canal activo.

Payloads (contrato en `../bot/widget-contrato.md`): `b2c_escuelas`, `b2c_kids`, `b2c_young`, `b2c_adultos`,
`b2c_vacacional`, `b2b_general`, `b2b_torneo`, `b2b_pausas`, `b2b_integracion`, `coliseo_alquiler`, `asesor` y
`cal_<servicio>_<AAAAMMDD>_<HHMM>` desde el calendario (p. ej. `cal_clase-prueba-kids_20261121_1600`).

- Telegram: `https://t.me/<bot>?start=<payload>` (≤ 64 caracteres, `[A-Za-z0-9_-]`).
- WhatsApp: `https://wa.me/<número>?text=<mensaje + sufijo UTM + "\nRef: <payload>">`.

### Widget de chat

`main.js` monta en todas las páginas el botón flotante "Escríbenos" y un panel (`role="dialog"`, foco atrapado,
Esc cierra, 44 px, sin animación con `prefers-reduced-motion`) con cuatro opciones: Escuelas de voleibol
(`b2c_escuelas`), Empresas (`b2b_general`), Alquiler del coliseo (`coliseo_alquiler`) y Hablar con un asesor
(`asesor`). El panel lleva el aviso académico y el enlace a la política de datos. El widget no captura datos:
solo redirige; la autorización (Ley 1581) se pide dentro del bot.

## Formularios HubSpot (registro en el CRM)

Portal `52324192`, región `na1`. Escuelas: formId `6f132906-3ff1-4e18-b149-af533e4eff94`; Empresas:
`c11057d5-f84c-4f4d-93d8-6c9561b1c662` (ambos en `assets/js/config.js`). `main.js` inserta el embed
oficial — `<script src="https://js.hsforms.net/forms/embed/52324192.js" defer>` +
`<div class="hs-form-frame" data-region="na1" data-form-id="…" data-portal-id="52324192">` — y oculta el
formulario nativo. Si el script falla o no dibuja nada en 8 segundos, vuelve el formulario nativo, que
valida, guarda el envío en `localStorage` (`asder_leads`) y redirige a `/gracias/` con el resumen y el botón
al chat. Si un formId queda vacío, el nativo se muestra y debajo aparece el contenedor `.hs-form-frame`
con un atajo "Escríbenos por Telegram/WhatsApp" (`b2b_torneo` / `b2c_escuelas`).

En la página, el calendario es la acción principal ("Reserva en un minuto": solo servicio, día y hora) y
el formulario se presenta como alternativa personalizada ("¿Prefieres que nos ajustemos a tu agenda?").
La interfaz nunca menciona CRM ni HubSpot.

Evidencia para la rúbrica: captura del contacto creado en HubSpot + la URL con UTM usada en la
prueba (HubSpot captura `utm_*` de la URL en el contexto del envío).

## Valores por confirmar

La interfaz no muestra asteriscos ni avisos de "demo": precios, horarios, edades y agenda se ven
como propuesta terminada. Cada uno de esos valores está en `SUPUESTOS.md` con su justificación y se
reemplaza en el HTML cuando ASDER lo confirme. Las tres reseñas del home son literales de Google Maps.

## Calendario de reserva (retícula semanal tipo Lobb's)

El componente `.cal[data-calendar]` dibuja una retícula por día: pestañas de día arriba (Hoy, Mar 17…),
columnas = espacios, filas cada 30 minutos entre las horas de `data-hours`, línea de hora actual y un
botón flotante verde "Reservar". Se elige una celda y el botón abre el canal activo con el payload
`cal_<servicio>_<AAAAMMDD>_<HHMM>`; por WhatsApp el texto es "Hola, quiero reservar {espacio o clase} el
{día} a las {hora}. Vengo de la web." más la línea `Ref: cal_…`.

Mientras la agenda no venga de la hoja real, cada calendario muestra la línea "Agenda de muestra: la disponibilidad real se confirma por Telegram/WhatsApp" (`.cal__sample`) y el JSON lleva el campo `nota`.

Atributos: `data-mode` (`espacios`: celdas libres reservables; `clases`: solo los bloques amarillos con
cupos; `citas`: visita/llamada), `data-spaces` (columnas), `data-services` (filtro de clases),
`data-hours` (p. ej. `8-22`), `data-days` (pestañas), `data-src` (JSON). Estados: disponible (borde
verde, "+ hora"), reservado (verde rayado + nombre o "Privado" con candado), clase (amarillo + chip
de cupos), pasado (gris).

### Datos: `data/disponibilidad.json` o una hoja de Google

Cada fila es un bloque. Columnas: `id,tipo,servicio,espacio,fecha,semanal,hora,duracion,titulo,cupos,nombre,privado`.
- `tipo`: `clase` o `reservado`. Lo que no esté en la hoja se muestra como disponible.
- `espacio`: `cancha-1`, `cancha-2`, `badminton`, `tenis-de-mesa`, `simuladores`, `visita-coliseo`, `llamada-cotizacion`.
- `semanal`: días en que se repite (`1` lunes … `7` domingo; en CSV sepáralos con `;`), o `fecha` `AAAA-MM-DD` para un bloque puntual.
- `hora` `HH:MM` (24 h), `duracion` en minutos, `cupos` = `abiertos` / `cerrados` (solo clases), `nombre` (reservas), `privado` = `1`.
- Si todas las fechas puntuales de ejemplo quedan en el pasado, el JS las desplaza en semanas completas para que la demo siga viva.

Para conectar la hoja: *Archivo → Compartir → Publicar en la web → Hoja → CSV*, y pega la URL en
`SHEET_CSV_URL` de `assets/js/config.js`. Cuando el agente de WhatsApp (n8n) confirma una reserva,
añade una fila `reservado`: el próximo visitante ya la ve en verde rayado.

## Animaciones

La entrada del hero es una animación CSS (`@keyframes heroIn`) que solo se activa con la clase `.js`
que pone `config.js` en `<html>`: sin JS todo se ve, y como depende del reloj y no de ticks, nunca deja
el titular a medias. GSAP 3.12.5 + ScrollTrigger (cdnjs, versión fija) hacen el reveal al hacer scroll
(`data-reveal`, `data-reveal-group`) solo de lo que está por debajo del primer pantallazo, el parallax
≤ 8 % en fotos full-bleed y nada más; marquee en CSS y nav que se compacta al hacer scroll. Con
`prefers-reduced-motion: reduce` no corre ninguna animación. Si el CDN no carga, la página se ve completa.

En móvil y tablet (≤ 768 px) el hero mide 85 svh con el titular arriba (líneas en flujo, ≤ 4 renglones),
subtítulo de 1-2 líneas y la CTA principal dentro del primer pantallazo, sobre un degradado navy.

Flujo propuesto con n8n (gratuito autoalojado o número de prueba de Meta): *WhatsApp Trigger → Agente IA
(clasifica familia/empresa, pide autorización de datos) → HubSpot (crear/actualizar contacto) → Google
Sheets (marcar franja) → WhatsApp (confirmar)*.

## Analítica

En `config.js` pon `GA4_ID` (`G-XXXXXXXXXX`). Eventos que envía el sitio: `whatsapp_click` y
`reserva_click` (con parámetros `channel` = telegram | whatsapp y `payload`), `chat_open`,
`generate_lead`, `newsletter_signup`, `hubspot_fallback`. La página `/gracias/` sirve como conversión
de formulario. Los parámetros `utm_*` se guardan en la sesión y viajan en los campos ocultos del
formulario y como sufijo del mensaje de WhatsApp.

## SEO

- Un H1 por página con la palabra clave principal: home "Coliseo ASDER en Bogotá…", escuelas
  "Escuela de voleibol en Bogotá para niños y jóvenes", empresas "Torneo de voleibol empresarial en
  Bogotá…", coliseo "Alquiler de cancha de voleibol cubierta en Bogotá…".
- Titles ≤ 60 y descriptions ≤ 155 caracteres, canonical, Open Graph con imagen, `lang="es-CO"`.
- JSON-LD: `SportsActivityLocation` + `LocalBusiness` en el home (NAP, geo, horario, `sameAs`,
  `aggregateRating` 4,5/129 visible en la página); `Service` + `BreadcrumbList` + `FAQPage` en escuelas,
  empresas y coliseo; `ContactPage` en contacto. Validar en https://validator.schema.org/ tras publicar.
  Nota: Google dejó de mostrar rich results de FAQ en mayo de 2026; el `FAQPage` se mantiene como
  marcado semántico para asistentes y AI Overviews, no para obtener ese fragmento.
- `sitemap.xml` y `robots.txt` (reemplazar el dominio). `/gracias/` está en `noindex`.

## Imágenes

Fotos originales de asder.co (JPEG, como respaldo en `src`) más variantes WebP a 480, 800, 1200 y 1600 px
(`srcset` + `sizes` en cada `<img>`; 17-140 KB, el hero más pesado pesa 95 KB a 1200 px). La imagen LCP
de cada página lleva `fetchpriority="high"` y un `<link rel="preload" as="image" imagesrcset>`; el resto
`loading="lazy" decoding="async"` y `width`/`height` fijos. La galería del coliseo tiene variantes de 320 px
para las dos columnas del móvil. Para añadir una foto: genera las variantes (Squoosh o `npx sharp-cli`) y
copia el patrón de `srcset` de otra imagen del mismo tipo.

El script de HubSpot (`js.hsforms.net`) se carga bajo demanda con `IntersectionObserver` cuando la sección
del formulario se acerca a la pantalla (600 px de margen), con el mismo respaldo al formulario nativo.
No hace falta minificar CSS/JS ni configurar compresión: GitHub Pages sirve los archivos con gzip/brotli.

## Qué probar antes de presentar

1. El widget "Escríbenos" abre en todas las páginas, cierra con Esc y cada opción lleva a `t.me/<bot>?start=<payload>` (o a `wa.me` si el canal es WhatsApp).
2. El calendario muestra franjas y al tocar una el botón verde abre el chat con el payload `cal_…` (y, por WhatsApp, día y hora escritos).
3. Los formularios de HubSpot cargan en /escuelas/ y /empresas/; sin red, el nativo no envía sin la casilla de autorización y lleva a /gracias/ con el resumen.
4. En móvil (360-390 px) no hay scroll horizontal, el titular cabe en ≤ 4 líneas con la CTA en el primer pantallazo y el menú se abre y cierra.
5. PageSpeed Insights de la URL publicada (objetivo móvil ≥ 85).

Nota para capturas con Chrome headless en Windows: `--window-size=390,844` se queda en 500 px de ancho
(mínimo de ventana; `innerWidth` = 500). Para ver el layout real de 390 px, carga la página dentro de un
`<iframe width="390">` o usa la emulación móvil de DevTools / Lighthouse.
