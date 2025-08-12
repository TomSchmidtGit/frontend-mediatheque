import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CatalogPage from '../../pages/public/CatalogPage';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  Squares2X2Icon: ({ className, ...props }) => <div data-testid="grid-icon" className={className} {...props} />,
  ListBulletIcon: ({ className, ...props }) => <div data-testid="list-icon" className={className} {...props} />,
  AdjustmentsHorizontalIcon: ({ className, ...props }) => <div data-testid="filters-icon" className={className} {...props} />,
  SparklesIcon: ({ className, ...props }) => <div data-testid="sparkles-icon" className={className} {...props} />,
}));

// Mock des composants enfants
vi.mock('../../components/catalog/MediaCard', () => ({
  default: ({ media, onToggleFavorite }) => (
    <div data-testid={`media-card-${media._id}`} className="media-card">
      <h3>{media.title}</h3>
      <p>{media.author}</p>
      <p>{media.year}</p>
      <button onClick={() => onToggleFavorite(media._id, false)}>
        Toggle Favorite
      </button>
    </div>
  ),
}));

vi.mock('../../components/catalog/CatalogFilters', () => ({
  default: ({ filters, onFiltersChange, categories, tags, loading, searchInput, onSearchInputChange }) => (
    <div data-testid="catalog-filters">
      <input
        data-testid="search-input"
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
        placeholder="Rechercher..."
      />
      <button onClick={() => onFiltersChange({ ...filters, type: 'book' })}>
        Filtrer par livre
      </button>
      <button onClick={() => onFiltersChange({ ...filters, category: 'fiction' })}>
        Filtrer par catégorie
      </button>
      <button onClick={() => onFiltersChange({ ...filters, tags: 'action' })}>
        Filtrer par tag
      </button>
    </div>
  ),
}));

vi.mock('../../components/common/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange, loading }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Précédent
      </button>
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">/ {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Suivant
      </button>
    </div>
  ),
}));

// Mock des services
vi.mock('../../services/mediaService', () => ({
  default: {
    getMedia: vi.fn(),
    getCategories: vi.fn(),
    getTags: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}));

// Mock du contexte d'authentification
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'user1', name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    isAdmin: false,
  }),
}));

// Mock des utilitaires
vi.mock('../../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' '),
}));

