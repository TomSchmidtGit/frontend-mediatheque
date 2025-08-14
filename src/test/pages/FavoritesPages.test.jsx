import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des services
vi.mock('../../services/mediaService', () => ({
  default: {
    getFavorites: vi.fn(),
    toggleFavorite: vi.fn()
  }
}));

// Mock du contexte d'authentification
const mockUser = {
  _id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  favorites: ['media1', 'media2', 'media3']
};

const mockUpdateUser = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    updateUser: mockUpdateUser,
    isAdmin: false,
    isAuthenticated: true
  })
}));

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
  };
});

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  HeartIcon: () => <div data-testid="heart-icon">❤️</div>,
  SparklesIcon: () => <div data-testid="sparkles-icon">✨</div>,
  Squares2X2Icon: () => <div data-testid="grid-icon">⊞</div>,
  ListBulletIcon: () => <div data-testid="list-icon">☰</div>,
  TrashIcon: () => <div data-testid="trash-icon">🗑️</div>
}));

// Mock des icônes Heroicons solid
vi.mock('@heroicons/react/24/solid', () => ({
  HeartIcon: () => <div data-testid="heart-solid-icon">❤️</div>
}));

// Mock du composant MediaCard
vi.mock('../../components/catalog/MediaCard', () => ({
  default: ({ media, onToggleFavorite, isInFavoritesPage }) => (
    <div className="media-card" data-testid={`media-card-${media._id}`}>
      <div className="media-info">
        <h3>{media.title}</h3>
        <p>{media.author}</p>
        <span className="media-type">{media.type}</span>
      </div>
      <button
        onClick={() => onToggleFavorite && onToggleFavorite(media._id)}
        className="favorite-button"
        data-testid={`favorite-button-${media._id}`}
      >
        {isInFavoritesPage ? 'Retirer' : 'Ajouter'}
      </button>
    </div>
  )
}));

// Mock du composant MediaListItem
vi.mock('../../components/catalog/MediaListItem', () => ({
  default: ({ media, onToggleFavorite, isInFavoritesPage }) => (
    <div className="media-list-item" data-testid={`media-list-item-${media._id}`}>
      <div className="media-info">
        <h3>{media.title}</h3>
        <p>{media.author}</p>
        <span className="media-type">{media.type}</span>
      </div>
      <button
        onClick={() => onToggleFavorite && onToggleFavorite(media._id)}
        className="favorite-button"
        data-testid={`favorite-button-${media._id}`}
      >
        {isInFavoritesPage ? 'Retirer' : 'Ajouter'}
      </button>
    </div>
  )
}));

