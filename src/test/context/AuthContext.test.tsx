import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import userService from '../../services/userService';
import mediaService from '../../services/mediaService';
import { tokenManager } from '../../services/api';

// Mock des services
vi.mock('../../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  }
}));

vi.mock('../../services/userService', () => ({
  default: {
    getProfile: vi.fn()
  }
}));

vi.mock('../../services/mediaService', () => ({
  default: {
    getFavorites: vi.fn()
  }
}));

vi.mock('../../services/api', () => ({
  tokenManager: {
    getAccessToken: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn()
  }
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Composant de test qui utilise le contexte
const TestComponent = () => {
  const {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    refreshUserData
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Not Loading'}</div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="is-admin">{isAdmin ? 'Admin' : 'Not Admin'}</div>

      {user && (
        <div>
          <div data-testid="user-name">{user.name}</div>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-role">{user.role}</div>
          <div data-testid="user-favorites-count">{user.favorites.length}</div>
        </div>
      )}

      <button onClick={() => login('test@example.com', 'password')} data-testid="login-button">
        Login
      </button>

      <button onClick={() => register('Test User', 'test@example.com', 'password')} data-testid="register-button">
        Register
      </button>

      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>

      <button onClick={() => updateUser({ name: 'Updated Name' })} data-testid="update-user-button">
        Update User
      </button>

      <button onClick={refreshUserData} data-testid="refresh-user-button">
        Refresh User
      </button>
    </div>
  );
};

// Helper pour wrapper le composant avec AuthProvider
const renderWithAuthProvider = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  const mockUser = {
    _id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user' as const,
    favorites: ['media-1', 'media-2'],
    actif: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockAdminUser = {
    ...mockUser,
    role: 'admin' as const
  };

  // const mockFavorites = [
  //   { _id: 'media-1', title: 'Test Media 1' },
  //   { _id: 'media-2', title: 'Test Media 2' }
  // ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockReturnValue(undefined);
    localStorageMock.removeItem.mockReturnValue(undefined);
    localStorageMock.clear.mockReturnValue(undefined);

    // Supprimer les console.error pour éviter le bruit dans les tests
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mocks par défaut
    vi.mocked(authService.login).mockResolvedValue({
      _id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });

    vi.mocked(authService.register).mockResolvedValue({
      _id: 'user-123',
      name: 'New User',
      email: 'test@example.com',
      accessToken: 'mock-token'
    });

    vi.mocked(authService.logout).mockResolvedValue(undefined);

    vi.mocked(userService.getProfile).mockResolvedValue(mockUser);

    vi.mocked(mediaService.getFavorites).mockResolvedValue({
      data: [
        {
          _id: 'media-1',
          title: 'Test Media 1',
          type: 'book' as const,
          author: 'Test Author',
          year: 2024,
          available: true,
          tags: [],
          reviews: [],
          averageRating: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          _id: 'media-2',
          title: 'Test Media 2',
          type: 'movie' as const,
          author: 'Test Director',
          year: 2024,
          available: true,
          tags: [],
          reviews: [],
          averageRating: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      currentPage: 1,
      totalPages: 1,
      totalItems: 2
    });

    vi.mocked(tokenManager.getAccessToken).mockReturnValue(null);
    vi.mocked(tokenManager.setTokens).mockReturnValue(undefined);
    vi.mocked(tokenManager.clearTokens).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restaurer console.error
    vi.restoreAllMocks();
  });

  describe('Initialisation', () => {
    it('affiche l\'état de chargement initial', async () => {
      // Créer un composant qui capture l'état de chargement initial
      let initialLoadingState: boolean | null = null;

      const TestComponentWithState = () => {
        const { loading } = useAuth();

        // Capturer l'état initial de loading
        if (initialLoadingState === null) {
          initialLoadingState = loading;
        }

        return (
          <div>
            <div data-testid="loading">{loading ? 'Loading...' : 'Not Loading'}</div>
            <div data-testid="loading-state">{String(loading)}</div>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithState />);

      // L'état de chargement initial devrait être true (Loading...)
      expect(initialLoadingState).toBe(true);

      // Attendre que l'initialisation soit terminée
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
    });

    it('n\'est pas authentifié initialement', async () => {
      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not Authenticated');
    });

    it('n\'est pas admin initialement', async () => {
      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
    });

    it('initialise l\'auth avec un token et utilisateur stockés', async () => {
      const mockToken = 'mock-access-token';
      const mockStoredUser = JSON.stringify(mockUser);

      vi.mocked(tokenManager.getAccessToken).mockReturnValue(mockToken);
      localStorageMock.getItem.mockReturnValue(mockStoredUser);

      vi.mocked(userService.getProfile).mockResolvedValue(mockUser);
      vi.mocked(mediaService.getFavorites).mockResolvedValue({
        data: [
          {
            _id: 'media-1',
            title: 'Test Media 1',
            type: 'book' as const,
            author: 'Test Author',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            _id: 'media-2',
            title: 'Test Media 2',
            type: 'movie' as const,
            author: 'Test Director',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
      expect(screen.getByTestId('user-favorites-count')).toHaveTextContent('2');
    });

    it('gère l\'erreur lors de l\'initialisation', async () => {
      const mockToken = 'mock-access-token';
      const mockStoredUser = JSON.stringify(mockUser);

      vi.mocked(tokenManager.getAccessToken).mockReturnValue(mockToken);
      localStorageMock.getItem.mockReturnValue(mockStoredUser);

      vi.mocked(userService.getProfile).mockRejectedValue(new Error('API Error'));

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not Authenticated');
    });
  });

  describe('Connexion', () => {
    it('permet de se connecter avec succès', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.login).mockResolvedValue({
        _id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });

      vi.mocked(userService.getProfile).mockResolvedValue(mockUser);
      vi.mocked(mediaService.getFavorites).mockResolvedValue({
        data: [
          {
            _id: 'media-1',
            title: 'Test Media 1',
            type: 'book' as const,
            author: 'Test Author',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            _id: 'media-2',
            title: 'Test Media 2',
            type: 'movie' as const,
            author: 'Test Director',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
      expect(screen.getByTestId('user-favorites-count')).toHaveTextContent('2');
    });

    it('gère l\'erreur de connexion', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.login).mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } }
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      const loginButton = screen.getByTestId('login-button');

      // Cliquer sur le bouton et attendre que l'erreur soit gérée
      await user.click(loginButton);

      // Attendre que l'erreur soit gérée
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not Authenticated');
      });
    });

    it('gère l\'erreur lors de la récupération du profil après connexion', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.login).mockResolvedValue({
        _id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });

      vi.mocked(userService.getProfile).mockRejectedValue(new Error('Profile Error'));

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      const loginButton = screen.getByTestId('login-button');

      // Cliquer sur le bouton et attendre que l'erreur soit gérée
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not Authenticated');
      });
    });
  });

  describe('Inscription', () => {
    it('permet de s\'inscrire avec succès', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.register).mockResolvedValue({
        _id: 'user-123',
        name: 'New User',
        email: 'test@example.com',
        accessToken: 'mock-token'
      });

      vi.mocked(userService.getProfile).mockResolvedValue(mockUser);

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      const registerButton = screen.getByTestId('register-button');
      await user.click(registerButton);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });

    it('gère l\'erreur d\'inscription', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.register).mockRejectedValue({
        response: { data: { message: 'Email already exists' } }
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      const registerButton = screen.getByTestId('register-button');

      // Utiliser act pour gérer les mises à jour d'état asynchrones
      await user.click(registerButton);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not Authenticated');
      });
    });
  });

  describe('Déconnexion', () => {
    it('permet de se déconnecter', async () => {
      const user = userEvent.setup();

      // Initialiser avec un utilisateur connecté
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      vi.mocked(userService.getProfile).mockResolvedValue(mockUser);
      vi.mocked(mediaService.getFavorites).mockResolvedValue({
        data: [
          {
            _id: 'media-1',
            title: 'Test Media 1',
            type: 'book' as const,
            author: 'Test Author',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            _id: 'media-2',
            title: 'Test Media 2',
            type: 'movie' as const,
            author: 'Test Director',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
      });

      const logoutButton = screen.getByTestId('logout-button');
      await user.click(logoutButton);

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not Authenticated');
      expect(tokenManager.clearTokens).toHaveBeenCalled();
    });
  });

  describe('Mise à jour utilisateur', () => {
    it('permet de mettre à jour les informations utilisateur', async () => {
      const user = userEvent.setup();

      // Initialiser avec un utilisateur connecté
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      vi.mocked(userService.getProfile).mockResolvedValue(mockUser);
      vi.mocked(mediaService.getFavorites).mockResolvedValue({
        data: [
          {
            _id: 'media-1',
            title: 'Test Media 1',
            type: 'book' as const,
            author: 'Test Author',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            _id: 'media-2',
            title: 'Test Media 2',
            type: 'movie' as const,
            author: 'Test Director',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
      });

      const updateButton = screen.getByTestId('update-user-button');
      await user.click(updateButton);

      expect(screen.getByTestId('user-name')).toHaveTextContent('Updated Name');
    });
  });

  describe('Rafraîchissement des données', () => {
    it('permet de rafraîchir les données utilisateur', async () => {
      const user = userEvent.setup();

      // Initialiser avec un utilisateur connecté
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      vi.mocked(userService.getProfile).mockResolvedValue(mockUser);
      vi.mocked(mediaService.getFavorites).mockResolvedValue({
        data: [
          {
            _id: 'media-1',
            title: 'Test Media 1',
            type: 'book' as const,
            author: 'Test Author',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            _id: 'media-2',
            title: 'Test Media 2',
            type: 'movie' as const,
            author: 'Test Director',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
      });

      const refreshButton = screen.getByTestId('refresh-user-button');
      await user.click(refreshButton);

      expect(userService.getProfile).toHaveBeenCalled();
      expect(mediaService.getFavorites).toHaveBeenCalled();
    });

    it('gère l\'erreur lors du rafraîchissement', async () => {
      const user = userEvent.setup();

      // Initialiser avec un utilisateur connecté
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      vi.mocked(userService.getProfile).mockResolvedValue(mockUser);
      vi.mocked(mediaService.getFavorites).mockResolvedValue({
        data: [
          {
            _id: 'media-1',
            title: 'Test Media 1',
            type: 'book' as const,
            author: 'Test Author',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            _id: 'media-2',
            title: 'Test Media 2',
            type: 'movie' as const,
            author: 'Test Director',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
      });

      // Simuler une erreur lors du rafraîchissement
      vi.mocked(userService.getProfile).mockRejectedValue(new Error('Refresh Error'));

      const refreshButton = screen.getByTestId('refresh-user-button');
      await user.click(refreshButton);

      // L'utilisateur devrait rester connecté malgré l'erreur
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
    });
  });

  describe('Gestion des rôles', () => {
    it('identifie correctement un utilisateur admin', async () => {
      // Initialiser avec un utilisateur admin
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAdminUser));
      vi.mocked(userService.getProfile).mockResolvedValue(mockAdminUser);
      vi.mocked(mediaService.getFavorites).mockResolvedValue({
        data: [
          {
            _id: 'media-1',
            title: 'Test Media 1',
            type: 'book' as const,
            author: 'Test Author',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            _id: 'media-2',
            title: 'Test Media 2',
            type: 'movie' as const,
            author: 'Test Director',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-admin')).toHaveTextContent('Admin');
      });

      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    });

    it('identifie correctement un utilisateur non-admin', async () => {
      // Initialiser avec un utilisateur normal
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      vi.mocked(userService.getProfile).mockResolvedValue(mockUser);
      vi.mocked(mediaService.getFavorites).mockResolvedValue({
        data: [
          {
            _id: 'media-1',
            title: 'Test Media 1',
            type: 'book' as const,
            author: 'Test Author',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            _id: 'media-2',
            title: 'Test Media 2',
            type: 'movie' as const,
            author: 'Test Director',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
      });

      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    });
  });

  describe('Gestion des favoris', () => {
    it('enrichit l\'utilisateur avec les favoris', async () => {
      // Initialiser avec un utilisateur connecté
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      vi.mocked(userService.getProfile).mockResolvedValue(mockUser);
      vi.mocked(mediaService.getFavorites).mockResolvedValue({
        data: [
          {
            _id: 'media-1',
            title: 'Test Media 1',
            type: 'book' as const,
            author: 'Test Author',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            _id: 'media-2',
            title: 'Test Media 2',
            type: 'movie' as const,
            author: 'Test Director',
            year: 2024,
            available: true,
            tags: [],
            reviews: [],
            averageRating: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-favorites-count')).toHaveTextContent('2');
    });

    it('gère l\'erreur lors de la récupération des favoris', async () => {
      // Initialiser avec un utilisateur connecté
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      vi.mocked(userService.getProfile).mockResolvedValue(mockUser);
      vi.mocked(mediaService.getFavorites).mockRejectedValue(new Error('Favorites Error'));

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
      });

      // L'utilisateur devrait avoir une liste de favoris vide en cas d'erreur
      expect(screen.getByTestId('user-favorites-count')).toHaveTextContent('0');
    });
  });

  describe('Hook useAuth', () => {
    it('lance une erreur si utilisé en dehors d\'AuthProvider', () => {
      // Supprimer la console.error pour éviter le bruit dans les tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});
