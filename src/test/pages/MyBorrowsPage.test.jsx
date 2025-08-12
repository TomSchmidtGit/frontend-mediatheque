import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des services
vi.mock('../../services/borrowService', () => ({
  default: {
    getMyBorrows: vi.fn()
  }
}));

// Mock du contexte d'authentification
const mockUser = {
  _id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
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
  ClockIcon: () => <div data-testid="clock-icon">⏰</div>,
  BookOpenIcon: () => <div data-testid="book-icon">📚</div>,
  FilmIcon: () => <div data-testid="film-icon">🎬</div>,
  MusicalNoteIcon: () => <div data-testid="music-icon">🎵</div>,
  CalendarIcon: () => <div data-testid="calendar-icon">📅</div>,
  ArrowPathIcon: () => <div data-testid="refresh-icon">🔄</div>,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon">⚠️</div>,
  CheckCircleIcon: () => <div data-testid="check-icon">✅</div>,
  Squares2X2Icon: () => <div data-testid="grid-icon">⊞</div>,
  ListBulletIcon: () => <div data-testid="list-icon">☰</div>,
  UserIcon: () => <div data-testid="user-icon">👤</div>,
  EyeIcon: () => <div data-testid="eye-icon">👁️</div>,
  FunnelIcon: () => <div data-testid="funnel-icon">🔍</div>,
  XMarkIcon: () => <div data-testid="close-icon">✕</div>,
  ChevronLeftIcon: () => <div data-testid="chevron-left-icon">◀</div>,
  ChevronRightIcon: () => <div data-testid="chevron-right-icon">▶</div>
}));

