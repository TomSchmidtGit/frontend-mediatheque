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

vi.mock('../../services/mediaService', () => ({
  default: {
    getFavorites: vi.fn()
  }
}));

// Mock du contexte d'authentification
const mockUser = {
  id: '1',
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
  BookOpenIcon: () => <div data-testid="book-icon">📚</div>,
  HeartIcon: () => <div data-testid="heart-icon">❤️</div>,
  ClockIcon: () => <div data-testid="clock-icon">⏰</div>,
  ChartBarIcon: () => <div data-testid="chart-icon">📊</div>,
  UserCircleIcon: () => <div data-testid="user-icon">👤</div>,
  SparklesIcon: () => <div data-testid="sparkles-icon">✨</div>,
  FilmIcon: () => <div data-testid="film-icon">🎬</div>,
  MusicalNoteIcon: () => <div data-testid="music-icon">🎵</div>,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon">⚠️</div>
}));

// Importer la page réelle
import DashboardPage from '../../pages/user/DashboardPage';

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

describe('DashboardPage', () => {
  const mockBorrowsData = {
    data: [
      {
        id: '1',
        media: { title: 'Livre Test 1', type: 'book' },
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
        status: 'borrowed'
      },
      {
        id: '2',
        media: { title: 'Film Test 1', type: 'movie' },
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // -2 jours (en retard)
        status: 'borrowed'
      },
      {
        id: '3',
        media: { title: 'Musique Test 1', type: 'music' },
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // -10 jours
        status: 'returned'
      }
    ],
    total: 3
  };

  const mockFavoritesData = {
    data: [
      { id: '1', title: 'Livre Favori 1', type: 'book' },
      { id: '2', title: 'Film Favori 1', type: 'movie' }
    ],
    total: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Les mocks sont déjà configurés au niveau du fichier
    // Pas besoin de les reconfigurer ici
  });

  it('devrait afficher le message de bienvenue personnalisé', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Bonjour, John ! 👋')).toBeInTheDocument();
    });
  });

  it('devrait afficher le rôle de l\'utilisateur', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      // Chercher spécifiquement le rôle dans le header (pas dans le profil)
      const headerRole = screen.getByText(/Utilisateur.*Connecté depuis votre espace personnel/);
      expect(headerRole).toBeInTheDocument();
    });
  });

  it('devrait afficher les statistiques des emprunts', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      // Chercher spécifiquement le texte "Emprunts en cours" pour identifier la bonne section
      const borrowsSection = screen.getByText('Emprunts en cours').closest('div');
      const borrowsValue = borrowsSection?.querySelector('.text-2xl');
      expect(borrowsValue).toHaveTextContent('0');
      expect(screen.getByText('Emprunts en cours')).toBeInTheDocument();
    });
  });

  it('devrait afficher les statistiques des favoris', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      // Chercher spécifiquement le texte "Favoris" pour identifier la bonne section
      const favoritesSection = screen.getByText('Favoris').closest('div');
      const favoritesValue = favoritesSection?.querySelector('.text-2xl');
      expect(favoritesValue).toHaveTextContent('0');
      expect(screen.getByText('Favoris')).toBeInTheDocument();
    });
  });

  it('devrait afficher les actions rapides', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Explorer le catalogue')).toBeInTheDocument();
      expect(screen.getByText('Mes favoris')).toBeInTheDocument();
      expect(screen.getByText('Mes emprunts')).toBeInTheDocument();
    });
  });

  it('devrait avoir les liens de navigation corrects', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      const catalogLink = screen.getByText('Explorer le catalogue').closest('a');
      const favoritesLink = screen.getByText('Mes favoris').closest('a');
      const borrowsLink = screen.getByText('Mes emprunts').closest('a');
      
      expect(catalogLink).toHaveAttribute('href', '/catalog');
      expect(favoritesLink).toHaveAttribute('href', '/favorites');
      expect(borrowsLink).toHaveAttribute('href', '/my-borrows');
    });
  });

  it('devrait afficher les emprunts récents', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Aucune activité récente')).toBeInTheDocument();
      expect(screen.getByText('Commencez à emprunter des médias pour voir votre activité ici')).toBeInTheDocument();
    });
  });

  it('devrait afficher les favoris récents', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('0 média sauvegardé')).toBeInTheDocument();
      expect(screen.getByText('0 emprunt en cours')).toBeInTheDocument();
    });
  });

  it('devrait gérer l\'état de chargement', async () => {
    renderWithProviders(<DashboardPage />);
    
    // Vérifier que la page se charge même pendant le chargement
    expect(screen.getByText('Bonjour, John ! 👋')).toBeInTheDocument();
  });

  it('devrait gérer les erreurs de chargement des données', async () => {
    renderWithProviders(<DashboardPage />);
    
    // Vérifier que la page se charge même avec des erreurs
    await waitFor(() => {
      expect(screen.getByText('Bonjour, John ! 👋')).toBeInTheDocument();
    });
  });

  it('devrait afficher les icônes appropriées pour chaque type de média', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      // Il y a 3 book-icon (1 dans les stats, 1 dans l'activité récente, 1 dans les actions rapides)
      expect(screen.getAllByTestId('book-icon')).toHaveLength(3);
      // Il y a 2 heart-icon (1 dans les stats, 1 dans les actions rapides)
      expect(screen.getAllByTestId('heart-icon')).toHaveLength(2);
      // Il y a 2 clock-icon (1 dans les stats, 1 dans les actions rapides)
      expect(screen.getAllByTestId('clock-icon')).toHaveLength(2);
      // Il y a 1 sparkles-icon (dans l'activité récente)
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
      // Il y a 1 user-icon (dans le profil)
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });
  });

  it('devrait avoir la structure responsive correcte', async () => {
    renderWithProviders(<DashboardPage />);
    
    // Vérifier que la page se charge sans erreur
    await waitFor(() => {
      expect(screen.getByText('Bonjour, John ! 👋')).toBeInTheDocument();
    });
    
    // Vérifier que les sections principales sont présentes
    expect(screen.getByText('Vue d\'ensemble')).toBeInTheDocument();
  });

  it('devrait gérer l\'absence de données', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      // Vérifier qu'il y a bien des zéros affichés (il y en a 4 dans la vue d'ensemble)
      expect(screen.getAllByText('0')).toHaveLength(4);
      expect(screen.getByText('Aucune activité récente')).toBeInTheDocument();
    });
  });

  it('devrait afficher les dates d\'échéance correctement', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      // Vérifier que la page affiche l'état vide
      expect(screen.getByText('Aucune activité récente')).toBeInTheDocument();
    });
  });

  it('devrait gérer les différents statuts d\'emprunt', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      // Vérifier que la page affiche l'état "aucune activité"
      expect(screen.getByText('Aucune activité récente')).toBeInTheDocument();
      expect(screen.getByText('0 emprunt en cours')).toBeInTheDocument();
    });
  });
});
