'use strict';

/**
 * consentManager.js
 * Manages consent state (read/write/clear) and applies it by
 * creating or deleting the appropriate cookies.
 *
 * Depends on: cookieDefinitions.js, cookieManager.js, logger.js
 */

var CONSENT_LS_KEY = 'consent_state';

/* ─────────────────────────────────────────────────────────────────────────
   State read / write / clear
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Reads consent state from localStorage.
 * @returns {object|null}  Consent state or null if not set
 */
function readConsent() {
  try {
    var raw = localStorage.getItem(CONSENT_LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Saves a consent choice to localStorage.
 * @param {boolean} analytics
 * @param {boolean} marketing
 * @returns {object} Saved consent state
 */
function writeConsent(analytics, marketing) {
  var state = {
    version:   1,
    updatedAt: new Date().toISOString(),
    necessary: true,
    analytics: !!analytics,
    marketing: !!marketing
  };
  localStorage.setItem(CONSENT_LS_KEY, JSON.stringify(state));
  return state;
}

/**
 * Removes consent from localStorage and deletes all demo cookies.
 * Does NOT log — the caller (UI) is responsible for logging CONSENT_RESET.
 */
function clearConsent() {
  localStorage.removeItem(CONSENT_LS_KEY);
  var names = Object.keys(COOKIE_DEFINITIONS);
  for (var i = 0; i < names.length; i++) {
    deleteCookie(names[i]);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   Apply consent → create / delete cookies
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Creates or deletes cookies to match the given consent state.
 * Logs every cookie action via logger.js.
 *
 * @param {object} state    { necessary, analytics, marketing }
 * @param {string} trigger  Source identifier for the log entries
 */
function applyConsent(state, trigger) {
  trigger = trigger || 'system';
  var existing = parseCookies();

  /* ── Necessary (always created) ─────────────────────────────── */

  if (!existing['session_id']) {
    var sid = generateId('sess');
    setCookie('session_id', sid, null);
    appendLog('COOKIE_SET', 'Cookie session_id créé', {
      name: 'session_id', category: 'necessary', ttlDays: 'session', value: sid
    }, trigger);
  }

  var consentVal = JSON.stringify({
    necessary: true, analytics: state.analytics, marketing: state.marketing
  });
  if (!existing['consent_state']) {
    setCookie('consent_state', consentVal, 180);
    appendLog('COOKIE_SET', 'Cookie consent_state créé', {
      name: 'consent_state', category: 'necessary', ttlDays: 180, value: consentVal
    }, trigger);
  } else if (existing['consent_state'] !== consentVal) {
    setCookie('consent_state', consentVal, 180);
    appendLog('CONSENT_UPDATED', 'consent_state mis à jour', {
      name: 'consent_state', newValue: consentVal
    }, trigger);
  }

  /* ── Analytics ──────────────────────────────────────────────── */

  if (state.analytics) {
    if (!existing['analytics_id']) {
      var uid = generateId('uid');
      setCookie('analytics_id', uid, 390);
      appendLog('COOKIE_SET', 'Cookie analytics_id créé', {
        name: 'analytics_id', category: 'analytics', ttlDays: 390, value: uid
      }, trigger);
    }
    if (!existing['page_views']) {
      setCookie('page_views', '1', 1);
      appendLog('COOKIE_SET', 'Cookie page_views initialisé à 1', {
        name: 'page_views', category: 'analytics', ttlDays: 1, value: '1'
      }, trigger);
    } else {
      var views = String(parseInt(existing['page_views'], 10) + 1);
      setCookie('page_views', views, 1);
      if (trigger !== 'page_load') {
        appendLog('COOKIE_SET', 'Cookie page_views incrémenté → ' + views, {
          name: 'page_views', category: 'analytics', ttlDays: 1, value: views
        }, trigger);
      }
    }
  } else {
    ['analytics_id', 'page_views'].forEach(function (n) {
      if (existing[n]) {
        deleteCookie(n);
        appendLog('COOKIE_DELETE', 'Cookie ' + n + ' supprimé (analytics refusé)', {
          name: n, category: 'analytics'
        }, trigger);
      }
    });
  }

  /* ── Marketing ──────────────────────────────────────────────── */

  if (state.marketing) {
    if (!existing['ad_id']) {
      var adid = generateId('adid');
      setCookie('ad_id', adid, 390);
      appendLog('COOKIE_SET', 'Cookie ad_id créé', {
        name: 'ad_id', category: 'marketing', ttlDays: 390, value: adid
      }, trigger);
    }
    if (!existing['last_campaign']) {
      var campaign = 'campaign_' + Math.random().toString(36).substring(2, 8);
      setCookie('last_campaign', campaign, 30);
      appendLog('COOKIE_SET', 'Cookie last_campaign créé', {
        name: 'last_campaign', category: 'marketing', ttlDays: 30, value: campaign
      }, trigger);
    }
  } else {
    ['ad_id', 'last_campaign'].forEach(function (n) {
      if (existing[n]) {
        deleteCookie(n);
        appendLog('COOKIE_DELETE', 'Cookie ' + n + ' supprimé (marketing refusé)', {
          name: n, category: 'marketing'
        }, trigger);
      }
    });
  }
}
