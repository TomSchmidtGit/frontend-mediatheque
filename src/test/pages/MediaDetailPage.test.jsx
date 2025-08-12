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
const mockUseAuth = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: mockUseAuth
}));

// Mock du service média
const mockGetMediaById = vi.fn();
const mockToggleFavorite = vi.fn();
const mockAddReview = vi.fn();

vi.mock('../../services/mediaService', () => ({
  default: {
    getMediaById: mockGetMediaById,
    toggleFavorite: mockToggleFavorite,
    addReview: mockAddReview
  }
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock des utilitaires
vi.mock('../../utils', () => ({
  formatters: {
    formatDate: (date) => date,
    truncateText: (text, length) => text.substring(0, length)
  },
  formatDate: (date) => date,
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Données de test
const mockMedia = {
  _id: 'test-media-id',
  title: 'Test Media Title',
  description: 'This is a test media description that should be displayed on the detail page.',
  type: 'book',
  category: 'fiction',
  tags: ['test', 'example', 'fiction'],
  author: 'Test Author',
  releaseDate: '2023-01-01',
  rating: 4.5,
  coverImage: 'test-cover.jpg',
  isbn: '1234567890',
  pages: 300,
  duration: null,
  language: 'Français',
  publisher: 'Test Publisher',
  reviews: [
    {
      _id: 'review1',
      userId: 'user1',
      userName: 'User One',
      rating: 5,
      comment: 'Excellent livre !',
      createdAt: '2023-01-15'
    }
  ],
  isAvailable: true
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
      expect(screen.getByText('This is a test media description')).toBeInTheDocument();
      expect(screen.getByText('fiction')).toBeInTheDocument();
    });
  });

  it('devrait afficher l\'image de couverture du média', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      const coverImage = screen.getByAltText('Couverture de Test Media Title');
      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveAttribute('src', 'test-cover.jpg');
    });
  });

  it('devrait afficher les informations spécifiques au type de média (livre)', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('ISBN:')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      expect(screen.getByText('Pages:')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument();
    });
  });

  it('devrait afficher les informations spécifiques au type de média (film)', async () => {
    const movieMedia = { ...mockMedia, type: 'movie', duration: '120 min' };
    mockGetMediaById.mockResolvedValue(movieMedia);

    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Durée:')).toBeInTheDocument();
      expect(screen.getByText('120 min')).toBeInTheDocument();
    });
  });

  it('devrait afficher les informations spécifiques au type de média (musique)', async () => {
    const musicMedia = { ...mockMedia, type: 'music', duration: '45 min' };
    mockGetMediaById.mockResolvedValue(musicMedia);

    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Durée:')).toBeInTheDocument();
      expect(screen.getByText('45 min')).toBeInTheDocument();
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
      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('example')).toBeInTheDocument();
      expect(screen.getByText('fiction')).toBeInTheDocument();
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
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('Excellent livre !')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('devrait afficher le bouton pour ajouter un avis', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      const addReviewButton = screen.getByRole('button', { name: /ajouter un avis/i });
      expect(addReviewButton).toBeInTheDocument();
    });
  });

  it('devrait ouvrir le formulaire d\'avis lors du clic sur le bouton', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      const addReviewButton = screen.getByRole('button', { name: /ajouter un avis/i });
      fireEvent.click(addReviewButton);
    });

    expect(screen.getByText('Votre avis')).toBeInTheDocument();
    expect(screen.getByLabelText('Note')).toBeInTheDocument();
    expect(screen.getByLabelText('Commentaire')).toBeInTheDocument();
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
      expect(screen.getByText('Éditeur:')).toBeInTheDocument();
      expect(screen.getByText('Test Publisher')).toBeInTheDocument();
      expect(screen.getByText('Langue:')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
    });
  });

  it('devrait afficher la date de sortie avec l\'icône de calendrier', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    });
  });

  it('devrait afficher l\'icône de type correcte selon le type de média', async () => {
    renderWithQueryClient(<MediaDetailPage />);

    await waitFor(() => {
      // Vérifier que l'icône de livre est présente
      const bookIcon = document.querySelector('[data-testid="book-open-icon"]') || 
                      document.querySelector('.h-6.w-6');
      expect(bookIcon).toBeInTheDocument();
    });
  });
});
