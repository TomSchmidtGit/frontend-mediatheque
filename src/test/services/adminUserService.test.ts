import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import adminUserService from '../../services/adminUserService';
import api from '../../services/api';
import type { User } from '../../types';
import type { UserFilters, UpdateUserData } from '../../services/adminUserService';

// Mock du service API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn()
  }
}));

describe('AdminUserService', () => {
  const mockApi = vi.mocked(api) as any;

  const mockUser: User = {
    _id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    favorites: [],
    actif: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockUpdateUserData: UpdateUserData = {
    name: 'Updated User',
    email: 'updated@example.com',
    role: 'employee'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('devrait récupérer tous les utilisateurs sans filtres', async () => {
      const mockResponse = {
        data: {
          data: [mockUser],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminUserService.getUsers();

      expect(mockApi.get).toHaveBeenCalledWith('/users?');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les utilisateurs avec tous les filtres', async () => {
      const filters: UserFilters = {
        page: 2,
        limit: 20,
        search: 'test user',
        role: 'user',
        status: 'active'
      };

      const mockResponse = {
        data: {
          data: [mockUser],
          currentPage: 2,
          totalPages: 3,
          totalItems: 50
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminUserService.getUsers(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/users?page=2&limit=20&search=test+user&role=user&status=active');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de récupération des utilisateurs', async () => {
      const mockError = new Error('Failed to fetch users');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminUserService.getUsers()).rejects.toThrow('Failed to fetch users');
      expect(mockApi.get).toHaveBeenCalledWith('/users?');
    });
  });

  describe('getUserById', () => {
    it('devrait récupérer un utilisateur par ID avec succès', async () => {
      const mockResponse = { data: mockUser };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminUserService.getUserById('user-123');

      expect(mockApi.get).toHaveBeenCalledWith('/users/user-123');
      expect(result).toEqual(mockUser);
    });

    it('devrait gérer les erreurs de récupération par ID', async () => {
      const mockError = new Error('User not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminUserService.getUserById('invalid-id')).rejects.toThrow('User not found');
      expect(mockApi.get).toHaveBeenCalledWith('/users/invalid-id');
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour un utilisateur avec succès', async () => {
      const updatedUser = { ...mockUser, ...mockUpdateUserData };
      const mockResponse = { data: updatedUser };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await adminUserService.updateUser('user-123', mockUpdateUserData);

      expect(mockApi.put).toHaveBeenCalledWith('/users/user-123', mockUpdateUserData);
      expect(result).toEqual(updatedUser);
    });

    it('devrait mettre à jour un utilisateur avec des données partielles', async () => {
      const partialUpdateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      const mockResponse = { data: updatedUser };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await adminUserService.updateUser('user-123', partialUpdateData);

      expect(mockApi.put).toHaveBeenCalledWith('/users/user-123', partialUpdateData);
      expect(result).toEqual(updatedUser);
    });

    it('devrait gérer les erreurs de mise à jour d\'utilisateur', async () => {
      const mockError = new Error('User not found');
      mockApi.put.mockRejectedValue(mockError);

      await expect(adminUserService.updateUser('invalid-id', mockUpdateUserData)).rejects.toThrow('User not found');
      expect(mockApi.put).toHaveBeenCalledWith('/users/invalid-id', mockUpdateUserData);
    });
  });

  describe('toggleUserStatus', () => {
    it('devrait désactiver un utilisateur actif avec succès', async () => {
      const mockResponse = {
        data: { message: 'Utilisateur désactivé avec succès' }
      };
      
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await adminUserService.toggleUserStatus('user-123', true);

      expect(mockApi.patch).toHaveBeenCalledWith('/users/user-123/deactivate');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait réactiver un utilisateur inactif avec succès', async () => {
      const mockResponse = {
        data: { message: 'Utilisateur réactivé avec succès' }
      };
      
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await adminUserService.toggleUserStatus('user-123', false);

      expect(mockApi.patch).toHaveBeenCalledWith('/users/user-123/reactivate');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de changement de statut d\'utilisateur', async () => {
      const mockError = new Error('User not found');
      mockApi.patch.mockRejectedValue(mockError);

      await expect(adminUserService.toggleUserStatus('invalid-id', true)).rejects.toThrow('User not found');
      expect(mockApi.patch).toHaveBeenCalledWith('/users/invalid-id/deactivate');
    });
  });

  describe('getUserBorrows', () => {
    it('devrait récupérer les emprunts d\'un utilisateur avec pagination par défaut', async () => {
      const mockBorrowsResponse = {
        data: {
          data: [],
          currentPage: 1,
          totalPages: 1,
          totalItems: 0
        }
      };
      
      mockApi.get.mockResolvedValue(mockBorrowsResponse);

      const result = await adminUserService.getUserBorrows('user-123');

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/user/user-123?page=1&limit=10');
      expect(result).toEqual(mockBorrowsResponse.data);
    });

    it('devrait récupérer les emprunts d\'un utilisateur avec pagination personnalisée', async () => {
      const mockBorrowsResponse = {
        data: {
          data: [],
          currentPage: 2,
          totalPages: 3,
          totalItems: 25
        }
      };
      
      mockApi.get.mockResolvedValue(mockBorrowsResponse);

      const result = await adminUserService.getUserBorrows('user-123', 2, 20);

      expect(mockApi.get).toHaveBeenCalledWith('/borrow/user/user-123?page=2&limit=20');
      expect(result).toEqual(mockBorrowsResponse.data);
    });

    it('devrait gérer les erreurs de récupération des emprunts utilisateur', async () => {
      const mockError = new Error('User not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminUserService.getUserBorrows('invalid-user')).rejects.toThrow('User not found');
      expect(mockApi.get).toHaveBeenCalledWith('/borrow/user/invalid-user?page=1&limit=10');
    });
  });

  describe('getUserStats', () => {
    it('devrait calculer les statistiques des utilisateurs', async () => {
      const mockUsersResponse = {
        data: {
          data: [
            { ...mockUser, role: 'user', actif: true },
            { ...mockUser, _id: 'user-456', role: 'employee', actif: true },
            { ...mockUser, _id: 'user-789', role: 'admin', actif: false }
          ],
          totalItems: 3
        }
      };
      
      mockApi.get.mockResolvedValue(mockUsersResponse);

      const result = await adminUserService.getUserStats();

      expect(mockApi.get).toHaveBeenCalledWith('/users?limit=1000');
      expect(result.total).toBe(3);
      expect(result.active).toBe(2);
      expect(result.inactive).toBe(1);
      expect(result.byRole.user).toBe(1);
      expect(result.byRole.employee).toBe(1);
      expect(result.byRole.admin).toBe(1);
    });

    it('devrait gérer les erreurs de calcul des statistiques', async () => {
      const mockError = new Error('Failed to fetch users');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminUserService.getUserStats()).rejects.toThrow('Failed to fetch users');
      expect(mockApi.get).toHaveBeenCalledWith('/users?limit=1000');
    });
  });
});
