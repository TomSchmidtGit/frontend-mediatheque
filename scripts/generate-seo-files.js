#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le répertoire du script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire la configuration depuis siteConfig.ts
const readSiteConfig = () => {
  try {
    const configPath = path.join(__dirname, '../src/config/siteConfig.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Extraire le domaine et la description depuis le fichier
    const domainMatch = configContent.match(
      /domain:\s*import\.meta\.env\.VITE_SITE_DOMAIN\s*\|\|\s*['"`]([^'"`]+)['"`]/
    );
    const nameMatch = configContent.match(/name:\s*['"`]([^'"`]+)['"`]/);
    const descriptionMatch = configContent.match(
      /defaultDescription:\s*['"`]([^'"`]+)['"`]/
    );

    return {
      domain:
        process.env.VITE_SITE_DOMAIN ||
        (domainMatch
          ? domainMatch[1]
          : 'https://frontend-mediatheque.vercel.app'),
      name: nameMatch ? nameMatch[1] : 'Médiathèque',
      defaultDescription: descriptionMatch
        ? descriptionMatch[1]
        : 'Explorez notre vaste collection de livres, films, musique et autres médias. Empruntez, découvrez et enrichissez vos connaissances avec notre médiathèque.',
    };
  } catch (error) {
    console.warn(
      '⚠️  Impossible de lire siteConfig.ts, utilisation des valeurs par défaut'
    );
    return {
      domain:
        process.env.VITE_SITE_DOMAIN ||
        'https://frontend-mediatheque.vercel.app',
      name: 'Médiathèque',
      defaultDescription:
        'Explorez notre vaste collection de livres, films, musique et autres médias. Empruntez, découvrez et enrichissez vos connaissances avec notre médiathèque.',
    };
  }
};

// Configuration du site (lue depuis siteConfig.ts)
const siteConfig = readSiteConfig();

// Fonction pour construire des URLs
const buildUrl = (pathParam = '') => {
  const cleanPath = pathParam.startsWith('/') ? pathParam : `/${pathParam}`;
  return `${siteConfig.domain}${cleanPath}`;
};

// Génération du robots.txt
const generateRobotsTxt = () => {
  const content = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${buildUrl('sitemap.xml')}

# Empecher l'indexation des pages d'administration
Disallow: /admin/
Disallow: /api/

# Autoriser l'indexation des pages publiques
Allow: /catalog
Allow: /about
Allow: /contact
Allow: /media/

# Delai entre les requetes (en secondes)
Crawl-delay: 1
`;

  fs.writeFileSync(path.join(__dirname, '../public/robots.txt'), content);
  console.log('✅ robots.txt généré');
};

// Génération du sitemap.xml
const generateSitemap = () => {
  const currentDate = new Date().toISOString().split('T')[0];

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Page d'accueil -->
  <url>
    <loc>${buildUrl()}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Catalogue -->
  <url>
    <loc>${buildUrl('catalog')}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- À propos -->
  <url>
    <loc>${buildUrl('about')}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Contact -->
  <url>
    <loc>${buildUrl('contact')}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Conditions d'utilisation -->
  <url>
    <loc>${buildUrl('terms')}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>

  <!-- Politique de confidentialité -->
  <url>
    <loc>${buildUrl('privacy')}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>

  <!-- Page de connexion -->
  <url>
    <loc>${buildUrl('login')}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Page d'inscription -->
  <url>
    <loc>${buildUrl('register')}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

  fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), content);
  console.log('✅ sitemap.xml généré');
};

// Génération du manifest.json
const generateManifest = () => {
  const content = JSON.stringify(
    {
      name: siteConfig.name,
      short_name: siteConfig.name,
      description: siteConfig.defaultDescription,
      start_url: '/',
      display: 'standalone',
      background_color: '#667eea',
      theme_color: '#667eea',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
      categories: ['education', 'books', 'entertainment'],
      lang: 'fr',
      dir: 'ltr',
    },
    null,
    2
  );

  fs.writeFileSync(path.join(__dirname, '../public/manifest.json'), content);
  console.log('✅ manifest.json généré');
};

// Mise à jour d'index.html avec la configuration
const updateIndexHtml = () => {
  const indexPath = path.join(__dirname, '../index.html');
  let content = fs.readFileSync(indexPath, 'utf8');

  // Remplacer le domaine dans les meta tags
  content = content.replace(/https:\/\/votre-domaine\.com/g, siteConfig.domain);

  fs.writeFileSync(indexPath, content);
  console.log('✅ index.html mis à jour');
};

// Fonction principale
const main = () => {
  console.log('🚀 Génération des fichiers SEO...');
  console.log(`📍 Domaine configuré : ${siteConfig.domain}`);
  console.log('');

  try {
    generateRobotsTxt();
    generateSitemap();
    generateManifest();
    updateIndexHtml();

    console.log('');
    console.log('🎉 Tous les fichiers SEO ont été générés avec succès !');
    console.log('');
    console.log(
      '📝 Pour changer le domaine, modifiez la variable VITE_SITE_DOMAIN'
    );
    console.log('   ou éditez le script scripts/generate-seo-files.js');
  } catch (error) {
    console.error('❌ Erreur lors de la génération :', error.message);
    process.exit(1);
  }
};

// Exécution du script
main();
