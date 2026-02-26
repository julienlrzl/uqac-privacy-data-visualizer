'use strict';

/**
 * cookieManager.js
 * Pure functions for reading, writing and deleting cookies.
 * No side-effects beyond document.cookie. No logging here.
 */

/**
 * Generates a pseudo-unique identifier.
 * Non-cryptographic — demo purposes only.
 * @param {string} prefix
 */
function generateId(prefix) {
  var rand = Math.random().toString(36).substring(2, 10);
  var time = (Date.now() % 1000000).toString(36);
  return (prefix || 'id') + '_' + rand + time;
}

// --- Cookie support / fallback (file://) ---
var __COOKIE_FALLBACK_KEY = '__pdv_cookie_fallback_v1';

function __getCookieFallbackStore() {
  try { return JSON.parse(localStorage.getItem(__COOKIE_FALLBACK_KEY) || '{}'); }
  catch (e) { return {}; }
}

function __setCookieFallbackStore(obj) {
  try { localStorage.setItem(__COOKIE_FALLBACK_KEY, JSON.stringify(obj || {})); } catch (e) {}
}

function cookiesAreSupported() {
  try {
    var test = '__pdv_test_cookie';
    document.cookie = test + "=1; path=/; SameSite=Strict";
    var ok = document.cookie && document.cookie.indexOf(test + '=') !== -1;
    document.cookie = test + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    return !!ok;
  } catch (e) {
    return false;
  }
}


/**
 * Sets a cookie on the current domain.
 * @param {string}      name
 * @param {string}      value
 * @param {number|null} ttlDays  null → session cookie (no Expires header)
 */

function setCookie(name, value, ttlDays) {
  var str = name + '=' + encodeURIComponent(String(value)) + '; path=/; SameSite=Strict';

  if (ttlDays !== null && ttlDays !== undefined) {
    var d = new Date();
    d.setTime(d.getTime() + ttlDays * 86400000);
    str += '; expires=' + d.toUTCString();
  }

  document.cookie = str;

  // Fallback if cookies are not persisted (common on file://)
  if (!cookiesAreSupported()) {
    var store = __getCookieFallbackStore();
    store[name] = String(value);
    __setCookieFallbackStore(store);
  }
}

/**
 * Deletes a cookie by back-dating its expiry.
 * @param {string} name
 */

function deleteCookie(name) {
  document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';

  var store = __getCookieFallbackStore();
  if (store && Object.prototype.hasOwnProperty.call(store, name)) {
    delete store[name];
    __setCookieFallbackStore(store);
  }
}

/**
 * Parses document.cookie into a name → value map.
 * @returns {Object.<string, string>}
 */

function parseCookies() {
  var result = {};

  // Real cookies
  var parts = (document.cookie || '').split(';');
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i].trim();
    if (!part) continue;
    var eq = part.indexOf('=');
    if (eq < 0) continue;
    var key = part.substring(0, eq).trim();
    var val = part.substring(eq + 1).trim();
    if (key) result[key] = decodeURIComponent(val);
  }

  // Fallback cookies (file://)
  var fb = __getCookieFallbackStore();
  Object.keys(fb).forEach(function (k) {
    if (!(k in result)) result[k] = fb[k];
  });

  return result;
}

/**
 * Returns an enriched list of current cookies, cross-referenced with COOKIE_DEFINITIONS.
 * @returns {Array<{name, value, valuePreview, category, ttlDays, purpose}>}
 */
function listCookies() {
  var raw  = parseCookies();
  var keys = Object.keys(raw);
  return keys.map(function (name) {
    var def   = COOKIE_DEFINITIONS[name];
    var value = raw[name];
    return {
      name:         name,
      value:        value,
      valuePreview: value.length > 45 ? value.substring(0, 45) + '\u2026' : value,
      category:     def ? def.category : 'unknown',
      ttlDays:      def ? def.ttlDays  : '?',
      purpose:      def ? def.purpose  : 'Cookie non référencé dans cette démo'
    };
  });
}

