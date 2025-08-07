// src/services/borrowService.ts
import api from './api';
import type { Borrow, PaginatedResponse } from '../types';

class BorrowService {
  /**
   * Récupérer les emprunts de l'utilisateur connecté
   */
  async getMyBorrows(page: number = 1, limit: number = 12): Promise<PaginatedResponse<Borrow>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    console.log('📡 Récupération des emprunts - page:', page, 'limit:', limit);
    const response = await api.get<PaginatedResponse<Borrow>>(`/borrow/mine?${params}`);
    console.log('✅ Emprunts reçus:', response.data);
    return response.data;
  }

  // Note: L'emprunt et le retour des médias se font uniquement en présentiel
  // via l'interface d'administration. Les utilisateurs peuvent seulement
  // consulter leurs emprunts en cours.
}

export default new BorrowService();