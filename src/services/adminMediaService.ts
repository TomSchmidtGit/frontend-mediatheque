// src/services/adminMediaService.ts
import api from './api';
import type { Media, PaginatedResponse, Category, Tag } from '../types';

interface MediaFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'book' | 'movie' | 'music';
  category?: string;
  tags?: string;
  available?: boolean;
}

interface CreateMediaData {
  title: string;
  type: 'book' | 'movie' | 'music';
  author: string;
  year: number;
  description?: string;
  category?: string;
  tags?: string[];
  image?: File;
}

interface UpdateMediaData {
  title?: string;
  type?: 'book' | 'movie' | 'music';
  author?: string;
  year?: number;
  description?: string;
  category?: string;
  tags?: string[];
  available?: boolean;
  image?: File;
}

class AdminMediaService {
  /**
   * Récupérer tous les médias avec filtres admin
   */
  async getMedia(filters: MediaFilters = {}): Promise<PaginatedResponse<Media>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.tags) params.append('tags', filters.tags);
    if (filters.available !== undefined) {
      params.append('available', filters.available.toString());
    }

    const response = await api.get<PaginatedResponse<Media>>(`/media?${params}`);
    return response.data;
  }

  /**
   * Récupérer un média par son ID
   */
  async getMediaById(mediaId: string): Promise<Media> {
    const response = await api.get<Media>(`/media/${mediaId}`);
    return response.data;
  }

  /**
   * Créer un nouveau média avec upload d'image
   */
  async createMedia(mediaData: CreateMediaData): Promise<Media> {
    const formData = new FormData();
    
    formData.append('title', mediaData.title);
    formData.append('type', mediaData.type);
    formData.append('author', mediaData.author);
    formData.append('year', mediaData.year.toString());
    
    if (mediaData.description) {
      formData.append('description', mediaData.description);
    }
    
    if (mediaData.category) {
      formData.append('category', mediaData.category);
    }
    
    if (mediaData.tags && mediaData.tags.length > 0) {
      mediaData.tags.forEach(tag => {
        formData.append('tags', tag);
      });
    }
    
    if (mediaData.image) {
      formData.append('image', mediaData.image);
    }

    const response = await api.post<Media>('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  /**
   * Mettre à jour un média
   */
  async updateMedia(mediaId: string, mediaData: UpdateMediaData): Promise<Media> {
    if (mediaData.image) {
      // Si on a une nouvelle image, utiliser FormData
      const formData = new FormData();
      
      Object.entries(mediaData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'image') {
          if (key === 'tags' && Array.isArray(value)) {
            value.forEach(tag => formData.append('tags', tag));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      if (mediaData.image) {
        formData.append('image', mediaData.image);
      }

      const response = await api.put<Media>(`/media/${mediaId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } else {
      // Sinon, utiliser JSON classique
      const response = await api.put<Media>(`/media/${mediaId}`, mediaData);
      return response.data;
    }
  }

  /**
   * Supprimer un média
   */
  async deleteMedia(mediaId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/media/${mediaId}`);
    return response.data;
  }

  /**
   * Récupérer toutes les catégories
   */
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  }

  /**
   * Récupérer tous les tags
   */
  async getTags(): Promise<Tag[]> {
    const response = await api.get<Tag[]>('/tags');
    return response.data;
  }

  /**
   * Créer une catégorie
   */
  async createCategory(name: string): Promise<Category> {
    const response = await api.post<Category>('/categories', { name });
    return response.data;
  }

  /**
   * Créer un tag
   */
  async createTag(name: string): Promise<Tag> {
    const response = await api.post<Tag>('/tags', { name });
    return response.data;
  }

  /**
   * Statistiques des médias
   */
  async getMediaStats(): Promise<{
    total: number;
    available: number;
    borrowed: number;
    byType: {
      book: number;
      movie: number;
      music: number;
    };
  }> {
    const allMedia = await this.getMedia({ limit: 1000 });
    
    const stats = {
      total: allMedia.totalItems,
      available: allMedia.data.filter(m => m.available).length,
      borrowed: allMedia.data.filter(m => !m.available).length,
      byType: {
        book: allMedia.data.filter(m => m.type === 'book').length,
        movie: allMedia.data.filter(m => m.type === 'movie').length,
        music: allMedia.data.filter(m => m.type === 'music').length,
      }
    };
    
    return stats;
  }
}

export default new AdminMediaService();
export type { MediaFilters, CreateMediaData, UpdateMediaData };