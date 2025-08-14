# 🏛️ Frontend Médiathèque

Application React moderne pour la gestion d'une médiathèque, développée avec TypeScript, Vite et Tailwind CSS.

## 📋 Table des matières

- [🚀 Fonctionnalités](#-fonctionnalités)
- [🛠️ Technologies utilisées](#️-technologies-utilisées)
- [📁 Structure du projet](#-structure-du-projet)
- [⚙️ Prérequis](#️-prérequis)
- [🔧 Installation](#-installation)
- [🚀 Démarrage rapide](#-démarrage-rapide)
- [🏗️ Scripts disponibles](#️-scripts-disponibles)
- [🧪 Tests](#-tests)
- [📦 Déploiement](#-déploiement)
- [🔒 Sécurité](#-sécurité)
- [📱 Responsive Design](#-responsive-design)
- [🔧 Configuration](#-configuration)
- [📚 API et Services](#-api-et-services)
- [🎨 UI/UX](#-uiux)
- [🚀 Performance](#-performance)
- [🤝 Contribution](#-contribution)

## 🚀 Fonctionnalités

### 👥 Gestion des utilisateurs

- **Authentification** : Connexion, inscription, récupération de mot de passe
- **Profils utilisateurs** : Gestion des informations personnelles
- **Rôles** : Utilisateur, Employé, Administrateur
- **Favoris** : Système de médias favoris personnalisé

### 📚 Gestion des médias

- **Catalogue complet** : Livres, films, musique
- **Recherche avancée** : Filtres par type, catégorie, tags
- **Intégration API externes** : Google Books, TMDB, MusicBrainz
- **Détails enrichis** : Métadonnées complètes, images, descriptions

### 📖 Système d'emprunt

- **Gestion des emprunts** : Emprunt, retour, prolongation
- **Historique personnel** : Suivi des emprunts actuels et passés
- **Notifications** : Rappels de retour, confirmations
- **Statistiques** : Tableau de bord utilisateur

### 👨‍💼 Administration

- **Tableau de bord admin** : Statistiques globales, alertes
- **Gestion des utilisateurs** : Création, modification, désactivation
- **Gestion des médias** : Ajout, édition, suppression
- **Gestion des emprunts** : Vue d'ensemble, actions administratives
- **Gestion des catégories** : Organisation du catalogue

### 🌐 Interface publique

- **Page d'accueil** : Présentation, statistiques
- **Catalogue public** : Navigation sans authentification
- **Pages d'information** : À propos, contact, conditions

## 🛠️ Technologies utilisées

### Frontend

- **React 19** : Framework principal
- **TypeScript** : Typage statique et sécurité du code
- **Vite** : Build tool ultra-rapide
- **Tailwind CSS** : Framework CSS utilitaire
- **React Router DOM** : Navigation et routage
- **React Hook Form** : Gestion des formulaires
- **Zod** : Validation des schémas

### État et données

- **TanStack React Query** : Gestion du cache et des requêtes
- **Axios** : Client HTTP avec intercepteurs
- **Context API** : Gestion de l'état global

### UI/UX

- **Headless UI** : Composants accessibles
- **Heroicons** : Icônes SVG
- **Lucide React** : Icônes modernes
- **React Hot Toast** : Notifications toast
- **React Dropzone** : Upload de fichiers

### Outils de développement

- **ESLint** : Linting du code
- **Prettier** : Formatage automatique
- **Vitest** : Framework de tests
- **Testing Library** : Tests des composants
- **Pre-commit hooks** : Qualité du code

### Déploiement

- **Docker** : Conteneurisation
- **Nginx** : Serveur web de production
- **Vercel** : Déploiement automatique

## 📁 Structure du projet

```
frontend-mediatheque/
├── 📁 src/
│   ├── 📁 components/          # Composants réutilisables
│   │   ├── 📁 admin/          # Composants d'administration
│   │   ├── 📁 catalog/        # Composants du catalogue
│   │   ├── 📁 common/         # Composants communs
│   │   ├── 📁 dashboard/      # Composants du tableau de bord
│   │   ├── 📁 forms/          # Composants de formulaires
│   │   ├── 📁 layout/         # Composants de mise en page
│   │   └── 📁 modals/         # Composants modaux
│   ├── 📁 config/             # Configuration de l'application
│   ├── 📁 context/            # Contextes React (Auth, etc.)
│   ├── 📁 pages/              # Pages de l'application
│   │   ├── 📁 admin/          # Pages d'administration
│   │   ├── 📁 auth/           # Pages d'authentification
│   │   ├── 📁 media/          # Pages des médias
│   │   ├── 📁 public/         # Pages publiques
│   │   └── 📁 user/           # Pages utilisateur
│   ├── 📁 services/           # Services API et logique métier
│   ├── 📁 types/              # Définitions TypeScript
│   ├── 📁 utils/              # Utilitaires et helpers
│   ├── App.tsx                # Composant racine
│   ├── main.tsx               # Point d'entrée
│   └── index.css              # Styles globaux
├── 📁 public/                 # Assets statiques
├── 📁 scripts/                # Scripts utilitaires
├── 📁 test/                   # Tests de l'application
├── 📁 dist/                   # Build de production
├── package.json               # Dépendances et scripts
├── vite.config.ts             # Configuration Vite
├── tailwind.config.js         # Configuration Tailwind
├── tsconfig.json              # Configuration TypeScript
├── Dockerfile                 # Configuration Docker
├── nginx.conf                 # Configuration Nginx
└── vercel.json                # Configuration Vercel
```

## ⚙️ Prérequis

- **Node.js** : Version 18+ (recommandé 20+)
- **npm** : Version 9+ ou **yarn** ou **pnpm**
- **Git** : Pour le contrôle de version

### Vérification des prérequis

```bash
# Vérifier Node.js
node --version  # Doit être >= 18

# Vérifier npm
npm --version   # Doit être >= 9

# Vérifier Git
git --version
```

## 🔧 Installation

### 1. Cloner le repository

```bash
git clone <url-du-repo>
cd frontend-mediatheque
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# URL de l'API backend
VITE_API_URL=http://localhost:5001/api

# URL du site (pour le SEO)
VITE_SITE_DOMAIN=http://localhost:5173

# Variables d'environnement optionnelles
VITE_APP_NAME=Médiathèque
VITE_APP_VERSION=1.0.0
```

### 4. Configuration des hooks pre-commit

```bash
npm run setup:pre-commit
```

## 🚀 Démarrage rapide

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Mode production

```bash
npm run build
npm run preview
```

### Tests

```bash
# Tests en mode watch
npm run test

# Tests une seule fois
npm run test:run

# Tests avec interface graphique
npm run test:ui

# Tests avec couverture
npm run test:coverage
```

## 🏗️ Scripts disponibles

### Développement

```bash
npm run dev              # Démarrage du serveur de développement
npm run build            # Build de production avec génération SEO
npm run preview          # Prévisualisation du build
```

### Qualité du code

```bash
npm run lint             # Vérification ESLint
npm run lint:fix         # Correction automatique ESLint
npm run format           # Formatage Prettier
npm run format:check     # Vérification du formatage
```

### Tests

```bash
npm run test             # Tests en mode watch
npm run test:run         # Tests une seule fois
npm run test:ui          # Interface graphique des tests
npm run test:coverage    # Tests avec couverture
npm run test:watch       # Tests en mode watch
```

### CI/CD

```bash
npm run ci               # Exécution complète de la CI
npm run setup:pre-commit # Installation des hooks pre-commit
npm run pre-commit:run   # Exécution manuelle des hooks
```

### SEO

```bash
npm run generate:seo     # Génération des fichiers SEO
```

## 🧪 Tests

### Structure des tests

```
test/
├── 📁 components/       # Tests des composants
├── 📁 context/         # Tests des contextes
├── 📁 pages/           # Tests des pages
├── 📁 services/        # Tests des services
├── 📁 utils/           # Tests des utilitaires
├── setup.jsx           # Configuration des tests
└── types.d.ts          # Types pour les tests
```

### Exécution des tests

```bash
# Tests en mode watch (développement)
npm run test

# Tests une seule fois (CI)
npm run test:run

# Tests avec interface graphique
npm run test:ui

# Tests avec couverture de code
npm run test:coverage
```

### Écriture de tests

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## 📦 Déploiement

### Déploiement avec Docker

#### 1. Build de l'image

```bash
# Build pour la production
docker build --target production -t mediatheque-frontend .

# Build pour le développement
docker build --target development -t mediatheque-frontend:dev .
```

#### 2. Exécution du conteneur

```bash
# Production
docker run -p 80:80 mediatheque-frontend

# Développement
docker run -p 80:80 mediatheque-frontend:dev
```

### Déploiement avec Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend-mediatheque
      target: production
    ports:
      - '80:80'
    environment:
      - NODE_ENV=production
```

```bash
docker-compose up -d
```

### Déploiement sur Vercel

Le projet est configuré pour un déploiement automatique sur Vercel :

1. Connecter le repository GitHub à Vercel
2. Les déploiements se font automatiquement à chaque push
3. Configuration dans `vercel.json`

### Déploiement manuel

```bash
# Build de production
npm run build

# Les fichiers sont dans le dossier `dist/`
# Déployer ce dossier sur votre serveur web
```

## 🔒 Sécurité

### Authentification

- **JWT Tokens** : Access et refresh tokens
- **Intercepteurs Axios** : Gestion automatique des tokens
- **Routes protégées** : Vérification des permissions
- **Middleware d'auth** : Protection des routes sensibles

### Validation

- **Zod** : Validation des schémas côté client
- **Sanitisation** : Protection contre les injections
- **CORS** : Configuration des origines autorisées

### Headers de sécurité

- **X-Frame-Options** : Protection contre le clickjacking
- **X-XSS-Protection** : Protection XSS
- **Content-Security-Policy** : Politique de sécurité du contenu

## 📱 Responsive Design

### Breakpoints Tailwind

- **Mobile** : `< 640px`
- **Tablet** : `640px - 1024px`
- **Desktop** : `> 1024px`

### Composants adaptatifs

- **Navigation** : Menu hamburger sur mobile
- **Grilles** : Adaptation automatique des colonnes
- **Formulaires** : Layout optimisé pour chaque écran
- **Modales** : Taille adaptée à l'écran

## 🔧 Configuration

### Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          /* Palette personnalisée */
        },
        secondary: {
          /* Palette personnalisée */
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

### TypeScript

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true
  }
}
```

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
```

## 📚 API et Services

### Architecture des services

```
services/
├── api.ts                 # Configuration Axios et intercepteurs
├── authService.ts         # Authentification et gestion des tokens
├── userService.ts         # Gestion des utilisateurs
├── mediaService.ts        # Gestion des médias
├── borrowService.ts       # Gestion des emprunts
├── dashboardService.ts    # Données du tableau de bord
├── adminMediaService.ts   # Services d'administration des médias
├── adminUserService.ts    # Services d'administration des utilisateurs
├── adminBorrowService.ts  # Services d'administration des emprunts
├── externalApiService.ts  # Intégration des APIs externes
└── contactService.ts      # Service de contact
```

### Gestion des erreurs

- **Intercepteurs Axios** : Gestion centralisée des erreurs
- **Toast notifications** : Affichage des messages d'erreur
- **Fallbacks** : Gestion gracieuse des échecs API
- **Retry logic** : Tentatives automatiques de reconnexion

### Cache et performance

- **React Query** : Cache intelligent des données
- **Stale time** : Configuration de la fraîcheur des données
- **Background updates** : Mise à jour en arrière-plan
- **Optimistic updates** : Mises à jour optimistes de l'UI

## 🎨 UI/UX

### Design System

- **Couleurs** : Palette cohérente avec variantes
- **Typographie** : Hiérarchie claire des textes
- **Espacement** : Système d'espacement cohérent
- **Animations** : Transitions fluides et micro-interactions

### Composants

- **Accessibilité** : Support des lecteurs d'écran
- **Responsive** : Adaptation à tous les écrans
- **Thème** : Support des thèmes clair/sombre (futur)
- **Internationalisation** : Support multi-langues (futur)

### Icônes et illustrations

- **Heroicons** : Icônes SVG cohérentes
- **Lucide React** : Icônes modernes et accessibles
- **Favicon** : Icône personnalisée du projet

## 🚀 Performance

### Optimisations Vite

- **Tree shaking** : Élimination du code inutilisé
- **Code splitting** : Division automatique du bundle
- **Lazy loading** : Chargement à la demande des composants
- **Compression** : Gzip et Brotli automatiques

### Optimisations React

- **Memoization** : Optimisation des re-renders
- **Lazy components** : Chargement différé des pages
- **Code splitting** : Division des bundles par route
- **Suspense** : Gestion des états de chargement

### Monitoring

- **Bundle analyzer** : Analyse de la taille des bundles
- **Performance metrics** : Mesures des performances
- **Error tracking** : Suivi des erreurs en production

## 🤝 Contribution

### Workflow de développement

1. **Fork** du repository
2. **Création** d'une branche feature
3. **Développement** avec tests
4. **Commit** avec messages conventionnels
5. **Push** et création d'une Pull Request
6. **Review** et merge

### Standards de code

- **ESLint** : Règles de qualité du code
- **Prettier** : Formatage automatique
- **TypeScript** : Typage strict
- **Tests** : Couverture minimale de 80%

### Hooks pre-commit

```bash
# Installation automatique
npm run setup:pre-commit

# Exécution manuelle
npm run pre-commit:run
```

Les hooks vérifient automatiquement :

- Qualité du code (ESLint)
- Formatage (Prettier)
- Tests
- Sécurité des dépendances

## 🆘 Support

### Problèmes courants

#### Erreur de build

```bash
# Nettoyer le cache
rm -rf node_modules package-lock.json
npm install
```

#### Erreurs TypeScript

```bash
# Vérifier la configuration
npm run lint
npm run format:check
```

#### Tests qui échouent

```bash
# Nettoyer et relancer
npm run test:run
```

---

**Développé par Tom Schmidt**
