import { useEffect } from 'react';
import type { MetaTags } from '../../config/metaTags';

interface MetaTagsProps {
  metaTags: MetaTags;
}

export const MetaTagsComponent: React.FC<MetaTagsProps> = ({ metaTags }) => {
  useEffect(() => {
    // Mise à jour du titre de la page
    document.title = metaTags.title;

    // Mise à jour des meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(
        `meta[name="${name}"]`
      ) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updatePropertyMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(
        `meta[property="${property}"]`
      ) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Mise à jour des meta tags de base
    if (metaTags.description) {
      updateMetaTag('description', metaTags.description);
    } else {
      // Si pas de description, utiliser la description par défaut
      updateMetaTag(
        'description',
        'Médiathèque - Découvrez notre collection de médias'
      );
    }

    if (metaTags.keywords) {
      updateMetaTag('keywords', metaTags.keywords);
    }

    // Mise à jour des meta tags Open Graph
    updatePropertyMetaTag('og:title', metaTags.title);
    updatePropertyMetaTag(
      'og:description',
      metaTags.description ||
        'Médiathèque - Découvrez notre collection de médias'
    );

    if (metaTags.ogImage) {
      updatePropertyMetaTag('og:image', metaTags.ogImage);
    }

    // Mise à jour des meta tags Twitter
    updatePropertyMetaTag('twitter:title', metaTags.title);
    updatePropertyMetaTag(
      'twitter:description',
      metaTags.description ||
        'Médiathèque - Découvrez notre collection de médias'
    );

    if (metaTags.ogImage) {
      updatePropertyMetaTag('twitter:image', metaTags.ogImage);
    }

    // Mise à jour du lien canonique
    if (metaTags.canonical) {
      let canonical = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = metaTags.canonical;
    }

    // Nettoyage lors du démontage du composant
    return () => {
      // Optionnel : restaurer les meta tags par défaut
      document.title = 'Médiathèque - Découvrez notre collection de médias';
    };
  }, [metaTags]);

  // Ce composant ne rend rien visuellement
  return null;
};
