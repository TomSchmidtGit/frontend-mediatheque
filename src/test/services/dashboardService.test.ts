import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dashboardService from '../../services/dashboardService';
import api from '../../services/api';
import type { DashboardStats } from '../../types';

// Mock du service API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('DashboardService', () => {
  const mockApi = vi.mocked(api) as any;

  const mockDashboardStats: DashboardStats = {
    users: {
      total: 150,
      active: 120,
      inactive: 30,
      newThisMonth: 15
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
      active: 80,
      overdue: 5,
      returned: 1200,
      total: 1285
    },
    topBorrowedMedia: [
      {
        _id: 'media-1',
        title: 'Popular Book',
        type: 'book',
        author: 'Famous Author',
        borrowCount: 45
      }
    ],
    recentBorrows: [],
    mostActiveUsers: [
      {
        _id: 'user-1',
        name: 'Active User',
        email: 'active@example.com',
        borrowCount: 25
      }
    ],
    alerts: [
      {
        type: 'warning',
        message: '5 emprunts en retard',
        priority: 'high'
      }
    ],
    overdueDetails: [
      {
        _id: 'borrow-1',
        user: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        media: {
          title: 'Overdue Book'
        },
        dueDate: '2024-01-01T00:00:00.000Z',
        daysOverdue: 5
      }
    ]
  };

  const mockBorrowStatsData = {
    period: 'month',
    startDate: '2024-01-01T00:00:00.000Z',
    data: [
      { _id: '2024-01-01', count: 15 },
      { _id: '2024-01-02', count: 12 },
      { _id: '2024-01-03', count: 18 }
    ]
  };

  const mockMediaCategoryStats = [
    {
      _id: 'fiction',
      types: [
        { type: 'book', count: 150 },
        { type: 'movie', count: 75 },
        { type: 'music', count: 25 }
      ],
      total: 250
    },
    {
      _id: 'non-fiction',
      types: [
        { type: 'book', count: 100 },
        { type: 'movie', count: 50 },
        { type: 'music', count: 20 }
      ],
      total: 170
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('devrait récupérer les statistiques du tableau de bord avec succès', async () => {
      const mockResponse = { data: mockDashboardStats };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dashboardService.getDashboardStats();

      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/stats');
      expect(result).toEqual(mockDashboardStats);
    });

    it('devrait gérer les erreurs de récupération des statistiques', async () => {
      const mockError = new Error('Failed to fetch dashboard stats');
      mockApi.get.mockRejectedValue(mockError);

      await expect(dashboardService.getDashboardStats()).rejects.toThrow('Failed to fetch dashboard stats');
      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/stats');
    });

    it('devrait gérer les erreurs d\'authentification', async () => {
      const mockError = new Error('Unauthorized');
      mockApi.get.mockRejectedValue(mockError);

      await expect(dashboardService.getDashboardStats()).rejects.toThrow('Unauthorized');
      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/stats');
    });
  });

  describe('getBorrowStatsByPeriod', () => {
    it('devrait récupérer les statistiques d\'emprunts par période avec succès (période par défaut)', async () => {
      const mockResponse = { data: mockBorrowStatsData };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dashboardService.getBorrowStatsByPeriod();

      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/borrows/stats?period=month');
      expect(result).toEqual(mockBorrowStatsData);
    });

    it('devrait récupérer les statistiques d\'emprunts par semaine', async () => {
      const mockResponse = { data: mockBorrowStatsData };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dashboardService.getBorrowStatsByPeriod('week');

      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/borrows/stats?period=week');
      expect(result).toEqual(mockBorrowStatsData);
    });

    it('devrait récupérer les statistiques d\'emprunts par année', async () => {
      const mockResponse = { data: mockBorrowStatsData };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dashboardService.getBorrowStatsByPeriod('year');

      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/borrows/stats?period=year');
      expect(result).toEqual(mockBorrowStatsData);
    });

    it('devrait gérer les erreurs de récupération des statistiques d\'emprunts', async () => {
      const mockError = new Error('Failed to fetch borrow stats');
      mockApi.get.mockRejectedValue(mockError);

      await expect(dashboardService.getBorrowStatsByPeriod()).rejects.toThrow('Failed to fetch borrow stats');
      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/borrows/stats?period=month');
    });

    it('devrait gérer les erreurs de réseau', async () => {
      const mockError = new Error('Network error');
      mockApi.get.mockRejectedValue(mockError);

      await expect(dashboardService.getBorrowStatsByPeriod('week')).rejects.toThrow('Network error');
      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/borrows/stats?period=week');
    });
  });

  describe('getMediaStatsByCategory', () => {
    it('devrait récupérer les statistiques des médias par catégorie avec succès', async () => {
      const mockResponse = { data: mockMediaCategoryStats };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dashboardService.getMediaStatsByCategory();

      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/media/categories');
      expect(result).toEqual(mockMediaCategoryStats);
    });

    it('devrait gérer les erreurs de récupération des statistiques des médias', async () => {
      const mockError = new Error('Failed to fetch media stats');
      mockApi.get.mockRejectedValue(mockError);

      await expect(dashboardService.getMediaStatsByCategory()).rejects.toThrow('Failed to fetch media stats');
      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/media/categories');
    });

    it('devrait gérer les erreurs de serveur', async () => {
      const mockError = new Error('Server error');
      mockApi.get.mockRejectedValue(mockError);

      await expect(dashboardService.getMediaStatsByCategory()).rejects.toThrow('Server error');
      expect(mockApi.get).toHaveBeenCalledWith('/dashboard/media/categories');
    });
  });
});
