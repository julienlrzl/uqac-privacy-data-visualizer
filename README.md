# Privacy Data Visualizer

Outil pédagogique pour comprendre les mécanismes de collecte de données personnelles sur le web : cookies, pixels de suivi, et politiques de confidentialité.

**Projet universitaire - UQAC**

## 📋 Description

Ce visualiseur est conçu pour sensibiliser aux pratiques de collecte de données en ligne. L'application permet d'explorer de manière interactive :

- La gestion des cookies et niveaux de consentement
- Le fonctionnement des pixels de suivi invisibles
- L'analyse de politiques de confidentialité
- Des cas d'usage concrets (TikTok, YouTube)

## 🎯 Statut du Projet

**Version actuelle : Interface UI v1.0**

Cette version contient uniquement l'interface utilisateur (UI/UX). Les fonctionnalités de collecte, d'analyse et de visualisation de données seront implémentées dans les prochaines étapes.

Tous les composants actuels sont des **placeholders** (interface visuelle sans logique fonctionnelle).

## 📁 Structure du Projet

```
uqac-privacy-data-visualizer/
├── index.html                    # Page d'accueil
├── pages/                        # Pages de l'application
│   ├── cookies.html             # Gestion des cookies
│   ├── pixel-tracker.html       # Pixel de suivi
│   ├── politiques.html          # Politiques de confidentialité
│   ├── exemple-tiktok.html      # Cas d'usage TikTok
│   └── exemple-youtube.html     # Cas d'usage YouTube
├── assets/                       # Ressources statiques
│   ├── css/
│   │   └── styles.css           # Styles globaux
│   ├── js/
│   │   └── main.js              # JavaScript (navigation uniquement)
│   └── images/
│       └── favicon.svg          # Favicon du site
├── .gitignore                    # Fichiers ignorés par Git
└── README.md                     # Ce fichier
```

## 🚀 Installation et Utilisation

### Prérequis

Aucune dépendance requise. Le projet utilise uniquement HTML, CSS et JavaScript vanilla.

### Lancement Local

1. Clonez le repository :

```bash
git clone https://github.com/votre-username/uqac-privacy-data-visualizer.git
cd uqac-privacy-data-visualizer
```

2. Ouvrez `index.html` dans votre navigateur web :
   - Double-cliquez sur le fichier
   - Ou utilisez un serveur local (recommandé) :

```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js et npx
npx serve
```

3. Accédez à `http://localhost:8000` dans votre navigateur

## 🎨 Caractéristiques UI

### Pages Disponibles

1. **Accueil** : Vue d'ensemble du projet avec navigation par cartes
2. **Cookies** : Options de consentement et visualisation des données collectées
3. **Pixel Tracker** : Démonstration visuelle du fonctionnement des pixels
4. **Politiques** : Interface d'analyse de politiques de confidentialité
5. **Exemples** : Cas d'usage TikTok et YouTube avec analyses détaillées

## 🔮 Roadmap

### Version 2.0 - Fonctionnalités Réelles (À venir)

- [ ] Implémentation de la collecte de cookies
- [ ] Tracking réel des événements utilisateur
- [ ] Génération d'identifiants uniques
- [ ] Stockage local (localStorage/sessionStorage)
- [ ] Analyse automatique de politiques de confidentialité
- [ ] Génération de rapports et comparaisons
- [ ] Export de données

### Version 3.0 - Avancée (Futur)

- [ ] Dashboard analytique
- [ ] Visualisations graphiques (charts, timelines)
- [ ] Mode comparaison de scénarios
- [ ] Détection automatique de clauses sensibles (NLP)
- [ ] Système de scoring des politiques

## 👥 Contribution

Projet universitaire - UQAC
Contributions et suggestions bienvenues via issues/pull requests.

## 📄 Licence

Projet académique - UQAC 2026

---

**Note** : Ce projet est à but pédagogique uniquement. Il vise à sensibiliser aux enjeux de la vie privée en ligne, pas à collecter réellement des données utilisateur.
