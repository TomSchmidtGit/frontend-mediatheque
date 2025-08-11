// src/services/borrowService.ts
import api from './api';
import type { Borrow, PaginatedResponse } from '../types';

interface BorrowFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'borrowed' | 'returned' | 'overdue';
  mediaType?: 'book' | 'movie' | 'music';
}

class BorrowService {
  /**
   * Récupérer les emprunts de l'utilisateur connecté avec filtres
   */
  async getMyBorrows(filters: BorrowFilters = {}): Promise<PaginatedResponse<Borrow>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.mediaType) params.append('mediaType', filters.mediaType);
    
    console.log('📡 Récupération des emprunts avec filtres:', filters);
    const response = await api.get<PaginatedResponse<Borrow>>(`/borrow/mine?${params}`);
    console.log('✅ Emprunts reçus:', response.data);
    return response.data;
  }

  // Note: L'emprunt et le retour des médias se font uniquement en présentiel
  // via l'interface d'administration. Les utilisateurs peuvent seulement
  // consulter leurs emprunts en cours.
}

export default new BorrowService();