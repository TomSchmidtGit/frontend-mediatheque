// Configuration centralisée du site
export const siteConfig = {
  // Domaine principal du site
  domain:
    import.meta.env.VITE_SITE_DOMAIN ||
    'https://frontend-mediatheque.vercel.app',

  // Nom du site
  name: 'Médiathèque',

  // Description par défaut
  defaultDescription:
    'Explorez notre vaste collection de livres, films, musique et autres médias. Empruntez, découvrez et enrichissez vos connaissances avec notre médiathèque.',

  // Couleurs principales
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    text: '#2d3748',
    background: '#f7fafc',
  },

  // Contact
  contact: {
    email: 'contact@mediatheque.com',
    phone: '+33 1 23 45 67 89',
  },

  // Réseaux sociaux
  social: {
    facebook: 'https://facebook.com/votre-mediatheque',
    twitter: 'https://twitter.com/votre-mediatheque',
    instagram: 'https://instagram.com/votre-mediatheque',
  },
};

// Fonction utilitaire pour construire des URLs complètes
export const buildUrl = (path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.domain}${cleanPath}`;
};

// Fonction utilitaire pour obtenir l'URL de l'image Open Graph
export const getOgImageUrl = (): string => {
  return buildUrl('mediatheque-og.png');
};
