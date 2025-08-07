// src/services/mediaService.ts
import api from './api';
import type { Media, PaginatedResponse, MediaFilters, Category, Tag } from '../types';

class MediaService {
  /**
   * Récupérer tous les médias avec filtres et pagination (SANS favoris)
   */
  async getMedia(filters: MediaFilters = {}): Promise<PaginatedResponse<Media>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.tags) params.append('tags', filters.tags);

    const response = await api.get<PaginatedResponse<Media>>(`/media?${params}`);
    return response.data;
  }

  /**
   * Méthode spécialisée pour les favoris
   */
  async getFavorites(page: number = 1, limit: number = 12): Promise<PaginatedResponse<Media>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get<PaginatedResponse<Media>>(`/users/favorites?${params}`);
    return response.data;
  }

  async getMediaById(id: string): Promise<Media> {
    const response = await api.get<Media>(`/media/${id}`);
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  }

  async getTags(): Promise<Tag[]> {
    const response = await api.get<Tag[]>('/tags');
    return response.data;
  }

  async toggleFavorite(mediaId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/favorites/toggle', {
      mediaId
    });
    return response.data;
  }

  async addReview(mediaId: string, rating: number, comment?: string): Promise<Media> {
    const response = await api.post<Media>(`/media/${mediaId}/reviews`, {
      rating,
      comment
    });
    return response.data;
  }

  async updateReview(mediaId: string, rating: number, comment?: string): Promise<Media> {
    const response = await api.put<Media>(`/media/${mediaId}/reviews`, {
      rating,
      comment
    });
    return response.data;
  }
}

export default new MediaService();