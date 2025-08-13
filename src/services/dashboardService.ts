// src/services/dashboardService.ts
import api from './api';
import type { DashboardStats } from '../types';

interface BorrowStatsData {
  period: string;
  startDate: string;
  data: Array<{
    _id: string;
    count: number;
  }>;
}

interface MediaCategoryStats {
  _id: string;
  types: Array<{
    type: 'book' | 'movie' | 'music';
    count: number;
  }>;
  total: number;
}

class DashboardService {
  /**
   * Récupérer les statistiques complètes du dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }

  /**
   * Récupérer les statistiques d'emprunts par période
   */
  async getBorrowStatsByPeriod(
    period: 'week' | 'month' | 'year' = 'month'
  ): Promise<BorrowStatsData> {
    const response = await api.get<BorrowStatsData>(
      `/dashboard/borrows/stats?period=${period}`
    );
    return response.data;
  }

  /**
   * Récupérer les statistiques des médias par catégorie
   */
  async getMediaStatsByCategory(): Promise<MediaCategoryStats[]> {
    const response = await api.get<MediaCategoryStats[]>(
      '/dashboard/media/categories'
    );
    return response.data;
  }
}

export default new DashboardService();
