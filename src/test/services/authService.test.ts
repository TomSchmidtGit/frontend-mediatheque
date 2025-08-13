import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import authService from '../../services/authService';
import api from '../../services/api';

// Mock du service API
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn()
  }
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn()
  }
}));

describe('AuthService', () => {
  const mockApi = vi.mocked(api) as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('devrait permettre la connexion avec succès', async () => {
      const mockResponse = {
        data: {
          _id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de connexion', async () => {
      const mockError = new Error('Invalid credentials');
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.login('test@example.com', 'wrong-password'))
        .rejects.toThrow('Invalid credentials');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'wrong-password'
      });
    });
  });

  describe('register', () => {
    it('devrait permettre l\'inscription avec succès', async () => {
      const mockResponse = {
        data: {
          _id: 'user-123',
          name: 'New User',
          email: 'newuser@example.com',
          accessToken: 'mock-token'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.register('New User', 'newuser@example.com', 'password123');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs d\'inscription', async () => {
      const mockError = new Error('Email already exists');
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.register('Existing User', 'existing@example.com', 'password123'))
        .rejects.toThrow('Email already exists');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });
    });
  });

  describe('refreshToken', () => {
    it('devrait rafraîchir le token avec succès', async () => {
      const mockResponse = {
        data: {
          accessToken: 'new-access-token'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken('old-refresh-token');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old-refresh-token'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de rafraîchissement', async () => {
      const mockError = new Error('Invalid refresh token');
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.refreshToken('invalid-token'))
        .rejects.toThrow('Invalid refresh token');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'invalid-token'
      });
    });
  });

  describe('logout', () => {
    it('devrait permettre la déconnexion avec succès', async () => {
      mockApi.post.mockResolvedValue({});

      await authService.logout();

      expect(mockApi.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('devrait gérer les erreurs de déconnexion sans les propager', async () => {
      const mockError = new Error('Server error');
      mockApi.post.mockRejectedValue(mockError);

      // Le logout ne devrait pas lancer d'erreur
      await expect(authService.logout()).resolves.toBeUndefined();

      expect(mockApi.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('forgotPassword', () => {
    it('devrait envoyer la demande de réinitialisation avec succès', async () => {
      const mockResponse = {
        data: {
          message: 'Email de réinitialisation envoyé'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword('user@example.com');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'user@example.com'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de demande de réinitialisation', async () => {
      const mockError = new Error('User not found');
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.forgotPassword('nonexistent@example.com'))
        .rejects.toThrow('User not found');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'nonexistent@example.com'
      });
    });
  });

  describe('resetPassword', () => {
    it('devrait réinitialiser le mot de passe avec succès', async () => {
      const mockResponse = {
        data: {
          message: 'Mot de passe réinitialisé avec succès'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.resetPassword('reset-token', 'user@example.com', 'newpassword123');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        email: 'user@example.com',
        newPassword: 'newpassword123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de réinitialisation', async () => {
      const mockError = new Error('Invalid or expired token');
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.resetPassword('expired-token', 'user@example.com', 'newpassword123'))
        .rejects.toThrow('Invalid or expired token');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'expired-token',
        email: 'user@example.com',
        newPassword: 'newpassword123'
      });
    });
  });

  describe('changePassword', () => {
    it('devrait changer le mot de passe avec succès', async () => {
      const mockResponse = {
        data: {
          message: 'Mot de passe changé avec succès'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.changePassword('oldpassword', 'newpassword123');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de changement de mot de passe', async () => {
      const mockError = new Error('Current password is incorrect');
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.changePassword('wrongpassword', 'newpassword123'))
        .rejects.toThrow('Current password is incorrect');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      });
    });
  });
});
