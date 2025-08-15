# 🚀 Protocole CI/CD - Frontend Médiathèque

Ce document décrit les protocoles d'intégration continue et de déploiement continu pour le frontend de la médiathèque.

## 📋 Table des matières

- [🔄 Protocole d'intégration continue](#-protocole-dintégration-continue)
- [🚀 Protocole de déploiement continu](#-protocole-de-déploiement-continu)
- [📊 Critères qualité & performance](#-critères-qualité--performance)
- [🌍 Matrice des environnements](#-matrice-des-environnements)
- [🔧 Configuration des outils](#-configuration-des-outils)

## 🔄 Protocole d'intégration continue

### Enchaînement pre-commit

Le workflow d'intégration suit cette séquence automatique avant chaque commit :

```bash
# Séquence automatique des hooks pre-commit
1. Linting (ESLint) → 2. Tests complets → 3. Audit sécurité → 4. Commit
```

#### 1. Linting (ESLint)
- **Objectif** : Vérification de la qualité du code
- **Seuil** : 0 erreur, 0 warning critique
- **Commande** : `npm run lint`
- **Action** : Bloque le commit si des erreurs sont détectées

#### 2. Tests complets
- **Objectif** : Vérification du bon fonctionnement
- **Commande** : `npm run test:run`
- **Action** : Bloque le commit si des tests échouent
- **Note** : Tous les tests sont exécutés, pas seulement les tests rapides

#### 3. Audit sécurité
- **Objectif** : Vérification des vulnérabilités
- **Commande** : `npm audit --audit-level=moderate`
- **Action** : Bloque le commit si des vulnérabilités modérées+ sont détectées

### Fréquence de merge

- **Branches feature** : Merge après validation complète des tests
- **Branche principale** : `main` (production)

### Vérifications bloquantes

#### Pre-commit (bloque le commit)
- ❌ Linting avec erreurs
- ❌ Tests qui échouent
- ❌ Vulnérabilités de sécurité modérées+

#### CI/CD (bloque le merge)
- ❌ Tests qui échouent
- ❌ Linting avec erreurs
- ❌ Vulnérabilités de sécurité
- ❌ Conflits Git non résolus

## 🚀 Protocole de déploiement continu

### Déclenchement automatique

Le déploiement se déclenche automatiquement sur :
- **Push direct** sur `main` → Déploiement production
- **Merge** sur `main` → Déploiement production

### Frontend → Vercel

#### Séquence de déploiement

```bash
1. Build → 2. Variables d'environnement → 3. Déploiement → 4. Vérification
```

#### Détail des étapes

1. **Build**
   - Installation des dépendances : `npm install`
   - Build de production : `npm run build`
   - Optimisation des assets et génération SEO

2. **Variables d'environnement**
   - Variables configurées dans Vercel
   - `.env` a configurer (se baser sur `.env.example` visible dans le repo)

3. **Déploiement**
   - Upload des fichiers buildés
   - Configuration des routes (SPA fallback)
   - Activation du nouveau déploiement

4. **Vérification**
   - Tests de santé du site
   - Vérification des performances
   - Notification de succès/échec

#### Configuration Vercel

```json
// vercel.json (fichier existant)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📊 Critères qualité & performance

### Frontend

| Critère | Seuil | Mesure |
|---------|-------|---------|
| **Linting** | 0 erreur | ESLint |
| **Tests** | 100% passent | Vitest |
| **Sécurité** | 0 vulnérabilité modérée+ | npm audit |
| **Formatage** | Conforme | Prettier |

### Métriques globales

- **Build** : Configuration automatique via Vite
- **Déploiement** : Automatique via Vercel
- **Monitoring** : Vercel Analytics et Error Tracking

## 🌍 Matrice des environnements

### Environnement de développement

| Aspect | Configuration |
|--------|---------------|
| **URL** | `http://localhost:5173` |
| **Variables** | Variables locales |
| **Logs** | Console + Vite dev server |
| **Debug** | Activé |
| **Hot reload** | Activé |

#### Commandes de lancement

```bash
cd frontend-mediatheque
npm run dev
```

### Environnement de production

| Aspect | Configuration |
|--------|---------------|
| **URL** | `https://frontend-mediatheque.vercel.app/` |
| **Variables** | Vercel production |
| **Logs** | Vercel logs |
| **Debug** | Désactivé |
| **Monitoring** | Activé |

#### Commandes de lancement

```bash
# Déploiement automatique sur push vers main
git checkout main
git push origin main
```

## 🔧 Configuration des outils

### Hooks pre-commit

#### Installation

```bash
cd frontend-mediatheque
npm run setup:pre-commit
```

#### Configuration

Le fichier `.pre-commit-config.yaml` configure :
- ESLint pour la qualité du code
- Prettier pour le formatage
- Tests complets via `npm run test:run`
- Audit de sécurité via `npm audit`

### Scripts disponibles

```json
// package.json
{
  "scripts": {
    "ci": "npm run lint && npm run format:check && npm run test:run",
    "pre-commit:run": "pre-commit run --all-files",
    "test:run": "Tests complets en mode CI"
  }
}
```

### Monitoring et alertes

#### Frontend (Vercel)

- **Performance** : Core Web Vitals monitoring
- **Erreurs** : Vercel Error Tracking
- **Déploiements** : Notifications automatiques (mail + console)
