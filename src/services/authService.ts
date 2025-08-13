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
      password,
    });
    return response.data;
  }

  /**
   * Inscription utilisateur
   */
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  }

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
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

  /**
   * Demande de réinitialisation de mot de passe
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/forgot-password',
      {
        email,
      }
    );
    return response.data;
  }

  /**
   * Réinitialisation du mot de passe avec token
   */
  async resetPassword(
    token: string,
    email: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/reset-password',
      {
        token,
        email,
        newPassword,
      }
    );
    return response.data;
  }

  /**
   * Changement de mot de passe (utilisateur connecté)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/change-password',
      {
        currentPassword,
        newPassword,
      }
    );
    return response.data;
  }
}

export default new AuthService();
