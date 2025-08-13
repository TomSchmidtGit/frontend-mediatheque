import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AboutPage from '../../pages/public/AboutPage';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  BookOpenIcon: ({ className, ...props }) => <div data-testid="book-icon" className={className} {...props} />,
  HeartIcon: ({ className, ...props }) => <div data-testid="heart-icon" className={className} {...props} />,
  UsersIcon: ({ className, ...props }) => <div data-testid="users-icon" className={className} {...props} />,
  GlobeAltIcon: ({ className, ...props }) => <div data-testid="globe-icon" className={className} {...props} />,
  AcademicCapIcon: ({ className, ...props }) => <div data-testid="academic-icon" className={className} {...props} />,
  LightBulbIcon: ({ className, ...props }) => <div data-testid="lightbulb-icon" className={className} {...props} />,
  CheckCircleIcon: ({ className, ...props }) => <div data-testid="check-icon" className={className} {...props} />,
  EnvelopeIcon: ({ className, ...props }) => <div data-testid="envelope-icon" className={className} {...props} />,
  MapPinIcon: ({ className, ...props }) => <div data-testid="map-pin-icon" className={className} {...props} />,
  ClockIcon: ({ className, ...props }) => <div data-testid="clock-icon" className={className} {...props} />,
  PhoneIcon: ({ className, ...props }) => <div data-testid="phone-icon" className={className} {...props} />,
}));

