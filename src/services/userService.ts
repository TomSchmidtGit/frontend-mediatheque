// src/services/userService.ts - VERSION MISE À JOUR
import api from './api';
import type { User, PaginatedResponse, Media } from '../types';

class UserService {
  /**
   * Récupérer le profil utilisateur actuel
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put<User>('/users/me', userData);
    return response.data;
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>('/users/me/password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    return response.data;
  }

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
   * Uploader un avatar (optionnel)
   */
  async uploadAvatar(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post<{ imageUrl: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Exporter les données utilisateur
   */
  async exportData(): Promise<Blob> {
    const response = await api.get('/users/me/export', {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Désactiver le compte temporairement
   */
  async deactivateAccount(): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>('/users/me/deactivate');
    return response.data;
  }

  /**
   * Supprimer définitivement le compte
   */
  async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/users/me', {
      data: { password }
    });
    return response.data;
  }
}

export default new UserService();