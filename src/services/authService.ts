// src/services/authService.ts - SANS ROUTE PROFILE
import api from './api';
import type { AuthResponse } from '../types';

class AuthService {
  /**
   * Connexion utilisateur
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  }

  /**
   * Inscription utilisateur
   */
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password
    });
    return response.data;
  }

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken
    });
    return response.data;
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignorer les erreurs de logout côté serveur
      console.warn('Erreur lors du logout côté serveur:', error);
    }
  }

}

export default new AuthService();