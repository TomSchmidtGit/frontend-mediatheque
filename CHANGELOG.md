# Changelog - Frontend Médiathèque

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [1.1.0] - 2025-08-14

### Added

- **APIs publiques** : Intégration des APIs externes pour la création de médias
  - Google Books API pour les livres
  - TMDB API pour les films
  - MusicBrainz API pour la musique
- **Recherche externe** : Possibilité de rechercher et importer des médias depuis les APIs publiques
- **Modal d'import** : Interface pour sélectionner et créer des médias depuis les données externes

### Changed

- **MediaFormModal** : Ajout d'un onglet pour l'import via APIs publiques
- **ExternalMediaSearch** : Composant de recherche dans les APIs externes

## [1.0.0] - 2025-08-13

### Added

- **Premier déploiement en production** avec Vercel
- **Authentification complète** : Inscription, connexion, récupération de mot de passe
- **Gestion des utilisateurs** : Profils, paramètres, gestion des rôles
- **Catalogue de médias** : Livres, films, musique avec recherche et filtres
- **Gestion des favoris** : Ajout, suppression, organisation des médias favoris
- **Dashboard utilisateur** : Vue d'ensemble des emprunts et favoris
- **Interface d'administration** : Gestion des utilisateurs, médias et emprunts
- **Tests complets** : 1,248 tests couvrant tous les composants et fonctionnalités
- **CI/CD** : Hooks pre-commit, linting automatique, tests automatisés
- **Responsive design** : Interface adaptée mobile, tablette et desktop
- **Accessibilité** : Navigation clavier, labels ARIA, contraste approprié

### Technical

- **React 19** avec TypeScript
- **Tailwind CSS** pour le styling
- **TanStack Query** pour la gestion des données
- **React Hook Form** avec validation Zod
- **Vitest** pour les tests unitaires
- **Vercel** pour le déploiement

## [0.1.0] - 2025-02-05

### Added

- **Initialisation du projet** React avec TypeScript
- **Structure de base** : Composants, pages, services
- **Configuration** Tailwind CSS et outils de développement
- **Premiers composants** : Header, navigation, pages de base

---

## Notes de version

- **v1.1.0** : Ajout des APIs publiques pour enrichir le catalogue
- **v1.0.0** : Première version stable et déployée en production
- **v0.1.0** : Version de développement initiale

## Support

Pour toute question ou problème, consultez le [README](./README.md) ou créez une issue sur le repository.
