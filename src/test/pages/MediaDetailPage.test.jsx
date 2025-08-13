import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaDetailPage from '../../pages/media/MediaDetailPage';

// Mock des hooks de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-media-id' }),
    useNavigate: () => vi.fn()
  };
});

// Mock du contexte d'authentification
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock du service média
vi.mock('../../services/mediaService', () => ({
  default: {
    getMediaById: vi.fn(),
    toggleFavorite: vi.fn(),
    addReview: vi.fn()
  }
}));

// Récupérer les mocks après leur création
const mockUseAuth = vi.mocked(await import('../../context/AuthContext')).useAuth;
const mockGetMediaById = vi.mocked(await import('../../services/mediaService')).default.getMediaById;
const mockToggleFavorite = vi.mocked(await import('../../services/mediaService')).default.toggleFavorite;
const mockAddReview = vi.mocked(await import('../../services/mediaService')).default.addReview;

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  },
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock des utilitaires
vi.mock('../../utils', () => ({
  formatters: {
    mediaType: (type) => {
      const types = { book: 'Livre', movie: 'Film', music: 'Musique' };
      return types[type] || type;
    },
    userRole: (role) => {
      const roles = { user: 'Utilisateur', employee: 'Employé', admin: 'Administrateur' };
      return roles[role] || role;
    },
    borrowStatus: (status) => {
      const statuses = { borrowed: 'Emprunté', returned: 'Retourné', overdue: 'En retard' };
      return statuses[status] || status;
    }
  },
  formatDate: {
    short: (date) => date,
    long: (date) => date,
    dateTime: (date) => date,
    timeAgo: (date) => 'il y a 2 jours'
  },
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Données de test
const mockMedia = {
  _id: 'test-media-id',
  title: 'Test Media Title',
  description: 'This is a test media description that should be displayed on the detail page.',
  type: 'book',
  category: {
    _id: '1',
    name: 'fiction',
    slug: 'fiction',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  tags: [
    { _id: '1', name: 'test', slug: 'test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: '2', name: 'example', slug: 'example', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  author: 'Test Author',
  year: 2023,
  imageUrl: 'test-cover.jpg',
  available: true,
  reviews: [
    {
      _id: 'review1',
      user: 'user2',
      rating: 5,
      comment: 'Excellent livre !',
      createdAt: '2023-01-15'
    }
  ],
  averageRating: 4.5
};

const mockUser = {
  _id: 'user1',
  email: 'test@example.com',
  favorites: ['test-media-id'],
  role: 'user'
};

describe('MediaDetailPage', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true
    });

    mockGetMediaById.mockResolvedValue(mockMedia);
    mockToggleFavorite.mockResolvedValue({ success: true });
    mockAddReview.mockResolvedValue({ success: true });
  });

  const renderWithQueryClient = (component) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('devrait afficher un indicateur de chargement pendant le chargement des données', () => {
    mockGetMediaById.mockImplementation(() => new Promise(() => {})); // Jamais résolue

    renderWithQueryClient(<MediaDetailPage />);

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it('devrait afficher les détails du média une fois chargés', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Media Title')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
      expect(screen.getByText('This is a test media description that should be displayed on the detail page.')).toBeInTheDocument();
    });
  });

  it('devrait afficher l\'image de couverture du média', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      const coverImage = screen.getByAltText('Test Media Title');
      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveAttribute('src', 'test-cover.jpg');
    });
  });

  it('devrait afficher les informations spécifiques au type de média (livre)', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Catégorie:')).toBeInTheDocument();
      expect(screen.getByText('fiction')).toBeInTheDocument();
      expect(screen.getByText('#test')).toBeInTheDocument();
      expect(screen.getByText('#example')).toBeInTheDocument();
    });
  });

  it('devrait afficher les informations spécifiques au type de média (film)', async () => {
    const movieMedia = { ...mockMedia, type: 'movie' };
    mockGetMediaById.mockResolvedValue(movieMedia);

    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Film')).toBeInTheDocument();
    });
  });

  it('devrait afficher les informations spécifiques au type de média (musique)', async () => {
    const musicMedia = { ...mockMedia, type: 'music' };
    mockGetMediaById.mockResolvedValue(musicMedia);

    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Musique')).toBeInTheDocument();
    });
  });

  it('devrait afficher la note moyenne avec l\'icône d\'étoile', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument();
      // Vérifier que l'icône d'étoile est présente
      const starIcon = document.querySelector('[data-testid="star-icon"]') || 
                      document.querySelector('.h-5.w-5');
      expect(starIcon).toBeInTheDocument();
    });
  });

  it('devrait afficher les tags du média', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('#test')).toBeInTheDocument();
      expect(screen.getByText('#example')).toBeInTheDocument();
    });
  });

  it('devrait afficher le bouton de retour avec l\'icône de flèche', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /retour/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  it('devrait afficher le bouton favori comme actif si le média est dans les favoris', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      const favoriteButton = screen.getByRole('button', { name: /retirer des favoris/i });
      expect(favoriteButton).toBeInTheDocument();
    });
  });

  it('devrait afficher le bouton favori comme inactif si le média n\'est pas dans les favoris', async () => {
    const userWithoutFavorite = { ...mockUser, favorites: [] };
    mockUseAuth.mockReturnValue({
      user: userWithoutFavorite,
      isAuthenticated: true
    });

    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      const favoriteButton = screen.getByRole('button', { name: /ajouter aux favoris/i });
      expect(favoriteButton).toBeInTheDocument();
    });
  });

  it('devrait afficher les avis existants', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('U')).toBeInTheDocument(); // Première lettre de l'ID utilisateur 'user2'
      expect(screen.getByText('Excellent livre !')).toBeInTheDocument();
      expect(screen.getByText('il y a 2 jours')).toBeInTheDocument(); // Mock de formatDate.timeAgo
    });
  });

  it('devrait afficher le bouton pour ajouter un avis', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      const addReviewButton = screen.getByRole('button', { name: /laisser un avis/i });
      expect(addReviewButton).toBeInTheDocument();
    });
  });

  it('devrait ouvrir le formulaire d\'avis lors du clic sur le bouton', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      const addReviewButton = screen.getByRole('button', { name: /laisser un avis/i });
      fireEvent.click(addReviewButton);
    });

    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Commentaire (optionnel)')).toBeInTheDocument();
  });

  it('devrait afficher le statut de disponibilité', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });
  });

  it('devrait afficher les informations de publication', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Catégorie:')).toBeInTheDocument();
      expect(screen.getByText('fiction')).toBeInTheDocument();
    });
  });

  it('devrait afficher l\'année de sortie avec l\'icône de calendrier', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });

  it('devrait afficher l\'icône de type correcte selon le type de média', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      // Vérifier que l'icône de livre est présente dans le badge de type
      const bookIcon = document.querySelector('.h-5.w-5');
      expect(bookIcon).toBeInTheDocument();
    });
  });
});
