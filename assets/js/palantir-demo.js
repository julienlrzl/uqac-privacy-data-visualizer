'use strict';
/**
 * palantir-demo.js
 * Cas d'usage "Data Broker" — simulation pédagogique inspirée des cookies observables sur palantir.com.
 *
 * IMPORTANT (contraintes du cours) :
 * - aucune donnée n'est envoyée vers un serveur externe
 * - tout est stocké et observable localement (cookies + localStorage + logs)
 */

/* ─────────────────────────────────────────────────────────────────────────
   Définitions de cookies (inspirées des cookies observables sur palantir.com)
   Les TTL ci-dessous sont une SIMULATION (jours). Certaines valeurs sont indicatives.
   Source de la liste / durées: voir README / page (références web).
   ───────────────────────────────────────────────────────────────────────── */

var PALANTIR_COOKIE_DEFINITIONS = {
  // Consentement OneTrust (souvent présent sur des sites B2B)
  OptanonAlertBoxClosed: { category: 'necessary', ttlDays: 365, purpose: "Mémorise que la bannière cookies a été fermée (OneTrust)." },
  OptanonConsent:        { category: 'necessary', ttlDays: 365, purpose: "Stocke l'état du consentement (catégories acceptées/refusées) (OneTrust)." },

  // Analytics (Google Analytics + HubSpot)
  _ga:      { category: 'analytics', ttlDays: 729, purpose: "Identifiant Google Analytics (visiteur unique) — mesure d'audience." },
  _gid:     { category: 'analytics', ttlDays: 1,   purpose: "Identifiant Google Analytics (court terme) — mesure d'audience." },
  _gat:     { category: 'analytics', ttlDays: 1/24, purpose: "Limitation du taux de requêtes Google Analytics (≈ 1h)." },

  __hstc:      { category: 'analytics', ttlDays: 179, purpose: "Cookie HubSpot — suivi visiteurs/analytics (timestamp + sessions)." },
  __hssrc:     { category: 'analytics', ttlDays: null, purpose: "Cookie HubSpot — détecte si la session a changé." },
  __hssc:      { category: 'analytics', ttlDays: 1/48, purpose: "Cookie HubSpot — suivi de session (≈ 30 min)." },
  hubspotutk:  { category: 'analytics', ttlDays: 179, purpose: "Identifiant HubSpot — associe formulaires et visites." },

  // Marketing / ciblage (exemples fréquents sur les sites B2B)
  _fbp:     { category: 'marketing', ttlDays: 89,  purpose: "Meta/Facebook — identifiant marketing/retargeting." },
  fr:       { category: 'marketing', ttlDays: 89,  purpose: "Meta/Facebook — diffusion/ciblage publicitaire." },

  IDE:      { category: 'marketing', ttlDays: 389, purpose: "DoubleClick/Google Ads — mesure de conversions + retargeting." },

  _uetsid:  { category: 'marketing', ttlDays: 1,   purpose: "Microsoft Ads — identifiant de session (≈ 24h)." },
  _uetvid:  { category: 'marketing', ttlDays: 389, purpose: "Microsoft Ads — identifiant visiteur persistant." },
  MUID:     { category: 'marketing', ttlDays: 389, purpose: "Microsoft — identifiant visiteur (ciblage/analytics publicitaire)." },

  _gcl_au:  { category: 'marketing', ttlDays: 89,  purpose: "Google Ads — expérimentation d'efficacité publicitaire." },

  li_sugr:  { category: 'marketing', ttlDays: 89,  purpose: "LinkedIn — probabilistic matching / ads." },

  muc_ads:  { category: 'marketing', ttlDays: 729, purpose: "X (Twitter) — ciblage publicitaire." },
  guest_id: { category: 'marketing', ttlDays: 729, purpose: "X (Twitter) — identifiant invité." },

  _ttp:              { category: 'marketing', ttlDays: 389, purpose: "TikTok — mesure de conversions + retargeting." },
  _tt_enable_cookie: { category: 'marketing', ttlDays: 389, purpose: "TikTok — mémorise le consentement/activation du tracking." }
};

var PALANTIR_CATEGORY_LABELS = {
  necessary: 'Nécessaire',
  analytics: 'Statistiques',
  marketing: 'Marketing',
  unknown:   'Inconnu'
};

