#!/bin/bash

# Script de configuration de la CI pour le frontend médiathèque
# Usage: ./scripts/setup-ci.sh

set -e

echo "🚀 Configuration de la CI pour le frontend médiathèque..."

# Vérification des prérequis
echo "🔍 Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Prérequis vérifiés"

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Installation de pre-commit
echo "🔧 Installation de pre-commit..."
pip install pre-commit || npm install -g pre-commit || echo "⚠️  Impossible d'installer pre-commit globalement"

# Configuration des hooks pre-commit
echo "🔧 Configuration des hooks pre-commit..."
if command -v pre-commit &> /dev/null; then
    pre-commit install
    pre-commit install --hook-type commit-msg
    echo "✅ Hooks pre-commit installés"
else
    echo "⚠️  Pre-commit n'est pas installé. Les hooks ne seront pas configurés automatiquement."
fi

# Vérification de la configuration
echo "🔍 Vérification de la configuration..."

# Test du lint
echo "🧪 Test du lint..."
npm run lint --silent || echo "⚠️  Le lint a des erreurs"

# Test du formatage
echo "✨ Test du formatage..."
npm run format:check --silent || echo "⚠️  Le formatage a des erreurs"

# Test des tests
echo "🧪 Test des tests..."
npm run test:run --silent || echo "⚠️  Les tests ont des erreurs"

echo ""
echo "🎉 Configuration de la CI terminée pour le frontend !"
echo ""
echo "📋 Commandes disponibles :"
echo "  npm run lint          - Vérifier le code (lint)"
echo "  npm run lint:fix      - Correction automatique du code"
echo "  npm run format        - Formater le code"
echo "  npm run format:check  - Vérifier le formatage"
echo "  npm run test          - Exécuter les tests"
echo "  npm run ci            - Exécuter la CI complète"
echo "  npm run setup:pre-commit - Installer les hooks pre-commit"
echo ""
echo "🔧 Hooks pre-commit :"
echo "  Les hooks pre-commit sont configurés pour s'exécuter automatiquement"
echo "  lors de chaque commit. Ils vérifient :"
echo "  - La qualité du code (ESLint)"
echo "  - Le formatage (Prettier)"
echo "  - Les tests"
echo "  - La sécurité des dépendances"
