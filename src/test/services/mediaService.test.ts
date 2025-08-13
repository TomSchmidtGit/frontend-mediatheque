import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mediaService from '../../services/mediaService';
import api from '../../services/api';
import type { Media, Category, Tag } from '../../types';

// Mock du service API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}));

describe('MediaService', () => {
  const mockApi = vi.mocked(api) as any;

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

  const mockCategory: Category = {
    _id: 'category-1',
    name: 'Test Category',
    slug: 'test-category',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockTag: Tag = {
    _id: 'tag-1',
    name: 'Test Tag',
    slug: 'test-tag',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getMedia', () => {
    it('devrait récupérer les médias sans filtres', async () => {
      const mockResponse = {
        data: {
          data: [mockMedia],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mediaService.getMedia();

      expect(mockApi.get).toHaveBeenCalledWith('/media?');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les médias avec tous les filtres', async () => {
      const filters = {
        page: 2,
        limit: 10,
        search: 'test',
        type: 'book' as const,
        category: 'fiction',
        tags: 'action,adventure'
      };

      const mockResponse = {
        data: {
          data: [mockMedia],
          currentPage: 2,
          totalPages: 3,
          totalItems: 25
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mediaService.getMedia(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/media?page=2&limit=10&search=test&type=book&category=fiction&tags=action%2Cadventure');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de récupération des médias', async () => {
      const mockError = new Error('Failed to fetch media');
      mockApi.get.mockRejectedValue(mockError);

      await expect(mediaService.getMedia()).rejects.toThrow('Failed to fetch media');
      expect(mockApi.get).toHaveBeenCalledWith('/media?');
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

      const result = await mediaService.getFavorites();

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

      const result = await mediaService.getFavorites(2, 10);

      expect(mockApi.get).toHaveBeenCalledWith('/users/favorites?page=2&limit=10');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de récupération des favoris', async () => {
      const mockError = new Error('Failed to fetch favorites');
      mockApi.get.mockRejectedValue(mockError);

      await expect(mediaService.getFavorites()).rejects.toThrow('Failed to fetch favorites');
      expect(mockApi.get).toHaveBeenCalledWith('/users/favorites?page=1&limit=12');
    });
  });

  describe('getMediaById', () => {
    it('devrait récupérer un média par ID avec succès', async () => {
      const mockResponse = { data: mockMedia };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mediaService.getMediaById('media-123');

      expect(mockApi.get).toHaveBeenCalledWith('/media/media-123');
      expect(result).toEqual(mockMedia);
    });

    it('devrait gérer les erreurs de récupération par ID', async () => {
      const mockError = new Error('Media not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(mediaService.getMediaById('invalid-id')).rejects.toThrow('Media not found');
      expect(mockApi.get).toHaveBeenCalledWith('/media/invalid-id');
    });
  });

  describe('getCategories', () => {
    it('devrait récupérer toutes les catégories avec succès', async () => {
      const mockResponse = { data: [mockCategory] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mediaService.getCategories();

      expect(mockApi.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual([mockCategory]);
    });

    it('devrait gérer les erreurs de récupération des catégories', async () => {
      const mockError = new Error('Failed to fetch categories');
      mockApi.get.mockRejectedValue(mockError);

      await expect(mediaService.getCategories()).rejects.toThrow('Failed to fetch categories');
      expect(mockApi.get).toHaveBeenCalledWith('/categories');
    });
  });

  describe('getTags', () => {
    it('devrait récupérer tous les tags avec succès', async () => {
      const mockResponse = { data: [mockTag] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mediaService.getTags();

      expect(mockApi.get).toHaveBeenCalledWith('/tags');
      expect(result).toEqual([mockTag]);
    });

    it('devrait gérer les erreurs de récupération des tags', async () => {
      const mockError = new Error('Failed to fetch tags');
      mockApi.get.mockRejectedValue(mockError);

      await expect(mediaService.getTags()).rejects.toThrow('Failed to fetch tags');
      expect(mockApi.get).toHaveBeenCalledWith('/tags');
    });
  });

  describe('toggleFavorite', () => {
    it('devrait basculer le statut favori avec succès', async () => {
      const mockResponse = {
        data: { message: 'Media ajouté aux favoris' }
      };
      
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await mediaService.toggleFavorite('media-123');

      expect(mockApi.post).toHaveBeenCalledWith('/users/favorites/toggle', {
        mediaId: 'media-123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de toggle des favoris', async () => {
      const mockError = new Error('Media not found');
      mockApi.post.mockRejectedValue(mockError);

      await expect(mediaService.toggleFavorite('invalid-media-id')).rejects.toThrow('Media not found');
      expect(mockApi.post).toHaveBeenCalledWith('/users/favorites/toggle', {
        mediaId: 'invalid-media-id'
      });
    });
  });

  describe('getFavoriteIds', () => {
    it('devrait récupérer les IDs des favoris avec succès', async () => {
      const mockResponse = {
        data: { favoriteIds: ['media-1', 'media-2'] }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mediaService.getFavoriteIds();

      expect(mockApi.get).toHaveBeenCalledWith('/users/favorites/ids');
      expect(result).toEqual(['media-1', 'media-2']);
    });

    it('devrait retourner un tableau vide en cas d\'erreur', async () => {
      const mockError = new Error('Failed to fetch favorite IDs');
      mockApi.get.mockRejectedValue(mockError);

      const result = await mediaService.getFavoriteIds();

      expect(mockApi.get).toHaveBeenCalledWith('/users/favorites/ids');
      expect(result).toEqual([]);
    });

    it('devrait retourner un tableau vide si pas de favoriteIds dans la réponse', async () => {
      const mockResponse = { data: {} };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await mediaService.getFavoriteIds();

      expect(mockApi.get).toHaveBeenCalledWith('/users/favorites/ids');
      expect(result).toEqual([]);
    });
  });

  describe('addReview', () => {
    it('devrait ajouter une critique avec succès', async () => {
      const mockResponse = { data: mockMedia };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await mediaService.addReview('media-123', 5, 'Excellent livre !');

      expect(mockApi.post).toHaveBeenCalledWith('/media/media-123/reviews', {
        rating: 5,
        comment: 'Excellent livre !'
      });
      expect(result).toEqual(mockMedia);
    });

    it('devrait ajouter une critique sans commentaire', async () => {
      const mockResponse = { data: mockMedia };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await mediaService.addReview('media-123', 4);

      expect(mockApi.post).toHaveBeenCalledWith('/media/media-123/reviews', {
        rating: 4,
        comment: undefined
      });
      expect(result).toEqual(mockMedia);
    });

    it('devrait gérer les erreurs d\'ajout de critique', async () => {
      const mockError = new Error('Failed to add review');
      mockApi.post.mockRejectedValue(mockError);

      await expect(mediaService.addReview('media-123', 5, 'Comment')).rejects.toThrow('Failed to add review');
      expect(mockApi.post).toHaveBeenCalledWith('/media/media-123/reviews', {
        rating: 5,
        comment: 'Comment'
      });
    });
  });

  describe('updateReview', () => {
    it('devrait mettre à jour une critique avec succès', async () => {
      const mockResponse = { data: mockMedia };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await mediaService.updateReview('media-123', 4, 'Très bon livre');

      expect(mockApi.put).toHaveBeenCalledWith('/media/media-123/reviews', {
        rating: 4,
        comment: 'Très bon livre'
      });
      expect(result).toEqual(mockMedia);
    });

    it('devrait mettre à jour une critique sans commentaire', async () => {
      const mockResponse = { data: mockMedia };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await mediaService.updateReview('media-123', 3);

      expect(mockApi.put).toHaveBeenCalledWith('/media/media-123/reviews', {
        rating: 3,
        comment: undefined
      });
      expect(result).toEqual(mockMedia);
    });

    it('devrait gérer les erreurs de mise à jour de critique', async () => {
      const mockError = new Error('Failed to update review');
      mockApi.put.mockRejectedValue(mockError);

      await expect(mediaService.updateReview('media-123', 4, 'Comment')).rejects.toThrow('Failed to update review');
      expect(mockApi.put).toHaveBeenCalledWith('/media/media-123/reviews', {
        rating: 4,
        comment: 'Comment'
      });
    });
  });
});
