'use strict';

/**
 * cookieDefinitions.js
 * Central configuration for all simulated cookies.
 * Each entry defines metadata used by cookieManager, consentManager, and the UI.
 */

var COOKIE_DEFINITIONS = {
  consent_state: {
    name:         'consent_state',
    category:     'necessary',
    ttlDays:      180,
    purpose:      'Mémorise le choix de consentement (synchronisation avec localStorage)',
    exampleValue: '{"necessary":true,"analytics":false,"marketing":false}'
  },
  session_id: {
    name:         'session_id',
    category:     'necessary',
    ttlDays:      null,   // null = session cookie, pas d'Expires
    purpose:      'Identifiant de session temporaire — supprimé à la fermeture du navigateur',
    exampleValue: 'sess_abc123def456'
  },
  analytics_id: {
    name:         'analytics_id',
    category:     'analytics',
    ttlDays:      390,
    purpose:      'Identifiant persistant permettant de reconnaître un visiteur unique sur 13 mois',
    exampleValue: 'uid_xyz789ghi'
  },
  page_views: {
    name:         'page_views',
    category:     'analytics',
    ttlDays:      1,
    purpose:      'Compteur de pages vues, réinitialisé chaque jour',
    exampleValue: '3'
  },
  ad_id: {
    name:         'ad_id',
    category:     'marketing',
    ttlDays:      390,
    purpose:      'Identifiant pour le ciblage publicitaire et le retargeting sur 13 mois',
    exampleValue: 'adid_mno456pqr'
  },
  last_campaign: {
    name:         'last_campaign',
    category:     'marketing',
    ttlDays:      30,
    purpose:      'Dernière campagne marketing associée à la visite (attribution)',
    exampleValue: 'campaign_summer2024'
  }
};

var CATEGORY_LABELS = {
  necessary: 'Nécessaire',
  analytics: 'Statistiques',
  marketing: 'Marketing',
  unknown:   'Inconnu'
};