// Wrapper pour fournir le contexte de routeur et React Query
const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CatalogPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock des données par défaut
    const mockMediaService = await import('../../services/mediaService');
    mockMediaService.default.getMedia.mockResolvedValue({
      data: [
        {
          _id: '1',
          title: 'Le Seigneur des Anneaux',
          type: 'book',
          author: 'J.R.R. Tolkien',
          year: 1954,
          available: true,
          description: 'Un roman épique',
          imageUrl: 'https://example.com/image1.jpg',
          reviews: [],
          averageRating: 4.5,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          title: 'Inception',
          type: 'movie',
          author: 'Christopher Nolan',
          year: 2010,
          available: true,
          description: 'Un film de science-fiction',
          imageUrl: 'https://example.com/image2.jpg',
          reviews: [],
          averageRating: 4.8,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      currentPage: 1,
      totalPages: 1,
      totalItems: 2,
    });

    mockMediaService.default.getCategories.mockResolvedValue([
      { _id: '1', name: 'Fiction', slug: 'fiction' },
      { _id: '2', name: 'Non-fiction', slug: 'non-fiction' },
    ]);

    mockMediaService.default.getTags.mockResolvedValue([
      { _id: '1', name: 'Action', slug: 'action' },
      { _id: '2', name: 'Drame', slug: 'drame' },
    ]);
  });

  describe('Affichage de base', () => {
    it('affiche le titre principal "Catalogue des médias"', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Catalogue des médias')).toBeInTheDocument();
      });
    });

    it('affiche la description du catalogue', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Découvrez notre collection de livres, films et musiques')).toBeInTheDocument();
      });
    });

    it('affiche le composant CatalogFilters', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('catalog-filters')).toBeInTheDocument();
      });
    });

    it('affiche le composant Pagination', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
    });
  });

  describe('Affichage des médias', () => {
    it('affiche les cartes de médias', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('media-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('media-card-2')).toBeInTheDocument();
      });
    });

    it('affiche les informations des médias', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Le Seigneur des Anneaux')).toBeInTheDocument();
        expect(screen.getByText('J.R.R. Tolkien')).toBeInTheDocument();
        expect(screen.getByText('1954')).toBeInTheDocument();
        expect(screen.getByText('Inception')).toBeInTheDocument();
        expect(screen.getByText('Christopher Nolan')).toBeInTheDocument();
        expect(screen.getByText('2010')).toBeInTheDocument();
      });
    });

    it('affiche le nombre total de médias', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('médias trouvés')).toBeInTheDocument();
      });
    });
  });

  describe('Modes d\'affichage', () => {
    it('affiche par défaut en mode grille', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const gridButton = screen.getByTestId('grid-icon').closest('button');
        expect(gridButton).toHaveClass('bg-primary-600');
      });
    });

    it('permet de basculer vers le mode liste', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const listButton = screen.getByTestId('list-icon').closest('button');
        fireEvent.click(listButton);
        expect(listButton).toHaveClass('bg-primary-600');
      });
    });

    it('affiche les icônes pour les modes d\'affichage', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
        expect(screen.getByTestId('list-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Filtres et recherche', () => {
    it('affiche le bouton de filtres sur mobile', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const filtersButton = screen.getByRole('button', { name: /Filtres/i });
        expect(filtersButton).toBeInTheDocument();
        expect(screen.getByTestId('filters-icon')).toBeInTheDocument();
      });
    });

    it('permet de saisir dans le champ de recherche', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'test' } });
        expect(searchInput.value).toBe('test');
      });
    });

    it('permet de filtrer par type de média', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const bookFilterButton = screen.getByRole('button', { name: /Filtrer par livre/i });
        fireEvent.click(bookFilterButton);
      });
    });

    it('permet de filtrer par catégorie', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const categoryFilterButton = screen.getByRole('button', { name: /Filtrer par catégorie/i });
        fireEvent.click(categoryFilterButton);
      });
    });

    it('permet de filtrer par tag', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const tagFilterButton = screen.getByRole('button', { name: /Filtrer par tag/i });
        fireEvent.click(tagFilterButton);
      });
    });
  });

  describe('Pagination', () => {
    it('affiche la pagination avec les bonnes informations', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('current-page')).toHaveTextContent('1');
        expect(screen.getByTestId('total-pages')).toHaveTextContent('/ 1');
      });
    });

    it('permet de naviguer vers la page suivante', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Suivant/i });
        fireEvent.click(nextButton);
      });
    });

    it('permet de naviguer vers la page précédente', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /Précédent/i });
        fireEvent.click(prevButton);
      });
    });
  });

  describe('Gestion des favoris', () => {
    it('permet de basculer les favoris', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const toggleButtons = screen.getAllByText('Toggle Favorite');
        fireEvent.click(toggleButtons[0]);
      });
    });
  });

  describe('États de chargement', () => {
    it('affiche un indicateur de chargement', async () => {
      const mockMediaService = await import('../../services/mediaService');
      mockMediaService.default.getMedia.mockImplementation(() => new Promise(() => {}));
      
      renderWithProviders(<CatalogPage />);
      
      expect(screen.getByText('Chargement des médias...')).toBeInTheDocument();
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });
  });

  describe('Gestion des erreurs', () => {
    it('affiche un message d\'erreur en cas d\'échec', async () => {
      const mockMediaService = await import('../../services/mediaService');
      mockMediaService.default.getMedia.mockRejectedValue(new Error('Erreur de chargement'));
      
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
        expect(screen.getByText('Impossible de charger le catalogue des médias.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Réessayer/i })).toBeInTheDocument();
      });
    });

    it('permet de réessayer après une erreur', async () => {
      const mockMediaService = await import('../../services/mediaService');
      mockMediaService.default.getMedia.mockRejectedValueOnce(new Error('Erreur de chargement'));
      
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /Réessayer/i });
        fireEvent.click(retryButton);
      });
    });
  });

  describe('État vide', () => {
    it('affiche un message quand aucun média n\'est trouvé', async () => {
      const mockMediaService = await import('../../services/mediaService');
      mockMediaService.default.getMedia.mockResolvedValue({
        data: [],
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
      });
      
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Aucun média trouvé')).toBeInTheDocument();
        expect(screen.getByText('Essayez de modifier vos critères de recherche.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Réinitialiser les filtres/i })).toBeInTheDocument();
      });
    });

    it('permet de réinitialiser les filtres', async () => {
      const mockMediaService = await import('../../services/mediaService');
      mockMediaService.default.getMedia.mockResolvedValue({
        data: [],
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
      });
      
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: /Réinitialiser les filtres/i });
        fireEvent.click(resetButton);
      });
    });
  });

  describe('Responsive design', () => {
    it('affiche le bouton de filtres sur mobile', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const filtersButton = screen.getByRole('button', { name: /Filtres/i });
        expect(filtersButton).toHaveClass('lg:hidden');
      });
    });

    it('affiche la sidebar des filtres sur desktop', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const sidebar = screen.getByTestId('catalog-filters').closest('aside');
        expect(sidebar).toHaveClass('lg:w-80');
      });
    });
  });

  describe('Structure et layout', () => {
    it('affiche la page avec la classe de fond gris', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const mainContainer = document.querySelector('.bg-gray-50');
        expect(mainContainer).toBeInTheDocument();
      });
    });

    it('affiche la barre d\'outils avec les contrôles', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const toolbar = screen.getByText('Affichage :').closest('div').parentElement.parentElement;
        expect(toolbar).toHaveClass('bg-white');
      });
    });

    it('affiche la grille des médias', async () => {
      renderWithProviders(<CatalogPage />);
      
      await waitFor(() => {
        const mediaGrid = screen.getByTestId('media-card-1').closest('div').parentElement;
        expect(mediaGrid).toHaveClass('grid');
      });
    });
  });
});
