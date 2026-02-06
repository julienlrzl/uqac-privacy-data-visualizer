/* Pixel Tracker - Front-only demo
   - Valeurs réelles uniquement (ou #NA)
   - Bouton + par ligne (usage normal + intérêt potentiel attaquant)
   - Filtres + tri
*/

(function () {
  const NA = "#NA";
  const $ = (sel) => document.querySelector(sel);

  const els = {
    pixelImg: $("#pixelImg"),
    pixelStatus: $("#pixelStatus"),
    pixelVisual: $("#pixelVisual"),
    pixelSizeLabel: $("#pixelSizeLabel"),
    pixelUrlLabel: $("#pixelUrlLabel"),

    btnSmaller: $("#btnPixelSmaller"),
    btnBigger: $("#btnPixelBigger"),
    btnFire: $("#btnFirePixel"),
    btnClearLogs: $("#btnClearLogs"),

    eventsConsole: $("#eventsConsole"),

    netUrl: $("#netUrl"),
    netReferrer: $("#netReferrer"),
    netUA: $("#netUA"),
    netLang: $("#netLang"),
    netTZ: $("#netTZ"),

    tStart: $("#tStart"),
    tDuration: $("#tDuration"),
    tProto: $("#tProto"),
    tTransfer: $("#tTransfer"),
    tInitiator: $("#tInitiator"),
    btnRefreshPerf: $("#btnRefreshPerf"),

    fieldSearch: $("#fieldSearch"),
    fieldCategory: $("#fieldCategory"),
    fieldSensitivity: $("#fieldSensitivity"),
    fieldSort: $("#fieldSort"),

    fieldsTbody: $("#fieldsTbody"),
    fieldsCount: $("#fieldsCount"),
    btnExportJson: $("#btnExportJson"),
    btnExportCsv: $("#btnExportCsv"),

    btnExpandAll: $("#btnExpandAll"),
    btnCollapseAll: $("#btnCollapseAll"),
  };

  const SIZES = [16, 32, 64, 96, 128];
  let sizeIdx = 0;
  let lastPixelUrl = null;

  const PIXEL_DATA_URL =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  function tsClock() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function valOrNA(v) {
    if (v === undefined || v === null) return NA;
    if (typeof v === "string" && v.trim() === "") return NA;
    if (typeof v === "number" && Number.isNaN(v)) return NA;
    return v;
  }

  function asText(v) {
    v = valOrNA(v);
    if (v === NA) return NA;
    if (Array.isArray(v)) return v.length ? v.join(", ") : NA;
    if (typeof v === "object") {
      try { return JSON.stringify(v); } catch { return NA; }
    }
    return String(v);
  }

  function logEvent(eventName, message) {
    const first = els.eventsConsole.querySelector(".console-line");
    if (first && first.textContent.includes("INIT - En attente")) {
      els.eventsConsole.removeChild(first);
    }

    const line = document.createElement("div");
    line.className = "console-line";

    const ts = document.createElement("span");
    ts.className = "timestamp";
    ts.textContent = `[${tsClock()}]`;

    const ev = document.createElement("span");
    ev.className = "event";
    ev.textContent = eventName;

    line.appendChild(ts);
    line.appendChild(document.createTextNode(" "));
    line.appendChild(ev);
    line.appendChild(document.createTextNode(" - "));
    line.appendChild(document.createTextNode(message));

    els.eventsConsole.appendChild(line);
    els.eventsConsole.scrollTop = els.eventsConsole.scrollHeight;
  }

  function getConnection() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return null;
    return {
      effectiveType: c.effectiveType ?? null,
      rtt: typeof c.rtt === "number" ? c.rtt : null,
      downlink: typeof c.downlink === "number" ? c.downlink : null,
      saveData: typeof c.saveData === "boolean" ? c.saveData : null,
    };
  }

  function getNavEntry() {
    const nav = performance.getEntriesByType("navigation");
    return nav && nav.length ? nav[0] : null;
  }

  function cookieNames() {
    try {
      const raw = document.cookie || "";
      if (!raw.trim()) return [];
      return raw.split(";").map((p) => p.split("=")[0].trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  function storageKeysSafe(store) {
    try { return Object.keys(store); } catch { return []; }
  }

  function urlParam(name) {
    try { return new URLSearchParams(location.search).get(name); } catch { return null; }
  }

  // Behavior (front)
  const behaviorState = {
    startTs: Date.now(),
    clickCount: 0,
    lastClickTarget: null,
    scrollEvents: 0,
    scrollMaxPercent: 0,
  };

  function getScrollPercent() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const scrollHeight = doc.scrollHeight || 0;
    const clientHeight = doc.clientHeight || 1;
    const maxScrollable = Math.max(1, scrollHeight - clientHeight);
    return Math.round((scrollTop / maxScrollable) * 100);
  }

  function snapshotBehavior() {
    const now = Date.now();
    return {
      time_on_page_ms: now - behaviorState.startTs,
      scroll_events_count: behaviorState.scrollEvents,
      scroll_max_percent: behaviorState.scrollMaxPercent,
      click_count: behaviorState.clickCount,
      last_click_target: behaviorState.lastClickTarget,
    };
  }

  // Table helpers
  function categoryLabel(c) {
    const map = {
      page: "Page & nav",
      client: "Navigateur",
      device: "Écran/device",
      network: "Réseau",
      perf: "Performance",
      behavior: "Comportement",
      storage: "Stockage",
      marketing: "Marketing/UTM",
    };
    return map[c] || c;
  }

  function catBadgeClass(c) {
    return `badge badge-secondary badge-cat badge-cat-${c}`;
  }

  function sensBadgeClass(s) {
    if (s === "Élevé") return "badge badge-sens-high";
    if (s === "Moyen") return "badge badge-sens-med";
    return "badge badge-sens-low";
  }

  function sensitivityRank(s) {
    if (s === "Élevé") return 3;
    if (s === "Moyen") return 2;
    return 1;
  }

  const FIELD_DEFS = [
    { category:"page", field:"page_url", source:"location", sensitivity:"Moyen",
      get:()=>location.href,
      whyNormal:"Identifier précisément la page vue (analytics, attribution, debugging).",
      whyAttack:"Confirmer le contexte exact et corréler un parcours d’actions."
    },
    { category:"page", field:"referrer", source:"document", sensitivity:"Moyen",
      get:()=>document.referrer,
      whyNormal:"Mesurer l’origine de la visite (page précédente, campagne, moteur).",
      whyAttack:"Reconstruire une partie du chemin et déduire certains usages."
    },
    { category:"page", field:"title", source:"document", sensitivity:"Faible",
      get:()=>document.title,
      whyNormal:"Libellé lisible pour reporting.",
      whyAttack:"Indice rapide du contenu consulté (corrélation contextuelle)."
    },
    { category:"page", field:"visibility_state", source:"document", sensitivity:"Faible",
      get:()=>document.visibilityState,
      whyNormal:"Mesurer si l’onglet est actif (engagement).",
      whyAttack:"Aider au timing (déclencher quand l’utilisateur est actif)."
    },

    { category:"client", field:"user_agent", source:"navigator", sensitivity:"Moyen",
      get:()=>navigator.userAgent,
      whyNormal:"Compatibilité, statistiques navigateur/appareil.",
      whyAttack:"Fingerprinting léger et ciblage d’arnaques adaptées."
    },
    { category:"client", field:"language", source:"navigator", sensitivity:"Faible",
      get:()=>navigator.language,
      whyNormal:"Localiser l’interface.",
      whyAttack:"Personnaliser des messages frauduleux (langue/locale)."
    },
    { category:"client", field:"timezone", source:"Intl", sensitivity:"Faible",
      get:()=>{ try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return null; } },
      whyNormal:"Afficher des heures locales / segmentation régionale.",
      whyAttack:"Indice de localisation approximative et fenêtre horaire."
    },
    { category:"client", field:"do_not_track", source:"navigator", sensitivity:"Faible",
      get:()=>navigator.doNotTrack,
      whyNormal:"Signal de préférence de non-suivi.",
      whyAttack:"Segmenter des profils (valeur limitée seule)."
    },

    { category:"device", field:"screen_w", source:"screen", sensitivity:"Faible",
      get:()=>screen.width,
      whyNormal:"Responsive/statistiques tailles d’écran.",
      whyAttack:"Composante de fingerprinting et adaptation d’UI trompeuse."
    },
    { category:"device", field:"screen_h", source:"screen", sensitivity:"Faible",
      get:()=>screen.height,
      whyNormal:"Responsive/statistiques tailles d’écran.",
      whyAttack:"Composante de fingerprinting et adaptation d’UI trompeuse."
    },
    { category:"device", field:"viewport_w", source:"window", sensitivity:"Faible",
      get:()=>window.innerWidth,
      whyNormal:"Layout basé sur viewport réel.",
      whyAttack:"Optimiser overlays/popups trompeurs."
    },
    { category:"device", field:"viewport_h", source:"window", sensitivity:"Faible",
      get:()=>window.innerHeight,
      whyNormal:"Layout basé sur viewport réel.",
      whyAttack:"Optimiser overlays/popups trompeurs."
    },
    { category:"device", field:"pixel_ratio", source:"window", sensitivity:"Faible",
      get:()=>window.devicePixelRatio,
      whyNormal:"Qualité d’affichage.",
      whyAttack:"Signal additionnel de fingerprinting (faible seul)."
    },

    { category:"network", field:"connection_effective_type", source:"navigator.connection", sensitivity:"Faible",
      get:()=>getConnection()?.effectiveType,
      whyNormal:"Adapter qualité média au réseau.",
      whyAttack:"Estimer conditions réseau (timing/poids)."
    },
    { category:"network", field:"connection_rtt_ms", source:"navigator.connection", sensitivity:"Faible",
      get:()=>getConnection()?.rtt,
      whyNormal:"Mesure latence / QoS.",
      whyAttack:"Profiling faible (utile combiné à d’autres)."
    },

    { category:"perf", field:"ttfb_ms", source:"Performance API", sensitivity:"Moyen",
      get:()=>{ const n=getNavEntry(); return (n?.responseStart!=null && n?.requestStart!=null) ? (n.responseStart-n.requestStart) : null; },
      whyNormal:"Mesurer performance perçue.",
      whyAttack:"Faible intérêt seul ; parfois utile si combiné."
    },

    { category:"behavior", field:"time_on_page_ms", source:"JS", sensitivity:"Moyen",
      get:()=>snapshotBehavior().time_on_page_ms,
      whyNormal:"Mesurer engagement.",
      whyAttack:"Déclencher une action au ‘bon moment’."
    },
    { category:"behavior", field:"scroll_max_percent", source:"JS", sensitivity:"Moyen",
      get:()=>snapshotBehavior().scroll_max_percent,
      whyNormal:"Comprendre profondeur de lecture.",
      whyAttack:"Activer/placer du contenu trompeur au bon moment."
    },
    { category:"behavior", field:"click_count", source:"JS", sensitivity:"Moyen",
      get:()=>snapshotBehavior().click_count,
      whyNormal:"Mesurer interactions.",
      whyAttack:"Adapter le timing selon activité."
    },
    { category:"behavior", field:"last_click_target", source:"JS", sensitivity:"Moyen",
      get:()=>snapshotBehavior().last_click_target,
      whyNormal:"Debug UX (où l’utilisateur clique).",
      whyAttack:"Indice d’intérêt/actions (corrélation de parcours)."
    },

    { category:"storage", field:"localstorage_keys", source:"localStorage", sensitivity:"Moyen",
      get:()=>storageKeysSafe(localStorage),
      whyNormal:"Debug/diagnostic (clés applicatives présentes).",
      whyAttack:"Peut indiquer outils/apps utilisés (via noms de clés connus)."
    },
    { category:"storage", field:"sessionstorage_keys", source:"sessionStorage", sensitivity:"Faible",
      get:()=>storageKeysSafe(sessionStorage),
      whyNormal:"Debug/diagnostic (état session).",
      whyAttack:"Signal de contexte (moins persistant)."
    },
    { category:"storage", field:"cookies_present", source:"document.cookie", sensitivity:"Moyen",
      get:()=>cookieNames(),
      whyNormal:"Voir si des cookies existent (sans lire les valeurs ici).",
      whyAttack:"Noms peuvent révéler services/états ; danger si valeurs accessibles."
    },

    { category:"marketing", field:"utm_source", source:"URLSearchParams", sensitivity:"Faible",
      get:()=>urlParam("utm_source"),
      whyNormal:"Attribution marketing.",
      whyAttack:"Contextualiser un message (ingénierie sociale)."
    },
    { category:"marketing", field:"utm_medium", source:"URLSearchParams", sensitivity:"Faible",
      get:()=>urlParam("utm_medium"),
      whyNormal:"Attribution marketing.",
      whyAttack:"Adapter au canal (email, social…)."
    },
    { category:"marketing", field:"utm_campaign", source:"URLSearchParams", sensitivity:"Faible",
      get:()=>urlParam("utm_campaign"),
      whyNormal:"Attribution marketing.",
      whyAttack:"Contextualiser un message (social engineering)."
    },
  ];

  function renderFieldsTable() {
    const q = (els.fieldSearch?.value || "").trim().toLowerCase();
    const cat = els.fieldCategory?.value || "all";
    const sens = els.fieldSensitivity?.value || "all";
    const sort = els.fieldSort?.value || "none";

    let rows = FIELD_DEFS.map((d, idx) => {
      let v = null;
      try { v = d.get(); } catch { v = null; }
      return {
        idx,
        category: d.category,
        field: d.field,
        valueText: asText(v),
        source: d.source,
        sensitivity: d.sensitivity,
        whyNormal: d.whyNormal || NA,
        whyAttack: d.whyAttack || NA,
      };
    });

    rows = rows.filter((r) => {
      if (cat !== "all" && r.category !== cat) return false;
      if (sens !== "all" && r.sensitivity !== sens) return false;
      if (!q) return true;
      return (
        r.field.toLowerCase().includes(q) ||
        categoryLabel(r.category).toLowerCase().includes(q) ||
        r.valueText.toLowerCase().includes(q) ||
        String(r.source).toLowerCase().includes(q)
      );
    });

    const cmp = (a, b) => a.localeCompare(b);
    rows.sort((a, b) => {
      if (sort === "sens_asc") return sensitivityRank(a.sensitivity) - sensitivityRank(b.sensitivity);
      if (sort === "sens_desc") return sensitivityRank(b.sensitivity) - sensitivityRank(a.sensitivity);
      if (sort === "cat_asc") return cmp(categoryLabel(a.category), categoryLabel(b.category));
      if (sort === "cat_desc") return cmp(categoryLabel(b.category), categoryLabel(a.category));
      if (sort === "field_asc") return cmp(a.field, b.field);
      if (sort === "field_desc") return cmp(b.field, a.field);
      return 0;
    });

    els.fieldsTbody.innerHTML = "";

    if (!rows.length) {
      const tr0 = document.createElement("tr");
      tr0.innerHTML = `<td colspan="6" class="table-empty">Aucun résultat</td>`;
      els.fieldsTbody.appendChild(tr0);
      els.fieldsCount.textContent = "0 champ affiché";
      return;
    }

    for (const r of rows) {
      const tr = document.createElement("tr");
      tr.setAttribute("data-row", String(r.idx));

      tr.innerHTML = `
        <td>
          <button class="detail-btn" type="button" aria-expanded="false" aria-label="Ouvrir détails" data-toggle="${r.idx}">+</button>
        </td>
        <td><span class="${catBadgeClass(r.category)}">${escapeHtml(categoryLabel(r.category))}</span></td>
        <td><code>${escapeHtml(r.field)}</code></td>
        <td><code>${escapeHtml(r.valueText)}</code></td>
        <td>${escapeHtml(r.source)}</td>
        <td><span class="${sensBadgeClass(r.sensitivity)}">${escapeHtml(r.sensitivity)}</span></td>
      `;

      const trd = document.createElement("tr");
      trd.className = "detail-row";
      trd.setAttribute("data-detail", String(r.idx));
      trd.innerHTML = `
        <td class="detail-cell" colspan="6">
          <div class="detail-grid">
            <div class="detail-box">
              <div class="detail-title">Usage normal</div>
              <div class="detail-text">${escapeHtml(r.whyNormal)}</div>
            </div>
            <div class="detail-box">
              <div class="detail-title">Intérêt potentiel attaquant</div>
              <div class="detail-text">${escapeHtml(r.whyAttack)}</div>
            </div>
          </div>
        </td>
      `;

      els.fieldsTbody.appendChild(tr);
      els.fieldsTbody.appendChild(trd);
    }

    els.fieldsCount.textContent = `${rows.length} champ(s) affiché(s) / ${FIELD_DEFS.length} total`;
  }

  function setDetailOpen(idx, open) {
    const btn = els.fieldsTbody.querySelector(`button[data-toggle="${idx}"]`);
    const row = els.fieldsTbody.querySelector(`tr[data-detail="${idx}"]`);
    if (!btn || !row) return;

    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "−" : "+";
    row.classList.toggle("open", !!open);
  }

  function openAllDetails(open) {
    for (let i = 0; i < FIELD_DEFS.length; i++) setDetailOpen(i, open);
  }

  function downloadText(filename, text, mime) {
    const blob = new Blob([text], { type: mime || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    const rows = FIELD_DEFS.map((d) => {
      let v = null;
      try { v = d.get(); } catch { v = null; }
      return {
        category: categoryLabel(d.category),
        field: d.field,
        value: asText(v),
        source: d.source,
        sensitivity: d.sensitivity,
        why_normal: d.whyNormal || NA,
        why_attacker: d.whyAttack || NA,
      };
    });
    downloadText("pixel-tracker-data.json", JSON.stringify(rows, null, 2), "application/json");
  }

  function csvEscape(v) {
    const s = String(v ?? "");
    const NL = String.fromCharCode(10);
    const needs = s.includes(",") || s.includes('"') || s.includes(NL);
    const out = s.replaceAll('"', '""');
    return needs ? `"${out}"` : out;
  }

  function exportCsv() {
    const header = ["category","field","value","source","sensitivity","why_normal","why_attacker"];
    const NL = String.fromCharCode(10);
    const lines = [header.join(",")];

    for (const d of FIELD_DEFS) {
      let v = null;
      try { v = d.get(); } catch { v = null; }
      const row = [
        categoryLabel(d.category),
        d.field,
        asText(v),
        d.source,
        d.sensitivity,
        d.whyNormal || NA,
        d.whyAttack || NA
      ].map(csvEscape);
      lines.push(row.join(","));
    }

    downloadText("pixel-tracker-data.csv", lines.join(NL), "text/csv");
  }

  function buildPixelUrl() {
    const base = new URL("../assets/images/pixel.gif", location.href);
    const p = new URLSearchParams();
    p.set("ts", String(Date.now()));
    p.set("page", location.href);
    p.set("ref", document.referrer || "");
    p.set("cb", `${Math.random().toString(16).slice(2)}${Date.now()}`);
    base.search = p.toString();
    return base.toString();
  }

  function refreshPerfTimings() {
    if (!lastPixelUrl) return;

    const entries = performance.getEntriesByType("resource");
    let match = null;

    try {
      const u = new URL(lastPixelUrl);
      const path = u.pathname;
      for (let i = entries.length - 1; i >= 0; i--) {
        if (typeof entries[i].name === "string" && entries[i].name.includes(path)) {
          match = entries[i];
          break;
        }
      }
    } catch {
      match = null;
    }

    els.tStart.textContent = match ? match.startTime.toFixed(2) : NA;
    els.tDuration.textContent = match ? match.duration.toFixed(2) : NA;
    els.tProto.textContent = match?.nextHopProtocol || NA;
    els.tTransfer.textContent = typeof match?.transferSize === "number" ? `${match.transferSize} bytes` : NA;
    els.tInitiator.textContent = match?.initiatorType || NA;
  }

  function setSizeIdx(i) {
    sizeIdx = Math.max(0, Math.min(SIZES.length - 1, i));
    const px = SIZES[sizeIdx];
    els.pixelVisual.dataset.size = String(px);
    els.pixelSizeLabel.textContent = `${px}px`;
  }

  function firePixel() {
    lastPixelUrl = buildPixelUrl();

    els.pixelUrlLabel.textContent = lastPixelUrl;
    els.netUrl.textContent = lastPixelUrl;
    els.netReferrer.textContent = document.referrer || NA;
    els.netUA.textContent = navigator.userAgent || NA;
    els.netLang.textContent = navigator.language || NA;
    try { els.netTZ.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || NA; }
    catch { els.netTZ.textContent = NA; }

    els.pixelStatus.textContent = "chargement…";

    const imgNet = new Image();

    imgNet.onload = () => {
      els.pixelStatus.textContent = "chargé";
      logEvent("PIXEL_LOADED", "Pixel chargé.");
      refreshPerfTimings();
      renderFieldsTable();
    };

    imgNet.onerror = () => {
      els.pixelStatus.textContent = "erreur";
      logEvent("PIXEL_ERROR", "Erreur de chargement du pixel.");
      refreshPerfTimings();
      renderFieldsTable();
    };

    logEvent("PIXEL_REQUEST_SENT", "Requête pixel déclenchée.");
    imgNet.src = lastPixelUrl;

    // pixel visible (toujours)
    els.pixelImg.src = PIXEL_DATA_URL;
  }

  function bind() {
    els.pixelImg.src = PIXEL_DATA_URL;
    els.pixelStatus.textContent = "inactif";
    setSizeIdx(0);

    document.addEventListener("click", (e) => {
      behaviorState.clickCount += 1;
      const t = e.target;
      const id = t && t.id ? `#${t.id}` : "";
      const cls =
        t && typeof t.className === "string" && t.className.trim()
          ? `.${t.className.trim().split(" ")[0]}`
          : "";
      const name = t && t.tagName ? t.tagName.toLowerCase() : "node";
      behaviorState.lastClickTarget = id || cls || name;
    }, true);

    window.addEventListener("scroll", () => {
      behaviorState.scrollEvents += 1;
      const p = getScrollPercent();
      if (p > behaviorState.scrollMaxPercent) behaviorState.scrollMaxPercent = p;
    }, { passive: true });

    els.btnSmaller.addEventListener("click", () => setSizeIdx(sizeIdx - 1));
    els.btnBigger.addEventListener("click", () => setSizeIdx(sizeIdx + 1));

    els.btnFire.addEventListener("click", () => {
      firePixel();
      renderFieldsTable();
    });

    els.btnClearLogs.addEventListener("click", () => {
      const header = els.eventsConsole.querySelector(".console-header");
      els.eventsConsole.innerHTML = "";
      els.eventsConsole.appendChild(header);
      logEvent("INIT", "Journal effacé.");
    });

    els.btnRefreshPerf.addEventListener("click", () => {
      refreshPerfTimings();
      renderFieldsTable();
    });

    els.fieldSearch?.addEventListener("input", renderFieldsTable);
    els.fieldCategory?.addEventListener("change", renderFieldsTable);
    els.fieldSensitivity?.addEventListener("change", renderFieldsTable);
    els.fieldSort?.addEventListener("change", renderFieldsTable);

    els.btnExportJson?.addEventListener("click", exportJson);
    els.btnExportCsv?.addEventListener("click", exportCsv);

    els.fieldsTbody.addEventListener("click", (e) => {
      const btn = e.target.closest?.("button[data-toggle]");
      if (!btn) return;
      const idx = btn.getAttribute("data-toggle");
      const open = btn.getAttribute("aria-expanded") === "true";
      setDetailOpen(idx, !open);
    });

    els.btnExpandAll?.addEventListener("click", () => openAllDetails(true));
    els.btnCollapseAll?.addEventListener("click", () => openAllDetails(false));

    // init preview
    els.netUA.textContent = navigator.userAgent || NA;
    els.netLang.textContent = navigator.language || NA;
    els.netReferrer.textContent = document.referrer || NA;
    try { els.netTZ.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || NA; }
    catch { els.netTZ.textContent = NA; }

    renderFieldsTable();
    logEvent("INIT", "Pixel Tracker prêt. Clique sur 'Charger le pixel'.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
