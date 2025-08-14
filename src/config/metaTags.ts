import { siteConfig, buildUrl, getOgImageUrl } from './siteConfig';

export interface MetaTags {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export const defaultMetaTags: MetaTags = {
  title: `${siteConfig.name} - Découvrez notre collection de médias`,
  description: siteConfig.defaultDescription,
  keywords:
    'médiathèque, bibliothèque, livres, films, musique, emprunt, culture, médias',
  ogImage: getOgImageUrl(),
  canonical: buildUrl(),
};

export const pageMetaTags: Record<string, MetaTags> = {
  home: {
    title: 'Médiathèque - Découvrez notre collection de médias',
    description:
      'Bienvenue dans notre médiathèque. Explorez des milliers de livres, films, CD et autres médias. Empruntez facilement et enrichissez vos connaissances.',
    keywords: 'médiathèque, accueil, bibliothèque, culture, médias',
  },
  catalog: {
    title: 'Catalogue - Médiathèque',
    description:
      'Parcourez notre catalogue complet de médias. Trouvez facilement des livres, films, musique et plus encore grâce à nos filtres avancés.',
    keywords:
      'catalogue, recherche, livres, films, musique, filtres, médiathèque',
  },
  about: {
    title: 'À propos - Médiathèque',
    description:
      "Découvrez l'histoire de notre médiathèque, nos missions et nos valeurs. Nous nous engageons à promouvoir la culture et l'accès au savoir.",
    keywords: 'à propos, histoire, mission, valeurs, médiathèque, culture',
  },
  contact: {
    title: 'Contact - Médiathèque',
    description:
      'Contactez notre équipe de médiathèque. Nous sommes là pour vous aider et répondre à toutes vos questions sur nos services.',
    keywords: 'contact, aide, support, médiathèque, services',
  },
  login: {
    title: 'Connexion - Médiathèque',
    description:
      'Connectez-vous à votre compte médiathèque pour accéder à vos emprunts, favoris et profiter de tous nos services.',
    keywords: 'connexion, compte, authentification, médiathèque',
  },
  register: {
    title: 'Inscription - Médiathèque',
    description:
      "Créez votre compte médiathèque gratuitement. Accédez à nos services d'emprunt et découvrez notre collection de médias.",
    keywords: 'inscription, compte, adhésion, médiathèque, gratuit',
  },

  // Pages utilisateur (avec titre uniquement)
  dashboard: {
    title: 'Tableau de bord - Médiathèque',
  },
  myBorrows: {
    title: 'Mes emprunts - Médiathèque',
  },
  favorites: {
    title: 'Mes favoris - Médiathèque',
  },
  settings: {
    title: 'Paramètres - Médiathèque',
  },

  // Pages admin (avec titre uniquement)
  adminDashboard: {
    title: 'Administration - Médiathèque',
  },
  adminMedia: {
    title: 'Gestion des médias - Médiathèque',
  },
  adminUsers: {
    title: 'Gestion des utilisateurs - Médiathèque',
  },
  adminBorrows: {
    title: 'Gestion des emprunts - Médiathèque',
  },
  adminCategories: {
    title: 'Gestion des catégories - Médiathèque',
  },
  adminUserDetail: {
    title: 'Détail utilisateur - Médiathèque',
  },

  // Pages d'authentification
  forgotPassword: {
    title: 'Mot de passe oublié - Médiathèque',
  },
  resetPassword: {
    title: 'Réinitialisation du mot de passe - Médiathèque',
  },
};

export const generateMetaTags = (
  pageKey: string,
  customData?: Partial<MetaTags>
): MetaTags => {
  const pageTags = pageMetaTags[pageKey] || defaultMetaTags;
  return {
    ...defaultMetaTags,
    ...pageTags,
    ...customData,
  };
};
