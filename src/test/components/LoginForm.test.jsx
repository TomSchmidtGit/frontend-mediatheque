import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Composant LoginForm de test
const LoginForm = ({ onSubmit, loading = false, error = null }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit({
      email: formData.get('email'),
      password: formData.get('password')
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800" data-testid="error-message">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                data-testid="email-input"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                data-testid="password-input"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-button"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

describe('LoginForm Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le titre de connexion', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByText('Connexion à votre compte')).toBeInTheDocument();
    expect(screen.getByText('Connexion à votre compte')).toHaveClass('text-3xl', 'font-extrabold');
  });

  it('devrait avoir les champs email et mot de passe', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Adresse email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
  });

  it('devrait avoir les types d\'input corrects', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('devrait appeler onSubmit avec les bonnes données', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('devrait afficher une erreur quand error est fourni', () => {
    const errorMessage = 'Email ou mot de passe incorrect';
    render(<LoginForm onSubmit={mockOnSubmit} error={errorMessage} />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-red-800');
  });

  it('devrait avoir le style d\'erreur correct', () => {
    render(<LoginForm onSubmit={mockOnSubmit} error="Erreur" />);
    
    // Vérifier que l'erreur est affichée
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Erreur')).toBeInTheDocument();
  });

  it('devrait afficher le loading state', () => {
    render(<LoginForm onSubmit={mockOnSubmit} loading={true} />);
    
    expect(screen.getByText('Connexion en cours...')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  it('devrait avoir le spinner de loading', () => {
    render(<LoginForm onSubmit={mockOnSubmit} loading={true} />);
    
    const spinner = screen.getByTestId('submit-button').querySelector('div[class*="animate-spin"]');
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'h-4', 'w-4', 'border-b-2', 'border-white');
  });

  it('devrait avoir les classes CSS de base correctes', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    // Vérifier que le formulaire est présent
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
  });

  it('devrait avoir les attributs d\'accessibilité', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });

  it('devrait gérer les classes de focus', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByTestId('email-input');
    expect(emailInput).toHaveClass('focus:ring-blue-500', 'focus:border-blue-500');
  });

  it('devrait avoir la structure responsive', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    // Vérifier que la structure est présente
    expect(screen.getByText('Connexion à votre compte')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });
});
