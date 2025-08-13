// src/services/adminBorrowService.ts
import api from './api';
import type { Borrow, PaginatedResponse } from '../types';

interface BorrowFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'borrowed' | 'returned' | 'overdue';
  user?: string;
  mediaType?: 'book' | 'movie' | 'music';
}

interface CreateBorrowData {
  userId: string;
  mediaId: string;
  dueDate?: string;
}

class AdminBorrowService {
  /**
   * Récupérer tous les emprunts avec filtres et pagination
   */
  async getBorrows(
    filters: BorrowFilters = {}
  ): Promise<PaginatedResponse<Borrow>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all')
      params.append('status', filters.status);
    if (filters.user) params.append('user', filters.user);
    if (filters.mediaType) params.append('mediaType', filters.mediaType);

    const response = await api.get<PaginatedResponse<Borrow>>(
      `/borrow?${params}`
    );
    return response.data;
  }

  /**
   * Récupérer un emprunt par son ID
   */
  async getBorrowById(borrowId: string): Promise<Borrow> {
    const response = await api.get<Borrow>(`/borrow/${borrowId}`);
    return response.data;
  }

  /**
   * Créer un nouvel emprunt (admin uniquement)
   */
  async createBorrow(borrowData: CreateBorrowData): Promise<Borrow> {
    const response = await api.post<Borrow>('/borrow', borrowData);
    return response.data;
  }

  /**
   * Marquer un emprunt comme retourné
   */
  async returnBorrow(borrowId: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(
      `/borrow/${borrowId}/return`
    );
    return response.data;
  }

  /**
   * Prolonger un emprunt
   */
  async extendBorrow(borrowId: string, newDueDate?: string): Promise<Borrow> {
    const data = newDueDate ? { newDueDate } : {};
    const response = await api.put<Borrow>(`/borrow/${borrowId}/extend`, data);
    return response.data;
  }

  /**
   * Récupérer les emprunts d'un utilisateur spécifique
   */
  async getUserBorrows(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Borrow>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<PaginatedResponse<Borrow>>(
      `/borrow/user/${userId}?${params}`
    );
    return response.data;
  }

  /**
   * Statistiques des emprunts pour l'admin
   */
  async getBorrowStats(): Promise<{
    total: number;
    active: number;
    overdue: number;
    returned: number;
    averageBorrowDuration: number;
    mostBorrowedMedia: Array<{
      mediaId: string;
      title: string;
      borrowCount: number;
    }>;
    mostActiveUsers: Array<{
      userId: string;
      name: string;
      borrowCount: number;
    }>;
  }> {
    // Cette fonction peut être étendue si vous ajoutez un endpoint dédié
    // Pour l'instant, on peut calculer les stats côté client
    const allBorrows = await this.getBorrows({ limit: 1000 });

    const now = new Date();
    const stats = {
      total: allBorrows.totalItems,
      active: allBorrows.data.filter(b => b.status === 'borrowed').length,
      overdue: allBorrows.data.filter(b => {
        const dueDate = new Date(b.dueDate);
        return b.status === 'borrowed' && dueDate < now;
      }).length,
      returned: allBorrows.data.filter(b => b.status === 'returned').length,
      averageBorrowDuration: 14, // Valeur par défaut
      mostBorrowedMedia: [],
      mostActiveUsers: [],
    };

    return stats;
  }

  /**
   * Envoyer un rappel par email pour un emprunt en retard
   */
  async sendOverdueReminder(borrowId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/borrow/${borrowId}/reminder`
    );
    return response.data;
  }

  /**
   * Récupérer les emprunts en retard
   */
  async getOverdueBorrows(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Borrow>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('status', 'overdue');

    const response = await api.get<PaginatedResponse<Borrow>>(
      `/borrow?${params}`
    );
    return response.data;
  }

  /**
   * Exporter les données d'emprunts (CSV)
   */
  async exportBorrows(filters: BorrowFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== 'all')
      params.append('status', filters.status);
    if (filters.user) params.append('user', filters.user);
    if (filters.mediaType) params.append('mediaType', filters.mediaType);

    const response = await api.get(`/borrow/export?${params}`, {
      responseType: 'blob',
    });

    return response.data;
  }

  /**
   * Annuler un emprunt (si pas encore récupéré)
   */
  async cancelBorrow(borrowId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/borrow/${borrowId}`
    );
    return response.data;
  }
}

export default new AdminBorrowService();
export type { BorrowFilters, CreateBorrowData };
