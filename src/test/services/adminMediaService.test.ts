import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import adminMediaService from '../../services/adminMediaService';
import api from '../../services/api';
import type { Media, Category, Tag } from '../../types';
import type { MediaFilters, CreateMediaData, UpdateMediaData } from '../../services/adminMediaService';

// Mock du service API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('AdminMediaService', () => {
  const mockApi = vi.mocked(api) as any;

  const mockMedia: Media = {
    _id: 'media-123',
    title: 'Test Book',
    type: 'book',
    author: 'Test Author',
    year: 2024,
    description: 'Test description',
    available: true,
    category: {
      _id: 'category-123',
      name: 'Fiction',
      slug: 'fiction',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    tags: [
      {
        _id: 'tag-123',
        name: 'Adventure',
        slug: 'adventure',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    reviews: [],
    averageRating: 4.5,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockCategory: Category = {
    _id: 'category-123',
    name: 'Fiction',
    slug: 'fiction',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockTag: Tag = {
    _id: 'tag-123',
    name: 'Adventure',
    slug: 'adventure',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockCreateMediaData: CreateMediaData = {
    title: 'New Book',
    type: 'book',
    author: 'New Author',
    year: 2024,
    description: 'New description',
    category: 'category-123',
    tags: ['tag-123'],
    image: new File(['test'], 'test.jpg', { type: 'image/jpeg' })
  };

  const mockUpdateMediaData: UpdateMediaData = {
    title: 'Updated Book',
    description: 'Updated description'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===== GESTION DES MÉDIAS =====

  describe('getMedia', () => {
    it('devrait récupérer tous les médias sans filtres', async () => {
      const mockResponse = {
        data: {
          data: [mockMedia],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminMediaService.getMedia();

      expect(mockApi.get).toHaveBeenCalledWith('/media?');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait récupérer les médias avec tous les filtres', async () => {
      const filters: MediaFilters = {
        page: 2,
        limit: 20,
        search: 'test book',
        type: 'book',
        category: 'category-123',
        tags: 'tag-123',
        available: true
      };

      const mockResponse = {
        data: {
          data: [mockMedia],
          currentPage: 2,
          totalPages: 3,
          totalItems: 50
        }
      };
      
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminMediaService.getMedia(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/media?page=2&limit=20&search=test+book&type=book&category=category-123&tags=tag-123&available=true');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de récupération des médias', async () => {
      const mockError = new Error('Failed to fetch media');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminMediaService.getMedia()).rejects.toThrow('Failed to fetch media');
      expect(mockApi.get).toHaveBeenCalledWith('/media?');
    });
  });

  describe('getMediaById', () => {
    it('devrait récupérer un média par ID avec succès', async () => {
      const mockResponse = { data: mockMedia };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminMediaService.getMediaById('media-123');

      expect(mockApi.get).toHaveBeenCalledWith('/media/media-123');
      expect(result).toEqual(mockMedia);
    });

    it('devrait gérer les erreurs de récupération par ID', async () => {
      const mockError = new Error('Media not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminMediaService.getMediaById('invalid-id')).rejects.toThrow('Media not found');
      expect(mockApi.get).toHaveBeenCalledWith('/media/invalid-id');
    });
  });

  describe('createMedia', () => {
    it('devrait créer un nouveau média avec succès', async () => {
      const mockResponse = { data: mockMedia };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await adminMediaService.createMedia(mockCreateMediaData);

      expect(mockApi.post).toHaveBeenCalledWith('/media', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockMedia);
    });

    it('devrait créer un média sans image avec succès', async () => {
      const mediaDataWithoutImage = {
        title: 'New Book',
        type: 'book' as const,
        author: 'New Author',
        year: 2024
      };

      const mockResponse = { data: mockMedia };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await adminMediaService.createMedia(mediaDataWithoutImage);

      expect(mockApi.post).toHaveBeenCalledWith('/media', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockMedia);
    });

    it('devrait gérer les erreurs de création de média', async () => {
      const mockError = new Error('Invalid media data');
      mockApi.post.mockRejectedValue(mockError);

      await expect(adminMediaService.createMedia(mockCreateMediaData)).rejects.toThrow('Invalid media data');
      expect(mockApi.post).toHaveBeenCalledWith('/media', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    });
  });

  describe('updateMedia', () => {
    it('devrait mettre à jour un média sans image avec succès', async () => {
      const mockResponse = { data: { ...mockMedia, ...mockUpdateMediaData } };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await adminMediaService.updateMedia('media-123', mockUpdateMediaData);

      expect(mockApi.put).toHaveBeenCalledWith('/media/media-123', mockUpdateMediaData);
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait mettre à jour un média avec image avec succès', async () => {
      const updateDataWithImage = {
        ...mockUpdateMediaData,
        image: new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      };

      const mockResponse = { data: { ...mockMedia, ...mockUpdateMediaData } };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await adminMediaService.updateMedia('media-123', updateDataWithImage);

      expect(mockApi.put).toHaveBeenCalledWith('/media/media-123', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de mise à jour de média', async () => {
      const mockError = new Error('Media not found');
      mockApi.put.mockRejectedValue(mockError);

      await expect(adminMediaService.updateMedia('invalid-id', mockUpdateMediaData)).rejects.toThrow('Media not found');
      expect(mockApi.put).toHaveBeenCalledWith('/media/invalid-id', mockUpdateMediaData);
    });
  });

  describe('deleteMedia', () => {
    it('devrait supprimer un média avec succès', async () => {
      const mockResponse = {
        data: { message: 'Média supprimé avec succès' }
      };
      
      mockApi.delete.mockResolvedValue(mockResponse);

      const result = await adminMediaService.deleteMedia('media-123');

      expect(mockApi.delete).toHaveBeenCalledWith('/media/media-123');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de suppression de média', async () => {
      const mockError = new Error('Media not found');
      mockApi.delete.mockRejectedValue(mockError);

      await expect(adminMediaService.deleteMedia('invalid-id')).rejects.toThrow('Media not found');
      expect(mockApi.delete).toHaveBeenCalledWith('/media/invalid-id');
    });
  });

  // ===== GESTION DES CATÉGORIES =====

  describe('getCategories', () => {
    it('devrait récupérer toutes les catégories avec succès', async () => {
      const mockResponse = { data: [mockCategory] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminMediaService.getCategories();

      expect(mockApi.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual([mockCategory]);
    });

    it('devrait gérer les erreurs de récupération des catégories', async () => {
      const mockError = new Error('Failed to fetch categories');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminMediaService.getCategories()).rejects.toThrow('Failed to fetch categories');
      expect(mockApi.get).toHaveBeenCalledWith('/categories');
    });
  });

  describe('createCategory', () => {
    it('devrait créer une catégorie avec succès', async () => {
      const mockResponse = { data: mockCategory };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await adminMediaService.createCategory('Fiction');

      expect(mockApi.post).toHaveBeenCalledWith('/categories', { name: 'Fiction' });
      expect(result).toEqual(mockCategory);
    });

    it('devrait gérer les erreurs de création de catégorie', async () => {
      const mockError = new Error('Category name already exists');
      mockApi.post.mockRejectedValue(mockError);

      await expect(adminMediaService.createCategory('Fiction')).rejects.toThrow('Category name already exists');
      expect(mockApi.post).toHaveBeenCalledWith('/categories', { name: 'Fiction' });
    });
  });

  describe('updateCategory', () => {
    it('devrait mettre à jour une catégorie avec succès', async () => {
      const updatedCategory = { ...mockCategory, name: 'Updated Fiction' };
      const mockResponse = { data: updatedCategory };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await adminMediaService.updateCategory('category-123', 'Updated Fiction');

      expect(mockApi.put).toHaveBeenCalledWith('/categories/category-123', { name: 'Updated Fiction' });
      expect(result).toEqual(updatedCategory);
    });

    it('devrait gérer les erreurs de mise à jour de catégorie', async () => {
      const mockError = new Error('Category not found');
      mockApi.put.mockRejectedValue(mockError);

      await expect(adminMediaService.updateCategory('invalid-id', 'Updated Name')).rejects.toThrow('Category not found');
      expect(mockApi.put).toHaveBeenCalledWith('/categories/invalid-id', { name: 'Updated Name' });
    });
  });

  describe('deleteCategory', () => {
    it('devrait supprimer une catégorie avec succès', async () => {
      const mockResponse = {
        data: { message: 'Catégorie supprimée avec succès' }
      };
      
      mockApi.delete.mockResolvedValue(mockResponse);

      const result = await adminMediaService.deleteCategory('category-123');

      expect(mockApi.delete).toHaveBeenCalledWith('/categories/category-123');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de suppression de catégorie', async () => {
      const mockError = new Error('Category not found');
      mockApi.delete.mockRejectedValue(mockError);

      await expect(adminMediaService.deleteCategory('invalid-id')).rejects.toThrow('Category not found');
      expect(mockApi.delete).toHaveBeenCalledWith('/categories/invalid-id');
    });
  });

  describe('getCategoryById', () => {
    it('devrait récupérer une catégorie par ID avec succès', async () => {
      const mockResponse = { data: mockCategory };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminMediaService.getCategoryById('category-123');

      expect(mockApi.get).toHaveBeenCalledWith('/categories/category-123');
      expect(result).toEqual(mockCategory);
    });

    it('devrait gérer les erreurs de récupération de catégorie par ID', async () => {
      const mockError = new Error('Category not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminMediaService.getCategoryById('invalid-id')).rejects.toThrow('Category not found');
      expect(mockApi.get).toHaveBeenCalledWith('/categories/invalid-id');
    });
  });

  // ===== GESTION DES TAGS =====

  describe('getTags', () => {
    it('devrait récupérer tous les tags avec succès', async () => {
      const mockResponse = { data: [mockTag] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminMediaService.getTags();

      expect(mockApi.get).toHaveBeenCalledWith('/tags');
      expect(result).toEqual([mockTag]);
    });

    it('devrait gérer les erreurs de récupération des tags', async () => {
      const mockError = new Error('Failed to fetch tags');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminMediaService.getTags()).rejects.toThrow('Failed to fetch tags');
      expect(mockApi.get).toHaveBeenCalledWith('/tags');
    });
  });

  describe('createTag', () => {
    it('devrait créer un tag avec succès', async () => {
      const mockResponse = { data: mockTag };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await adminMediaService.createTag('Adventure');

      expect(mockApi.post).toHaveBeenCalledWith('/tags', { name: 'Adventure' });
      expect(result).toEqual(mockTag);
    });

    it('devrait gérer les erreurs de création de tag', async () => {
      const mockError = new Error('Tag name already exists');
      mockApi.post.mockRejectedValue(mockError);

      await expect(adminMediaService.createTag('Adventure')).rejects.toThrow('Tag name already exists');
      expect(mockApi.post).toHaveBeenCalledWith('/tags', { name: 'Adventure' });
    });
  });

  describe('updateTag', () => {
    it('devrait mettre à jour un tag avec succès', async () => {
      const updatedTag = { ...mockTag, name: 'Updated Adventure' };
      const mockResponse = { data: updatedTag };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await adminMediaService.updateTag('tag-123', 'Updated Adventure');

      expect(mockApi.put).toHaveBeenCalledWith('/tags/tag-123', { name: 'Updated Adventure' });
      expect(result).toEqual(updatedTag);
    });

    it('devrait gérer les erreurs de mise à jour de tag', async () => {
      const mockError = new Error('Tag not found');
      mockApi.put.mockRejectedValue(mockError);

      await expect(adminMediaService.updateTag('invalid-id', 'Updated Name')).rejects.toThrow('Tag not found');
      expect(mockApi.put).toHaveBeenCalledWith('/tags/invalid-id', { name: 'Updated Name' });
    });
  });

  describe('deleteTag', () => {
    it('devrait supprimer un tag avec succès', async () => {
      const mockResponse = {
        data: { message: 'Tag supprimé avec succès' }
      };
      
      mockApi.delete.mockResolvedValue(mockResponse);

      const result = await adminMediaService.deleteTag('tag-123');

      expect(mockApi.delete).toHaveBeenCalledWith('/tags/tag-123');
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de suppression de tag', async () => {
      const mockError = new Error('Tag not found');
      mockApi.delete.mockRejectedValue(mockError);

      await expect(adminMediaService.deleteTag('invalid-id')).rejects.toThrow('Tag not found');
      expect(mockApi.delete).toHaveBeenCalledWith('/tags/invalid-id');
    });
  });

  describe('getTagById', () => {
    it('devrait récupérer un tag par ID avec succès', async () => {
      const mockResponse = { data: mockTag };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await adminMediaService.getTagById('tag-123');

      expect(mockApi.get).toHaveBeenCalledWith('/tags/tag-123');
      expect(result).toEqual(mockTag);
    });

    it('devrait gérer les erreurs de récupération de tag par ID', async () => {
      const mockError = new Error('Tag not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminMediaService.getTagById('invalid-id')).rejects.toThrow('Tag not found');
      expect(mockApi.get).toHaveBeenCalledWith('/tags/invalid-id');
    });
  });

  // ===== STATISTIQUES =====

  describe('getMediaStats', () => {
    it('devrait calculer les statistiques des médias', async () => {
      const mockMediaResponse = {
        data: {
          data: [
            { ...mockMedia, type: 'book' },
            { ...mockMedia, type: 'movie', _id: 'media-456' },
            { ...mockMedia, type: 'music', _id: 'media-789', available: false }
          ],
          totalItems: 3
        }
      };
      
      mockApi.get.mockResolvedValue(mockMediaResponse);

      const result = await adminMediaService.getMediaStats();

      expect(mockApi.get).toHaveBeenCalledWith('/media?limit=1000');
      expect(result.total).toBe(3);
      expect(result.available).toBe(2);
      expect(result.borrowed).toBe(1);
      expect(result.byType.book).toBe(1);
      expect(result.byType.movie).toBe(1);
      expect(result.byType.music).toBe(1);
    });

    it('devrait gérer les erreurs de calcul des statistiques', async () => {
      const mockError = new Error('Failed to fetch media');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminMediaService.getMediaStats()).rejects.toThrow('Failed to fetch media');
      expect(mockApi.get).toHaveBeenCalledWith('/media?limit=1000');
    });
  });

  describe('getCategoriesTagsStats', () => {
    it('devrait calculer les statistiques des catégories et tags', async () => {
      const mockCategoriesResponse = { data: [mockCategory] };
      const mockTagsResponse = { data: [mockTag] };
      const mockMediaResponse = {
        data: {
          data: [mockMedia],
          totalItems: 1
        }
      };
      
      mockApi.get
        .mockResolvedValueOnce(mockCategoriesResponse)
        .mockResolvedValueOnce(mockTagsResponse)
        .mockResolvedValueOnce(mockMediaResponse);

      const result = await adminMediaService.getCategoriesTagsStats();

      expect(mockApi.get).toHaveBeenCalledWith('/categories');
      expect(mockApi.get).toHaveBeenCalledWith('/tags');
      expect(mockApi.get).toHaveBeenCalledWith('/media?limit=1000');
      
      expect(result.categories.total).toBe(1);
      expect(result.categories.withMedia).toBe(1);
      expect(result.categories.withoutMedia).toBe(0);
      expect(result.tags.total).toBe(1);
      expect(result.tags.mostUsed).toHaveLength(1);
      expect(result.tags.mostUsed[0].count).toBe(1);
    });

    it('devrait gérer les erreurs de calcul des statistiques catégories/tags', async () => {
      const mockError = new Error('Failed to fetch categories');
      mockApi.get.mockRejectedValue(mockError);

      await expect(adminMediaService.getCategoriesTagsStats()).rejects.toThrow('Failed to fetch categories');
      expect(mockApi.get).toHaveBeenCalledWith('/categories');
    });
  });
});
