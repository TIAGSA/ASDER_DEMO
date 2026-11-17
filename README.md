# ASDER Colombia — propuesta de rediseño web (demo estática, pieza B1)

**En línea:** https://tiagsa.github.io/ASDER_DEMO/ (GitHub Pages, repositorio `TIAGSA/ASDER_DEMO`, rama
`main`, publicada el 17-nov-2026).

Sitio estático (HTML + CSS + JS, sin frameworks ni build). **Ejercicio académico de la Universidad
Central** (prueba de suficiencia, Análisis Estratégico Digital); no es comunicación oficial de ASDER
Colombia. Todas las páginas llevan el aviso visible, la política de tratamiento de datos (Ley 1581 de
2012, Decreto 1377 de 2013) y formularios con consentimiento separado.

Qué demuestra: un ecosistema donde la web deja de ser informativa y pasa a **captar y calificar demanda**
para las tres líneas de ASDER (escuelas de voleibol para familias, torneos y pausas activas para
empresas, alquiler del coliseo): calendario de reserva tipo Lobb's → chat (Telegram en el ejercicio,
WhatsApp en producción) con el contexto de la franja → registro en HubSpot (CRM gratuito) → correo de
seguimiento automático.

Estado (17-nov-2026): v5 tras dos iteraciones de QA (criterios en `research/09-qa-web-loop.md`).
Lighthouse móvil en producción: home 76 / 100 / 100 / 100 y escuelas 73 / 100 / 100 / 100
(rendimiento / accesibilidad / buenas prácticas / SEO); en local el rendimiento da 80-85 con 100 en el
resto. Cero `<style>` ni `style=""`, HTML semántico, sin cifras sin fuente (los precios se retiraron
hasta que ASDER los confirme).

Reglas de código: CSS y JS en archivos aparte, HTML semántico, nada de supuestos visibles en la
interfaz, reseñas literales de Google Maps con enlace a la ficha, todo lo configurable en
`assets/js/config.js`.

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
SUPUESTOS.md                  (solo en la copia local, no en el repo) Cada valor no confirmado por ASDER, con justificación y dato real que lo reemplaza
```

## Publicación y actualización (GitHub Pages)

Ya está publicada: repositorio `TIAGSA/ASDER_DEMO`, rama `main`, carpeta raíz, Pages activado. Para
actualizar, sube los cambios a `main` (`git push`) y GitHub Pages redespliega en 1-2 minutos. `SITE_URL`
en `assets/js/config.js`, `canonical`, Open Graph, `sitemap.xml`, `robots.txt` y el JSON-LD ya apuntan a
`https://tiagsa.github.io/ASDER_DEMO/`; `404.html` usa rutas absolutas `/ASDER_DEMO/` porque GitHub lo
sirve desde cualquier profundidad. Si el sitio se mueve a otro dominio, buscar y reemplazar esa URL.
`SUPUESTOS.md` es un archivo interno de trabajo y no se sube al repositorio.

**Importante para HubSpot:** el dominio donde vive la página debe estar registrado en *Configuración →
Informes y seguimiento → Dominios de sitio adicionales* (ya está `tiagsa.github.io`). Si no, la
protección antispam de HubSpot bloquea los envíos del formulario como "Unregistered Site Domain": la
página muestra "Formulario enviado" pero no se crea el contacto ni corre la automatización. Los envíos
bloqueados se ven y se liberan en *Formularios → formulario → Spam*; al liberarlos sí se crea el contacto,
pero el workflow no se dispara retroactivamente (hay que volver a enviar el formulario).

Para Vercel: *Add New → Project → Import* la carpeta; no necesita build (framework "Other").

## Canal de chat: Telegram (ejercicio) o WhatsApp (producción)

Todo se decide en `assets/js/config.js`:

- `CHAT_CHANNEL_PRIMARY`: `"telegram"` durante el ejercicio, `"whatsapp"` en producción.
- `TELEGRAM_BOT_USERNAME`: username del bot sin `@`: `ASDER_DEMO_bot` (creado el 17-nov-2026; deep link `https://t.me/ASDER_DEMO_bot?start=<payload>`). Si queda vacío y el canal es Telegram, todos los enlaces caen a WhatsApp.
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

Portal `52324192`, región `na1`. Escuelas (B1): formId `6f132906-3ff1-4e18-b149-af533e4eff94`; Empresas:
`c11057d5-f84c-4f4d-93d8-6c9561b1c662` (ambos en `assets/js/config.js`). `main.js` carga el embed
oficial bajo demanda (cuando la sección del formulario se acerca a la pantalla) —
`<script src="https://js.hsforms.net/forms/embed/52324192.js" defer>` +
`<div class="hs-form-frame" data-region="na1" data-form-id="…" data-portal-id="52324192">` — y oculta el
formulario nativo. Si el script falla o no dibuja nada en 15 segundos, vuelve el formulario nativo, que
valida, guarda el envío en `localStorage` (`asder_leads`) y redirige a `/gracias/` con el resumen y el botón
al chat. Si un formId queda vacío, el nativo se muestra y debajo aparece el contenedor `.hs-form-frame`
con un atajo "Escríbenos por Telegram/WhatsApp" (`b2b_torneo` / `b2c_escuelas`).

Configurado en HubSpot Free (17-nov-2026): formularios B1 y Empresas publicados con consentimiento
separado (almacenar datos obligatorio; comunicaciones opcional); textos de consentimiento con Ley
1581/1377; propiedades de contacto *Línea de negocio, Interés, Canal de ingreso, Estado del lead ASDER,
Franja solicitada*; lista activa "L1 Familias vacacional" y lista estática para la pieza B2; **workflow
simple activo en B1** que envía el correo "Recibimos tu solicitud en ASDER" tras cada envío (remitente
"ASDER Colombia (ejercicio académico)", pie de página legal con la dirección del coliseo). Detalle y
bitácora en `evidencias/hubspot-b1-b2/configuracion-crm-2026-11-17.md`.

En la página, el calendario es la acción principal ("Reserva en un minuto": solo servicio, día y hora) y
el formulario se presenta como alternativa personalizada ("¿Prefieres que nos ajustemos a tu agenda?").
La interfaz nunca menciona CRM ni HubSpot.

Evidencia para la rúbrica: captura del contacto creado en HubSpot + el correo automático recibido + la
URL con UTM usada en la prueba (HubSpot captura `utm_*` de la URL en el contexto del envío).

## Valores por confirmar

La interfaz no muestra asteriscos ni avisos de "demo". Los precios y la hora de cierre se retiraron el
17-nov-2026 por no tener fuente; horarios de clases, fechas del vacacional y la agenda del calendario
(etiquetada "Agenda de muestra") son oferta de ejemplo documentada en `SUPUESTOS.md` (archivo interno,
no publicado) y se reemplazan cuando ASDER los confirme. Las tres reseñas del home son literales de
Google Maps (ficha "Coliseo Asder", 4,5 ★ / 129, 17-nov-2026).

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
5. PageSpeed Insights de la URL publicada. Medido el 17-nov-2026 (Lighthouse 12, móvil): home 76 y escuelas 73 en rendimiento, 100 en accesibilidad, buenas prácticas y SEO; en local 80-85. La diferencia es red/CDN (GSAP y Google Fonts externos); la mejora pendiente es autoalojarlos.

Nota para capturas con Chrome headless en Windows: `--window-size=390,844` se queda en 500 px de ancho
(mínimo de ventana; `innerWidth` = 500). Para ver el layout real de 390 px, carga la página dentro de un
`<iframe width="390">` o usa la emulación móvil de DevTools / Lighthouse.