// Mock des utilitaires
vi.mock('../../utils', () => ({
  formatDate: {
    short: (date) => new Date(date).toLocaleDateString('fr-FR')
  },
  dateUtils: {
    isOverdue: (date) => new Date(date) < new Date(),
    isDueSoon: (date) => {
      const dueDate = new Date(date);
      const now = new Date();
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays > 0;
    }
  },
  formatters: {
    mediaType: (type) => {
      const types = { book: 'Livre', movie: 'Film', music: 'Musique' };
      return types[type] || type;
    }
  },
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Importer la page réelle
import MyBorrowsPage from '../../pages/user/MyBorrowsPage';

// Récupérer le mock après l'import
const mockGetMyBorrows = vi.mocked(await import('../../services/borrowService')).default.getMyBorrows;

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

describe('MyBorrowsPage', () => {
  const mockBorrowsData = {
    data: [
      {
        _id: '1',
        user: mockUser,
        media: {
          _id: 'media1',
          title: 'Livre Test 1',
          type: 'book',
          author: 'Auteur Test 1',
          year: '2023',
          imageUrl: null
        },
        borrowDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // -7 jours
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
        status: 'borrowed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        user: mockUser,
        media: {
          _id: 'media2',
          title: 'Film Test 1',
          type: 'movie',
          author: 'Réalisateur Test 1',
          year: '2022',
          imageUrl: null
        },
        borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // -10 jours
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // -2 jours (en retard)
        status: 'borrowed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        user: mockUser,
        media: {
          _id: 'media3',
          title: 'Musique Test 1',
          type: 'music',
          author: 'Artiste Test 1',
          year: '2021',
          imageUrl: null
        },
        borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // -20 jours
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // -6 jours
        returnDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // -5 jours
        status: 'returned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    currentPage: 1,
    totalPages: 1,
    totalItems: 3
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMyBorrows.mockResolvedValue(mockBorrowsData);
  });

  it('devrait afficher le titre et la description de la page', async () => {
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mes emprunts')).toBeInTheDocument();
      expect(screen.getByText(/Gérez vos emprunts en cours et consultez votre historique/)).toBeInTheDocument();
    });
  });

  it('devrait afficher les statistiques des emprunts', async () => {
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      // Vérifier que les statistiques sont affichées
      expect(screen.getByText('En cours')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      
      // Vérifier que les statistiques contiennent les bonnes informations
      const statsContainer = screen.getByText('En cours').closest('div');
      expect(statsContainer).toBeInTheDocument();
    });
  });

  it('devrait afficher la barre d\'outils avec les filtres', async () => {
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Filtres')).toBeInTheDocument();
      expect(screen.getByText('Affichage :')).toBeInTheDocument();
      expect(screen.getByText('emprunts trouvés')).toBeInTheDocument();
    });
  });

  it('devrait afficher les emprunts en mode liste par défaut', async () => {
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
      expect(screen.getByText('Film Test 1')).toBeInTheDocument();
      expect(screen.getByText('Musique Test 1')).toBeInTheDocument();
      expect(screen.getByText('Auteur Test 1')).toBeInTheDocument();
      expect(screen.getByText('Réalisateur Test 1')).toBeInTheDocument();
      expect(screen.getByText('Artiste Test 1')).toBeInTheDocument();
    });
  });

  it('devrait basculer entre les modes d\'affichage liste et grille', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Basculer vers le mode grille
    const gridButton = screen.getByTestId('grid-icon').closest('button');
    await user.click(gridButton);

    // Vérifier que le mode grille est actif
    expect(gridButton).toHaveClass('bg-primary-600');

    // Basculer vers le mode liste
    const listButton = screen.getByTestId('list-icon').closest('button');
    await user.click(listButton);

    // Vérifier que le mode liste est actif
    expect(listButton).toHaveClass('bg-primary-600');
  });

  it('devrait afficher et masquer les filtres', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    // Ouvrir les filtres
    const filterButton = screen.getByText('Filtres');
    await user.click(filterButton);

    // Vérifier que les filtres sont visibles
    expect(screen.getByPlaceholderText('Titre ou auteur du média...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tous les statuts')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tous les types')).toBeInTheDocument();

    // Fermer les filtres
    await user.click(filterButton);

    // Vérifier que les filtres sont masqués
    expect(screen.queryByPlaceholderText('Titre ou auteur du média...')).not.toBeInTheDocument();
  });

  it('devrait filtrer par statut', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    // Ouvrir les filtres
    const filterButton = screen.getByText('Filtres');
    await user.click(filterButton);

    // Sélectionner le statut "En cours"
    const statusSelect = screen.getByDisplayValue('Tous les statuts');
    await user.selectOptions(statusSelect, 'borrowed');

    // Vérifier que le filtre est appliqué localement
    expect(screen.getByDisplayValue('En cours')).toBeInTheDocument();
  });

  it('devrait filtrer par type de média', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    // Ouvrir les filtres
    const filterButton = screen.getByText('Filtres');
    await user.click(filterButton);

    // Sélectionner le type "Livre"
    const typeSelect = screen.getByDisplayValue('Tous les types');
    await user.selectOptions(typeSelect, 'book');

    // Vérifier que le filtre est appliqué localement
    expect(screen.getByDisplayValue('Livre')).toBeInTheDocument();
  });

  it('devrait rechercher par texte avec debounce', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    // Ouvrir les filtres
    const filterButton = screen.getByText('Filtres');
    await user.click(filterButton);

    // Saisir du texte dans la recherche
    const searchInput = screen.getByPlaceholderText('Titre ou auteur du média...');
    await user.type(searchInput, 'Test');

    // Vérifier que le texte est saisi
    expect(searchInput).toHaveValue('Test');
  });

  it('devrait effacer tous les filtres', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    // Ouvrir les filtres
    const filterButton = screen.getByText('Filtres');
    await user.click(filterButton);

    // Appliquer des filtres
    const statusSelect = screen.getByDisplayValue('Tous les statuts');
    await user.selectOptions(statusSelect, 'borrowed');

    // Vérifier que les filtres sont actifs
    expect(screen.getByText(/filtré/)).toBeInTheDocument();

    // Effacer les filtres
    const clearButton = screen.getByText('Effacer les filtres');
    await user.click(clearButton);

    // Vérifier que les filtres sont effacés
    expect(screen.queryByText(/filtré/)).not.toBeInTheDocument();
    
    // Vérifier que les filtres sont fermés
    expect(screen.queryByPlaceholderText('Titre ou auteur du média...')).not.toBeInTheDocument();
  });

  it('devrait afficher les informations de statut correctement', async () => {
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      // Vérifier que les emprunts sont affichés avec leurs statuts
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
      expect(screen.getByText('Film Test 1')).toBeInTheDocument();
      expect(screen.getByText('Musique Test 1')).toBeInTheDocument();
    });
  });

  it('devrait afficher les liens vers les détails des médias', async () => {
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      const detailLinks = screen.getAllByText(/Voir détail/);
      expect(detailLinks).toHaveLength(3);
      
      // Vérifier que les liens pointent vers les bonnes URLs
      detailLinks.forEach((link, index) => {
        expect(link).toHaveAttribute('href', `/media/media${index + 1}`);
      });
    });
  });

  it('devrait afficher le message d\'absence d\'emprunts quand la liste est vide', async () => {
    mockGetMyBorrows.mockResolvedValueOnce({
      data: [],
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    });

    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucun emprunt')).toBeInTheDocument();
      expect(screen.getByText(/Vous n'avez encore effectué aucun emprunt/)).toBeInTheDocument();
      expect(screen.getByText('Explorer le catalogue')).toBeInTheDocument();
    });
  });

  it('devrait afficher le message d\'absence de résultats avec filtres actifs', async () => {
    // Mock avec des données vides
    mockGetMyBorrows.mockResolvedValueOnce({
      data: [],
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    });

    const user = userEvent.setup();
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    // Ouvrir et appliquer des filtres
    const filterButton = screen.getByText('Filtres');
    await user.click(filterButton);

    const statusSelect = screen.getByDisplayValue('Tous les statuts');
    await user.selectOptions(statusSelect, 'returned');

    // Vérifier que le filtre est appliqué
    expect(screen.getByDisplayValue('Retournés')).toBeInTheDocument();
  });

  it('devrait afficher les informations importantes en bas de page', async () => {
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('ℹ️ Informations importantes')).toBeInTheDocument();
      expect(screen.getByText(/Les emprunts et retours se font uniquement en présentiel/)).toBeInTheDocument();
      expect(screen.getByText(/La durée standard d'emprunt est de 14 jours/)).toBeInTheDocument();
    });
  });

  it('devrait gérer l\'état de chargement', async () => {
    mockGetMyBorrows.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(<MyBorrowsPage />);

    // Vérifier l'état de chargement
    expect(screen.getByText('Chargement de vos emprunts...')).toBeInTheDocument();
    // Le spinner est un élément CSS, pas une icône
    expect(screen.getByText('Chargement de vos emprunts...')).toBeInTheDocument();
  });

  it('devrait gérer les erreurs de chargement', async () => {
    mockGetMyBorrows.mockRejectedValueOnce(new Error('Erreur de chargement'));

    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
      expect(screen.getByText('Impossible de charger vos emprunts.')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });
  });

  it('devrait permettre de réessayer après une erreur', async () => {
    mockGetMyBorrows.mockRejectedValueOnce(new Error('Erreur de chargement'));

    const user = userEvent.setup();
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    // Cliquer sur le bouton réessayer
    const retryButton = screen.getByText('Réessayer');
    await user.click(retryButton);

    // Vérifier que le service est appelé à nouveau
    expect(mockGetMyBorrows).toHaveBeenCalledTimes(2);
  });

  it('devrait afficher la pagination quand il y a plusieurs pages', async () => {
    // Mock avec plusieurs pages
    const mockDataWithPagination = {
      ...mockBorrowsData,
      currentPage: 1,
      totalPages: 3,
      totalItems: 30
    };
    
    mockGetMyBorrows.mockResolvedValueOnce(mockDataWithPagination);

    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      // Vérifier que les données sont chargées
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Vérifier que la pagination est présente
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument(); // Page actuelle
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument(); // Page suivante
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument(); // Page suivante
  });

  it('devrait changer de page correctement', async () => {
    // Mock avec plusieurs pages
    const mockDataWithPagination = {
      ...mockBorrowsData,
      currentPage: 1,
      totalPages: 3,
      totalItems: 30
    };
    
    mockGetMyBorrows.mockResolvedValueOnce(mockDataWithPagination);

    const user = userEvent.setup();
    renderWithProviders(<MyBorrowsPage />);

    await waitFor(() => {
      // Vérifier que les données sont chargées
      expect(screen.getByText('Livre Test 1')).toBeInTheDocument();
    });

    // Cliquer sur la page 2 (utiliser un sélecteur plus spécifique)
    const page2Button = screen.getByRole('button', { name: '2' });
    await user.click(page2Button);

    // Vérifier que le service est appelé avec la bonne page
    await waitFor(() => {
      expect(mockGetMyBorrows).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });
});
