# UQAC Privacy Data Visualizer

Projet pédagogique de visualisation des mécanismes de collecte de données et de suivi en ligne (cookies, pixels, politiques de confidentialité) dans un contexte de sensibilisation à la vie privée.

Ce projet simule le fonctionnement de technologies de tracking et de monétisation des données, sans collecte réelle ni envoi de données vers des serveurs externes.

---

## 🎯 Objectifs pédagogiques

- Comprendre le rôle des cookies et du consentement
- Visualiser les identifiants techniques (IDs, trackers, pixels)
- Illustrer le modèle économique des data brokers
- Analyser les implications en matière de vie privée et RGPD
- Montrer la corrélation entre données techniques et profilage

---

## 🧱 Structure du projet

```
uqac-privacy-data-visualizer/
│
├── index.html                      → Page d’accueil
│
├── pages/
│   ├── cookies.html                → Gestion du consentement cookies
│   ├── pixel-tracker.html          → Simulation de pixel de tracking
│   ├── politiques.html             → Analyse des politiques de confidentialité
│   └── exemple-plateforme.html     → Cas d’usage : Data Broker (type Palantir)
│
├── assets/
│   ├── css/
│   │   └── politiques.css
│   │
│   └── js/
│       ├── storage.js              → Gestion cookies + fallback localStorage
│       ├── consent.js              → Gestion des préférences utilisateur
│       ├── pixel.js                → Simulation du pixel tracker
│       ├── politiques.js           → Affichage des politiques
│       └── palantir-demo.js        → Tableau dynamique des cookies (cas d’usage)
│
├── data/
│   ├── apps.json
│   ├── instagram.json
│   ├── tiktok.json
│   └── youtube.json
│
└── README.md
```

---

## 🧪 Fonctionnalités principales

### 🔹 Cookies & Consentement
- Bannière de consentement simulée
- Création de cookies selon les choix utilisateur
- Catégories : essentiels, analytics, marketing
- Tableau dynamique des cookies observables

### 🔹 Fallback `file://` (mode démo)
En ouverture locale (`file://`), certains navigateurs bloquent les cookies.  
Le projet utilise donc un **fallback localStorage** pour simuler leur présence.

➡️ Aucun cookie réel n’est envoyé à un serveur.

### 🔹 Pixel Tracker
- Simulation d’un pixel invisible
- Génération d’un identifiant unique
- Illustration du tracking cross-page

### 🔹 Politiques de confidentialité
- Analyse structurée de plateformes (Instagram, TikTok, YouTube)
- Données collectées
- Finalités
- Durées de conservation
- Partage avec des tiers

### 🔹 Cas d’usage : Data Broker (type Palantir)
- Scénario de corrélation de données
- Données observables côté navigateur
- Implications (durée de conservation, monétisation)
- Rappel des principes RGPD
- Tableau dynamique des cookies présents

---

## 🚀 Lancer le projet

### Option 1 — Recommandé (serveur local)
Permet un comportement normal des cookies :

```bash
python3 -m http.server 8000
```

Puis ouvrir :

```
http://localhost:8000
```

### Option 2 — Mode démo (`file://`)
Ouvrir directement `index.html`.

Dans ce cas :
- les cookies réels peuvent être bloqués
- le projet utilise automatiquement un fallback via `localStorage`

---

## 🔒 Vie privée

- Aucune donnée n’est envoyée vers un serveur
- Tous les identifiants sont générés localement
- Les cookies sont simulés à des fins pédagogiques uniquement
- Le fallback localStorage est utilisé uniquement pour l’affichage en mode local

---

## ⚖️ Cadre légal (RGPD)

Le projet illustre :
- le principe de consentement
- la limitation des finalités
- la minimisation des données
- la transparence des traitements
- les durées de conservation

---

## 👥 Contexte académique

Projet réalisé dans le cadre du cours de :

**Sécurité informatique et vie privée – UQAC**

Objectif : sensibilisation aux mécanismes de collecte et de valorisation des données personnelles.

---

## 🛠️ Technologies utilisées

- HTML5 / CSS3
- JavaScript (vanilla)
- localStorage (fallback cookies)
- JSON pour la simulation de données plateformes

---

## 📌 Remarques

Ce projet est une **simulation pédagogique**.  
Il ne représente pas le fonctionnement réel des plateformes ni d’un data broker.

Toute ressemblance avec des systèmes existants est utilisée uniquement à des fins éducatives.
