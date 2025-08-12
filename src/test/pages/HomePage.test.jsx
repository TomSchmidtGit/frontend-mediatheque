import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/public/HomePage';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  BookOpenIcon: ({ className, ...props }) => <div data-testid="book-icon" className={className} {...props} />,
  FilmIcon: ({ className, ...props }) => <div data-testid="film-icon" className={className} {...props} />,
  MusicalNoteIcon: ({ className, ...props }) => <div data-testid="music-icon" className={className} {...props} />,
  SparklesIcon: ({ className, ...props }) => <div data-testid="sparkles-icon" className={className} {...props} />,
  ClockIcon: ({ className, ...props }) => <div data-testid="clock-icon" className={className} {...props} />,
  UsersIcon: ({ className, ...props }) => <div data-testid="users-icon" className={className} {...props} />,
}));

// Wrapper pour fournir le contexte de routeur
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    renderWithRouter(<HomePage />);
  });

  describe('Hero Section', () => {
    it('affiche le titre principal avec le nom de la médiathèque', () => {
      expect(screen.getByText(/Bienvenue à la/)).toBeInTheDocument();
      expect(screen.getByText('Médiathèque')).toBeInTheDocument();
    });

    it('affiche la description principale', () => {
      expect(screen.getByText(/Découvrez notre riche collection de livres, films et musiques/)).toBeInTheDocument();
    });

    it('affiche le bouton "Explorer le catalogue" avec icône', () => {
      const catalogButton = screen.getByRole('link', { name: /Explorer le catalogue/i });
      expect(catalogButton).toBeInTheDocument();
      expect(catalogButton).toHaveAttribute('href', '/catalog');
      const sparklesIcon = catalogButton.querySelector('[data-testid="sparkles-icon"]');
      expect(sparklesIcon).toBeInTheDocument();
    });

    it('affiche le bouton "Créer un compte gratuit"', () => {
      const registerButton = screen.getByRole('link', { name: /Créer un compte gratuit/i });
      expect(registerButton).toBeInTheDocument();
      expect(registerButton).toHaveAttribute('href', '/register');
    });
  });

  describe('Section Types de médias', () => {
    it('affiche le titre "Notre collection"', () => {
      expect(screen.getByText('Notre collection')).toBeInTheDocument();
    });

    it('affiche la description de la section', () => {
      expect(screen.getByText(/Explorez nos différents univers culturels/)).toBeInTheDocument();
    });

    describe('Carte Livres', () => {
      it('affiche l\'icône des livres', () => {
        const livresSection = screen.getByText('Livres').closest('div');
        const bookIcon = livresSection.querySelector('[data-testid="book-icon"]');
        expect(bookIcon).toBeInTheDocument();
      });

      it('affiche le titre "Livres"', () => {
        expect(screen.getByText('Livres')).toBeInTheDocument();
      });

      it('affiche la description des livres', () => {
        expect(screen.getByText(/Romans, essais, bandes dessinées et bien plus encore/)).toBeInTheDocument();
      });

      it('affiche le badge "500+ titres"', () => {
        expect(screen.getByText('500+ titres')).toBeInTheDocument();
      });
    });

    describe('Carte Films', () => {
      it('affiche l\'icône des films', () => {
        const filmsSection = screen.getByText('Films').closest('div');
        const filmIcon = filmsSection.querySelector('[data-testid="film-icon"]');
        expect(filmIcon).toBeInTheDocument();
      });

      it('affiche le titre "Films"', () => {
        expect(screen.getByText('Films')).toBeInTheDocument();
      });

      it('affiche la description des films', () => {
        expect(screen.getByText(/Découvrez notre sélection de films classiques et contemporains/)).toBeInTheDocument();
      });

      it('affiche le badge "300+ films"', () => {
        expect(screen.getByText('300+ films')).toBeInTheDocument();
      });
    });

    describe('Carte Musique', () => {
      it('affiche l\'icône de la musique', () => {
        const musiqueSection = screen.getByText('Musique').closest('div');
        const musicIcon = musiqueSection.querySelector('[data-testid="music-icon"]');
        expect(musicIcon).toBeInTheDocument();
      });

      it('affiche le titre "Musique"', () => {
        expect(screen.getByText('Musique')).toBeInTheDocument();
      });

      it('affiche la description de la musique', () => {
        expect(screen.getByText(/Explorez notre collection musicale variée/)).toBeInTheDocument();
      });

      it('affiche le badge "200+ albums"', () => {
        expect(screen.getByText('200+ albums')).toBeInTheDocument();
      });
    });
  });

  describe('Section Statistiques', () => {
    it('affiche le titre "La médiathèque en chiffres"', () => {
      expect(screen.getByText('La médiathèque en chiffres')).toBeInTheDocument();
    });

    it('affiche la description des statistiques', () => {
      expect(screen.getByText(/Une communauté dynamique et en constante croissance/)).toBeInTheDocument();
    });

    describe('Statistique Médias', () => {
      it('affiche l\'icône des livres pour les médias', () => {
        const bookIcons = screen.getAllByTestId('book-icon');
        expect(bookIcons.length).toBeGreaterThanOrEqual(2); // Une dans la collection, une dans les stats
      });

      it('affiche le nombre "1000+" pour les médias', () => {
        expect(screen.getByText('1000+')).toBeInTheDocument();
      });

      it('affiche le label "Médias disponibles"', () => {
        expect(screen.getByText('Médias disponibles')).toBeInTheDocument();
      });
    });

    describe('Statistique Utilisateurs', () => {
      it('affiche l\'icône des utilisateurs', () => {
        const usersIcons = screen.getAllByTestId('users-icon');
        expect(usersIcons.length).toBeGreaterThanOrEqual(1);
      });

      it('affiche le nombre "250+" pour les utilisateurs', () => {
        expect(screen.getByText('250+')).toBeInTheDocument();
      });

      it('affiche le label "Utilisateurs actifs"', () => {
        expect(screen.getByText('Utilisateurs actifs')).toBeInTheDocument();
      });
    });

    describe('Statistique Accès', () => {
      it('affiche l\'icône de l\'horloge', () => {
        const clockIcons = screen.getAllByTestId('clock-icon');
        expect(clockIcons.length).toBeGreaterThanOrEqual(1);
      });

      it('affiche le texte "24/7" pour l\'accès', () => {
        expect(screen.getByText('24/7')).toBeInTheDocument();
      });

      it('affiche le label "Accès en ligne"', () => {
        expect(screen.getByText('Accès en ligne')).toBeInTheDocument();
      });
    });
  });

  describe('Section CTA (Call to Action)', () => {
    it('affiche le titre "Prêt à commencer votre aventure ?"', () => {
      expect(screen.getByText('Prêt à commencer votre aventure ?')).toBeInTheDocument();
    });

    it('affiche la description de la section CTA', () => {
      expect(screen.getByText(/Rejoignez notre communauté dès aujourd'hui et accédez à toute notre collection/)).toBeInTheDocument();
    });

    it('affiche le bouton principal "S\'inscrire gratuitement" avec icône', () => {
      const registerButton = screen.getByRole('link', { name: /S'inscrire gratuitement/i });
      expect(registerButton).toBeInTheDocument();
      expect(registerButton).toHaveAttribute('href', '/register');
      expect(screen.getAllByTestId('sparkles-icon')).toHaveLength(2); // Une dans le hero, une dans le CTA
    });

    it('affiche le lien "Ou explorer sans compte"', () => {
      const exploreLink = screen.getByRole('link', { name: /Ou explorer sans compte/i });
      expect(exploreLink).toBeInTheDocument();
      expect(exploreLink).toHaveAttribute('href', '/catalog');
    });
  });

  describe('Navigation et liens', () => {
    it('contient tous les liens de navigation vers les pages principales', () => {
      const catalogLinks = screen.getAllByRole('link', { name: /catalogue|explorer/i });
      const registerLinks = screen.getAllByRole('link', { name: /inscrire|compte/i });
      
      expect(catalogLinks.length).toBeGreaterThan(0);
      expect(registerLinks.length).toBeGreaterThan(0);
    });

    it('tous les liens ont des attributs href valides', () => {
      const allLinks = screen.getAllByRole('link');
      allLinks.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).toMatch(/^\/(catalog|register)$/);
      });
    });
  });

  describe('Structure et layout', () => {
    it('affiche la page avec la classe de fond blanc', () => {
      const mainContainer = document.querySelector('.bg-white');
      expect(mainContainer).toBeInTheDocument();
    });

    it('contient toutes les sections principales', () => {
      // Hero section
      expect(screen.getByText(/Bienvenue à la/)).toBeInTheDocument();
      
      // Types de médias
      expect(screen.getByText('Notre collection')).toBeInTheDocument();
      
      // Statistiques
      expect(screen.getByText('La médiathèque en chiffres')).toBeInTheDocument();
      
      // CTA
      expect(screen.getByText('Prêt à commencer votre aventure ?')).toBeInTheDocument();
    });
  });
});
