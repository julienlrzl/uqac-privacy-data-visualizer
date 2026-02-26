# Privacy Data Visualizer

Outil pédagogique pour comprendre les mécanismes de collecte de données personnelles sur le web : cookies, pixels de suivi, et politiques de confidentialité.

**Projet universitaire - UQAC**

## Description

Ce visualiseur est conçu pour sensibiliser aux pratiques de collecte de données en ligne. L'application permet d'explorer de manière interactive :

- La gestion des cookies et niveaux de consentement
- Le fonctionnement des pixels de suivi invisibles
- L'analyse de politiques de confidentialité
- Des cas d'usage concrets (TikTok, YouTube)

## Structure du Projet

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

## Installation et Utilisation

### Prérequis

L'application utilise l'API fetch() pour charger les fichiers JSON. Pour des raisons de sécurité (politique CORS), elle doit être lancée via un serveur local et non en ouvrant directement le fichier HTML.
Lancer l'application avec Python

Ouvrez un terminal à la racine du projet.

Lancez le serveur avec la commande suivante :
    Bash

    python -m http.server 8000

Accédez à l'application dans votre navigateur à l'adresse : http://localhost:8000


**Note** : Ce projet est à but pédagogique uniquement. Il vise à sensibiliser aux enjeux de la vie privée en ligne, pas à collecter réellement des données utilisateur.
