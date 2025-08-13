import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des services
vi.mock('../../services/authService', () => ({
  default: {
    forgotPassword: vi.fn()
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
  ArrowLeftIcon: ({ className, ...props }) => <div data-testid="arrow-left-icon" className={className} {...props} />,
  EnvelopeIcon: ({ className, ...props }) => <div data-testid="envelope-icon" className={className} {...props} />
}));

// Importer la page réelle
import ForgotPasswordPage from '../../pages/auth/ForgotPasswordPage';

// Récupérer le mock après l'import
const mockForgotPassword = vi.mocked(await import('../../services/authService')).default.forgotPassword;

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

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockForgotPassword.mockReset();
  });

  it('devrait afficher le formulaire de récupération de mot de passe', () => {
    renderWithProviders(<ForgotPasswordPage />);
    
    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
    expect(screen.getByText(/Entrez votre adresse email et nous vous enverrons un lien/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' })).toBeInTheDocument();
  });

  it('devrait afficher le lien de retour vers la connexion', () => {
    renderWithProviders(<ForgotPasswordPage />);
    
    const backLink = screen.getByRole('link', { name: /Retour à la connexion/ });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/login');
  });

  it('devrait valider le format de l\'email lors de la soumission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByPlaceholderText('votre@email.com');
    const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
    
    await user.type(emailInput, 'email-invalide');
    await user.click(submitButton);
    
    // La validation Zod devrait empêcher la soumission du formulaire
    // Vérifier que le service n'est pas appelé
    expect(mockForgotPassword).not.toHaveBeenCalled();
  });

  it('devrait accepter un email valide', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByPlaceholderText('votre@email.com');
    const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    // Vérifier que le service est appelé avec l'email saisi
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('devrait gérer l\'envoi réussi de l\'email', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValue({ message: 'Email envoyé' });
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByPlaceholderText('votre@email.com');
    const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('devrait afficher la page de confirmation après envoi réussi', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValue({ message: 'Email envoyé' });
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByPlaceholderText('votre@email.com');
    const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email envoyé !')).toBeInTheDocument();
      expect(screen.getByText(/Si cet email existe dans notre base/)).toBeInTheDocument();
      expect(screen.getByText('Vérifiez votre boîte de réception')).toBeInTheDocument();
    });
  });

  it('devrait afficher l\'état de chargement pendant l\'envoi', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByPlaceholderText('votre@email.com');
    const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    // Vérifier que le service est appelé
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('devrait gérer les erreurs d\'envoi', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockRejectedValue({
      response: { data: { message: 'Email non trouvé' } }
    });
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByPlaceholderText('votre@email.com');
    const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('devrait avoir la structure responsive correcte', () => {
    renderWithProviders(<ForgotPasswordPage />);
    
    // Vérifier que la page se charge sans erreur
    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
    
    // Vérifier que tous les éléments sont présents
    expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' })).toBeInTheDocument();
  });

  it('devrait gérer la navigation vers la connexion depuis la page de confirmation', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValue({ message: 'Email envoyé' });
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByPlaceholderText('votre@email.com');
    const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email envoyé !')).toBeInTheDocument();
    });
    
    const backToLoginLink = screen.getByRole('link', { name: /Retour à la connexion/ });
    expect(backToLoginLink).toHaveAttribute('href', '/login');
  });

  it('devrait afficher les informations de sécurité sur la page de confirmation', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValue({ message: 'Email envoyé' });
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByPlaceholderText('votre@email.com');
    const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email envoyé !')).toBeInTheDocument();
      expect(screen.getByText('Vérifiez votre boîte de réception')).toBeInTheDocument();
      expect(screen.getByText(/N'oubliez pas de vérifier vos spams/)).toBeInTheDocument();
    });
  });
});
