#!/bin/bash

# Script de nettoyage automatique des erreurs de linting
# Usage: ./scripts/cleanup-lint.sh

set -e

echo "🧹 Nettoyage automatique des erreurs de linting..."

# 1. Supprimer les imports non utilisés automatiquement
echo "📦 Suppression des imports non utilisés..."
npx unimported --write

# 2. Supprimer les variables non utilisées
echo "🗑️  Suppression des variables non utilisées..."
npx ts-unused-exports --fix

# 3. Correction automatique ESLint
echo "🔧 Correction automatique ESLint..."
npm run lint:fix

# 4. Vérification du résultat
echo "✅ Vérification du résultat..."
npm run lint

echo "🎉 Nettoyage terminé !"
