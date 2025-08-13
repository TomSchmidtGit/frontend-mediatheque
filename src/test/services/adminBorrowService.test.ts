import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import adminBorrowService from '../../services/adminBorrowService';
import api from '../../services/api';
import type { Borrow } from '../../types';
import type { BorrowFilters, CreateBorrowData } from '../../services/adminBorrowService';

// Mock du service API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('AdminBorrowService', () => {
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

  const mockCreateBorrowData: CreateBorrowData = {
    userId: 'user-123',
    mediaId: 'media-123',
    dueDate: '2024-02-01T00:00:00.000Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getBorrows', () => {
    it('devrait récupérer tous les emprunts sans filtres', async () => {
      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.getBorrows();

      expect(mockApi.get).toHaveBeenCalledWith('/borrow?');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les emprunts avec tous les filtres', async () => {
      const filters: BorrowFilters = {
        page: 2,
        limit: 20,
        search: 'test book',
        status: 'borrowed',
        user: 'user-123',
        mediaType: 'book'
      };

      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 2,
          totalPages: 3,
          totalItems: 50
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.getBorrows(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow?page=2&limit=20&search=test+book&status=borrowed&user=user-123&mediaType=book');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait ignorer le filtre de statut "all"', async () => {
      const filters: BorrowFilters = {
        status: 'all'
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

      const result = await adminBorrowService.getBorrows(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow?');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de récupération des emprunts', async () => {
      const mockError = new Error('Failed to fetch borrows');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminBorrowService.getBorrows()).rejects.toThrow('Failed to fetch borrows');
      expect(mockApi.get).toHaveBeenCalledWith('/borrow?');
    });
  });

  describe('getBorrowById', () => {
    it('devrait récupérer un emprunt par ID avec succès', async () => {
      const mockResponse = { data: mockBorrow };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.getBorrowById('borrow-123');

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/borrow-123');
      expect(result).toEqual(mockBorrow);
    });

    it('devrait gérer les erreurs de récupération par ID', async () => {
      const mockError = new Error('Borrow not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminBorrowService.getBorrowById('invalid-id')).rejects.toThrow('Borrow not found');
      expect(mockApi.get).toHaveBeenCalledWith('/borrow/invalid-id');
    });
  });

  describe('createBorrow', () => {
    it('devrait créer un nouvel emprunt avec succès', async () => {
      const mockResponse = { data: mockBorrow };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.createBorrow(mockCreateBorrowData);

      expect(mockApi.post).toHaveBeenCalledWith('/borrow', mockCreateBorrowData);
      expect(result).toEqual(mockBorrow);
    });

    it('devrait créer un emprunt sans date d\'échéance', async () => {
      const borrowDataWithoutDueDate = {
        userId: 'user-123',
        mediaId: 'media-123'
      };

      const mockResponse = { data: mockBorrow };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.createBorrow(borrowDataWithoutDueDate);

      expect(mockApi.post).toHaveBeenCalledWith('/borrow', borrowDataWithoutDueDate);
      expect(result).toEqual(mockBorrow);
    });

    it('devrait gérer les erreurs de création d\'emprunt', async () => {
      const mockError = new Error('User or media not found');
      mockApi.post.mockRejectedValue(mockError);

      await expect(adminBorrowService.createBorrow(mockCreateBorrowData)).rejects.toThrow('User or media not found');
      expect(mockApi.post).toHaveBeenCalledWith('/borrow', mockCreateBorrowData);
    });
  });

  describe('returnBorrow', () => {
    it('devrait marquer un emprunt comme retourné avec succès', async () => {
      const mockResponse = {
        data: { message: 'Emprunt retourné avec succès' }
      };
      
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.returnBorrow('borrow-123');

      expect(mockApi.put).toHaveBeenCalledWith('/borrow/borrow-123/return');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de retour d\'emprunt', async () => {
      const mockError = new Error('Borrow not found');
      mockApi.put.mockRejectedValue(mockError);

      await expect(adminBorrowService.returnBorrow('invalid-id')).rejects.toThrow('Borrow not found');
      expect(mockApi.put).toHaveBeenCalledWith('/borrow/invalid-id/return');
    });
  });

  describe('extendBorrow', () => {
    it('devrait prolonger un emprunt avec une nouvelle date avec succès', async () => {
      const newDueDate = '2024-03-01T00:00:00.000Z';
      const mockResponse = { data: { ...mockBorrow, dueDate: newDueDate } };
      
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.extendBorrow('borrow-123', newDueDate);

      expect(mockApi.put).toHaveBeenCalledWith('/borrow/borrow-123/extend', { newDueDate });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait prolonger un emprunt sans nouvelle date', async () => {
      const mockResponse = { data: mockBorrow };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.extendBorrow('borrow-123');

      expect(mockApi.put).toHaveBeenCalledWith('/borrow/borrow-123/extend', {});
      expect(result).toEqual(mockBorrow);
    });

    it('devrait gérer les erreurs de prolongation d\'emprunt', async () => {
      const mockError = new Error('Borrow not found');
      mockApi.put.mockRejectedValue(mockError);

      await expect(adminBorrowService.extendBorrow('invalid-id')).rejects.toThrow('Borrow not found');
      expect(mockApi.put).toHaveBeenCalledWith('/borrow/invalid-id/extend', {});
    });
  });

  describe('getUserBorrows', () => {
    it('devrait récupérer les emprunts d\'un utilisateur avec pagination par défaut', async () => {
      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.getUserBorrows('user-123');

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/user/user-123?page=1&limit=10');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les emprunts d\'un utilisateur avec pagination personnalisée', async () => {
      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 2,
          totalPages: 3,
          totalItems: 25
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.getUserBorrows('user-123', 2, 20);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/user/user-123?page=2&limit=20');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de récupération des emprunts utilisateur', async () => {
      const mockError = new Error('User not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminBorrowService.getUserBorrows('invalid-user')).rejects.toThrow('User not found');
      expect(mockApi.get).toHaveBeenCalledWith('/borrow/user/invalid-user?page=1&limit=10');
    });
  });

  describe('getBorrowStats', () => {
    it('devrait calculer les statistiques des emprunts', async () => {
      const mockBorrowsResponse = {
        data: {
          data: [
            { ...mockBorrow, status: 'borrowed' },
            { ...mockBorrow, status: 'returned', _id: 'borrow-456' },
            { ...mockBorrow, status: 'borrowed', _id: 'borrow-789' }
          ],
          totalItems: 3
        }
      };
      
      mockApi.get.mockResolvedValue(mockBorrowsResponse);

      const result = await adminBorrowService.getBorrowStats();

      expect(mockApi.get).toHaveBeenCalledWith('/borrow?limit=1000');
      expect(result.total).toBe(3);
      expect(result.active).toBe(2);
      expect(result.returned).toBe(1);
      expect(result.averageBorrowDuration).toBe(14);
      // Note: Le calcul des emprunts en retard dépend de la date actuelle
      // et peut varier selon l'environnement de test
    });

    it('devrait gérer les erreurs de calcul des statistiques', async () => {
      const mockError = new Error('Failed to fetch borrows');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminBorrowService.getBorrowStats()).rejects.toThrow('Failed to fetch borrows');
      expect(mockApi.get).toHaveBeenCalledWith('/borrow?limit=1000');
    });
  });

  describe('sendOverdueReminder', () => {
    it('devrait envoyer un rappel pour un emprunt en retard avec succès', async () => {
      const mockResponse = {
        data: { message: 'Rappel envoyé avec succès' }
      };
      
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.sendOverdueReminder('borrow-123');

      expect(mockApi.post).toHaveBeenCalledWith('/borrow/borrow-123/reminder');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs d\'envoi de rappel', async () => {
      const mockError = new Error('Borrow not found');
      mockApi.post.mockRejectedValue(mockError);

      await expect(adminBorrowService.sendOverdueReminder('invalid-id')).rejects.toThrow('Borrow not found');
      expect(mockApi.post).toHaveBeenCalledWith('/borrow/invalid-id/reminder');
    });
  });

  describe('getOverdueBorrows', () => {
    it('devrait récupérer les emprunts en retard avec pagination par défaut', async () => {
      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.getOverdueBorrows();

      expect(mockApi.get).toHaveBeenCalledWith('/borrow?page=1&limit=20&status=overdue');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les emprunts en retard avec pagination personnalisée', async () => {
      const mockResponse = {
        data: {
          data: [mockBorrow],
          currentPage: 2,
          totalPages: 3,
          totalItems: 50
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.getOverdueBorrows(2, 50);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow?page=2&limit=50&status=overdue');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de récupération des emprunts en retard', async () => {
      const mockError = new Error('Failed to fetch overdue borrows');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminBorrowService.getOverdueBorrows()).rejects.toThrow('Failed to fetch overdue borrows');
      expect(mockApi.get).toHaveBeenCalledWith('/borrow?page=1&limit=20&status=overdue');
    });
  });

  describe('exportBorrows', () => {
    it('devrait exporter les emprunts sans filtres avec succès', async () => {
      const mockBlob = new Blob(['borrow data'], { type: 'text/csv' });
      const mockResponse = { data: mockBlob };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.exportBorrows();

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/export?', {
        responseType: 'blob'
      });
      expect(result).toEqual(mockBlob);
    });

    it('devrait exporter les emprunts avec filtres', async () => {
      const filters: BorrowFilters = {
        status: 'borrowed',
        user: 'user-123',
        mediaType: 'book'
      };

      const mockBlob = new Blob(['borrow data'], { type: 'text/csv' });
      const mockResponse = { data: mockBlob };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.exportBorrows(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/export?status=borrowed&user=user-123&mediaType=book', {
        responseType: 'blob'
      });
      expect(result).toEqual(mockBlob);
    });

    it('devrait gérer les erreurs d\'export', async () => {
      const mockError = new Error('Export failed');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminBorrowService.exportBorrows()).rejects.toThrow('Export failed');
      expect(mockApi.get).toHaveBeenCalledWith('/borrow/export?', {
        responseType: 'blob'
      });
    });
  });

  describe('cancelBorrow', () => {
    it('devrait annuler un emprunt avec succès', async () => {
      const mockResponse = {
        data: { message: 'Emprunt annulé avec succès' }
      };
      
      mockApi.delete.mockResolvedValue(mockResponse);

      const result = await adminBorrowService.cancelBorrow('borrow-123');

      expect(mockApi.delete).toHaveBeenCalledWith('/borrow/borrow-123');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs d\'annulation d\'emprunt', async () => {
      const mockError = new Error('Borrow not found');
      mockApi.delete.mockRejectedValue(mockError);

      await expect(adminBorrowService.cancelBorrow('invalid-id')).rejects.toThrow('Borrow not found');
      expect(mockApi.delete).toHaveBeenCalledWith('/borrow/invalid-id');
    });
  });
});
