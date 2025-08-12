import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des services
vi.mock('../../services/borrowService', () => ({
  default: {
    getMyBorrows: vi.fn()
  }
}));

vi.mock('../../services/userService', () => ({
  default: {
    updateProfile: vi.fn()
  }
}));

vi.mock('../../services/authService', () => ({
  default: {
    changePassword: vi.fn()
  }
}));

// Mock du contexte d'authentification
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  favorites: ['fav1', 'fav2'],
  createdAt: '2024-01-01T00:00:00.000Z'
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    updateUser: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true
  })
}));

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
  };
});

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  UserCircleIcon: () => <div data-testid="user-icon">👤</div>,
  KeyIcon: () => <div data-testid="key-icon">🔑</div>,
  ShieldCheckIcon: () => <div data-testid="shield-icon">🛡️</div>,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon">⚠️</div>,
  XMarkIcon: () => <div data-testid="xmark-icon">✕</div>,
  EyeIcon: () => <div data-testid="eye-icon">👁️</div>,
  EyeSlashIcon: () => <div data-testid="eye-slash-icon">🙈</div>
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Importer la page réelle
import SettingsPage from '../../pages/user/SettingsPage';

// Wrapper avec providers
const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu initial', () => {
    it('affiche le titre et la description de la page', () => {
      renderWithProviders(<SettingsPage />);
      
      expect(screen.getByText('Paramètres')).toBeInTheDocument();
      expect(screen.getByText('Gérez votre profil et vos préférences')).toBeInTheDocument();
    });

    it('affiche les onglets de navigation', () => {
      renderWithProviders(<SettingsPage />);
      
      expect(screen.getByText('Profil')).toBeInTheDocument();
      expect(screen.getByText('Sécurité')).toBeInTheDocument();
      expect(screen.getByText('Compte')).toBeInTheDocument();
    });

    it('affiche l\'onglet Profil par défaut', () => {
      renderWithProviders(<SettingsPage />);
      
      // Utiliser getAllByText pour gérer les doublons
      const profileTexts = screen.getAllByText('Informations personnelles');
      expect(profileTexts.length).toBeGreaterThan(0);
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  describe('Onglet Profil', () => {
    it('affiche les informations utilisateur actuelles', () => {
      renderWithProviders(<SettingsPage />);
      
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Utilisateur')).toBeInTheDocument();
      expect(screen.getByText(/1 janvier 2024/)).toBeInTheDocument();
    });

    it('permet de modifier le nom et l\'email', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);
      
      const nameInput = screen.getByDisplayValue('John Doe');
      const emailInput = screen.getByDisplayValue('john@example.com');
      
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Doe');
      await user.clear(emailInput);
      await user.type(emailInput, 'jane@example.com');
      
      expect(nameInput).toHaveValue('Jane Doe');
      expect(emailInput).toHaveValue('jane@example.com');
    });

    it('affiche les boutons d\'action appropriés', () => {
      renderWithProviders(<SettingsPage />);
      
      expect(screen.getByText('Annuler')).toBeInTheDocument();
      expect(screen.getByText('Enregistrer les modifications')).toBeInTheDocument();
    });
  });

  describe('Onglet Sécurité', () => {
    it('affiche le formulaire de changement de mot de passe', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);
      
      // Cliquer sur l'onglet Sécurité
      await user.click(screen.getByText('Sécurité'));
      
      expect(screen.getByText('Sécurité du compte')).toBeInTheDocument();
      expect(screen.getByText('Changement de mot de passe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Votre mot de passe actuel')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Votre nouveau mot de passe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirmez votre nouveau mot de passe')).toBeInTheDocument();
    });

    it('affiche les informations de sécurité', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);
      
      await user.click(screen.getByText('Sécurité'));
      
      expect(screen.getByText(/Utilisez un mot de passe fort/)).toBeInTheDocument();
      expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
    });
  });

  describe('Onglet Compte', () => {
    it('affiche les statistiques du compte', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);
      
      await user.click(screen.getByText('Compte'));
      
      // Vérifier que les statistiques sont affichées (avec les valeurs par défaut)
      expect(screen.getByText('2')).toBeInTheDocument(); // Favoris
      
      // Utiliser getAllByText pour gérer les doublons
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBe(2); // 2 éléments avec la valeur "0"
      
      // Vérifier que les labels sont corrects
      expect(screen.getByText('Emprunts en cours')).toBeInTheDocument();
      expect(screen.getByText('Total emprunts')).toBeInTheDocument();
    });

    it('affiche les actions du compte', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);
      
      await user.click(screen.getByText('Compte'));
      
      expect(screen.getByText('Désactiver le compte')).toBeInTheDocument();
      expect(screen.getByText('Désactiver')).toBeInTheDocument();
    });
  });

  describe('Navigation entre onglets', () => {
    it('permet de naviguer entre les onglets', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);
      
      // Vérifier que l'onglet Profil est actif par défaut
      const profileTexts = screen.getAllByText('Informations personnelles');
      expect(profileTexts.length).toBeGreaterThan(0);
      
      // Aller à l'onglet Sécurité
      await user.click(screen.getByText('Sécurité'));
      expect(screen.getByText('Sécurité du compte')).toBeInTheDocument();
      
      // Aller à l'onglet Compte
      await user.click(screen.getByText('Compte'));
      expect(screen.getByText('Informations du compte')).toBeInTheDocument();
      
      // Retourner à l'onglet Profil
      await user.click(screen.getByText('Profil'));
      const profileTextsAfter = screen.getAllByText('Informations personnelles');
      expect(profileTextsAfter.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibilité', () => {
    it('a des labels appropriés pour les champs de formulaire', () => {
      renderWithProviders(<SettingsPage />);
      
      // Vérifier que les labels existent
      expect(screen.getByText('Nom complet')).toBeInTheDocument();
      expect(screen.getByText('Adresse email')).toBeInTheDocument();
      
      // Vérifier que les champs de saisie existent
      expect(screen.getByPlaceholderText('Votre nom complet')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    });

    it('a des descriptions pour les onglets', () => {
      renderWithProviders(<SettingsPage />);
      
      // Utiliser getAllByText pour gérer les doublons
      const profileTexts = screen.getAllByText('Informations personnelles');
      expect(profileTexts.length).toBeGreaterThan(0);
      expect(screen.getByText('Mot de passe et sécurité')).toBeInTheDocument();
      expect(screen.getByText('Gestion du compte')).toBeInTheDocument();
    });
  });
});
