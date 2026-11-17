// Configuración única de la demo. Cambia aquí, nunca en el HTML.
document.documentElement.classList.add("js"); // sin JS nada se oculta; con JS, las animaciones definen su estado inicial
window.ASDER_CONFIG = {
  // URL pública del sitio (GitHub Pages / dominio). También hay que reemplazarla en canonical, OG, sitemap y JSON-LD (ver README).
  SITE_URL: "https://tiagsa.github.io/ASDER_DEMO/",

  // Canal conversacional de la demo: "telegram" (ejercicio) | "whatsapp" (producción).
  CHAT_CHANNEL_PRIMARY: "telegram",
  // Username del bot sin @ (el que cree Santiago en BotFather). Vacío = el widget usa WhatsApp.
  TELEGRAM_BOT_USERNAME: "ASDER_DEMO_bot",
  // Número de pruebas; reemplazar por el oficial de ASDER (313 219 5733 → "573132195733") en producción.
  WHATSAPP_NUMBER: "573125122873",

  // HubSpot: portal y formularios (embed oficial). Un formId vacío deja el contenedor listo + atajo visible al chat.
  HUBSPOT_PORTAL_ID: "52324192",
  HUBSPOT_REGION: "na1",
  HUBSPOT_FORM_ID_ESCUELAS: "6f132906-3ff1-4e18-b149-af533e4eff94",
  HUBSPOT_FORM_ID_EMPRESAS: "c11057d5-f84c-4f4d-93d8-6c9561b1c662",

  // Disponibilidad: URL de un CSV publicado de Google Sheets. Vacío = usa data/disponibilidad.json.
  SHEET_CSV_URL: "",

  // GA4 (ej. "G-XXXXXXXXXX"). Vacío = no se carga analítica.
  GA4_ID: "",

  // Compromiso de respuesta (el horario comercial real lo confirma ASDER; no se muestra ninguna hora inventada).
  HORARIO_ATENCION: "el mismo día hábil",
  BRAND: "ASDER Colombia"
};
