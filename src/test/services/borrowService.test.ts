import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import borrowService from '../../services/borrowService';
import api from '../../services/api';
import type { Borrow } from '../../types';

// Mock du service API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('BorrowService', () => {
  const mockApi = vi.mocked(api) as any;

  const mockBorrow: Borrow = {
    _id: 'borrow-123',
    user: {
      _id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      favorites: [],
      actif: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    media: {
      _id: 'media-123',
      title: 'Test Book',
      type: 'book',
      author: 'Test Author',
      year: 2024,
      available: false,
      tags: [],
      reviews: [],
      averageRating: 4.5,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    borrowDate: '2024-01-01T00:00:00.000Z',
    dueDate: '2024-02-01T00:00:00.000Z',
    status: 'borrowed',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyBorrows', () => {
    it('devrait récupérer les emprunts sans filtres', async () => {
      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await borrowService.getMyBorrows();

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/mine?');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les emprunts avec pagination', async () => {
      const filters = {
        page: 2,
        limit: 10
      };

      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 2,
          totalPages: 3,
          totalItems: 25
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await borrowService.getMyBorrows(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/mine?page=2&limit=10');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les emprunts avec recherche', async () => {
      const filters = {
        search: 'test book'
      };

      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await borrowService.getMyBorrows(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/mine?search=test+book');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les emprunts avec filtre de statut', async () => {
      const filters = {
        status: 'borrowed' as const
      };

      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await borrowService.getMyBorrows(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/mine?status=borrowed');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les emprunts avec filtre de type de média', async () => {
      const filters = {
        mediaType: 'book' as const
      };

      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await borrowService.getMyBorrows(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/mine?mediaType=book');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les emprunts avec tous les filtres', async () => {
      const filters = {
        page: 1,
        limit: 20,
        search: 'fiction',
        status: 'overdue' as const,
        mediaType: 'movie' as const
      };

      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await borrowService.getMyBorrows(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/mine?page=1&limit=20&search=fiction&status=overdue&mediaType=movie');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait ignorer le filtre de statut "all"', async () => {
      const filters = {
        status: 'all' as const
      };

      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await borrowService.getMyBorrows(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/mine?');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de récupération des emprunts', async () => {
      const mockError = new Error('Failed to fetch borrows');
      mockApi.get.mockRejectedValue(mockError);

      await expect(borrowService.getMyBorrows()).rejects.toThrow('Failed to fetch borrows');
      expect(mockApi.get).toHaveBeenCalledWith('/borrow/mine?');
    });

    it('devrait gérer les erreurs de réseau', async () => {
      const mockError = new Error('Network error');
      mockApi.get.mockRejectedValue(mockError);

      await expect(borrowService.getMyBorrows()).rejects.toThrow('Network error');
      expect(mockApi.get).toHaveBeenCalledWith('/borrow/mine?');
    });

    it('devrait gérer les erreurs d\'authentification', async () => {
      const mockError = new Error('Unauthorized');
      mockApi.get.mockRejectedValue(mockError);

      await expect(borrowService.getMyBorrows()).rejects.toThrow('Unauthorized');
      expect(mockApi.get).toHaveBeenCalledWith('/borrow/mine?');
    });
  });
});
