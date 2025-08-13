// src/services/adminUserService.ts
import api from './api';
import type { User, PaginatedResponse } from '../types';

interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'employee' | 'admin';
  status?: 'active' | 'inactive';
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'user' | 'employee' | 'admin';
}

class AdminUserService {
  /**
   * Récupérer tous les utilisateurs avec filtres et pagination
   */
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get<PaginatedResponse<User>>(`/users?${params}`);
    return response.data;
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  async getUserById(userId: string): Promise<User> {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    const response = await api.put<User>(`/users/${userId}`, userData);
    return response.data;
  }

  /**
   * Désactiver/Réactiver un utilisateur
   */
  async toggleUserStatus(
    userId: string,
    currentStatus: boolean
  ): Promise<{ message: string }> {
    const endpoint = currentStatus ? 'deactivate' : 'reactivate';
    const response = await api.patch<{ message: string }>(
      `/users/${userId}/${endpoint}`
    );
    return response.data;
  }

  /**
   * Récupérer les emprunts d'un utilisateur spécifique
   */
  async getUserBorrows(userId: string, page: number = 1, limit: number = 10) {
    const response = await api.get(
      `/borrow/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Statistiques rapides des utilisateurs
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: {
      user: number;
      employee: number;
      admin: number;
    };
  }> {
    // Cette fonction peut être étendue si vous ajoutez un endpoint dédié
    // Pour l'instant, on récupère tous les users et on calcule
    const allUsers = await this.getUsers({ limit: 1000 });

    const stats = {
      total: allUsers.totalItems,
      active: allUsers.data.filter(u => u.actif).length,
      inactive: allUsers.data.filter(u => !u.actif).length,
      byRole: {
        user: allUsers.data.filter(u => u.role === 'user').length,
        employee: allUsers.data.filter(u => u.role === 'employee').length,
        admin: allUsers.data.filter(u => u.role === 'admin').length,
      },
    };

    return stats;
  }
}

export default new AdminUserService();
export type { UserFilters, UpdateUserData };
