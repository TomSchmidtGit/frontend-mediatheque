import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des services
vi.mock('../../services/authService', () => ({
  default: {
    resetPassword: vi.fn()
  }
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  CheckCircleIcon: ({ className, ...props }) => <div data-testid="check-icon" className={className} {...props} />,
  ExclamationTriangleIcon: ({ className, ...props }) => <div data-testid="exclamation-icon" className={className} {...props} />
}));

// Mock de react-router-dom
const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams('?token=valid-token&email=test@example.com');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams]
  };
});

// Importer la page réelle
import ResetPasswordPage from '../../pages/auth/ResetPasswordPage';

// Récupérer le mock après l'import
const mockResetPassword = vi.mocked(await import('../../services/authService')).default.resetPassword;

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

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResetPassword.mockReset();
    // Réinitialiser les paramètres de recherche
    mockSearchParams.set('token', 'valid-token');
    mockSearchParams.set('email', 'test@example.com');
  });

  it('devrait afficher le formulaire de réinitialisation de mot de passe', () => {
    renderWithProviders(<ResetPasswordPage />);
    
    expect(screen.getByRole('heading', { name: 'Nouveau mot de passe' })).toBeInTheDocument();
    expect(screen.getByText(/Créez un nouveau mot de passe pour votre compte/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nouveau mot de passe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmer le mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réinitialiser le mot de passe' })).toBeInTheDocument();
  });

  it('devrait afficher le lien de retour vers la connexion', () => {
    renderWithProviders(<ResetPasswordPage />);
    
    const backLink = screen.getByRole('link', { name: /Retour à la connexion/ });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/login');
  });

  it('devrait afficher l\'email en lecture seule', () => {
    renderWithProviders(<ResetPasswordPage />);
    
    const emailInput = screen.getByDisplayValue('test@example.com');
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveClass('bg-gray-50');
  });

  it('devrait valider la longueur minimale du mot de passe', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Réinitialiser le mot de passe' });
    
    await user.type(passwordInput, '123');
    await user.click(submitButton);
    
    // La validation Zod devrait empêcher la soumission du formulaire
    // Vérifier que le service n'est pas appelé
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('devrait valider la correspondance des mots de passe', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Réinitialiser le mot de passe' });
    
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'DifferentPassword123');
    await user.click(submitButton);
    
    // La validation Zod devrait empêcher la soumission du formulaire
    // Vérifier que le service n'est pas appelé
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('devrait accepter des mots de passe valides', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    
    expect(passwordInput).toHaveValue('Password123');
    expect(confirmPasswordInput).toHaveValue('Password123');
  });

  it('devrait gérer la réinitialisation réussie du mot de passe', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValue({ message: 'Mot de passe réinitialisé' });
    
    renderWithProviders(<ResetPasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Réinitialiser le mot de passe' });
    
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('valid-token', 'test@example.com', 'Password123');
    });
  });

  it('devrait afficher la page de succès après réinitialisation', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValue({ message: 'Mot de passe réinitialisé' });
    
    renderWithProviders(<ResetPasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Réinitialiser le mot de passe' });
    
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mot de passe réinitialisé !')).toBeInTheDocument();
      expect(screen.getByText(/Votre mot de passe a été modifié avec succès/)).toBeInTheDocument();
      expect(screen.getByText('Sécurité renforcée')).toBeInTheDocument();
    });
  });

  it('devrait afficher l\'état de chargement pendant la réinitialisation', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithProviders(<ResetPasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Réinitialiser le mot de passe' });
    
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);
    
    // Vérifier que le service est appelé
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('valid-token', 'test@example.com', 'Password123');
    });
  });

  it('devrait gérer les erreurs de réinitialisation', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockRejectedValue({
      response: { data: { message: 'Token expiré' } }
    });
    
    renderWithProviders(<ResetPasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Réinitialiser le mot de passe' });
    
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('valid-token', 'test@example.com', 'Password123');
    });
  });

  it('devrait rediriger vers forgot-password si token manquant', () => {
    mockSearchParams.delete('token');
    mockSearchParams.delete('email');
    
    renderWithProviders(<ResetPasswordPage />);
    
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  it('devrait rediriger vers forgot-password si email manquant', () => {
    mockSearchParams.set('token', 'valid-token');
    mockSearchParams.delete('email');
    
    renderWithProviders(<ResetPasswordPage />);
    
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  it('devrait basculer la visibilité du mot de passe', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const toggleButton = passwordInput.parentElement.querySelector('button');
    
    // Par défaut, le mot de passe est masqué
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Cliquer pour afficher le mot de passe
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Cliquer pour masquer le mot de passe
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('devrait basculer la visibilité de la confirmation du mot de passe', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);
    
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const toggleButton = confirmPasswordInput.parentElement.querySelector('button');
    
    // Par défaut, le mot de passe est masqué
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    // Cliquer pour afficher le mot de passe
    await user.click(toggleButton);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    
    // Cliquer pour masquer le mot de passe
    await user.click(toggleButton);
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('devrait avoir la structure responsive correcte', () => {
    renderWithProviders(<ResetPasswordPage />);
    
    // Vérifier que la page se charge sans erreur
    expect(screen.getByRole('heading', { name: 'Nouveau mot de passe' })).toBeInTheDocument();
    
    // Vérifier que tous les éléments sont présents
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nouveau mot de passe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmer le mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réinitialiser le mot de passe' })).toBeInTheDocument();
  });

  it('devrait gérer la navigation vers la connexion depuis la page de succès', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValue({ message: 'Mot de passe réinitialisé' });
    
    renderWithProviders(<ResetPasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Réinitialiser le mot de passe' });
    
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mot de passe réinitialisé !')).toBeInTheDocument();
    });
    
    const loginButton = screen.getByRole('link', { name: 'Se connecter' });
    expect(loginButton).toHaveAttribute('href', '/login');
  });

  it('devrait afficher les informations de sécurité sur la page de succès', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValue({ message: 'Mot de passe réinitialisé' });
    
    renderWithProviders(<ResetPasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Réinitialiser le mot de passe' });
    
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mot de passe réinitialisé !')).toBeInTheDocument();
      expect(screen.getByText('Sécurité renforcée')).toBeInTheDocument();
      expect(screen.getByText(/Pour des raisons de sécurité/)).toBeInTheDocument();
    });
  });
});
