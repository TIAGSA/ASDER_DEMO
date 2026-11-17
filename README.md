# ASDER Colombia · demo de ecosistema digital (ejercicio académico)

> **Ejercicio académico de la Universidad Central** (prueba de suficiencia, Análisis Estratégico
> Digital, noviembre de 2026). No es comunicación oficial de ASDER Colombia ni tiene relación
> comercial con la empresa. Los datos personales que se capturan son de prueba y se tratan según
> la Ley 1581 de 2012 (ver la política de datos del sitio).

| | |
|---|---|
| **Demo en línea** | https://tiagsa.github.io/ASDER_DEMO/ |
| **Landing priorizada (pieza B1)** | https://tiagsa.github.io/ASDER_DEMO/escuelas/ |
| **Bot de Telegram (pieza B4)** | https://t.me/ASDER_DEMO_bot |
| **Autor** | Santiago Agudelo (estudiante) |

## De qué se trata

[ASDER Colombia](https://asder.co/) es una empresa bogotana de deportes y eventos con un **coliseo
cubierto propio** (barrio San Felipe). Vende a dos públicos muy distintos: **familias** que inscriben
a sus hijos en las escuelas de voleibol Kids y Young (y también adultos, bádminton, tenis de mesa) y
**empresas** que contratan torneos internos, pausas activas e integraciones. Su sitio actual es
informativo: habla a los dos públicos a la vez, no tiene formulario conectado a un CRM ni política de
datos, y toda la conversión ocurre a mano por WhatsApp sin registro.

La pregunta que guía el trabajo:

> ¿Cómo lograr que familias y empresas de Bogotá reserven, se inscriban o coticen en el coliseo de
> ASDER, con cada lead calificado y registrado en un CRM, apoyándose en su coliseo cubierto propio y
> en sus 4,5 ★ en Google?

Este repositorio contiene **la demo con la que se responde esa pregunta**: un sitio rediseñado que
separa las dos rutas de compra y conecta cada intención con un canal de conversación y un CRM.

## Lo que encontró el diagnóstico (resumen)

- **La demanda local es pequeña y se gana en el mapa, no en volumen.** En el Planificador de
  palabras clave de Google (Colombia y Bogotá, consulta del 17-nov-2026) casi todas las búsquedas
  relevantes están en el rango de 10 a 100 al mes por palabra; "alquiler de coliseo" y "bádminton"
  en 0 a 10. El activo real es la ficha de Google: **4,5 ★ con 129 reseñas** (17-nov-2026).
- **El sitio actual no captura.** Ninguna llamada a la acción lleva a un formulario; no hay CRM ni
  seguimiento; no hay aviso de privacidad.
- **Los competidores directos tampoco pautan**, pero los sustitutos (cajas de compensación y
  centros deportivos con reserva en línea) sí tienen reserva, precios y prueba social visibles.

El detalle con fuentes y fechas está en el documento estratégico de la prueba (no en este repo).

## La estrategia en una línea

**Separar las dos rutas (familias / empresas), usar el coliseo y las reseñas como argumento, y
convertir cada visita en una conversación con contexto que termina registrada en el CRM.**

Cómo funciona el ecosistema que la demo implementa:

```
Visita (Google, Instagram, QR en el coliseo)
   │
   ▼
Sitio con dos rutas claras  ──►  Calendario de reserva ("Reserva en un minuto")
   │                                   │  elige servicio, día y hora
   │  ¿prefiere que lo llamen?         ▼
   ▼                             Chat con contexto (Telegram en la demo, WhatsApp en producción)
Formulario HubSpot                     │  el bot confirma la franja y pide la autorización de datos
   │                                   ▼
   ▼                             Asesor humano califica y cierra
Contacto en el CRM ──► correo automático de seguimiento ──► lista segmentada ──► boletín
```

Decisiones que vale la pena notar al recorrer la demo:

- **El calendario es la acción principal, el formulario es la alternativa.** Reservar una clase
  de prueba toma tres toques; quien prefiere agenda propia deja sus datos.
- **El chat recibe el contexto.** El enlace al bot lleva el servicio, el día y la hora elegidos
  (`cal_<servicio>_<fecha>_<hora>`), así el asesor no vuelve a preguntar.
- **Consentimiento separado.** Guardar los datos (obligatorio) y recibir comunicaciones
  (opcional) son dos casillas distintas, como exige la Ley 1581 de 2012.
- **Nada sin fuente.** Las tres reseñas del home son literales de Google Maps con enlace a la
  ficha. Los precios se retiraron porque ASDER no los publica; la agenda del calendario está
  etiquetada como "agenda de muestra".
- **Móvil primero.** La mayoría de la búsqueda local ocurre en el celular; el sitio se diseñó a
  390 px y se midió con Lighthouse en producción.

## Recorrido sugerido (5 minutos)

1. Abre el [home](https://tiagsa.github.io/ASDER_DEMO/) y elige una de las tres rutas: Escuelas,
   Empresas o Coliseo.
2. En [Escuelas](https://tiagsa.github.io/ASDER_DEMO/escuelas/), toca una clase en el calendario
   y luego el botón verde: se abre Telegram con el bot y el contexto de la franja.
3. Vuelve y usa el formulario "¿Prefieres que nos ajustemos a tu agenda?": el registro llega a
   HubSpot y dispara el correo automático "Recibimos tu solicitud en ASDER".
4. En [Empresas](https://tiagsa.github.io/ASDER_DEMO/empresas/), agenda una visita o una llamada
   de cotización.
5. El botón flotante "Escríbenos" (en todas las páginas) lleva al bot con la opción elegida.

## Las piezas de la prueba

| Pieza | Qué es | Dónde |
|---|---|---|
| B1 Landing + CRM | `/escuelas/` con propuesta de valor, prueba social, calendario, formulario HubSpot y política de datos | Este sitio + HubSpot Free |
| B2 Email | Correo automático de seguimiento tras el registro y boletín a una lista de prueba con consentimiento | HubSpot Free |
| B3 Pauta en buscadores | Campaña de búsqueda armada en borrador (nunca publicada) con palabras clave del Planificador | Documento de la prueba |
| B4 Electiva: bot | Bot de Telegram construido en n8n: menú por línea de negocio, reserva con contexto, paso a asesor | https://t.me/ASDER_DEMO_bot |

## Resultados medidos (Lighthouse móvil en producción, 17-nov-2026)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Home | 76 | 100 | 100 | 100 |
| Escuelas (B1) | 73 | 100 | 100 | 100 |

El rendimiento en local da 80 a 85; la diferencia es la carga de GSAP y Google Fonts desde CDN.

## Cómo está construido

Sitio estático (HTML, CSS y JavaScript sin frameworks ni proceso de build), publicado en GitHub
Pages desde la rama `main`. Todo lo configurable (canal de chat, bot, número de WhatsApp,
formularios de HubSpot, hoja de disponibilidad, analítica) vive en `assets/js/config.js`. El
calendario lee `data/disponibilidad.json` (o una hoja de Google publicada como CSV). Los formularios
de HubSpot se cargan bajo demanda y tienen un respaldo nativo si el script no responde.

El detalle técnico (estructura de carpetas, contrato de payloads del bot, formularios, calendario,
animaciones, SEO, imágenes y lista de pruebas) está en [docs/NOTAS-TECNICAS.md](docs/NOTAS-TECNICAS.md).

## Qué no es

- No es el sitio oficial de ASDER ni una propuesta contratada; es el trabajo de un estudiante
  para una prueba académica.
- Los horarios, cupos y fechas del calendario son de muestra. Las reseñas y la información del
  coliseo son públicas y están citadas.
- El bot de Telegram es la versión de demostración; la ruta de producción documentada es
  WhatsApp Cloud API con el mismo flujo.

---

Universidad Central · Análisis Estratégico Digital · prueba de suficiencia · noviembre de 2026.