function _safeJsonParse(str) {
  try { return JSON.parse(str); } catch (e) { return null; }
}

function getConsentState() {
  // On réutilise la même clé que la page "cookies.html" si elle existe.
  var raw = localStorage.getItem('consent_state');
  var parsed = raw ? _safeJsonParse(raw) : null;

  // Valeur par défaut (aucun tracking optionnel)
  if (!parsed || typeof parsed !== 'object') {
    return { necessary: true, analytics: false, marketing: false };
  }
  return {
    necessary: true,
    analytics: !!parsed.analytics,
    marketing: !!parsed.marketing
  };
}

function setCookieIfMissing(name, value, ttlDays, category) {
  var existing = parseCookies();
  if (existing[name] !== undefined) return;

  setCookie(name, value, ttlDays);
  appendLog('COOKIE_SET', 'Cookie simulé (Palantir-like) créé', {
    name: name,
    category: category || 'unknown',
    ttlDays: ttlDays,
    valuePreview: (String(value).length > 40 ? String(value).slice(0, 40) + '…' : String(value))
  }, 'palantir_seed');
}

function seedPalantirCookies() {
  var consent = getConsentState();

  // Necessary (toujours)
  setCookieIfMissing('OptanonAlertBoxClosed', new Date().toISOString(), PALANTIR_COOKIE_DEFINITIONS.OptanonAlertBoxClosed.ttlDays, 'necessary');
  setCookieIfMissing('OptanonConsent',
    'isIABGlobal=false&datestamp=' + encodeURIComponent(new Date().toString()) + '&groups=C0001:1,C0002:' + (consent.analytics ? '1' : '0') + ',C0004:' + (consent.marketing ? '1' : '0'),
    PALANTIR_COOKIE_DEFINITIONS.OptanonConsent.ttlDays,
    'necessary'
  );

  if (consent.analytics) {
    setCookieIfMissing('_ga', 'GA1.1.' + Math.floor(Math.random()*1e10) + '.' + Math.floor(Date.now()/1000), PALANTIR_COOKIE_DEFINITIONS._ga.ttlDays, 'analytics');
    setCookieIfMissing('_gid', 'GA1.1.' + Math.floor(Math.random()*1e10) + '.' + Math.floor(Date.now()/1000), PALANTIR_COOKIE_DEFINITIONS._gid.ttlDays, 'analytics');
    setCookieIfMissing('_gat', '1', PALANTIR_COOKIE_DEFINITIONS._gat.ttlDays, 'analytics');

    setCookieIfMissing('__hstc', String(Math.floor(Math.random()*1e12)), PALANTIR_COOKIE_DEFINITIONS.__hstc.ttlDays, 'analytics');
    setCookieIfMissing('__hssrc', '1', PALANTIR_COOKIE_DEFINITIONS.__hssrc.ttlDays, 'analytics');
    setCookieIfMissing('__hssc', String(Math.floor(Math.random()*1e8)), PALANTIR_COOKIE_DEFINITIONS.__hssc.ttlDays, 'analytics');
    setCookieIfMissing('hubspotutk', generateId('hbutk'), PALANTIR_COOKIE_DEFINITIONS.hubspotutk.ttlDays, 'analytics');
  } else {
    // Si l'utilisateur n'a pas consenti aux analytics, on supprime ceux qu'on aurait posés
    ['_ga','_gid','_gat','__hstc','__hssrc','__hssc','hubspotutk'].forEach(deleteCookie);
  }

  if (consent.marketing) {
    setCookieIfMissing('_fbp', 'fb.1.' + Date.now() + '.' + Math.floor(Math.random()*1e12), PALANTIR_COOKIE_DEFINITIONS._fbp.ttlDays, 'marketing');
    setCookieIfMissing('fr', generateId('fr'), PALANTIR_COOKIE_DEFINITIONS.fr.ttlDays, 'marketing');

    setCookieIfMissing('IDE', generateId('IDE'), PALANTIR_COOKIE_DEFINITIONS.IDE.ttlDays, 'marketing');

    setCookieIfMissing('_uetsid', generateId('sid'), PALANTIR_COOKIE_DEFINITIONS._uetsid.ttlDays, 'marketing');
    setCookieIfMissing('_uetvid', generateId('vid'), PALANTIR_COOKIE_DEFINITIONS._uetvid.ttlDays, 'marketing');
    setCookieIfMissing('MUID', generateId('muid'), PALANTIR_COOKIE_DEFINITIONS.MUID.ttlDays, 'marketing');

    setCookieIfMissing('_gcl_au', generateId('gcl'), PALANTIR_COOKIE_DEFINITIONS._gcl_au.ttlDays, 'marketing');

    setCookieIfMissing('li_sugr', generateId('li'), PALANTIR_COOKIE_DEFINITIONS.li_sugr.ttlDays, 'marketing');

    setCookieIfMissing('muc_ads', generateId('muc'), PALANTIR_COOKIE_DEFINITIONS.muc_ads.ttlDays, 'marketing');
    setCookieIfMissing('guest_id', generateId('guest'), PALANTIR_COOKIE_DEFINITIONS.guest_id.ttlDays, 'marketing');

    setCookieIfMissing('_ttp', generateId('ttp'), PALANTIR_COOKIE_DEFINITIONS._ttp.ttlDays, 'marketing');
    setCookieIfMissing('_tt_enable_cookie', '1', PALANTIR_COOKIE_DEFINITIONS._tt_enable_cookie.ttlDays, 'marketing');
  } else {
    ['_fbp','fr','IDE','_uetsid','_uetvid','MUID','_gcl_au','li_sugr','muc_ads','guest_id','_ttp','_tt_enable_cookie'].forEach(deleteCookie);
  }
}

