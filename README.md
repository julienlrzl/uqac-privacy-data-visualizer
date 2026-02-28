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
│   ├── politiques.html             → Analyse des politiques de confidentialité (nécessite serveur)
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
│       ├── politiques.js           → Chargement des JSON politiques (fetch)
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
- Fallback localStorage en mode `file://`

### 🔹 Pixel Tracker
- Simulation d’un pixel invisible
- Génération d’un identifiant unique
- Illustration du tracking cross-page

### 🔹 Politiques de confidentialité ⚠️
- Analyse structurée de plateformes (Instagram, TikTok, YouTube)
- Chargement des données depuis des fichiers JSON
- **Nécessite un serveur local** (les navigateurs bloquent `fetch()` en `file://`)

### 🔹 Cas d’usage : Data Broker (type Palantir)
- Scénario de corrélation de données
- Données observables côté navigateur
- Implications (durée de conservation, monétisation)
- Rappel des principes RGPD
- Tableau dynamique des cookies présents

---

## 🚀 Lancer le projet

### Option 1 — Recommandé (serveur local)
Permet le fonctionnement complet du projet (cookies + politiques) :

```bash
python3 -m http.server 8000
```

Puis ouvrir :

```
http://localhost:8000
```

### Option 2 — Mode démo (`file://`)
Ouvrir directement `index.html`.

Fonctionne pour :
- Cookies
- Pixel tracker
- Cas d’usage data broker

Ne fonctionne pas pour :
- ❌ Page **Politiques** (chargement JSON bloqué par le navigateur)

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
- localStorage (fallback cookies en mode démo)
- JSON pour la simulation des politiques plateformes

---

# 📘 Manuel d’installation et d’utilisation (Livrable 4.2)

## 🔎 Menace étudiée

Le projet illustre plusieurs mécanismes de suivi :

- Suivi par cookies (création d’identifiants persistants)
- Pixel de tracking (génération d’un identifiant invisible)
- Corrélation de données dans un scénario de type data broker
- Analyse des politiques de confidentialité (collecte déclarée)

Ces mécanismes permettent de simuler la construction d’un profil utilisateur à partir de données techniques.

---

## 📊 Données observées

Les données générées et visibles dans l’interface :

### Cookies
- Identifiant unique (`id_xxxxx`)
- Catégorie (essentiel, analytics, marketing)
- Durée de vie simulée
- Valeur partielle affichée (preview)

Moment de collecte :
- Lors du choix de consentement
- Lors de la navigation entre pages

Mécanisme :
- `document.cookie`
- fallback `localStorage` en mode démo

---

### Pixel tracker
- Génération d’un identifiant unique
- Horodatage de l’événement
- Simulation d’un événement de visite

Moment :
- Chargement de la page pixel

Mécanisme :
- Création d’un identifiant + stockage local

---

### Cas d’usage Data Broker
Données corrélées :
- Identifiant cookie
- Type de consentement
- Catégorie marketing / analytics
- Horodatage

Objectif :
- Montrer la reconstruction d’un profil à partir de plusieurs sources.

---

### Politiques de confidentialité
Données simulées issues des JSON :
- Types de données collectées
- Finalités
- Durées de conservation
- Partage avec des tiers

---

## ⚠️ Implications

Ces données permettent :

- le suivi dans le temps (identifiant persistant)
- la corrélation entre pages visitées
- le profilage comportemental
- l’inférence d’intérêts (marketing vs analytics)
- la reconstitution d’un historique de navigation

Dans un contexte réel, un data broker pourrait :
- relier ces identifiants à d’autres bases de données
- enrichir le profil avec des données externes
- vendre ou partager ce profil.

---

## 🧪 Scénarios reproductibles

### Scénario 1 — Refus des cookies
1. Ouvrir `index.html`
2. Cliquer sur **Refuser**
3. Aller sur la page *Cookies*
4. Observer le nombre limité de cookies
5. Recharger la page

Résultat attendu :
- uniquement les cookies essentiels

---

### Scénario 2 — Acceptation complète
1. Ouvrir `index.html`
2. Cliquer sur **Tout accepter**
3. Aller sur la page *Cookies*
4. Observer les cookies marketing et analytics
5. Recharger la page

Résultat attendu :
- plus grand nombre de cookies
- identifiants persistants

---

### Scénario 3 — Pixel tracker
1. Aller sur la page *Pixel tracker*
2. Recharger la page
3. Observer l’identifiant généré

Résultat :
- création d’un identifiant unique horodaté

---

### Scénario 4 — Corrélation Data Broker
1. Accepter les cookies marketing
2. Aller sur la page *Cas d’usage*
3. Cliquer sur **Rafraîchir**
4. Observer les cookies corrélés

Résultat :
- profil simulé construit à partir des données locales

---

### Scénario 5 — Politiques (nécessite serveur local)
1. Lancer `python3 -m http.server 8000`
2. Ouvrir `http://localhost:8000/pages/politiques.html`
3. Sélectionner une plateforme

Résultat :
- affichage des données collectées et finalités

---

## ❗ Limites de la démonstration

- Aucune donnée réelle n’est collectée
- Aucun envoi vers un serveur externe
- Pas de tracking inter-sites réel
- Les identifiants sont générés localement
- Les durées de conservation sont simulées
- Le scénario data broker est simplifié (pas de bases externes)

---

## 🛠️ Mesure d’atténuation proposée

- Refus des cookies non essentiels par défaut
- Limitation de la durée de vie des identifiants
- Transparence des données collectées
- Séparation des catégories de cookies
- Possibilité de suppression locale des identifiants

Ces mesures réduisent la capacité de profilage et la persistance du suivi.

---

## 📌 Remarques

Ce projet est une **simulation pédagogique**.  
Il ne représente pas le fonctionnement réel des plateformes ni d’un data broker.

Toute ressemblance avec des systèmes existants est utilisée uniquement à des fins éducatives.