// Wrapper pour fournir le contexte de routeur
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AboutPage', () => {
  describe('Affichage de base', () => {
    it('affiche le titre principal "À propos de notre Médiathèque"', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('À propos de notre')).toBeInTheDocument();
      expect(screen.getByText('Médiathèque')).toBeInTheDocument();
    });

    it('affiche la description principale', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText(/Depuis 1984, nous mettons la culture à portée de tous avec passion et engagement/)).toBeInTheDocument();
    });

    it('affiche les boutons d\'action dans le hero', () => {
      renderWithRouter(<AboutPage />);
      const catalogLinks = screen.getAllByRole('link', { name: /Explorer le catalogue/i });
      expect(catalogLinks.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('link', { name: /Nous contacter/i })).toBeInTheDocument();
    });
  });

  describe('Section Mission', () => {
    it('affiche le titre "Notre mission"', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('Notre mission')).toBeInTheDocument();
    });

    it('affiche la description de la mission', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText(/Démocratiser l'accès à la culture et au savoir/)).toBeInTheDocument();
    });

    it('affiche le titre "Nos objectifs"', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('🎯 Nos objectifs')).toBeInTheDocument();
    });

    it('affiche tous les objectifs avec des icônes de validation', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('Faciliter l\'accès aux ressources culturelles')).toBeInTheDocument();
      expect(screen.getByText('Accompagner les usagers dans leurs découvertes')).toBeInTheDocument();
      expect(screen.getByText('Créer du lien social autour de la culture')).toBeInTheDocument();
      expect(screen.getByText('Innover dans nos services et notre approche')).toBeInTheDocument();
      expect(screen.getByText('Soutenir l\'éducation et la formation')).toBeInTheDocument();
      
      // Vérifier que les icônes de validation sont présentes
      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons.length).toBeGreaterThanOrEqual(5);
    });

    it('affiche les réalisations avec les bonnes statistiques', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('1000+')).toBeInTheDocument();
      expect(screen.getByText('Médias disponibles')).toBeInTheDocument();
      expect(screen.getByText('500+')).toBeInTheDocument();
      expect(screen.getByText('Utilisateurs actifs')).toBeInTheDocument();
      expect(screen.getByText('41')).toBeInTheDocument();
      expect(screen.getByText('Années d\'expérience')).toBeInTheDocument();
      expect(screen.getByText('50+')).toBeInTheDocument();
      expect(screen.getByText('Événements par an')).toBeInTheDocument();
    });
  });

  describe('Section Valeurs', () => {
    it('affiche le titre "Nos valeurs"', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('Nos valeurs')).toBeInTheDocument();
    });

    it('affiche la description des valeurs', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText(/Des principes fondamentaux qui guident chacune de nos actions/)).toBeInTheDocument();
    });

    it('affiche toutes les valeurs avec leurs icônes', () => {
      renderWithRouter(<AboutPage />);
      
      // Vérifier les titres des valeurs
      expect(screen.getByText('Accès libre au savoir')).toBeInTheDocument();
      expect(screen.getByText('Communauté inclusive')).toBeInTheDocument();
      expect(screen.getByText('Innovation continue')).toBeInTheDocument();
      expect(screen.getByText('Passion culturelle')).toBeInTheDocument();
      expect(screen.getByText('Ouverture sur le monde')).toBeInTheDocument();
      expect(screen.getByText('Accompagnement éducatif')).toBeInTheDocument();

      // Vérifier les descriptions
      expect(screen.getByText(/Nous croyons que la connaissance doit être accessible à tous/)).toBeInTheDocument();
      expect(screen.getByText(/Nous favorisons les échanges et créons des liens entre les générations/)).toBeInTheDocument();
      expect(screen.getByText(/Nous intégrons les nouvelles technologies au service de nos usagers/)).toBeInTheDocument();
      expect(screen.getByText(/Nous partageons notre amour pour la lecture, le cinéma et la musique/)).toBeInTheDocument();
      expect(screen.getByText(/Nous proposons des contenus diversifiés reflétant la richesse culturelle mondiale/)).toBeInTheDocument();
      expect(screen.getByText(/Nous soutenons l'apprentissage et la recherche à tous les niveaux/)).toBeInTheDocument();

      // Vérifier que les icônes sont présentes
      expect(screen.getAllByTestId('book-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('users-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('lightbulb-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('heart-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('globe-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('academic-icon').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Section Équipe', () => {
    it('affiche le titre "Notre équipe"', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('Notre équipe')).toBeInTheDocument();
    });

    it('affiche la description de l\'équipe', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText(/Des professionnels passionnés et expérimentés/)).toBeInTheDocument();
    });

    it('affiche tous les membres de l\'équipe', () => {
      renderWithRouter(<AboutPage />);
      
      // Vérifier les noms
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.getByText('Pierre Martin')).toBeInTheDocument();
      expect(screen.getByText('Sophie Leroy')).toBeInTheDocument();
      expect(screen.getByText('Thomas Moreau')).toBeInTheDocument();

      // Vérifier les rôles
      expect(screen.getByText('Directrice de la médiathèque')).toBeInTheDocument();
      expect(screen.getByText('Responsable collections numériques')).toBeInTheDocument();
      expect(screen.getByText('Bibliothécaire jeunesse')).toBeInTheDocument();
      expect(screen.getByText('Chargé des partenariats')).toBeInTheDocument();

      // Vérifier les descriptions
      expect(screen.getByText(/Passionnée de littérature avec 15 ans d'expérience/)).toBeInTheDocument();
      expect(screen.getByText(/Expert en technologies éducatives et gestion des ressources multimédia/)).toBeInTheDocument();
      expect(screen.getByText(/Spécialisée dans l'animation culturelle et l'accompagnement des jeunes lecteurs/)).toBeInTheDocument();
      expect(screen.getByText(/Développe les collaborations avec les écoles et associations locales/)).toBeInTheDocument();
    });

    it('affiche les images des membres de l\'équipe', () => {
      renderWithRouter(<AboutPage />);
      const teamImages = screen.getAllByAltText(/Marie Dubois|Pierre Martin|Sophie Leroy|Thomas Moreau/);
      expect(teamImages.length).toBe(4);
    });
  });

  describe('Section Services', () => {
    it('affiche le titre "Nos services"', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('Nos services')).toBeInTheDocument();
    });

    it('affiche la description des services', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText(/Une gamme complète de services pensés pour répondre aux besoins/)).toBeInTheDocument();
    });

    it('affiche tous les services avec des icônes de validation', () => {
      renderWithRouter(<AboutPage />);
      
      expect(screen.getByText('Prêt de livres, films et musiques')).toBeInTheDocument();
      expect(screen.getByText('Accès aux ressources numériques')).toBeInTheDocument();
      expect(screen.getByText('Espaces de travail et de lecture')).toBeInTheDocument();
      expect(screen.getByText('Animations culturelles régulières')).toBeInTheDocument();
      expect(screen.getByText('Accueil de groupes scolaires')).toBeInTheDocument();
      expect(screen.getByText('Conseil et orientation documentaire')).toBeInTheDocument();

      // Vérifier que les icônes de validation sont présentes
      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons.length).toBeGreaterThanOrEqual(6);
    });

    it('affiche la section "Informations pratiques"', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('📍 Informations pratiques')).toBeInTheDocument();
    });

    it('affiche les informations de contact dans la section pratique', () => {
      renderWithRouter(<AboutPage />);
      
      // Adresse
      const addressElements = screen.getAllByText('Adresse');
      expect(addressElements.length).toBeGreaterThanOrEqual(1);
      
      // Utiliser getAllByText car l'adresse apparaît plusieurs fois
      const addressTexts = screen.getAllByText(/79 Rue des Jardiniers/);
      expect(addressTexts.length).toBeGreaterThanOrEqual(1);
      const cityTexts = screen.getAllByText(/69400 Villefranche-sur-Saône/);
      expect(cityTexts.length).toBeGreaterThanOrEqual(1);

      // Horaires - vérifier seulement la présence du titre
      const horairesElements = screen.getAllByText('Horaires d\'ouverture');
      expect(horairesElements.length).toBeGreaterThanOrEqual(1);
      
      // Ne pas tester le contenu spécifique des horaires car ils apparaissent à plusieurs endroits
      // et peuvent être divisés en plusieurs éléments

      // Contact
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('04 74 60 00 00')).toBeInTheDocument();
      expect(screen.getByText('contact@mediatheque.fr')).toBeInTheDocument();
    });

    it('affiche les boutons d\'action dans la section pratique', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByRole('link', { name: /Formulaire de contact/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Appeler maintenant/i })).toBeInTheDocument();
      expect(screen.getByText('contact@mediatheque.fr')).toBeInTheDocument();
    });
  });

  describe('Section Localisation', () => {
    it('affiche le titre "Notre localisation"', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('📍 Notre localisation')).toBeInTheDocument();
    });

    it('affiche la description de localisation', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText(/Venez nous rendre visite dans nos locaux situés au cœur de Villefranche-sur-Saône/)).toBeInTheDocument();
    });

    it('affiche les informations détaillées d\'adresse', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('Médiathèque')).toBeInTheDocument();
      
      // Utiliser getAllByText car l'adresse apparaît plusieurs fois
      const addressTexts = screen.getAllByText(/79 Rue des Jardiniers/);
      expect(addressTexts.length).toBeGreaterThanOrEqual(1);
      const cityTexts = screen.getAllByText(/69400 Villefranche-sur-Saône/);
      expect(cityTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('affiche les horaires détaillés', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('Mardi, Mercredi, Vendredi, Samedi')).toBeInTheDocument();
      expect(screen.getByText('10h00 - 18h00')).toBeInTheDocument();
      expect(screen.getByText('Jeudi')).toBeInTheDocument();
      expect(screen.getByText('16h00 - 20h00')).toBeInTheDocument();
      expect(screen.getByText('Lundi et Dimanche')).toBeInTheDocument();
      expect(screen.getByText('Fermé')).toBeInTheDocument();
    });

    it('affiche les boutons d\'action de localisation', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('Voir sur Google Maps')).toBeInTheDocument();
      expect(screen.getByText('04 74 60 00 00')).toBeInTheDocument();
    });
  });

  describe('Section CTA', () => {
    it('affiche le titre "Rejoignez notre communauté !"', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText('Rejoignez notre communauté !')).toBeInTheDocument();
    });

    it('affiche la description de la section CTA', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByText(/Inscrivez-vous dès aujourd'hui et découvrez tout ce que notre médiathèque peut vous offrir/)).toBeInTheDocument();
    });

    it('affiche les boutons d\'action dans le CTA', () => {
      renderWithRouter(<AboutPage />);
      expect(screen.getByRole('link', { name: /S'inscrire maintenant/i })).toBeInTheDocument();
      const catalogLinks = screen.getAllByRole('link', { name: /Explorer le catalogue/i });
      expect(catalogLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Navigation et liens', () => {
    it('contient tous les liens de navigation vers les pages principales', () => {
      renderWithRouter(<AboutPage />);
      
      const catalogLinks = screen.getAllByRole('link', { name: /catalogue|explorer/i });
      const contactLinks = screen.getAllByRole('link', { name: /contacter|contact/i });
      const registerLinks = screen.getAllByRole('link', { name: /inscrire|inscription/i });

      expect(catalogLinks.length).toBeGreaterThanOrEqual(2);
      expect(contactLinks.length).toBeGreaterThanOrEqual(2);
      expect(registerLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('tous les liens ont des attributs href valides', () => {
      renderWithRouter(<AboutPage />);
      
      const catalogLinks = screen.getAllByRole('link', { name: /catalogue|explorer/i });
      const contactLinks = screen.getAllByRole('link', { name: /contacter|contact/i });
      const registerLinks = screen.getAllByRole('link', { name: /inscrire|inscription/i });

      catalogLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/catalog');
      });

      // Les liens de contact peuvent être soit vers /contact soit des liens mailto
      contactLinks.forEach(link => {
        const href = link.getAttribute('href');
        expect(href === '/contact' || href.startsWith('mailto:') || href.startsWith('tel:')).toBe(true);
      });

      registerLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/register');
      });
    });

    it('affiche les liens externes avec les bons attributs', () => {
      renderWithRouter(<AboutPage />);
      
      const mapsLink = screen.getByText('Voir sur Google Maps');
      expect(mapsLink.closest('a')).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=79+Rue+des+Jardiniers,+69400+Villefranche-sur-Saône');
      expect(mapsLink.closest('a')).toHaveAttribute('target', '_blank');
      expect(mapsLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');

      const phoneLink = screen.getByText('04 74 60 00 00');
      expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:0474600000');

      const emailLink = screen.getByText('contact@mediatheque.fr');
      expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:contact@mediatheque.fr?subject=Contact depuis la page A propos');
    });
  });

  describe('Structure et layout', () => {
    it('affiche la page avec la classe de fond blanc', () => {
      renderWithRouter(<AboutPage />);
      const mainContainer = document.querySelector('.bg-white');
      expect(mainContainer).toBeInTheDocument();
    });

    it('affiche la section hero avec le dégradé', () => {
      renderWithRouter(<AboutPage />);
      const heroSection = document.querySelector('.bg-gradient-to-br');
      expect(heroSection).toBeInTheDocument();
    });

    it('affiche la section mission avec le fond gris', () => {
      renderWithRouter(<AboutPage />);
      const missionSection = document.querySelector('.bg-gray-50');
      expect(missionSection).toBeInTheDocument();
    });

    it('affiche la section équipe avec le fond gris', () => {
      renderWithRouter(<AboutPage />);
      const teamSections = document.querySelectorAll('.bg-gray-50');
      expect(teamSections.length).toBeGreaterThanOrEqual(1);
    });

    it('affiche la section CTA avec le fond primaire', () => {
      renderWithRouter(<AboutPage />);
      const ctaSection = document.querySelector('.bg-primary-600');
      expect(ctaSection).toBeInTheDocument();
    });

    it('affiche la grille responsive pour les valeurs', () => {
      renderWithRouter(<AboutPage />);
      const valuesGrid = document.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(valuesGrid).toBeInTheDocument();
    });

    it('affiche la grille responsive pour l\'équipe', () => {
      renderWithRouter(<AboutPage />);
      const teamGrid = document.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(teamGrid).toBeInTheDocument();
    });
  });

  describe('Icônes et éléments visuels', () => {
    it('affiche toutes les icônes nécessaires', () => {
      renderWithRouter(<AboutPage />);
      
      // Vérifier la présence des icônes principales
      expect(screen.getAllByTestId('book-icon').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByTestId('envelope-icon').length).toBeGreaterThanOrEqual(3);
      expect(screen.getAllByTestId('map-pin-icon').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByTestId('clock-icon').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByTestId('phone-icon').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByTestId('users-icon').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByTestId('heart-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('globe-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('academic-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('lightbulb-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('check-icon').length).toBeGreaterThanOrEqual(11);
    });

    it('affiche la carte interactive', () => {
      renderWithRouter(<AboutPage />);
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('title', 'Localisation de la Médiathèque CRM');
    });
  });

  describe('Accessibilité et navigation', () => {
    it('affiche des titres avec une hiérarchie correcte', () => {
      renderWithRouter(<AboutPage />);
      
      // Vérifier que h1 est unique et bien présent
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent(/À propos de notre.*Médiathèque/);

      // Vérifier la présence des h2
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThanOrEqual(5); // Mission, Valeurs, Équipe, Services, CTA
    });

    it('affiche des images avec des attributs alt appropriés', () => {
      renderWithRouter(<AboutPage />);
      
      const images = screen.getAllByRole('img');
      images.forEach(image => {
        expect(image).toHaveAttribute('alt');
        expect(image.getAttribute('alt')).not.toBe('');
      });
    });

    it('affiche des liens avec des textes descriptifs', () => {
      renderWithRouter(<AboutPage />);
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link.textContent).toBeTruthy();
        expect(link.textContent.trim()).not.toBe('');
      });
    });

    it('affiche la carte avec des attributs d\'accessibilité appropriés', () => {
      renderWithRouter(<AboutPage />);
      
      const iframe = screen.getByTitle('Localisation de la Médiathèque CRM');
      expect(iframe).toHaveAttribute('title');
      expect(iframe).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Responsive design et layout', () => {
    it('affiche la grille des valeurs avec des classes responsive appropriées', () => {
      renderWithRouter(<AboutPage />);
      
      const valuesGrid = document.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(valuesGrid).toBeInTheDocument();
      expect(valuesGrid).toHaveClass('grid');
      expect(valuesGrid).toHaveClass('md:grid-cols-2');
      expect(valuesGrid).toHaveClass('lg:grid-cols-3');
    });

    it('affiche la grille de l\'équipe avec des classes responsive appropriées', () => {
      renderWithRouter(<AboutPage />);
      
      const teamGrid = document.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(teamGrid).toBeInTheDocument();
      expect(teamGrid).toHaveClass('grid');
      expect(teamGrid).toHaveClass('md:grid-cols-2');
      expect(teamGrid).toHaveClass('lg:grid-cols-4');
    });

    it('affiche les boutons d\'action avec des classes responsive', () => {
      renderWithRouter(<AboutPage />);
      
      const heroButtons = document.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(heroButtons).toBeInTheDocument();
      expect(heroButtons).toHaveClass('flex-col');
      expect(heroButtons).toHaveClass('sm:flex-row');
    });

    it('affiche la section de localisation avec une grille responsive', () => {
      renderWithRouter(<AboutPage />);
      
      const locationGrid = document.querySelector('.grid.lg\\:grid-cols-2');
      expect(locationGrid).toBeInTheDocument();
      expect(locationGrid).toHaveClass('grid');
      expect(locationGrid).toHaveClass('lg:grid-cols-2');
    });
  });

  describe('Interactions et effets visuels', () => {
    it('affiche des éléments avec des classes de transition appropriées', () => {
      renderWithRouter(<AboutPage />);
      
      // Vérifier les transitions sur les cartes de valeurs
      const valueCards = document.querySelectorAll('.group.bg-white.rounded-xl');
      valueCards.forEach(card => {
        expect(card).toHaveClass('transition-all');
        expect(card).toHaveClass('duration-300');
        expect(card).toHaveClass('hover:-translate-y-2');
      });

      // Vérifier les transitions sur les cartes de l'équipe
      const teamCards = document.querySelectorAll('.bg-white.rounded-xl.overflow-hidden.shadow-lg');
      teamCards.forEach(card => {
        expect(card).toHaveClass('transition-all');
        expect(card).toHaveClass('duration-300');
        expect(card).toHaveClass('hover:-translate-y-2');
      });
    });

    it('affiche des éléments avec des effets de hover appropriés', () => {
      renderWithRouter(<AboutPage />);
      
      // Vérifier les effets de hover sur les icônes
      const valueIcons = document.querySelectorAll('.group-hover\\:scale-110');
      expect(valueIcons.length).toBeGreaterThan(0);

      // Vérifier les effets de hover sur les boutons
      const hoverButtons = document.querySelectorAll('.hover\\:bg-primary-50, .hover\\:bg-white');
      expect(hoverButtons.length).toBeGreaterThan(0);
    });

    it('affiche des éléments avec des animations CSS appropriées', () => {
      renderWithRouter(<AboutPage />);
      
      // Vérifier les animations sur le hero
      const heroTitle = document.querySelector('.animate-fade-in');
      const heroDescription = document.querySelector('.animate-slide-in');
      const heroButtons = document.querySelector('.animate-fade-in');
      
      expect(heroTitle).toBeInTheDocument();
      expect(heroDescription).toBeInTheDocument();
      expect(heroButtons).toBeInTheDocument();
    });
  });

  describe('Données et contenu dynamique', () => {
    it('affiche correctement le nombre d\'années d\'expérience', () => {
      renderWithRouter(<AboutPage />);
      
      // Calculer l'année actuelle - 1984
      const currentYear = new Date().getFullYear();
      const expectedYears = currentYear - 1984;
      
      expect(screen.getByText(expectedYears.toString())).toBeInTheDocument();
      expect(screen.getByText('Années d\'expérience')).toBeInTheDocument();
    });

    it('affiche tous les services dans la liste', () => {
      renderWithRouter(<AboutPage />);
      
      const expectedServices = [
        'Prêt de livres, films et musiques',
        'Accès aux ressources numériques',
        'Espaces de travail et de lecture',
        'Animations culturelles régulières',
        'Accueil de groupes scolaires',
        'Conseil et orientation documentaire'
      ];

      expectedServices.forEach(service => {
        expect(screen.getByText(service)).toBeInTheDocument();
      });
    });

    it('affiche tous les objectifs dans la liste', () => {
      renderWithRouter(<AboutPage />);
      
      const expectedObjectives = [
        'Faciliter l\'accès aux ressources culturelles',
        'Accompagner les usagers dans leurs découvertes',
        'Créer du lien social autour de la culture',
        'Innover dans nos services et notre approche',
        'Soutenir l\'éducation et la formation'
      ];

      expectedObjectives.forEach(objective => {
        expect(screen.getByText(objective)).toBeInTheDocument();
      });
    });

    it('affiche toutes les valeurs avec leurs icônes et descriptions', () => {
      renderWithRouter(<AboutPage />);
      
      const expectedValues = [
        {
          title: 'Accès libre au savoir',
          description: 'Nous croyons que la connaissance doit être accessible à tous, sans discrimination.'
        },
        {
          title: 'Communauté inclusive',
          description: 'Nous favorisons les échanges et créons des liens entre les générations.'
        },
        {
          title: 'Innovation continue',
          description: 'Nous intégrons les nouvelles technologies au service de nos usagers.'
        },
        {
          title: 'Passion culturelle',
          description: 'Nous partageons notre amour pour la lecture, le cinéma et la musique.'
        },
        {
          title: 'Ouverture sur le monde',
          description: 'Nous proposons des contenus diversifiés reflétant la richesse culturelle mondiale.'
        },
        {
          title: 'Accompagnement éducatif',
          description: 'Nous soutenons l\'apprentissage et la recherche à tous les niveaux.'
        }
      ];

      expectedValues.forEach(value => {
        expect(screen.getByText(value.title)).toBeInTheDocument();
        expect(screen.getByText(value.description)).toBeInTheDocument();
      });
    });
  });

  describe('Performance et chargement', () => {
    it('affiche la carte avec un chargement lazy', () => {
      renderWithRouter(<AboutPage />);
      
      const iframe = screen.getByTitle('Localisation de la Médiathèque CRM');
      expect(iframe).toHaveAttribute('loading', 'lazy');
    });

    it('affiche les images avec des dimensions appropriées', () => {
      renderWithRouter(<AboutPage />);
      
      const teamImages = screen.getAllByAltText(/Marie Dubois|Pierre Martin|Sophie Leroy|Thomas Moreau/);
      teamImages.forEach(image => {
        expect(image).toHaveAttribute('src');
        const src = image.getAttribute('src');
        expect(src).toContain('w=200&h=200&fit=crop&crop=face');
      });
    });

    it('affiche la carte avec la bonne source OpenStreetMap', () => {
      renderWithRouter(<AboutPage />);
      
      const iframe = screen.getByTitle('Localisation de la Médiathèque CRM');
      const src = iframe.getAttribute('src');
      expect(src).toContain('openstreetmap.org');
      expect(src).toContain('bbox=4.712486267089845%2C45.98685663589249%2C4.730691909790039%2C45.995128329306606');
    });
  });

  describe('Validation des liens et navigation', () => {
    it('affiche des liens internes avec des routes valides', () => {
      renderWithRouter(<AboutPage />);
      
      const internalLinks = [
        { text: /catalogue|explorer/i, href: '/catalog' },
        { text: /contacter|contact/i, href: '/contact' },
        { text: /inscrire|inscription/i, href: '/register' }
      ];

      internalLinks.forEach(({ text, href }) => {
        const links = screen.getAllByRole('link', { name: text });
        links.forEach(link => {
          if (link.getAttribute('href') && !link.getAttribute('href').startsWith('mailto:') && !link.getAttribute('href').startsWith('tel:')) {
            expect(link).toHaveAttribute('href', href);
          }
        });
      });
    });

    it('affiche des liens externes avec des attributs de sécurité appropriés', () => {
      renderWithRouter(<AboutPage />);
      
      const externalLinks = screen.getAllByRole('link', { name: /Google Maps|maps/i });
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('affiche des liens de contact avec les bons protocoles', () => {
      renderWithRouter(<AboutPage />);
      
      const phoneLinks = screen.getAllByRole('link', { name: /04 74 60 00 00/ });
      phoneLinks.forEach(link => {
        expect(link).toHaveAttribute('href', 'tel:0474600000');
      });

      const emailLinks = screen.getAllByRole('link', { name: /contact@mediatheque.fr/ });
      emailLinks.forEach(link => {
        expect(link).toHaveAttribute('href', 'mailto:contact@mediatheque.fr?subject=Contact depuis la page A propos');
      });
    });
  });

  describe('Structure sémantique', () => {
    it('utilise des éléments sémantiques appropriés', () => {
      renderWithRouter(<AboutPage />);
      
      // Vérifier l'utilisation de l'élément address
      const addressElement = document.querySelector('address');
      expect(addressElement).toBeInTheDocument();
      expect(addressElement).toHaveClass('not-italic');
    });

    it('affiche des sections avec des classes de conteneur appropriées', () => {
      renderWithRouter(<AboutPage />);
      
      const pageContainer = document.querySelector('.page-container');
      expect(pageContainer).toBeInTheDocument();
      
      // Vérifier que plusieurs sections utilisent page-container
      const pageContainers = document.querySelectorAll('.page-container');
      expect(pageContainers.length).toBeGreaterThan(1);
    });

    it('affiche des éléments avec des classes de couleur cohérentes', () => {
      renderWithRouter(<AboutPage />);
      
      // Vérifier l'utilisation des couleurs primaires
      const primaryElements = document.querySelectorAll('.text-primary-600, .bg-primary-600, .border-primary-500');
      expect(primaryElements.length).toBeGreaterThan(0);
      
      // Vérifier l'utilisation des couleurs grises
      const grayElements = document.querySelectorAll('.text-gray-600, .bg-gray-50, .border-gray-200');
      expect(grayElements.length).toBeGreaterThan(0);
    });
  });
});
