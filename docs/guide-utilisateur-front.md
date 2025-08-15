# 👥 Guide Utilisateur - Frontend Médiathèque

Ce guide décrit les parcours utilisateur principaux de l'application de médiathèque.

## 📋 Table des matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [🚀 Premiers pas](#-premiers-pas)
- [🔐 Authentification](#-authentification)
- [📚 Navigation dans le catalogue](#-navigation-dans-le-catalogue)
- [❤️ Gestion des favoris](#-gestion-des-favoris)
- [📖 Consultation des emprunts](#-consultation-des-emprunts)
- [👨‍💼 Administration](#-administration)
- [🔧 Paramètres et préférences](#-paramètres-et-préférences)
- [❓ FAQ](#-faq)

## 🎯 Vue d'ensemble

L'application de médiathèque permet aux utilisateurs de :
- **Parcourir** un catalogue riche de livres, films et musique
- **Rechercher** des médias par titre, auteur, catégorie
- **Consulter** les détails des médias et leur disponibilité
- **Gérer** leurs favoris et préférences
- **Administrer** la médiathèque (rôles admin/employé uniquement)

**⚠️ Important** : Les emprunts se font **uniquement sur place** à la médiathèque par le personnel. Les utilisateurs ne peuvent pas emprunter en ligne.

## 🚀 Premiers pas

### Accès à l'application

1. **Ouvrir votre navigateur** (Chrome, Firefox, Safari, Edge)
2. **Naviguer vers** : `https://frontend-mediatheque.vercel.app/`
3. **Page d'accueil** s'affiche avec présentation et statistiques

### Navigation principale

- **🏠 Accueil** : Page principale avec présentation
- **📚 Catalogue** : Accès au catalogue complet
- **👤 Mon compte** : Gestion du profil et favoris
- **📖 Mes emprunts** : Consultation des emprunts actuels et passés
- **❤️ Favoris** : Médias favoris
- **ℹ️ À propos** : Informations sur la médiathèque
- **📧 Contact** : Formulaire de contact

## 🔐 Authentification

### Inscription d'un nouveau compte

#### Étape 1 : Accès à l'inscription
1. Cliquer sur **"Se connecter"** dans le header
2. Cliquer sur **"Créer un compte"**
3. Remplir le formulaire d'inscription

#### Étape 2 : Remplir le formulaire
- **Nom complet** : Votre nom et prénom
- **Email** : Adresse email valide
- **Mot de passe** : Minimum 8 caractères
- **Confirmer le mot de passe** : Répéter le mot de passe

#### Étape 3 : Validation
1. Cliquer sur **"Créer mon compte"**
2. **Vérifier votre email** pour activer le compte
3. Cliquer sur le lien de validation dans l'email
4. **Compte activé** et prêt à utiliser

### Connexion à un compte existant

#### Étape 1 : Accès à la connexion
1. Cliquer sur **"Se connecter"** dans le header
2. Remplir le formulaire de connexion

#### Étape 2 : Saisir les identifiants
- **Email** : Votre adresse email
- **Mot de passe** : Votre mot de passe

#### Étape 3 : Connexion
1. Cliquer sur **"Se connecter"**
2. **Redirection automatique** vers le dashboard
3. **Session active** jusqu'à déconnexion

### Récupération de mot de passe

#### Étape 1 : Demande de récupération
1. Sur la page de connexion, cliquer sur **"Mot de passe oublié ?"**
2. Saisir votre **adresse email**
3. Cliquer sur **"Envoyer le lien de récupération"**

#### Étape 2 : Réinitialisation
1. **Vérifier votre email** pour le lien de récupération
2. Cliquer sur le lien dans l'email
3. Saisir un **nouveau mot de passe**
4. Confirmer le nouveau mot de passe
5. Cliquer sur **"Mettre à jour le mot de passe"**

## 📚 Navigation dans le catalogue

### Accès au catalogue

1. **Cliquer sur "Catalogue"** dans le menu principal
2. **Page catalogue** s'affiche avec tous les médias
3. **Filtres** disponibles sur la gauche
4. **Barre de recherche** en haut

### Recherche de médias

#### Recherche simple
1. **Utiliser la barre de recherche** en haut
2. **Saisir un terme** (titre, auteur, etc.)
3. **Résultats** s'affichent en temps réel
4. **Cliquer sur un résultat** pour les détails

#### Recherche avancée
1. **Utiliser les filtres** sur la gauche
2. **Sélectionner le type** : Livre, Film, Musique
3. **Choisir une catégorie** spécifique
4. **Appliquer les filtres** pour affiner les résultats

### Navigation par catégories

#### Catégories principales
- **📖 Livres** : Romans, essais, documentaires
- **🎬 Films** : Longs métrages, documentaires
- **🎵 Musique** : Albums, singles, compilations

#### Sous-catégories
- **Livres** : Fiction, Non-fiction, Jeunesse, Sciences
- **Films** : Action, Comédie, Drame, Thriller
- **Musique** : Rock, Jazz, Classique, Pop

### Affichage des résultats

#### Grille de médias
- **Cartes de médias** avec image et informations
- **Informations affichées** : Titre, auteur, disponibilité
- **Actions rapides** : Favoris, voir détails

#### Pagination
- **Navigation entre pages** en bas
- **Nombre d'éléments** par page configurable
- **Compteur total** de résultats

## ❤️ Gestion des favoris

### Ajouter un média aux favoris

#### Étape 1 : Sélection du média
1. **Parcourir le catalogue** ou utiliser la recherche
2. **Cliquer sur un média** pour voir les détails
3. **Page de détails** s'affiche

#### Étape 2 : Ajout aux favoris
1. **Cliquer sur l'icône cœur** (❤️) sur la carte ou page de détails
2. **Cœur se remplit** (❤️) pour indiquer l'ajout
3. **Message de confirmation** s'affiche

### Consulter ses favoris

#### Étape 1 : Accès aux favoris
1. **Cliquer sur "Favoris"** dans le menu principal
2. **Page des favoris** s'affiche
3. **Liste des médias** favoris

#### Étape 2 : Gestion des favoris
- **Voir les détails** : Cliquer sur un média
- **Retirer des favoris** : Cliquer sur le cœur plein
- **Vérifier la disponibilité** : Indicateur sur la carte

## 📖 Consultation des emprunts

### Consulter ses emprunts

#### Étape 1 : Accès aux emprunts
1. **Cliquer sur "Mes emprunts"** dans le menu principal
2. **Page des emprunts** s'affiche
3. **Liste des emprunts** actifs et passés

#### Étape 2 : Informations affichées
- **Titre du média** et type
- **Date d'emprunt** et de retour prévue
- **Statut** : En cours, En retard, Retourné
- **Date de retour effective** (si retourné)

#### Étape 3 : Navigation
- **Filtrer** par statut (En cours, Retournés, En retard)
- **Rechercher** dans vos emprunts
- **Voir les détails** d'un média emprunté

**ℹ️ Note** : Cette section permet uniquement de **consulter** vos emprunts. Pour emprunter ou retourner des médias, rendez-vous à la médiathèque où le personnel vous aidera.

### Organisation des favoris

#### Filtrage
- **Par type** : Livres, Films, Musique
- **Par catégorie** : Genre, thème
- **Par disponibilité** : Disponible, Emprunté

#### Tri
- **Par date d'ajout** : Plus récents en premier
- **Par titre** : Ordre alphabétique
- **Par auteur** : Regroupement par créateur

## 👨‍💼 Administration

### Accès au dashboard administrateur

#### Étape 1 : Connexion en tant qu'admin/employé
1. **Se connecter** avec un compte administrateur ou employé
2. **Menu admin** apparaît dans le header
3. **Cliquer sur "Administration"**

#### Étape 2 : Dashboard principal
1. **Vue d'ensemble** des statistiques
2. **Alertes** et notifications importantes
3. **Activité récente** de la médiathèque

### Gestion des utilisateurs (Admin uniquement)

#### Étape 1 : Accès à la gestion
1. **Dans le menu admin**, cliquer sur "Utilisateurs"
2. **Liste des utilisateurs** s'affiche
3. **Filtres et recherche** disponibles

#### Étape 2 : Actions sur les utilisateurs
- **Voir le profil** : Cliquer sur un utilisateur
- **Modifier** : Éditer les informations
- **Gérer les rôles** : User, Employee, Admin
- **Désactiver** : Suspendre temporairement
- **Supprimer** : Supprimer définitivement

### Gestion des médias (Admin uniquement)

#### Étape 1 : Accès au catalogue admin
1. **Dans le menu admin**, cliquer sur "Médias"
2. **Catalogue administrateur** s'affiche
3. **Outils de gestion** disponibles

#### Étape 2 : Actions sur les médias
- **Ajouter manuellement** : Nouveau média avec formulaire
- **Importer via API** : Google Books, TMDB, MusicBrainz
- **Modifier** : Éditer les informations
- **Supprimer** : Retirer du catalogue
- **Gérer la disponibilité** : Marquer disponible/indisponible

### Gestion des emprunts (Admin/Employé)

#### Étape 1 : Vue d'ensemble
1. **Dans le menu admin**, cliquer sur "Emprunts"
2. **Liste de tous les emprunts** s'affiche
3. **Filtres par statut** disponibles

#### Étape 2 : Création d'emprunts
1. **Cliquer sur "Créer un emprunt"**
2. **Sélectionner l'utilisateur** (recherche par nom/email)
3. **Sélectionner le média** (recherche par titre)
4. **Définir la date de retour** (par défaut +14 jours)
5. **Confirmer l'emprunt**

#### Étape 3 : Actions administratives
- **Voir les détails** : Informations complètes
- **Modifier le statut** : Mettre à jour
- **Marquer comme retourné** : Clôturer l'emprunt
- **Gérer les retards** : Notifications automatiques

### Gestion des catégories et tags (Admin uniquement)

#### Catégories
- **Créer** de nouvelles catégories
- **Modifier** les catégories existantes
- **Supprimer** les catégories inutilisées

#### Tags
- **Créer** de nouveaux tags
- **Modifier** les tags existants
- **Supprimer** les tags inutilisés

## 🔧 Paramètres et préférences

### Gestion du profil

#### Étape 1 : Accès aux paramètres
1. **Cliquer sur votre nom** dans le header
2. **Menu déroulant** s'affiche
3. **Sélectionner "Mon profil"**

#### Étape 2 : Modification des informations
- **Informations personnelles** : Nom, email
- **Changement de mot de passe** : Sécurité
- **Compte** : Désactivation

### Notifications

#### Types de notifications
- **Emails** : Confirmations, rappels
- **Notifications push** : Rappels de retour
- **SMS** : Alertes importantes (optionnel)

### Sécurité du compte

#### Changement de mot de passe
1. **Dans "Mon profil"**, section "Sécurité"
2. **Saisir l'ancien mot de passe**
3. **Nouveau mot de passe** (minimum 8 caractères)
4. **Confirmer** le nouveau mot de passe
5. **Sauvegarder** les modifications

#### Déconnexion
1. **Cliquer sur votre nom** dans le header
2. **Sélectionner "Se déconnecter"**
3. **Session fermée** et redirection vers l'accueil

#### Comment emprunter un média ?
**Les emprunts se font uniquement sur place à la médiathèque** par le personnel. Consultez le catalogue en ligne pour vérifier la disponibilité avant de vous déplacer.