// Mock du composant Pagination
vi.mock('../../components/common/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }) => (
    <div className="pagination" data-testid="pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? 'active' : ''}
          data-testid={`page-${page}`}
        >
          {page}
        </button>
      ))}
    </div>
  )
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock des utilitaires
vi.mock('../../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Importer la page réelle
import FavoritesPage from '../../pages/user/FavoritesPages';

// Récupérer les mocks après l'import
const mockGetFavorites = vi.mocked(await import('../../services/mediaService')).default.getFavorites;
const mockToggleFavorite = vi.mocked(await import('../../services/mediaService')).default.toggleFavorite;

// Wrapper avec providers
const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('FavoritesPage', () => {
  const mockFavoritesData = {
    data: [
      {
        _id: 'media1',
        title: 'Livre Test 1',
        type: 'book',
        author: 'Auteur Test 1',
        year: '2023',
        imageUrl: null,
        description: 'Description du livre test 1'
      },
      {
        _id: 'media2',
        title: 'Film Test 1',
        type: 'movie',
        author: 'Réalisateur Test 1',
        year: '2022',
        imageUrl: null,
        description: 'Description du film test 1'
      },
      {
        _id: 'media3',
        title: 'Musique Test 1',
        type: 'music',
        author: 'Artiste Test 1',
        year: '2021',
        imageUrl: null,
        description: 'Description de la musique test 1'
      }
    ],
    currentPage: 1,
    totalPages: 1,
    totalItems: 3
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFavorites.mockResolvedValue(mockFavoritesData);
    mockToggleFavorite.mockResolvedValue({ message: 'Favori retiré' });
    mockUpdateUser.mockClear();
  });

  it('devrait afficher le titre et la description de la page', async () => {
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Mes favoris')).toBeInTheDocument();
      expect(screen.getByText(/3 médias en favoris/)).toBeInTheDocument();
    });
  });

  it('devrait afficher le nombre de favoris', async () => {
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('3 médias en favoris')).toBeInTheDocument();
    });
  });

  it('devrait afficher la barre d\'outils avec les contrôles', async () => {
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Tout sélectionner')).toBeInTheDocument();
      expect(screen.getByText('Affichage :')).toBeInTheDocument();
    });
  });

  it('devrait afficher les favoris en mode grille par défaut', async () => {
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
      expect(screen.getByText('Film Test 1')).toBeInTheDocument();
      expect(screen.getByText('Musique Test 1')).toBeInTheDocument();
    });
  });

  it('devrait basculer entre les modes d\'affichage grille et liste', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Basculer vers le mode liste
    const listButton = screen.getByTestId('list-icon').closest('button');
    await user.click(listButton);

    // Vérifier que le mode liste est actif
    expect(listButton).toHaveClass('bg-primary-600');

    // Basculer vers le mode grille
    const gridButton = screen.getByTestId('grid-icon').closest('button');
    await user.click(gridButton);

    // Vérifier que le mode grille est actif
    expect(gridButton).toHaveClass('bg-primary-600');
  });

  it('devrait permettre de sélectionner des éléments individuels', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Sélectionner le premier élément
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[1]; // Le premier est "Tout sélectionner"

    await user.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();

    // Vérifier que le compteur de sélection s'affiche
    expect(screen.getByText('1 sélectionné')).toBeInTheDocument();
  });

  it('devrait permettre de tout sélectionner/désélectionner', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Sélectionner tout en cliquant sur le premier checkbox (Tout sélectionner)
    const allCheckboxes = screen.getAllByRole('checkbox');
    const selectAllCheckbox = allCheckboxes[0];
    await user.click(selectAllCheckbox);

    // Vérifier que tous les éléments sont sélectionnés
    allCheckboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });

    // Vérifier le compteur
    expect(screen.getByText('3 sélectionnés')).toBeInTheDocument();

    // Désélectionner tout
    await user.click(selectAllCheckbox);
    allCheckboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('devrait afficher le bouton de suppression en masse quand des éléments sont sélectionnés', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Sélectionner un élément
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[1];
    await user.click(firstCheckbox);

    // Vérifier que le bouton de suppression apparaît
    expect(screen.getByText('Retirer la sélection')).toBeInTheDocument();
  });

  it('devrait permettre de retirer des favoris individuellement', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Cliquer sur le bouton de retrait du premier média
    const removeButton = screen.getByTestId('favorite-button-media1');
    await user.click(removeButton);

    // Vérifier que le service est appelé
    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledWith('media1');
    });
  });

  it('devrait permettre de retirer plusieurs favoris en masse', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Sélectionner plusieurs éléments
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // Premier média
    await user.click(checkboxes[2]); // Deuxième média

    // Cliquer sur le bouton de suppression en masse
    const bulkRemoveButton = screen.getByText('Retirer la sélection');
    await user.click(bulkRemoveButton);

    // Vérifier que le service est appelé pour chaque élément
    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledWith('media1');
      expect(mockToggleFavorite).toHaveBeenCalledWith('media2');
    });
  });

  it('devrait afficher la pagination quand il y a plusieurs pages', async () => {
    // Mock avec plusieurs pages
    const mockDataWithPagination = {
      ...mockFavoritesData,
      currentPage: 1,
      totalPages: 3,
      totalItems: 30
    };

    mockGetFavorites.mockResolvedValueOnce(mockDataWithPagination);

    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByTestId('page-1')).toBeInTheDocument();
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
      expect(screen.getByTestId('page-3')).toBeInTheDocument();
    });
  });

  it('devrait changer de page correctement', async () => {
    // Mock avec plusieurs pages
    const mockDataWithPagination = {
      ...mockFavoritesData,
      currentPage: 1,
      totalPages: 3,
      totalItems: 30
    };

    mockGetFavorites.mockResolvedValueOnce(mockDataWithPagination);

    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
    });

    // Cliquer sur la page 2
    const page2Button = screen.getByTestId('page-2');
    await user.click(page2Button);

    // Vérifier que le service est appelé avec la bonne page
    await waitFor(() => {
      expect(mockGetFavorites).toHaveBeenCalledWith(2, 12);
    });
  });

  it('devrait afficher le message d\'absence de favoris quand la liste est vide', async () => {
    mockGetFavorites.mockResolvedValueOnce({
      data: [],
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    });

    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucun favori pour le moment')).toBeInTheDocument();
      expect(screen.getByText(/Commencez à explorer notre catalogue/)).toBeInTheDocument();
      expect(screen.getByText('Explorer le catalogue')).toBeInTheDocument();
      expect(screen.getByText('Retour au tableau de bord')).toBeInTheDocument();
    });
  });

  it('devrait afficher les informations importantes en bas de page', async () => {
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('💡 Conseil :')).toBeInTheDocument();
      expect(screen.getByText(/Vos favoris sont synchronisés sur tous vos appareils/)).toBeInTheDocument();
    });
  });

  it('devrait gérer l\'état de chargement', async () => {
    mockGetFavorites.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(<FavoritesPage />);

    // Vérifier l'état de chargement
    expect(screen.getByText('Chargement de vos favoris...')).toBeInTheDocument();
  });

  it('devrait gérer les erreurs de chargement', async () => {
    mockGetFavorites.mockRejectedValueOnce(new Error('Erreur de chargement'));

    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
      expect(screen.getByText('Impossible de charger vos favoris.')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });
  });

  it('devrait permettre de réessayer après une erreur', async () => {
    mockGetFavorites.mockRejectedValueOnce(new Error('Erreur de chargement'));

    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    // Cliquer sur le bouton réessayer
    const retryButton = screen.getByText('Réessayer');
    await user.click(retryButton);

    // Vérifier que le service est appelé à nouveau
    expect(mockGetFavorites).toHaveBeenCalledTimes(2);
  });

  it('devrait gérer l\'état de suppression en cours', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Sélectionner un élément
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[1];
    await user.click(firstCheckbox);

    // Cliquer sur le bouton de suppression en masse
    const bulkRemoveButton = screen.getByText('Retirer la sélection');
    await user.click(bulkRemoveButton);

    // Vérifier que le service est appelé
    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledWith('media1');
    });
  });

  it('devrait mettre à jour l\'interface après suppression d\'un favori', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Retirer un favori
    const removeButton = screen.getByTestId('favorite-button-media1');
    await user.click(removeButton);

    // Vérifier que l'interface est mise à jour
    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledWith('media1');
    });
  });

  it('devrait avoir la structure responsive correcte', async () => {
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Mes favoris')).toBeInTheDocument();
    });

    // Vérifier que la page se charge sans erreur
    expect(screen.getByText('Mes favoris')).toBeInTheDocument();
    expect(screen.getByText('Tout sélectionner')).toBeInTheDocument();
    expect(screen.getByText('Affichage :')).toBeInTheDocument();
  });

  it('devrait gérer la sélection partielle correctement', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Sélectionner seulement 2 éléments sur 3
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // Premier média
    await user.click(checkboxes[2]); // Deuxième média

    // Vérifier que "Tout sélectionner" n'est pas complètement coché
    const selectAllCheckbox = checkboxes[0];
    expect(selectAllCheckbox).not.toBeChecked();

    // Vérifier que le compteur affiche le bon nombre
    expect(screen.getByText('2 sélectionnés')).toBeInTheDocument();
  });

  describe('Modes d\'affichage', () => {
    it('affiche par défaut en mode grille', async () => {
      renderWithProviders(<FavoritesPage />);

      await waitFor(() => {
        // Vérifier que le bouton grille est actif
        const gridButton = screen.getByTestId('grid-icon').closest('button');
        expect(gridButton).toHaveClass('bg-primary-600');

        // Vérifier que le bouton liste n'est pas actif
        const listButton = screen.getByTestId('list-icon').closest('button');
        expect(listButton).toHaveClass('bg-white');

        // Vérifier que les MediaCard sont affichés
        expect(screen.getByTestId('media-card-media1')).toBeInTheDocument();
      });
    });

    it('permet de basculer vers le mode liste', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FavoritesPage />);

      await waitFor(() => {
        const listButton = screen.getByTestId('list-icon').closest('button');
        user.click(listButton);
      });

      // Attendre que le composant se mette à jour
      await waitFor(() => {
        const listButton = screen.getByTestId('list-icon').closest('button');
        expect(listButton).toHaveClass('bg-primary-600');
      });

      // Vérifier que le bouton grille n'est plus actif
      const gridButton = screen.getByTestId('grid-icon').closest('button');
      expect(gridButton).toHaveClass('bg-white');
    });

    it('affiche les MediaListItem en mode liste', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FavoritesPage />);

      // Basculer vers le mode liste
      await waitFor(() => {
        const listButton = screen.getByTestId('list-icon').closest('button');
        user.click(listButton);
      });

      // Attendre que les MediaListItem soient affichés
      await waitFor(() => {
        expect(screen.getByTestId('media-list-item-media1')).toBeInTheDocument();
      });

      // Vérifier que le conteneur a la classe space-y-3 pour le mode liste
      const mediaContainer = screen.getByTestId('media-list-item-media1').closest('div').parentElement.parentElement;
      expect(mediaContainer).toHaveClass('space-y-3');
    });

    it('affiche les MediaCard en mode grille', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FavoritesPage />);

      // Basculer vers le mode liste puis revenir en grille
      await waitFor(() => {
        const listButton = screen.getByTestId('list-icon').closest('button');
        user.click(listButton);
      });

      await waitFor(() => {
        const gridButton = screen.getByTestId('grid-icon').closest('button');
        user.click(gridButton);
      });

      // Attendre que les MediaCard soient affichés
      await waitFor(() => {
        expect(screen.getByTestId('media-card-media1')).toBeInTheDocument();
      });

      // Vérifier que le conteneur a la classe grid pour le mode grille
      const mediaContainer = screen.getByTestId('media-card-media1').closest('div').parentElement.parentElement;
      expect(mediaContainer).toHaveClass('grid');
    });

    it('applique les bonnes classes CSS selon le mode d\'affichage', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FavoritesPage />);

      // Mode grille par défaut
      await waitFor(() => {
        const mediaContainer = screen.getByTestId('media-card-media1').closest('div').parentElement.parentElement;
        expect(mediaContainer).toHaveClass('grid', 'gap-6', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
      });

      // Basculer vers le mode liste
      const listButton = screen.getByTestId('list-icon').closest('button');
      await user.click(listButton);

      // Attendre que le mode liste soit actif
      await waitFor(() => {
        expect(screen.getByTestId('media-list-item-media1')).toBeInTheDocument();
      });

      // Vérifier les classes du conteneur en mode liste
      const mediaContainer = screen.getByTestId('media-list-item-media1').closest('div').parentElement.parentElement;
      expect(mediaContainer).toHaveClass('space-y-3');
    });

    it('gère correctement les checkboxes dans les deux modes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FavoritesPage />);

      // Mode grille par défaut
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(4); // 1 select-all + 3 médias
      });

      // Basculer vers le mode liste
      const listButton = screen.getByTestId('list-icon').closest('button');
      await user.click(listButton);

      // Vérifier que les checkboxes sont toujours présentes
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(4);
      });
    });
  });
});
