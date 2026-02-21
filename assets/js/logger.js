'use strict';

/**
 * logger.js
 * Persistent event logger backed by localStorage.
 * Logs survive page reloads — cleared only on explicit user action.
 */

var LOG_KEY  = 'event_logs';
var MAX_LOGS = 300;

/**
 * Appends a structured entry to the event log.
 *
 * @param {string} eventType   Constant: PAGE_LOAD, COOKIE_SET, CONSENT_ACCEPT_ALL…
 * @param {string} description Human-readable explanation
 * @param {object} data        Arbitrary contextual data (cookie name, value, category…)
 * @param {string} trigger     Source of the event (page_load, click_accept_all, click_customize…)
 * @returns {object} The created log entry
 */
function appendLog(eventType, description, data, trigger) {
  var logs  = loadLogs();
  var entry = {
    id:          Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp:   new Date().toISOString(),
    eventType:   eventType,
    description: description,
    data:        data    || {},
    trigger:     trigger || 'system'
  };
  logs.push(entry);
  if (logs.length > MAX_LOGS) {
    logs = logs.slice(logs.length - MAX_LOGS);
  }
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  } catch (e) { /* storage full — fail silently */ }
  return entry;
}

/**
 * Loads all log entries from localStorage.
 * @returns {Array}
 */
function loadLogs() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

/**
 * Clears all log entries.
 */
function clearLogs() {
  localStorage.setItem(LOG_KEY, '[]');
}
