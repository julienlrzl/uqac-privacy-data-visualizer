'use strict';

/**
 * cookies-ui.js
 * UI controller for the Cookie consent demo page.
 * Depends on: cookieDefinitions.js, cookieManager.js, logger.js, consentManager.js
 */

/* ── Escape helper ───────────────────────────────────────────── */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── DOM References ──────────────────────────────────────────── */
var DOM = {};

function initDOMRefs() {
  // Banner
  DOM.banner          = document.getElementById('cookie-banner');
  DOM.btnAcceptAll    = document.getElementById('btn-accept-all');
  DOM.btnRefuseAll    = document.getElementById('btn-refuse-all');
  DOM.btnCustomize    = document.getElementById('btn-customize');

  // Control section (mirrors banner actions, always visible)
  DOM.btnCtrlAccept   = document.getElementById('btn-ctrl-accept-all');
  DOM.btnCtrlRefuse   = document.getElementById('btn-ctrl-refuse-all');
  DOM.btnCtrlCustom   = document.getElementById('btn-ctrl-customize');
  DOM.btnReset        = document.getElementById('btn-reset-consent');

  // Modal
  DOM.modalOverlay    = document.getElementById('consent-modal');
  DOM.modalClose      = document.getElementById('modal-close');
  DOM.togAnalytics    = document.getElementById('tog-analytics');
  DOM.togMarketing    = document.getElementById('tog-marketing');
  DOM.btnModalAccept  = document.getElementById('btn-modal-accept-all');
  DOM.btnModalSave    = document.getElementById('btn-modal-save');

  // Cookie viewer
  DOM.cookieTableBody = document.getElementById('cookie-table-body');
  DOM.cookieCount     = document.getElementById('cookie-count');

  // Event log
  DOM.logTableBody    = document.getElementById('log-table-body');
  DOM.logCount        = document.getElementById('log-count');
  DOM.btnClearLog     = document.getElementById('btn-clear-log');

}

/* ── Banner ──────────────────────────────────────────────────── */
function showBanner() {
  if (DOM.banner) DOM.banner.classList.remove('hidden');
}
function hideBanner() {
  if (DOM.banner) DOM.banner.classList.add('hidden');
}

/* ── Modal ───────────────────────────────────────────────────── */
function showModal() {
  var state = readConsent();
  if (DOM.togAnalytics) DOM.togAnalytics.checked = state ? !!state.analytics : false;
  if (DOM.togMarketing) DOM.togMarketing.checked = state ? !!state.marketing : false;
  if (DOM.modalOverlay) DOM.modalOverlay.classList.remove('hidden');
}
function hideModal() {
  if (DOM.modalOverlay) DOM.modalOverlay.classList.add('hidden');
}

/* ── Cookie viewer ───────────────────────────────────────────── */
function renderCookieTable() {
  if (!DOM.cookieTableBody) return;
  var cookies = listCookies();
  if (DOM.cookieCount) DOM.cookieCount.textContent = cookies.length;
  if (cookies.length === 0) {
    DOM.cookieTableBody.innerHTML =
      '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:1rem;">Aucun cookie actif</td></tr>';
    return;
  }
  DOM.cookieTableBody.innerHTML = cookies.map(function (c) {
    var catClass = 'badge-cat-' + c.category;
    var catLabel = CATEGORY_LABELS[c.category] || c.category;
    var ttl = (c.ttlDays === null || c.ttlDays === 'session') ? 'Session'
            : c.ttlDays === '?' ? '?'
            : c.ttlDays + '\u00a0j';
    return '<tr>' +
      '<td><code>' + esc(c.name) + '</code></td>' +
      '<td class="value-preview">' + esc(c.valuePreview) + '</td>' +
      '<td><span class="badge ' + catClass + '">' + esc(catLabel) + '</span></td>' +
      '<td>' + esc(ttl) + '</td>' +
      '<td class="purpose-cell">' + esc(c.purpose) + '</td>' +
      '</tr>';
  }).join('');
}

/* ── Event log ───────────────────────────────────────────────── */
function fmtTime(iso) {
  var d = new Date(iso);
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var date = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  var time = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  return '<span class="log-ts">' + time + '</span>' +
         '<span class="log-date">' + date + '</span>';
}

