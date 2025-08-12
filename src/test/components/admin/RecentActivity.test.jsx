import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecentActivity from '../../../components/admin/RecentActivity';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ClockIcon: ({ className }) => <div data-testid="clock-icon" className={className} />,
  UserIcon: ({ className }) => <div data-testid="user-icon" className={className} />,
  BookOpenIcon: ({ className }) => <div data-testid="book-icon" className={className} />,
  FilmIcon: ({ className }) => <div data-testid="film-icon" className={className} />,
  MusicalNoteIcon: ({ className }) => <div data-testid="music-icon" className={className} />,
  EyeIcon: ({ className }) => <div data-testid="eye-icon" className={className} />,
  CalendarIcon: ({ className }) => <div data-testid="calendar-icon" className={className} />
}));

// Mock des utilitaires
vi.mock('../../../utils', () => ({
  formatDate: {
    short: (date) => new Date(date).toLocaleDateString('fr-FR')
  },
  formatters: {
    borrowStatus: (status) => {
      const statusMap = {
        borrowed: 'Emprunté',
        returned: 'Retourné',
        overdue: 'En retard'
      };
      return statusMap[status] || status;
    },
    mediaType: (type) => {
      const typeMap = {
        book: 'Livre',
        movie: 'Film',
        music: 'Musique'
      };
      return typeMap[type] || type;
    }
  },
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Mock de react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
}));

