/* ASDER demo v4 — nav flotante, chat por canal (Telegram/WhatsApp) con payload, widget de chat, UTM, retícula de reservas, formularios (HubSpot embed + fallback), GSAP, analítica. */
(function () {
  "use strict";
  var cfg = window.ASDER_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Analítica (solo si hay GA4_ID) ---------- */
  function track(name, params) { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); }
  if (cfg.GA4_ID) {
    var ga = document.createElement("script");
    ga.async = true; ga.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.GA4_ID);
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", cfg.GA4_ID);
  }

  /* ---------- UTM ---------- */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  function captureUtm() {
    var p = new URLSearchParams(location.search), found = false, data = {};
    UTM_KEYS.forEach(function (k) { if (p.get(k)) { data[k] = p.get(k); found = true; } });
    try { if (found) sessionStorage.setItem("asder_utm", JSON.stringify(data)); return JSON.parse(sessionStorage.getItem("asder_utm") || "{}"); }
    catch (e) { return data; }
  }
  var utm = captureUtm();
  function utmSuffix() {
    var parts = [];
    if (utm.utm_source) parts.push("Fuente: " + utm.utm_source);
    if (utm.utm_campaign) parts.push("Campaña: " + utm.utm_campaign);
    return parts.length ? " (" + parts.join(", ") + ")" : "";
  }

  /* ---------- Enlaces de chat por canal (contrato bot/widget-contrato.md) ---------- */
  var PAYLOAD_RE = /^[A-Za-z0-9_-]{1,64}$/;
  function channel() { return (cfg.CHAT_CHANNEL_PRIMARY === "telegram" && cfg.TELEGRAM_BOT_USERNAME) ? "telegram" : "whatsapp"; }
  function waUrl(text, payload) {
    var body = text + utmSuffix() + (payload ? "\nRef: " + payload : "");
    return "https://wa.me/" + cfg.WHATSAPP_NUMBER + "?text=" + encodeURIComponent(body);
  }
  function tgUrl(payload) {
    var base = "https://t.me/" + cfg.TELEGRAM_BOT_USERNAME;
    return payload && PAYLOAD_RE.test(payload) ? base + "?start=" + payload : base;
  }
  function buildChatLink(payload, humanText, forceChannel) {
    var ch = forceChannel || channel();
    return ch === "telegram" ? tgUrl(payload) : waUrl(humanText || "Hola, vengo de la web de ASDER.", payload);
  }
  function channelName(ch) { return (ch || channel()) === "telegram" ? "Telegram" : "WhatsApp"; }
  function openChat(payload, humanText, label) {
    var url = buildChatLink(payload, humanText);
    track("whatsapp_click", { label: label || payload, channel: channel(), payload: payload });
    var w = window.open(url, "_blank", "noopener");
    if (!w) location.href = url;
  }
  // <a data-chat="payload" data-text="mensaje humano">: enlace al canal principal con contexto
  $$("[data-chat]").forEach(function (a) {
    var payload = a.getAttribute("data-chat"), text = a.getAttribute("data-text") || "Hola, vengo de la web de ASDER y quiero información.";
    a.setAttribute("href", buildChatLink(payload, text)); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener");
    a.addEventListener("click", function () { track("whatsapp_click", { label: a.getAttribute("data-label") || payload, channel: channel(), payload: payload }); });
  });
  // <a data-chat-alt="payload" data-text="…">: enlace al otro canal ("También por WhatsApp")
  var other = channel() === "telegram" ? "whatsapp" : "telegram";
  $$("[data-chat-alt]").forEach(function (a) {
    var payload = a.getAttribute("data-chat-alt"), text = a.getAttribute("data-text") || "Hola, vengo de la web de ASDER y quiero información.";
    a.setAttribute("href", buildChatLink(payload, text, other)); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener");
    a.addEventListener("click", function () { track("whatsapp_click", { label: a.getAttribute("data-label") || payload, channel: other, payload: payload }); });
  });
  // <a data-wa="texto">: siempre WhatsApp (enlace alterno)
  $$("[data-wa]").forEach(function (a) {
    var text = a.getAttribute("data-wa");
    a.setAttribute("href", waUrl(text, a.getAttribute("data-payload") || "")); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener");
    a.addEventListener("click", function () { track("whatsapp_click", { label: a.getAttribute("data-label") || text.slice(0, 60), channel: "whatsapp" }); });
  });
  // Nombre del canal en los textos ("te confirmamos por Telegram")
  $$("[data-channel-name]").forEach(function (el) { el.textContent = channelName(); });
  $$("[data-channel-alt-name]").forEach(function (el) { el.textContent = channelName(other); });

  /* ---------- Widget de chat (todas las páginas) ---------- */
  function mountChatWidget() {
    if ($(".chat") || !document.body) return;
    var root = location.pathname.replace(/[^\/]*$/, ""), isSub = /\/(escuelas|empresas|coliseo|contacto|politica-de-datos|gracias)\/$/.test(root);
    var policy = (isSub ? "../" : "") + "politica-de-datos/";
    var ch = channel();
    var wrap = document.createElement("div"); wrap.className = "chat";
    wrap.innerHTML =
      '<button type="button" class="chat__btn" aria-expanded="false" aria-controls="chat-panel" aria-label="Escríbenos: abrir chat">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>Escríbenos</button>' +
      '<div id="chat-panel" class="chat__panel" role="dialog" aria-modal="true" aria-labelledby="chat-title" hidden>' +
        '<div class="chat__head"><h2 id="chat-title">¿En qué te ayudamos?</h2><button type="button" class="chat__close" aria-label="Cerrar chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
        '<ul class="chat__options">' +
          '<li><a class="chat__opt" data-chat="b2c_escuelas" data-text="Hola, vengo de la web de ASDER y quiero información de las escuelas de voleibol." data-label="widget-escuelas"><b>Escuelas de voleibol</b><small>Kids, Young y adultos</small></a></li>' +
          '<li><a class="chat__opt" data-chat="b2b_general" data-text="Hola, vengo de la web de ASDER y quiero información para mi empresa." data-label="widget-empresas"><b>Empresas</b><small>Torneos, pausas activas e integraciones</small></a></li>' +
          '<li><a class="chat__opt" data-chat="coliseo_alquiler" data-text="Hola, vengo de la web de ASDER y quiero información del alquiler del coliseo." data-label="widget-coliseo"><b>Alquiler del coliseo</b><small>Eventos y entrenamientos</small></a></li>' +
          '<li><a class="chat__opt" data-chat="asesor" data-text="Hola, vengo de la web de ASDER y quiero hablar con un asesor." data-label="widget-asesor"><b>Hablar con un asesor</b></a></li>' +
        '</ul>' +
        '<p class="chat__note">Te llevamos a ' + channelName(ch) + ' para continuar la conversación.</p>' +
        '<div class="chat__legal"><p>Ejercicio académico de la Universidad Central. No es un canal oficial de ASDER Colombia.</p><p>No pedimos datos en esta ventana; si dejas tus datos en el chat, te pedimos tu autorización antes. <a href="' + policy + '">Política de tratamiento de datos</a></p></div>' +
      '</div>';
    document.body.appendChild(wrap);
    var btn = $(".chat__btn", wrap), panel = $("#chat-panel", wrap), close = $(".chat__close", wrap), lastFocus = null;
    $$("[data-chat]", wrap).forEach(function (a) {
      var payload = a.getAttribute("data-chat"), text = a.getAttribute("data-text");
      a.setAttribute("href", buildChatLink(payload, text)); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener");
      a.addEventListener("click", function () { track("whatsapp_click", { label: a.getAttribute("data-label"), channel: ch, payload: payload }); });
    });
    function focusables() { return $$("a[href], button, [tabindex]:not([tabindex='-1'])", panel); }
    function open() { lastFocus = document.activeElement; panel.hidden = false; panel.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); (focusables()[0] || panel).focus(); track("chat_open", { channel: ch }); }
    function shut() { panel.classList.remove("is-open"); panel.hidden = true; btn.setAttribute("aria-expanded", "false"); if (lastFocus && lastFocus.focus) lastFocus.focus(); else btn.focus(); }
    btn.addEventListener("click", function () { panel.hidden ? open() : shut(); });
    close.addEventListener("click", shut);
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); shut(); return; }
      if (e.key !== "Tab") return;
      var f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener("click", function (e) { if (!panel.hidden && !wrap.contains(e.target)) shut(); });
  }
  mountChatWidget();

  /* ---------- Nav: menú móvil + compactar al hacer scroll ---------- */
  var nav = $(".nav-float"), toggle = $(".nav-toggle"), mobile = $(".nav-mobile");
  if (toggle && mobile) {
    var navShut = function () { mobile.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", function () {
      var open = mobile.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { var first = $("a", mobile); if (first) first.focus(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobile.classList.contains("is-open")) { navShut(); toggle.focus(); }
      if (e.key === "Tab" && mobile.classList.contains("is-open")) {
        var f = $$("a", mobile), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$("a", mobile).forEach(function (a) { a.addEventListener("click", navShut); });
  }
  if (nav) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { nav.classList.toggle("is-compact", window.scrollY > 40); ticking = false; });
    };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  var path = location.pathname.replace(/index\.html$/, "");
  $$(".nav-links a, .nav-mobile a").forEach(function (a) {
    var href = a.getAttribute("href"); if (!href || href.indexOf("#") === 0 || a.classList.contains("btn")) return;
    var target = new URL(href, location.href).pathname.replace(/index\.html$/, "");
    if (target === path) a.setAttribute("aria-current", "page");
  });

  /* ---------- Animaciones: progresivas (sin GSAP todo se ve) ---------- */
  function initMotion() {
    if (reduced || !window.gsap) return;
    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    // Solo se oculta lo que está por debajo del primer pantallazo; lo visible al cargar no se toca.
    var vh = window.innerHeight;
    function belowFold(el) { return el.getBoundingClientRect().top > vh * 0.9; }
    // La entrada del hero es una animación CSS (styles.css, clase .js): su estado depende del reloj, no de ticks, así que nunca deja texto a medias.
    if (!window.ScrollTrigger) return;
    // Reveal solo con transform (sin opacidad): si un capturador congela el tween, el contenido sigue visible.
    $$("[data-reveal]").filter(belowFold).forEach(function (el) {
      gsap.from(el, { y: 28, duration: .8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    $$("[data-reveal-group]").filter(belowFold).forEach(function (g) {
      gsap.from(Array.prototype.slice.call(g.children), { y: 28, duration: .7, ease: "power2.out", stagger: .08, scrollTrigger: { trigger: g, start: "top 88%", once: true } });
    });
    $$(".bleed__img, .hero__img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }
  if (document.readyState === "complete") initMotion(); else window.addEventListener("load", initMotion);
  // Llegada con #ancla: salto instantáneo al cargar (el scroll suave del html no debe dejar la página a medio camino)
  function jumpToHash() { if (!location.hash || location.hash.length < 2) return; var t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView({ behavior: "instant", block: "start" }); }
  window.addEventListener("load", jumpToHash);

  /* ---------- Fechas ---------- */
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var DIAS3 = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var MES3 = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  function parseISO(d) { var p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function toISO(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function fmtLong(d) { return DIAS[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()]; }
  function fmtHora(min) { var hh = Math.floor(min / 60), mm = min % 60, suf = hh >= 12 ? "p. m." : "a. m."; return (hh % 12 || 12) + ":" + String(mm).padStart(2, "0") + " " + suf; }
  function toMin(h) { var p = h.split(":"); return (+p[0]) * 60 + (+p[1] || 0); }
  function today() { var t = new Date(); t.setHours(0, 0, 0, 0); return t; }
  function isoDow(d) { return d.getDay() === 0 ? 7 : d.getDay(); }
  function addDays(d, n) { var c = new Date(d); c.setDate(c.getDate() + n); return c; }
  function calPayload(servicio, date, min) {
    var s = String(servicio).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    return "cal_" + s + "_" + toISO(date).replace(/-/g, "") + "_" + String(Math.floor(min / 60)).padStart(2, "0") + String(min % 60).padStart(2, "0");
  }

  /* ---------- Carga de disponibilidad (JSON local o CSV publicado) ---------- */
  function parseCsv(text) {
    var lines = text.trim().split(/\r?\n/), head = lines.shift().split(",").map(function (h) { return h.trim().toLowerCase(); });
    return lines.map(function (l) {
      var cells = [], cur = "", q = false;
      for (var i = 0; i < l.length; i++) { var c = l[i]; if (c === '"') q = !q; else if (c === "," && !q) { cells.push(cur); cur = ""; } else cur += c; }
      cells.push(cur);
      var o = {}; head.forEach(function (h, i) { o[h] = (cells[i] || "").trim(); });
      if (o.semanal) o.semanal = String(o.semanal).split(/[;| ]+/).filter(Boolean).map(Number);
      if (o.duracion) o.duracion = +o.duracion;
      if (o.privado) o.privado = /^(1|true|si|sí)$/i.test(o.privado);
      return o;
    });
  }
  var ESPACIOS_DEF = [
    { id: "cancha-1", nombre: "Cancha 1" }, { id: "cancha-2", nombre: "Cancha 2" }, { id: "badminton", nombre: "Bádminton" },
    { id: "tenis-de-mesa", nombre: "Tenis de mesa" }, { id: "simuladores", nombre: "Simuladores" },
    { id: "visita-coliseo", nombre: "Visita al coliseo" }, { id: "llamada-cotizacion", nombre: "Llamada de cotización" }
  ];
  var dataCache = null;
  function loadData(src) {
    if (dataCache) return dataCache;
    var url = cfg.SHEET_CSV_URL || src;
    dataCache = fetch(url, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (t) {
        if (cfg.SHEET_CSV_URL) return { espacios: ESPACIOS_DEF, bloques: parseCsv(t) };
        var j = JSON.parse(t); return { espacios: j.espacios || ESPACIOS_DEF, bloques: j.bloques || [] };
      });
    return dataCache;
  }
  function keepAlive(bloques) {
    var t = today(), dated = bloques.filter(function (b) { return b.fecha; }), max = null;
    dated.forEach(function (b) { var d = parseISO(b.fecha); if (!max || d > max) max = d; });
    if (!max || max >= t) return bloques;
    var weeks = Math.ceil((t - max) / (7 * 864e5));
    return bloques.map(function (b) {
      if (!b.fecha) return b;
      var d = parseISO(b.fecha); d.setDate(d.getDate() + weeks * 7);
      var c = Object.assign({}, b); c.fecha = toISO(d); return c;
    });
  }
  function blocksFor(bloques, date) {
    var iso = toISO(date), dow = isoDow(date);
    return bloques.filter(function (b) { return b.fecha ? b.fecha === iso : (Array.isArray(b.semanal) && b.semanal.indexOf(dow) !== -1); });
  }

  /* ---------- Widget de calendario ---------- */
  var SVG_LOCK = '<svg class="cal__lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  var SVG_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  var STEP = 30, ROW_H = 50, HEAD_H = 44; // filas de 50 px → celdas de 44 px (objetivo táctil)

  function renderCalendar(el) {
    var mode = el.getAttribute("data-mode") || "espacios";
    var spacesAttr = (el.getAttribute("data-spaces") || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var servicesAttr = (el.getAttribute("data-services") || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var src = el.getAttribute("data-src") || "data/disponibilidad.json";
    var hours = (el.getAttribute("data-hours") || "8-22").split("-").map(Number);
    var days = +(el.getAttribute("data-days") || 14);
    var selected = null, active = 0;

    el.innerHTML = '<p class="cal__empty">Cargando disponibilidad…</p>';
    loadData(src).then(function (data) {
      var bloques = keepAlive(data.bloques);
      var espacios = spacesAttr.length ? spacesAttr.map(function (id) { return data.espacios.filter(function (e) { return e.id === id; })[0] || { id: id, nombre: id }; }) : data.espacios.slice(0, 5);
      var t = today(), now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
      var tabsData = [];
      if (mode === "clases") {
        var monday = addDays(t, 1 - isoDow(t)), nWeeks = Math.max(2, Math.ceil(days / 7));
        for (var w = 0; w < nWeeks; w++) {
          var start = addDays(monday, w * 7), end = addDays(start, 6);
          tabsData.push({ start: start, label: w === 0 ? "Esta semana" : (w === 1 ? "Próxima semana" : start.getDate() + " " + MES3[start.getMonth()] + " – " + end.getDate() + " " + MES3[end.getMonth()]), aria: "del " + fmtLong(start) });
        }
      } else {
        for (var i = 0; i < days; i++) { var d = addDays(t, i); tabsData.push({ date: d, label: i === 0 ? "Hoy" : DIAS3[d.getDay()] + " " + d.getDate(), aria: fmtLong(d) }); }
      }

      el.innerHTML = "";
      var head = document.createElement("div"); head.className = "cal__head";
      var tabs = document.createElement("div"); tabs.className = "cal__tabs"; tabs.setAttribute("role", "tablist");
      tabsData.forEach(function (td, i) {
        var b = document.createElement("button"); b.type = "button"; b.className = "cal__tab" + (i === 0 ? " is-active" : ""); b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", i === 0 ? "true" : "false"); b.textContent = td.label;
        // El nombre accesible empieza por el texto visible; el contexto va en texto oculto (sin aria-label)
        var sr = document.createElement("span"); sr.className = "sr-only"; sr.textContent = ", " + td.aria; b.appendChild(sr);
        b.addEventListener("click", function () { active = i; selected = null; $$(".cal__tab", tabs).forEach(function (x, j) { x.classList.toggle("is-active", j === i); x.setAttribute("aria-selected", j === i ? "true" : "false"); }); draw(); });
        tabs.appendChild(b);
      });
      var arrow = document.createElement("button"); arrow.type = "button"; arrow.className = "cal__arrow"; arrow.setAttribute("aria-label", "Ver más"); arrow.innerHTML = SVG_ARROW;
      arrow.addEventListener("click", function () { tabs.scrollBy({ left: 240, behavior: reduced ? "auto" : "smooth" }); });
      head.appendChild(tabs); head.appendChild(arrow); el.appendChild(head);
      var body = document.createElement("div"); body.className = "cal__body"; el.appendChild(body);
      var fab = document.createElement("button"); fab.type = "button"; fab.className = "btn btn--green cal__fab"; fab.disabled = true; el.appendChild(fab);
      fab.addEventListener("click", function () {
        if (!selected) return;
        var hora = fmtHora(selected.min);
        var msg = "Hola, quiero reservar " + selected.titulo + " el " + fmtLong(selected.date) + " a las " + hora + (/\.$/.test(hora) ? " " : ". ") + "Vengo de la web.";
        var payload = calPayload(selected.servicio, selected.date, selected.min);
        track("reserva_click", { espacio: selected.espacio, servicio: selected.servicio, fecha: toISO(selected.date), modo: mode, channel: channel(), payload: payload });
        var url = buildChatLink(payload, msg);
        var w = window.open(url, "_blank", "noopener"); if (!w) location.href = url;
      });
      function select(cell, info) {
        $$(".is-selected", body).forEach(function (c) { c.classList.remove("is-selected"); });
        cell.classList.add("is-selected"); selected = info;
        fab.disabled = false; fab.textContent = "Reservar · " + info.titulo + " · " + DIAS3[info.date.getDay()] + " " + info.date.getDate() + " · " + fmtHora(info.min);
      }
      function selectable(cell, info, extra) {
        cell.setAttribute("role", "button"); cell.tabIndex = 0;
        var sr = document.createElement("span"); sr.className = "sr-only"; sr.textContent = ", " + extra; cell.appendChild(sr);
        cell.addEventListener("click", function () { select(cell, info); });
        cell.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); select(cell, info); } });
      }
      function classCell(blk, m, span, date, past, open) {
        var cell = document.createElement("div");
        cell.className = "cal__cell cal__cell--class" + (open ? " is-open" : "") + (past ? " cal__cell--past" : "");
        cell.innerHTML = '<span>' + blk.titulo + '</span><small>' + fmtHora(m) + ' – ' + fmtHora(m + span * STEP) + '</small><span class="chip ' + (blk.cupos === "cerrados" ? "chip--blue" : "chip--green") + '">' + (blk.cupos === "cerrados" ? "Cupos cerrados" : (past ? "Ya pasó" : "Cupos disponibles")) + '</span>';
        if (open) selectable(cell, { titulo: blk.titulo, espacio: blk.espacio, servicio: blk.servicio || blk.espacio, date: date, min: m }, fmtLong(date) + ", reservar");
        return cell;
      }
      function busyCell(blk, m, span, past) {
        var cell = document.createElement("div");
        cell.className = "cal__cell cal__cell--busy" + (past ? " cal__cell--past" : "");
        cell.innerHTML = '<span>' + (blk.privado ? "Privado" + SVG_LOCK : "Reservado") + '</span>' + (blk.nombre && !blk.privado ? '<small>' + blk.nombre + '</small>' : '<small>' + fmtHora(m) + ' – ' + fmtHora(m + span * STEP) + '</small>');
        return cell;
      }
      function freeCell(e, m, date, past) {
        var cell = document.createElement("div");
        if (past) { cell.className = "cal__cell cal__cell--past"; cell.textContent = fmtHora(m); return cell; }
        cell.className = "cal__cell cal__cell--free"; cell.textContent = "+ " + fmtHora(m);
        selectable(cell, { titulo: e.nombre, espacio: e.id, servicio: e.id, date: date, min: m }, e.nombre + ", " + fmtLong(date) + ", reservar");
        return cell;
      }
      function buildGrid(cols, startMin, endMin, showNow) {
        var rows = Math.max(1, (endMin - startMin) / STEP);
        var grid = document.createElement("div"); grid.className = "cal__grid";
        grid.style.gridTemplateColumns = "56px repeat(" + cols.length + ", minmax(140px, 1fr))";
        grid.style.gridTemplateRows = HEAD_H + "px repeat(" + rows + ", " + ROW_H + "px)";
        var corner = document.createElement("div"); corner.className = "cal__corner"; grid.appendChild(corner);
        cols.forEach(function (c) { var h = document.createElement("div"); h.className = "cal__colhead"; h.innerHTML = c.head; grid.appendChild(h); });
        for (var r = 0; r < rows; r++) {
          var m = startMin + r * STEP, hc = document.createElement("div");
          hc.className = "cal__hour" + (m % 60 ? " is-half" : ""); hc.style.gridRow = String(r + 2); hc.style.gridColumn = "1";
          hc.textContent = m % 60 ? "·" : fmtHora(m).replace(":00", ""); grid.appendChild(hc);
        }
        cols.forEach(function (c, ci) {
          var col = ci + 2, r = 0;
          while (r < rows) {
            var m = startMin + r * STEP;
            var blk = c.blocks.filter(function (b) { return toMin(b.hora) === m; })[0];
            var cell;
            if (blk) {
              var span = Math.max(1, Math.min(rows - r, Math.round((blk.duracion || STEP) / STEP)));
              var past = c.date < t || (toISO(c.date) === toISO(t) && (m + span * STEP) <= nowMin);
              if (blk.tipo === "clase") cell = classCell(blk, m, span, c.date, past, blk.cupos !== "cerrados" && !past && mode === "clases");
              else cell = busyCell(blk, m, span, past);
              cell.style.gridColumn = String(col); cell.style.gridRow = (r + 2) + " / span " + span;
              grid.appendChild(cell); r += span;
            } else {
              if (mode === "clases") { cell = document.createElement("div"); cell.className = "cal__cell cal__cell--off"; }
              else cell = freeCell(c.space, m, c.date, toISO(c.date) === toISO(t) && m < nowMin);
              cell.style.gridColumn = String(col); cell.style.gridRow = String(r + 2);
              grid.appendChild(cell); r += 1;
            }
          }
        });
        if (showNow && nowMin >= startMin && nowMin <= endMin) {
          var line = document.createElement("div"); line.className = "cal__now"; line.setAttribute("data-time", fmtHora(nowMin));
          line.style.top = (HEAD_H + (nowMin - startMin) / STEP * ROW_H) + "px"; grid.appendChild(line);
        }
        return grid;
      }
      function draw() {
        var td = tabsData[active], cols, startMin = hours[0] * 60, endMin = hours[1] * 60, showNow = false, mins = [];
        if (mode === "clases") {
          cols = [];
          for (var i = 0; i < 7; i++) {
            var d = addDays(td.start, i);
            var blocks = blocksFor(bloques, d).filter(function (b) { return b.tipo === "clase" && (!servicesAttr.length || servicesAttr.indexOf(b.servicio) !== -1); });
            cols.push({ head: DIAS3[d.getDay()] + " <br><b>" + d.getDate() + "</b>", date: d, blocks: blocks });
          }
          var maxs = [];
          cols.forEach(function (c) { c.blocks.forEach(function (b) { var s = toMin(b.hora); mins.push(s); maxs.push(s + (b.duracion || STEP)); }); });
          if (mins.length) {
            startMin = Math.max(hours[0] * 60, Math.min.apply(null, mins) - 60);
            endMin = Math.min(hours[1] * 60, Math.max.apply(null, maxs) + 60);
            startMin -= startMin % STEP; endMin += (STEP - endMin % STEP) % STEP;
          }
        } else {
          var date = td.date, dayBlocks = blocksFor(bloques, date);
          cols = espacios.map(function (e) { return { head: e.nombre, date: date, space: e, blocks: dayBlocks.filter(function (b) { return b.espacio === e.id; }) }; });
          showNow = toISO(date) === toISO(t);
        }
        body.innerHTML = ""; body.appendChild(buildGrid(cols, startMin, endMin, showNow));
        fab.disabled = true; fab.textContent = mode === "clases" ? "Elige una clase para reservar" : "Elige una franja para reservar";
        var first = $(".cal__cell--class.is-open, .cal__cell--free", body);
        if (mode !== "clases" && showNow && nowMin > startMin) body.scrollTop = Math.max(0, (nowMin - startMin) / STEP * ROW_H - 60);
        else if (first) body.scrollTop = Math.max(0, first.offsetTop - 70);
        if (mode === "clases" && !mins.length) body.innerHTML = '<p class="cal__empty">No hay clases programadas esta semana. Mira la siguiente o escríbenos.</p>';
      }
      draw();
    }).catch(function () {
      el.innerHTML = '<p class="cal__empty">No pudimos cargar la disponibilidad. Escríbenos y buscamos una franja.</p>';
    });
  }
  $$("[data-calendar]").forEach(renderCalendar);

  /* ---------- Formularios: HubSpot (embed oficial) + respaldo ---------- */
  function hsFormId(type) { return type === "empresas" ? cfg.HUBSPOT_FORM_ID_EMPRESAS : cfg.HUBSPOT_FORM_ID_ESCUELAS; }
  function mountHubspot(form, type) {
    if (!cfg.HUBSPOT_PORTAL_ID) return;
    var fid = hsFormId(type) || "";
    var frame = document.createElement("div"); frame.className = "hs-form-frame";
    frame.setAttribute("data-region", cfg.HUBSPOT_REGION || "na1"); frame.setAttribute("data-form-id", fid); frame.setAttribute("data-portal-id", cfg.HUBSPOT_PORTAL_ID);
    var wrap = document.createElement("div"); wrap.className = "hs-wrap";
    if (!fid) {
      // Formulario aún no publicado: el nativo sigue visible; el contenedor queda listo y hay un atajo visible al chat
      wrap.classList.add("hs-wrap--pending"); wrap.appendChild(frame);
      var fb = document.createElement("div"); fb.className = "hs-fallback";
      var payload = type === "empresas" ? "b2b_torneo" : "b2c_escuelas";
      var human = type === "empresas" ? "Hola, vengo de la web de ASDER y quiero cotizar un torneo o evento para mi empresa." : "Hola, vengo de la web de ASDER y quiero información de las escuelas.";
      var lead = document.createElement("p"); lead.textContent = "¿Prefieres hablar directo?";
      var a = document.createElement("a"); a.className = "btn btn--outline"; a.textContent = "Escríbenos por " + channelName();
      a.setAttribute("href", buildChatLink(payload, human)); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener");
      a.addEventListener("click", function () { track("whatsapp_click", { label: "fallback:" + type, channel: channel(), payload: payload }); });
      var alt = document.createElement("a"); alt.className = "small"; alt.textContent = "También por " + channelName(other);
      alt.setAttribute("href", buildChatLink(payload, human, other)); alt.setAttribute("target", "_blank"); alt.setAttribute("rel", "noopener");
      fb.appendChild(lead); fb.appendChild(a); fb.appendChild(alt); wrap.appendChild(fb);
      form.parentNode.insertBefore(wrap, form.nextSibling);
      return;
    }
    var title = form.querySelector("h2"), sub = form.querySelector("p");
    if (title) { var h = document.createElement("h2"); h.textContent = title.textContent; wrap.appendChild(h); }
    if (sub) { var p = document.createElement("p"); p.className = "small"; p.textContent = sub.textContent; wrap.appendChild(p); }
    wrap.appendChild(frame);
    form.parentNode.insertBefore(wrap, form);
    form.hidden = true;
    var fallback = function () { if (!form.hidden) return; wrap.remove(); form.hidden = false; track("hubspot_fallback", { tipo: type }); };
    var loaded = false;
    var loadEmbed = function () {
      if (loaded) return; loaded = true;
      var s = document.createElement("script"); s.src = "https://js.hsforms.net/forms/embed/" + cfg.HUBSPOT_PORTAL_ID + ".js"; s.defer = true;
      s.onerror = fallback;
      document.head.appendChild(s);
      // Si a los 15 s el embed no ha dibujado nada (ni contenido ni altura), vuelve el formulario nativo.
      setTimeout(function () { if (!frame.querySelector("iframe, form") || frame.getBoundingClientRect().height < 80) fallback(); }, 15000);
    };
    // El script de HubSpot se carga bajo demanda, cuando la sección del formulario se acerca a la pantalla.
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) { if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); loadEmbed(); } }, { rootMargin: "600px 0px" });
      io.observe(wrap);
    } else loadEmbed();
  }
  function validate(form) {
    var ok = true;
    $$(".field, .check", form).forEach(function (f) { f.classList.remove("is-invalid"); });
    $$("[required]", form).forEach(function (inp) {
      var empty = inp.type === "checkbox" ? !inp.checked : !String(inp.value).trim();
      var bad = empty || (inp.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value)) || (inp.type === "tel" && inp.value.replace(/\D/g, "").length < 10);
      if (bad) { ok = false; (inp.closest(".field") || inp.closest(".check")).classList.add("is-invalid"); }
    });
    if (!ok) { var first = $(".is-invalid input, .is-invalid select", form); if (first) first.focus(); }
    return ok;
  }
  $$("form[data-form]").forEach(function (form) {
    var type = form.getAttribute("data-form");
    UTM_KEYS.concat(["pagina_origen"]).forEach(function (k) {
      var inp = form.querySelector('[name="' + k + '"]');
      if (!inp) { inp = document.createElement("input"); inp.type = "hidden"; inp.name = k; form.appendChild(inp); }
      inp.value = k === "pagina_origen" ? location.pathname : (utm[k] || "");
    });
    mountHubspot(form, type);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.tipo = type; data.fecha_envio = new Date().toISOString();
      try {
        var leads = JSON.parse(localStorage.getItem("asder_leads") || "[]"); leads.push(data);
        localStorage.setItem("asder_leads", JSON.stringify(leads));
        sessionStorage.setItem("asder_last_lead", JSON.stringify(data));
      } catch (err) { }
      track("generate_lead", { tipo: type, via: "demo" });
      location.href = form.getAttribute("data-gracias") || "../gracias/?tipo=" + type;
    });
  });

  /* ---------- Página de gracias ---------- */
  var g = $("[data-gracias-summary]");
  if (g) {
    var lead = null; try { lead = JSON.parse(sessionStorage.getItem("asder_last_lead") || "null"); } catch (e) { }
    var tipo = new URLSearchParams(location.search).get("tipo") || (lead && lead.tipo) || "escuelas";
    var labels = { nombre: "Nombre", acudiente: "Acudiente", empresa: "Empresa", cargo: "Cargo", telefono: "Teléfono", correo: "Correo", escuela: "Escuela", edad: "Edad", horario: "Horario preferido", actividad: "Actividad", personas: "Personas", fecha_tentativa: "Fecha tentativa" };
    if (lead) {
      var dl = "";
      Object.keys(labels).forEach(function (k) { if (lead[k]) dl += "<dt>" + labels[k] + "</dt><dd>" + String(lead[k]).replace(/</g, "&lt;") + "</dd>"; });
      g.innerHTML = dl ? '<div class="summary"><dl>' + dl + "</dl></div>" : "";
    }
    var btn = $("[data-gracias-wa]");
    if (btn) {
      var payload = tipo === "empresas" ? "b2b_general" : "b2c_escuelas";
      var msg = tipo === "empresas"
        ? "Hola, acabo de enviar una solicitud de cotización desde la web" + (lead && lead.empresa ? " para " + lead.empresa : "") + (lead && lead.actividad ? " (" + lead.actividad + ")" : "") + ". ¿Cuándo podemos hablar?"
        : "Hola, acabo de inscribirme desde la web" + (lead && lead.escuela ? " en " + lead.escuela : "") + (lead && lead.edad ? " (edad: " + lead.edad + ")" : "") + ". Quiero agendar la clase de prueba.";
      btn.setAttribute("href", buildChatLink(payload, msg)); btn.setAttribute("target", "_blank"); btn.setAttribute("rel", "noopener");
      btn.addEventListener("click", function () { track("whatsapp_click", { label: "gracias:" + tipo, channel: channel(), payload: payload }); });
      var altBtn = $("[data-gracias-alt]");
      if (altBtn) { altBtn.setAttribute("href", buildChatLink(payload, msg, other)); altBtn.setAttribute("target", "_blank"); altBtn.setAttribute("rel", "noopener"); }
    }
  }

  /* ---------- Newsletter del pie (demo: localStorage) ---------- */
  $$("form[data-newsletter]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var email = form.querySelector('input[type="email"]').value;
      try { var l = JSON.parse(localStorage.getItem("asder_newsletter") || "[]"); l.push({ email: email, fecha: new Date().toISOString() }); localStorage.setItem("asder_newsletter", JSON.stringify(l)); } catch (err) { }
      track("newsletter_signup", {});
      var st = form.querySelector(".form__status"); if (st) st.textContent = "Listo. Te escribimos cuando abran cupos.";
      form.reset();
    });
  });
})();
