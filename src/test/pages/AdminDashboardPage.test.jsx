import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboardPage from '../../pages/admin/AdminDashboardPage';

// Mock du service dashboard
vi.mock('../../services/dashboardService', () => ({
  default: {
    getDashboardStats: vi.fn()
  }
}));

// Récupérer le mock après sa création
const mockDashboardService = vi.mocked(await import('../../services/dashboardService')).default;

// Mock des composants enfants
vi.mock('../../components/admin/StatsCards', () => ({
  default: ({ stats, loading }) => (
    <div data-testid="stats-cards">
      {loading ? 'Chargement des statistiques...' : 'Statistiques chargées'}
    </div>
  )
}));

vi.mock('../../components/admin/RecentActivity', () => ({
  default: ({ activities, loading }) => (
    <div data-testid="recent-activity">
      {loading ? 'Chargement des activités...' : 'Activités récentes chargées'}
    </div>
  )
}));

vi.mock('../../components/admin/AlertsPanel', () => ({
  default: ({ alerts, loading }) => (
    <div data-testid="alerts-panel">
      {loading ? 'Chargement des alertes...' : 'Alertes chargées'}
    </div>
  )
}));

// Données de test correspondant à la structure DashboardStats
const mockDashboardStats = {
  users: {
    total: 150,
    active: 140,
    inactive: 10,
    newThisMonth: 5
  },
  media: {
    total: 500,
    byType: {
      book: 300,
      movie: 150,
      music: 50
    }
  },
  borrows: {
    active: 25,
    overdue: 5,
    returned: 45,
    total: 75
  },
  topBorrowedMedia: [
    { _id: '1', title: 'Livre populaire', type: 'book', author: 'Auteur', borrowCount: 15 }
  ],
  recentBorrows: [
    { _id: '1', user: { _id: '1', name: 'User', email: 'user@test.com' }, media: { _id: '1', title: 'Media', type: 'book' }, borrowDate: '2023-01-15', dueDate: '2023-02-15', status: 'borrowed', createdAt: '2023-01-15', updatedAt: '2023-01-15' }
  ],
  mostActiveUsers: [
    { _id: '1', name: 'User Actif', email: 'user@test.com', borrowCount: 10 }
  ]
};

describe('AdminDashboardPage', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Configurer le mock du service
    mockDashboardService.getDashboardStats.mockResolvedValue(mockDashboardStats);
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

  it('devrait afficher le titre du dashboard administrateur', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Administrateur')).toBeInTheDocument();
      expect(screen.getByText('Vue d\'ensemble de votre médiathèque')).toBeInTheDocument();
    });
  });

  it('devrait afficher la section de gestion administrateur', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Gestion administrateur')).toBeInTheDocument();
    });
  });

  it('devrait afficher le lien vers la gestion des utilisateurs', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      const usersLink = screen.getByText('Gérer les utilisateurs');
      expect(usersLink).toBeInTheDocument();
      expect(usersLink.closest('a')).toHaveAttribute('href', '/admin/users');
    });
  });

  it('devrait afficher le lien vers la gestion des médias', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      const mediaLink = screen.getByText('Gérer les médias');
      expect(mediaLink).toBeInTheDocument();
      expect(mediaLink.closest('a')).toHaveAttribute('href', '/admin/media');
    });
  });

  it('devrait afficher le lien vers la gestion des emprunts', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      const borrowsLink = screen.getByText('Gérer les emprunts');
      expect(borrowsLink).toBeInTheDocument();
      expect(borrowsLink.closest('a')).toHaveAttribute('href', '/admin/borrows');
    });
  });

  it('devrait afficher le lien vers la gestion des catégories', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      const categoriesLink = screen.getByText('Gérer les catégories');
      expect(categoriesLink).toBeInTheDocument();
      expect(categoriesLink.closest('a')).toHaveAttribute('href', '/admin/categories');
    });
  });

  it('devrait afficher les composants de statistiques', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
    });
  });

  it('devrait afficher le composant d\'activités récentes', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('recent-activity')).toBeInTheDocument();
    });
  });

  it('devrait afficher le composant d\'alertes', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alerts-panel')).toBeInTheDocument();
    });
  });

  it('devrait afficher un message d\'erreur en cas d\'échec de chargement', async () => {
    mockDashboardService.getDashboardStats.mockRejectedValue(new Error('Erreur de chargement'));

    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement du dashboard')).toBeInTheDocument();
      expect(screen.getByText('Impossible de récupérer les statistiques du dashboard.')).toBeInTheDocument();
    });
  });

  it('devrait afficher le bouton de réessai en cas d\'erreur', async () => {
    mockDashboardService.getDashboardStats.mockRejectedValue(new Error('Erreur de chargement'));

    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: /réessayer/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveClass('btn-primary');
    });
  });

  it('devrait appeler refetch lors du clic sur le bouton de réessai', async () => {
    mockDashboardService.getDashboardStats.mockRejectedValue(new Error('Erreur de chargement'));

    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: /réessayer/i });
      fireEvent.click(retryButton);
    });

    // Vérifier que getDashboardStats est appelé à nouveau
    expect(mockDashboardService.getDashboardStats).toHaveBeenCalledTimes(2);
  });

  it('devrait avoir la classe bg-gray-50 sur le conteneur principal', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      const mainContainer = screen.getByText('Dashboard Administrateur').closest('.bg-gray-50');
      expect(mainContainer).toHaveClass('bg-gray-50', 'min-h-screen');
    });
  });

  it('devrait afficher les descriptions des sections de gestion', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Voir et gérer tous les utilisateurs de la médiathèque')).toBeInTheDocument();
      expect(screen.getByText('Ajouter, modifier ou supprimer des médias')).toBeInTheDocument();
      expect(screen.getByText('Suivre et gérer tous les emprunts en cours')).toBeInTheDocument();
      expect(screen.getByText('Organiser la collection avec des catégories et tags')).toBeInTheDocument();
    });
  });

  it('devrait avoir des liens avec la classe btn-primary', async () => {
    renderWithQueryClient(<AdminDashboardPage />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        if (link.textContent.includes('Gérer')) {
          expect(link).toHaveClass('btn-primary');
        }
      });
    });
  });
});