describe('RecentActivity', () => {
  const mockStats = {
    users: {
      total: 1250,
      active: 1180,
      inactive: 70,
      newThisMonth: 45
    },
    media: {
      total: 3500,
      byType: {
        book: 2000,
        movie: 1000,
        music: 500
      }
    },
    borrows: {
      active: 280,
      overdue: 12,
      returned: 2150,
      total: 2430
    },
    topBorrowedMedia: [
      {
        _id: '1',
        title: 'Le Petit Prince',
        type: 'book',
        author: 'Antoine de Saint-Exupéry',
        borrowCount: 45
      },
      {
        _id: '2',
        title: 'Inception',
        type: 'movie',
        author: 'Christopher Nolan',
        borrowCount: 38
      },
      {
        _id: '3',
        title: 'Bohemian Rhapsody',
        type: 'music',
        author: 'Queen',
        borrowCount: 32
      },
      {
        _id: '4',
        title: '1984',
        type: 'book',
        author: 'George Orwell',
        borrowCount: 28
      },
      {
        _id: '5',
        title: 'The Dark Knight',
        type: 'movie',
        author: 'Christopher Nolan',
        borrowCount: 25
      }
    ],
    recentBorrows: [
      {
        _id: '1',
        user: {
          _id: 'user1',
          name: 'Jean Dupont',
          email: 'jean.dupont@example.com',
          role: 'user',
          favorites: [],
          actif: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        media: {
          _id: 'media1',
          title: 'Le Petit Prince',
          type: 'book',
          author: 'Antoine de Saint-Exupéry',
          year: 1943,
          available: false,
          description: 'Un conte poétique',
          category: { _id: 'cat1', name: 'Littérature', slug: 'litterature', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
          tags: [],
          imageUrl: 'https://example.com/image.jpg',
          reviews: [],
          averageRating: 4.5,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        borrowDate: '2024-12-01T00:00:00.000Z',
        dueDate: '2024-12-15T00:00:00.000Z',
        status: 'borrowed',
        createdAt: '2024-12-01T00:00:00.000Z',
        updatedAt: '2024-12-01T00:00:00.000Z'
      },
      {
        _id: '2',
        user: {
          _id: 'user2',
          name: 'Marie Martin',
          email: 'marie.martin@example.com',
          role: 'user',
          favorites: [],
          actif: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        media: {
          _id: 'media2',
          title: 'Inception',
          type: 'movie',
          author: 'Christopher Nolan',
          year: 2010,
          available: false,
          description: 'Un film de science-fiction',
          category: { _id: 'cat2', name: 'Science-Fiction', slug: 'science-fiction', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
          tags: [],
          imageUrl: 'https://example.com/image2.jpg',
          reviews: [],
          averageRating: 4.8,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        borrowDate: '2024-12-02T00:00:00.000Z',
        dueDate: '2024-12-16T00:00:00.000Z',
        status: 'returned',
        returnDate: '2024-12-10T00:00:00.000Z',
        createdAt: '2024-12-02T00:00:00.000Z',
        updatedAt: '2024-12-10T00:00:00.000Z'
      },
      {
        _id: '3',
        user: {
          _id: 'user3',
          name: 'Pierre Durand',
          email: 'pierre.durand@example.com',
          role: 'user',
          favorites: [],
          actif: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        media: {
          _id: 'media3',
          title: 'Bohemian Rhapsody',
          type: 'music',
          author: 'Queen',
          year: 1975,
          available: false,
          description: 'Une chanson rock',
          category: { _id: 'cat3', name: 'Rock', slug: 'rock', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
          tags: [],
          imageUrl: 'https://example.com/image3.jpg',
          reviews: [],
          averageRating: 4.7,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        borrowDate: '2024-11-25T00:00:00.000Z',
        dueDate: '2024-12-09T00:00:00.000Z',
        status: 'overdue',
        createdAt: '2024-11-25T00:00:00.000Z',
        updatedAt: '2024-11-25T00:00:00.000Z'
      }
    ],
    mostActiveUsers: []
  };

  describe('État de chargement', () => {
    it('affiche le skeleton loader quand loading est true', () => {
      render(<RecentActivity stats={mockStats} loading={true} />);
      
      // Vérifie que les skeletons sont affichés
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
      
      // Vérifie que les vraies données ne sont pas affichées
      expect(screen.queryByText('Emprunts récents')).not.toBeInTheDocument();
      expect(screen.queryByText('Médias populaires')).not.toBeInTheDocument();
    });

    it('affiche 2 sections de skeleton loader', () => {
      render(<RecentActivity stats={mockStats} loading={true} />);
      
      const skeletonSections = document.querySelectorAll('.bg-white.rounded-xl.border.border-gray-200');
      expect(skeletonSections).toHaveLength(2);
    });
  });

  describe('Affichage des emprunts récents', () => {
    beforeEach(() => {
      render(<RecentActivity stats={mockStats} loading={false} />);
    });

    it('affiche la section des emprunts récents avec le bon titre', () => {
      expect(screen.getByText('Emprunts récents')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('affiche les emprunts récents avec les informations correctes', () => {
      // Vérifie que tous les emprunts sont présents (peut y avoir des doublons)
      const allBorrowTitles = screen.getAllByText(/Le Petit Prince|Inception|Bohemian Rhapsody/);
      expect(allBorrowTitles.length).toBeGreaterThanOrEqual(3);
      
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
      expect(screen.getByText('Marie Martin')).toBeInTheDocument();
      expect(screen.getByText('Pierre Durand')).toBeInTheDocument();
    });

    it('affiche les statuts des emprunts avec les bonnes couleurs', () => {
      // Emprunté (bleu)
      const borrowedStatus = screen.getByText('Emprunté');
      expect(borrowedStatus).toHaveClass('bg-blue-100', 'text-blue-800');
      
      // Retourné (vert)
      const returnedStatus = screen.getByText('Retourné');
      expect(returnedStatus).toHaveClass('bg-green-100', 'text-green-800');
      
      // En retard (rouge)
      const overdueStatus = screen.getByText('En retard');
      expect(overdueStatus).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('affiche les icônes de type de média appropriées', () => {
      // Vérifie qu'il y a au moins une icône de chaque type
      const bookIcons = screen.getAllByTestId('book-icon');
      const filmIcons = screen.getAllByTestId('film-icon');
      const musicIcons = screen.getAllByTestId('music-icon');
      
      expect(bookIcons.length).toBeGreaterThan(0);
      expect(filmIcons.length).toBeGreaterThan(0);
      expect(musicIcons.length).toBeGreaterThan(0);
    });

    it('affiche les dates d\'emprunt formatées', () => {
      expect(screen.getByText('01/12/2024')).toBeInTheDocument();
      expect(screen.getByText('02/12/2024')).toBeInTheDocument();
      expect(screen.getByText('25/11/2024')).toBeInTheDocument();
    });

    it('affiche le lien vers tous les emprunts', () => {
      const link = screen.getByText('Voir tous les emprunts');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/admin/borrows');
      // Vérifie qu'il y a au moins une icône eye
      const eyeIcons = screen.getAllByTestId('eye-icon');
      expect(eyeIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Affichage des médias populaires', () => {
    beforeEach(() => {
      render(<RecentActivity stats={mockStats} loading={false} />);
    });

    it('affiche la section des médias populaires avec le bon titre', () => {
      expect(screen.getByText('Médias populaires')).toBeInTheDocument();
      // Vérifie qu'il y a au moins une icône book
      const bookIcons = screen.getAllByTestId('book-icon');
      expect(bookIcons.length).toBeGreaterThan(0);
    });

    it('affiche les médias populaires avec les informations correctes', () => {
      // Vérifie que tous les médias sont présents (peut y avoir des doublons)
      const allMediaTitles = screen.getAllByText(/Le Petit Prince|Inception|Bohemian Rhapsody|1984|The Dark Knight/);
      expect(allMediaTitles.length).toBeGreaterThanOrEqual(5);
      
      // Vérifie les auteurs (peuvent apparaître dans plusieurs sections)
      const allAuthors = screen.getAllByText(/Antoine de Saint-Exupéry|Christopher Nolan|Queen/);
      expect(allAuthors.length).toBeGreaterThanOrEqual(3);
    });

    it('affiche les compteurs d\'emprunt avec le bon formatage', () => {
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('38')).toBeInTheDocument();
      expect(screen.getByText('32')).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      
      // Vérifie que "emprunts" est affiché pour chaque média
      const empruntsLabels = screen.getAllByText('emprunts');
      expect(empruntsLabels).toHaveLength(5);
    });

    it('affiche les types de média avec les bonnes couleurs', () => {
      // Vérifie qu'il y a au moins un élément de chaque type
      const bookTypes = screen.getAllByText('Livre');
      const movieTypes = screen.getAllByText('Film');
      const musicTypes = screen.getAllByText('Musique');
      
      expect(bookTypes.length).toBeGreaterThan(0);
      expect(movieTypes.length).toBeGreaterThan(0);
      expect(musicTypes.length).toBeGreaterThan(0);
      
      // Vérifie les couleurs pour le premier élément de chaque type
      if (bookTypes.length > 0) {
        // Les couleurs sont appliquées au span parent qui contient l'icône et le texte
        const bookSpan = bookTypes[0].closest('span.inline-flex');
        expect(bookSpan).toHaveClass('bg-blue-100', 'text-blue-800');
      }
      if (movieTypes.length > 0) {
        const movieSpan = movieTypes[0].closest('span.inline-flex');
        expect(movieSpan).toHaveClass('bg-purple-100', 'text-purple-800');
      }
      if (musicTypes.length > 0) {
        const musicSpan = musicTypes[0].closest('span.inline-flex');
        expect(musicSpan).toHaveClass('bg-green-100', 'text-green-800');
      }
    });

    it('affiche les rangs numérotés', () => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('affiche le lien vers tous les médias', () => {
      const link = screen.getByText('Voir tous les médias');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/admin/media');
      // Vérifie qu'il y a au moins une icône eye
      const eyeIcons = screen.getAllByTestId('eye-icon');
      expect(eyeIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Gestion des cas d\'absence de données', () => {
    it('affiche un message approprié quand il n\'y a pas d\'emprunts récents', () => {
      const statsWithoutBorrows = {
        ...mockStats,
        recentBorrows: []
      };
      
      render(<RecentActivity stats={statsWithoutBorrows} loading={false} />);
      
      expect(screen.getByText('Aucun emprunt récent')).toBeInTheDocument();
      // Vérifie qu'il y a au moins une icône clock (dans l'en-tête)
      const clockIcons = screen.getAllByTestId('clock-icon');
      expect(clockIcons.length).toBeGreaterThan(0);
    });

    it('affiche un message approprié quand il n\'y a pas de médias populaires', () => {
      const statsWithoutMedia = {
        ...mockStats,
        topBorrowedMedia: []
      };
      
      render(<RecentActivity stats={statsWithoutMedia} loading={false} />);
      
      expect(screen.getByText('Aucune donnée d\'emprunt')).toBeInTheDocument();
      // Vérifie qu'il y a au moins une icône book (dans l'en-tête)
      const bookIcons = screen.getAllByTestId('book-icon');
      expect(bookIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Limitation du nombre d\'éléments', () => {
    it('affiche maximum 5 emprunts récents', () => {
      const statsWithManyBorrows = {
        ...mockStats,
        recentBorrows: Array.from({ length: 10 }, (_, i) => ({
          ...mockStats.recentBorrows[0],
          _id: `borrow${i}`,
          media: {
            ...mockStats.recentBorrows[0].media,
            title: `Média ${i + 1}`
          }
        }))
      };
      
      render(<RecentActivity stats={statsWithManyBorrows} loading={false} />);
      
      // Vérifie que seuls 5 emprunts sont affichés
      expect(screen.getByText('Média 1')).toBeInTheDocument();
      expect(screen.getByText('Média 5')).toBeInTheDocument();
      expect(screen.queryByText('Média 6')).not.toBeInTheDocument();
    });

    it('affiche maximum 5 médias populaires', () => {
      const statsWithManyMedia = {
        ...mockStats,
        topBorrowedMedia: Array.from({ length: 10 }, (_, i) => ({
          _id: `media${i}`,
          title: `Média Populaire ${i + 1}`,
          type: 'book',
          author: `Auteur ${i + 1}`,
          borrowCount: 100 - i
        }))
      };
      
      render(<RecentActivity stats={statsWithManyMedia} loading={false} />);
      
      // Vérifie que seuls 5 médias sont affichés
      expect(screen.getByText('Média Populaire 1')).toBeInTheDocument();
      expect(screen.getByText('Média Populaire 5')).toBeInTheDocument();
      expect(screen.queryByText('Média Populaire 6')).not.toBeInTheDocument();
    });
  });

  describe('Accessibilité et structure', () => {
    beforeEach(() => {
      render(<RecentActivity stats={mockStats} loading={false} />);
    });

    it('utilise une structure sémantique appropriée avec des en-têtes', () => {
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);
      expect(headings[0]).toHaveTextContent('Emprunts récents');
      expect(headings[1]).toHaveTextContent('Médias populaires');
    });

    it('affiche les icônes avec des classes appropriées', () => {
      // Vérifie l'icône clock dans l'en-tête des emprunts récents
      const headings = screen.getAllByRole('heading');
      const clockIcon = headings[0].querySelector('[data-testid="clock-icon"]');
      expect(clockIcon).toHaveClass('h-5', 'w-5', 'mr-2');
      
      // Vérifie l'icône book dans l'en-tête des médias populaires
      const bookIcon = headings[1].querySelector('[data-testid="book-icon"]');
      expect(bookIcon).toHaveClass('h-5', 'w-5', 'mr-2');
    });

    it('utilise des liens appropriés pour la navigation', () => {
      const borrowsLink = screen.getByText('Voir tous les emprunts').closest('a');
      expect(borrowsLink).toHaveAttribute('href', '/admin/borrows');
      
      const mediaLink = screen.getByText('Voir tous les médias').closest('a');
      expect(mediaLink).toHaveAttribute('href', '/admin/media');
    });
  });

  describe('Responsive et layout', () => {
    it('utilise une grille responsive appropriée', () => {
      render(<RecentActivity stats={mockStats} loading={false} />);
      
      const container = screen.getByText('Emprunts récents').closest('.grid');
      expect(container).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
    });

    it('applique des espacements cohérents', () => {
      render(<RecentActivity stats={mockStats} loading={false} />);
      
      const sections = document.querySelectorAll('.bg-white.rounded-xl.border.border-gray-200');
      sections.forEach(section => {
        expect(section).toHaveClass('overflow-hidden');
      });
    });
  });
});