function listCookiesWithDefs(defs) {
  var raw  = parseCookies();
  var keys = Object.keys(raw).sort();
  return keys.map(function (name) {
    var def = defs[name];
    var value = raw[name];
    return {
      name: name,
      value: value,
      valuePreview: value.length > 45 ? value.substring(0, 45) + '…' : value,
      category: def ? def.category : 'unknown',
      ttlDays: def ? def.ttlDays  : '?',
      purpose: def ? def.purpose  : 'Cookie non référencé (autre page / navigateur)'
    };
  });
}

function fmtTtl(ttlDays) {
  if (ttlDays === null) return 'Session';
  if (ttlDays === '?') return '?';
  if (typeof ttlDays === 'number') {
    if (ttlDays < 1) {
      var hours = Math.round(ttlDays * 24);
      return hours + ' h';
    }
    return Math.round(ttlDays) + ' j';
  }
  return String(ttlDays);
}

function renderCookieTable() {
  var tbody = document.getElementById('cookie-table-body');
  if (!tbody) return;

  var cookies = listCookiesWithDefs(PALANTIR_COOKIE_DEFINITIONS);

  tbody.innerHTML = '';
  cookies.forEach(function (c) {
    var tr = document.createElement('tr');

    var tdName = document.createElement('td');
    tdName.textContent = c.name;

    var tdCat = document.createElement('td');
    tdCat.textContent = PALANTIR_CATEGORY_LABELS[c.category] || c.category;

    var tdTtl = document.createElement('td');
    tdTtl.textContent = fmtTtl(c.ttlDays);

    var tdVal = document.createElement('td');
    tdVal.textContent = c.valuePreview;

    var tdPurpose = document.createElement('td');
    tdPurpose.textContent = c.purpose;

    tr.appendChild(tdName);
    tr.appendChild(tdCat);
    tr.appendChild(tdTtl);
    tr.appendChild(tdVal);
    tr.appendChild(tdPurpose);

    tbody.appendChild(tr);
  });

  var countEl = document.getElementById('cookie-count');
  if (countEl) countEl.textContent = String(cookies.length);
}

function wireButtons() {
  var btnRefresh = document.getElementById('btn-refresh-cookies');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', function () {
      appendLog('UI_ACTION', 'Rafraîchissement du tableau cookies', {}, 'refresh_table');
      seedPalantirCookies();
      renderCookieTable();
    });
  }

  var btnReset = document.getElementById('btn-clear-palantir');
  if (btnReset) {
    btnReset.addEventListener('click', function () {
      Object.keys(PALANTIR_COOKIE_DEFINITIONS).forEach(deleteCookie);
      appendLog('COOKIE_CLEAR', 'Suppression des cookies simulés (Palantir-like)', {}, 'clear_palantir');
      renderCookieTable();
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // seed + render
  seedPalantirCookies();
  renderCookieTable();
  wireButtons();
});
