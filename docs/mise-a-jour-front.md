# 🔄 Guide de Mise à Jour - Frontend Médiathèque

Ce guide décrit les procédures et règles de mise à jour de l'application frontend.

## 📋 Table des matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [📦 Gestion des dépendances](#-gestion-des-dépendances)
- [⚙️ Variables d'environnement](#-variables-denvironnement)
- [🚀 Procédures de mise à jour](#-procédures-de-mise-à-jour)
- [📚 Documentation](#-documentation)

## 🎯 Vue d'ensemble

Les mises à jour du frontend suivent un processus structuré pour garantir la stabilité et la qualité de l'application. Ce guide couvre tous les aspects des mises à jour, des dépendances aux variables d'environnement.

## 📦 Gestion des dépendances

### Politique de mise à jour

#### Dépendances critiques
- **React** : Mise à jour majeure après validation complète
- **Vite** : Mise à jour mineure automatique, majeure après tests
- **TypeScript** : Mise à jour mineure automatique
- **Tailwind CSS** : Mise à jour mineure automatique

#### Dépendances de développement
- **ESLint, Prettier** : Mise à jour automatique
- **Vitest, Testing Library** : Mise à jour après validation des tests
- **Husky, lint-staged** : Mise à jour mineure automatique

#### Dépendances de production
- **Axios** : Mise à jour mineure automatique
- **React Router** : Mise à jour après validation de la navigation
- **React Query** : Mise à jour après validation des performances

### Processus de mise à jour

#### 1. Vérification des mises à jour
```bash
# Vérifier les mises à jour disponibles
npm outdated

# Vérifier les vulnérabilités
npm audit

# Vérifier les mises à jour avec npm-check-updates
npx ncu
```

#### 2. Mise à jour des dépendances
```bash
# Mise à jour automatique des patchs
npm update

# Mise à jour manuelle des versions mineures/majeures
npm install package@latest

# Mise à jour de toutes les dépendances
npx ncu -u && npm install
```

#### 3. Validation post-mise à jour
```bash
# Vérifier que l'application se lance
npm run dev

# Lancer les tests
npm run test:run

# Vérifier le build
npm run build

# Vérifier le linting
npm run lint
```

### Gestion des conflits

#### Résolution des conflits de versions
1. **Identifier** les conflits dans `package-lock.json`
2. **Analyser** l'impact sur les fonctionnalités
3. **Tester** la compatibilité
4. **Résoudre** en ajustant les versions

#### Exemple de résolution
```json
// package.json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

## ⚙️ Variables d'environnement

### Variables VITE_*

#### Variables obligatoires
```env
# URL de l'API backend
VITE_API_URL=https://backend-mediatheque-production.up.railway.app/api

# URL du site (pour le SEO)
VITE_SITE_DOMAIN=https://frontend-mediatheque.vercel.app/

# Nom de l'application
VITE_APP_NAME=Médiathèque
```

#### Variables optionnelles
```env
# Version de l'application
VITE_APP_VERSION=1.0.0

# Mode de l'application
VITE_APP_MODE=production

# URL des services externes
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=https://sentry.io/DSN
```

#### Variables par environnement
```env
# Développement (.env.local)
VITE_API_URL=http://localhost:5001/api
VITE_SITE_DOMAIN=http://localhost:5173
VITE_APP_MODE=development

# Staging (.env.staging)
VITE_API_URL=http://localhost:5001/api
VITE_SITE_DOMAIN=http://localhost:5173
VITE_APP_MODE=staging

# Production (.env.production)
VITE_API_URL=https://backend-mediatheque-production.up.railway.app/api
VITE_SITE_DOMAIN=https://frontend-mediatheque.vercel.app/
VITE_APP_MODE=production
```

### Gestion des variables

#### Validation des variables
```typescript
// config/env.ts
export const validateEnv = () => {
  const requiredVars = [
    'VITE_API_URL',
    'VITE_SITE_DOMAIN',
    'VITE_APP_NAME'
  ];

  const missing = requiredVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${missing.join(', ')}`
    );
  }
};
```

#### Utilisation dans l'application
```typescript
// config/config.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  siteDomain: import.meta.env.VITE_SITE_DOMAIN,
  appName: import.meta.env.VITE_APP_NAME,
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appMode: import.meta.env.VITE_APP_MODE || 'development'
};
```

## 🚀 Procédures de mise à jour

### Mise à jour mineure (patch)

#### Processus automatique
1. **Vérification manuelle** des mises à jour disponibles
2. **Tests automatisés** s'exécutent
3. **Validation** par l'équipe
4. **Merge automatique** si tous les tests passent

#### Validation manuelle
```bash
# Vérifier les changements
git diff origin/main

# Tester localement
npm install
npm run test:run
npm run build

# Valider le déploiement
npm run preview
```

### Mise à jour mineure (feature)

#### Processus manuel
1. **Créer une branche** feature
2. **Mettre à jour** les dépendances
3. **Tester** les fonctionnalités
4. **Créer une Pull Request**
5. **Validation** par l'équipe
6. **Merge** après approbation

#### Checklist de validation
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Build de production réussi
- [ ] Linting sans erreurs
- [ ] Fonctionnalités critiques testées
- [ ] Documentation mise à jour

### Mise à jour majeure

#### Processus de migration
1. **Analyse d'impact** complète
2. **Plan de migration** détaillé
3. **Branche de développement** dédiée
4. **Tests exhaustifs** de régression
5. **Migration progressive** des fonctionnalités
6. **Validation** complète avant merge

#### Exemple de migration React 18 → 19
```typescript
// Avant (React 18)
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// Après (React 19)
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
```


## 📚 Documentation

### Mise à jour de la documentation

#### Documents à maintenir
- [x] **README.md** : Vue d'ensemble du projet
- [x] **Guide utilisateur** : Instructions d'utilisation
- [x] **Guide développeur** : Procédures techniques
- [x] **API documentation** : Référence des endpoints

#### Processus de mise à jour
1. **Identifier** les changements documentés
2. **Mettre à jour** les sections concernées
3. **Vérifier** la cohérence globale
4. **Valider** avec l'équipe
5. **Publier** la nouvelle version


### Guide de migration

#### Structure du guide
1. **Vue d'ensemble** des changements
2. **Impact** sur les utilisateurs
3. **Étapes de migration** détaillées
4. **Exemples** de code
5. **Troubleshooting** des problèmes courants

#### Exemple de guide
```markdown
# Guide de migration v1.0 → v1.1

#### Avant
```typescript
POST /api/favorites
{
  "mediaId": "123",
  "userId": "456"
}
```

#### Après
```typescript
POST /api/favorites
{
  "mediaId": "123"
}
```

## Étapes de migration

1. Mettre à jour les appels API
2. Adapter la gestion des erreurs
3. Tester les fonctionnalités
4. Valider les performances
```

---
