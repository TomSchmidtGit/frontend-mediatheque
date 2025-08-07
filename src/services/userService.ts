// src/services/userService.ts
import api from './api';
import type { User, PaginatedResponse, Media } from '../types';

class UserService {
  /**
   * Récupérer les favoris de l'utilisateur avec pagination
   */
  async getFavorites(page: number = 1, limit: number = 12): Promise<PaginatedResponse<Media>> {
    const response = await api.get<PaginatedResponse<Media>>(`/users/favorites?page=${page}&limit=${limit}`);
    return response.data;
  }

  /**
   * Ajouter/retirer un média des favoris
   */
  async toggleFavorite(mediaId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/favorites/toggle', {
      mediaId
    });
    return response.data;
  }

  /**
   * Récupérer le profil utilisateur actuel
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/profile');
    return response.data;
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put<User>('/users/profile', userData);
    return response.data;
  }
}

export default new UserService();