function renderLogTable() {
  if (!DOM.logTableBody) return;
  var logs = loadLogs().slice().reverse(); // most-recent first
  if (DOM.logCount) DOM.logCount.textContent = logs.length;
  if (logs.length === 0) {
    DOM.logTableBody.innerHTML =
      '<tr><td colspan="4" class="text-muted" style="text-align:center;padding:1rem;">Aucun événement enregistré</td></tr>';
    return;
  }
  DOM.logTableBody.innerHTML = logs.map(function (e) {
    var typeClass = 'log-type-' + e.eventType.toLowerCase().replace(/_/g, '-');
    var dataStr = Object.keys(e.data).length
      ? '<code>' + esc(JSON.stringify(e.data)) + '</code>'
      : '<span class="text-muted">\u2014</span>';
    return '<tr>' +
      '<td class="log-time">' + fmtTime(e.timestamp) + '</td>' +
      '<td><span class="log-type ' + typeClass + '">' + esc(e.eventType) + '</span></td>' +
      '<td>' + esc(e.description) + '</td>' +
      '<td class="log-data">' + dataStr + '</td>' +
      '</tr>';
  }).join('');
}

/* ── Refresh all live panels ─────────────────────────────────── */
function refreshUI() {
  renderCookieTable();
  renderLogTable();
}

/* ── Consent actions ─────────────────────────────────────────── */
function doAcceptAll(trigger) {
  var state = writeConsent(true, true);
  appendLog('CONSENT_ACCEPT_ALL', 'Tout accepté', { analytics: true, marketing: true }, trigger);
  applyConsent(state, trigger);
  hideBanner();
  hideModal();
  refreshUI();
}

function doRefuseAll(trigger) {
  var state = writeConsent(false, false);
  appendLog('CONSENT_REFUSE_ALL', 'Tout refusé', { analytics: false, marketing: false }, trigger);
  applyConsent(state, trigger);
  hideBanner();
  refreshUI();
}

function doSaveCustom() {
  var analytics = DOM.togAnalytics ? DOM.togAnalytics.checked : false;
  var marketing = DOM.togMarketing ? DOM.togMarketing.checked : false;
  var state = writeConsent(analytics, marketing);
  appendLog('CONSENT_CUSTOM_SAVE', 'Préférences personnalisées sauvegardées', {
    analytics: analytics, marketing: marketing
  }, 'click_save_custom');
  applyConsent(state, 'click_save_custom');
  hideBanner();
  hideModal();
  refreshUI();
}

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initDOMRefs();

  // Log page load
  appendLog('PAGE_LOAD', 'Page chargée', { url: location.pathname }, 'page_load');

  // Check existing consent
  var state = readConsent();
  if (!state) {
    showBanner();
    appendLog('CONSENT_MISSING', 'Aucun consentement enregistré — bannière affichée', {}, 'page_load');
  } else {
    hideBanner();
    appendLog('CONSENT_LOADED', 'Consentement chargé depuis localStorage', {
      analytics: state.analytics, marketing: state.marketing, updatedAt: state.updatedAt
    }, 'page_load');
    applyConsent(state, 'page_load');
  }

  refreshUI();

  /* ── Banner buttons ──────────────────────────────────────── */
  if (DOM.btnAcceptAll) {
    DOM.btnAcceptAll.addEventListener('click', function () { doAcceptAll('click_accept_all'); });
  }
  if (DOM.btnRefuseAll) {
    DOM.btnRefuseAll.addEventListener('click', function () { doRefuseAll('click_refuse_all'); });
  }
  if (DOM.btnCustomize) {
    DOM.btnCustomize.addEventListener('click', showModal);
  }

  /* ── Control section buttons ─────────────────────────────── */
  if (DOM.btnCtrlAccept) {
    DOM.btnCtrlAccept.addEventListener('click', function () { doAcceptAll('click_accept_all'); });
  }
  if (DOM.btnCtrlRefuse) {
    DOM.btnCtrlRefuse.addEventListener('click', function () { doRefuseAll('click_refuse_all'); });
  }
  if (DOM.btnCtrlCustom) {
    DOM.btnCtrlCustom.addEventListener('click', showModal);
  }
  if (DOM.btnReset) {
    DOM.btnReset.addEventListener('click', function () {
      clearConsent();
      appendLog('CONSENT_RESET', 'Consentement réinitialisé — cookies supprimés', {}, 'click_reset');
      showBanner();
      refreshUI();
    });
  }

  /* ── Modal buttons ───────────────────────────────────────── */
  if (DOM.modalClose) {
    DOM.modalClose.addEventListener('click', hideModal);
  }
  if (DOM.btnModalAccept) {
    DOM.btnModalAccept.addEventListener('click', function () { doAcceptAll('click_modal_accept_all'); });
  }
  if (DOM.btnModalSave) {
    DOM.btnModalSave.addEventListener('click', doSaveCustom);
  }
  if (DOM.modalOverlay) {
    DOM.modalOverlay.addEventListener('click', function (e) {
      if (e.target === DOM.modalOverlay) hideModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideModal();
  });

  /* ── Log controls ────────────────────────────────────────── */
  if (DOM.btnClearLog) {
    DOM.btnClearLog.addEventListener('click', function () {
      clearLogs();
      renderLogTable();
    });
  }

});
