import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userService from '../../services/userService';
import api from '../../services/api';
import type { User, Media } from '../../types';

// Mock du service API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    patch: vi.fn()
  }
}));

describe('UserService', () => {
  const mockApi = vi.mocked(api) as any;

  const mockUser: User = {
    _id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    favorites: ['media-1', 'media-2'],
    actif: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockMedia: Media = {
    _id: 'media-1',
    title: 'Test Media',
    type: 'book',
    author: 'Test Author',
    year: 2024,
    available: true,
    tags: [],
    reviews: [],
    averageRating: 4.5,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('devrait récupérer le profil utilisateur avec succès', async () => {
      const mockResponse = { data: mockUser };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userService.getProfile();

      expect(mockApi.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUser);
    });

    it('devrait gérer les erreurs de récupération du profil', async () => {
      const mockError = new Error('User not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(userService.getProfile()).rejects.toThrow('User not found');
      expect(mockApi.get).toHaveBeenCalledWith('/users/me');
    });
  });

  describe('updateProfile', () => {
    it('devrait mettre à jour le profil utilisateur avec succès', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };
      const mockResponse = { data: updatedUser };
      
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await userService.updateProfile(updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/users/me', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('devrait gérer les erreurs de mise à jour du profil', async () => {
      const updateData = { name: 'Updated Name' };
      const mockError = new Error('Invalid data');
      mockApi.put.mockRejectedValue(mockError);

      await expect(userService.updateProfile(updateData)).rejects.toThrow('Invalid data');
      expect(mockApi.put).toHaveBeenCalledWith('/users/me', updateData);
    });
  });

  describe('getFavorites', () => {
    it('devrait récupérer les favoris avec pagination par défaut', async () => {
      const mockResponse = {
        data: {
          data: [mockMedia],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userService.getFavorites();

      expect(mockApi.get).toHaveBeenCalledWith('/users/favorites?page=1&limit=12');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les favoris avec pagination personnalisée', async () => {
      const mockResponse = {
        data: {
          data: [mockMedia],
          currentPage: 2,
          totalPages: 3,
          totalItems: 25
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userService.getFavorites(2, 10);

      expect(mockApi.get).toHaveBeenCalledWith('/users/favorites?page=2&limit=10');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de récupération des favoris', async () => {
      const mockError = new Error('Failed to fetch favorites');
      mockApi.get.mockRejectedValue(mockError);

      await expect(userService.getFavorites()).rejects.toThrow('Failed to fetch favorites');
      expect(mockApi.get).toHaveBeenCalledWith('/users/favorites?page=1&limit=12');
    });
  });

  describe('toggleFavorite', () => {
    it('devrait ajouter/retirer un média des favoris avec succès', async () => {
      const mockResponse = {
        data: { message: 'Media ajouté aux favoris' }
      };
      
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userService.toggleFavorite('media-123');

      expect(mockApi.post).toHaveBeenCalledWith('/users/favorites/toggle', {
        mediaId: 'media-123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de toggle des favoris', async () => {
      const mockError = new Error('Media not found');
      mockApi.post.mockRejectedValue(mockError);

      await expect(userService.toggleFavorite('invalid-media-id')).rejects.toThrow('Media not found');
      expect(mockApi.post).toHaveBeenCalledWith('/users/favorites/toggle', {
        mediaId: 'invalid-media-id'
      });
    });
  });

  describe('exportData', () => {
    it('devrait exporter les données utilisateur avec succès', async () => {
      const mockBlob = new Blob(['user data'], { type: 'application/json' });
      const mockResponse = { data: mockBlob };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userService.exportData();

      expect(mockApi.get).toHaveBeenCalledWith('/users/me/export', {
        responseType: 'blob'
      });
      expect(result).toEqual(mockBlob);
    });

    it('devrait gérer les erreurs d\'export des données', async () => {
      const mockError = new Error('Export failed');
      mockApi.get.mockRejectedValue(mockError);

      await expect(userService.exportData()).rejects.toThrow('Export failed');
      expect(mockApi.get).toHaveBeenCalledWith('/users/me/export', {
        responseType: 'blob'
      });
    });
  });

  describe('deactivateAccount', () => {
    it('devrait désactiver le compte avec succès', async () => {
      const mockResponse = {
        data: { message: 'Compte désactivé avec succès' }
      };
      
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await userService.deactivateAccount('password123');

      expect(mockApi.patch).toHaveBeenCalledWith('/users/me/deactivate', {
        password: 'password123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de désactivation du compte', async () => {
      const mockError = new Error('Invalid password');
      mockApi.patch.mockRejectedValue(mockError);

      await expect(userService.deactivateAccount('wrong-password')).rejects.toThrow('Invalid password');
      expect(mockApi.patch).toHaveBeenCalledWith('/users/me/deactivate', {
        password: 'wrong-password'
      });
    });
  });
});
