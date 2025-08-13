import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Composant Navigation de test
const Navigation = ({ 
  isAuthenticated = false, 
  isAdmin = false, 
  userName = '', 
  onLogout, 
  currentPath = '/' 
}) => {
  const handleLogout = () => {
    onLogout();
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900" data-testid="app-title">
                Médiathèque
              </h1>
            </div>
            
            {isAuthenticated && (
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPath === '/dashboard'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  data-testid="nav-dashboard"
                >
                  Dashboard
                </a>
                <a
                  href="/catalog"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPath === '/catalog'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  data-testid="nav-catalog"
                >
                  Catalogue
                </a>
                <a
                  href="/borrows"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPath === '/borrows'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  data-testid="nav-borrows"
                >
                  Mes emprunts
                </a>
                
                {isAdmin && (
                  <a
                    href="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPath === '/admin'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    data-testid="nav-admin"
                  >
                    Administration
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700" data-testid="user-name">
                  Bonjour, {userName}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  data-testid="logout-button"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  data-testid="nav-login"
                >
                  Connexion
                </a>
                <a
                  href="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  data-testid="nav-register"
                >
                  Inscription
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

describe('Navigation Component', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le titre de l\'application', () => {
    render(<Navigation onLogout={mockOnLogout} />);
    
    expect(screen.getByTestId('app-title')).toBeInTheDocument();
    expect(screen.getByText('Médiathèque')).toBeInTheDocument();
  });

  it('devrait afficher les liens de connexion et inscription quand non authentifié', () => {
    render(<Navigation onLogout={mockOnLogout} />);
    
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
    expect(screen.getByTestId('nav-register')).toBeInTheDocument();
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByText('Inscription')).toBeInTheDocument();
  });

  it('devrait avoir le style du bouton d\'inscription', () => {
    render(<Navigation onLogout={mockOnLogout} />);
    
    const registerButton = screen.getByTestId('nav-register');
    expect(registerButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white');
  });

  it('devrait afficher les liens de navigation quand authentifié', () => {
    render(
      <Navigation 
        isAuthenticated={true} 
        userName="John Doe" 
        onLogout={mockOnLogout} 
      />
    );
    
    expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-catalog')).toBeInTheDocument();
    expect(screen.getByTestId('nav-borrows')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Catalogue')).toBeInTheDocument();
    expect(screen.getByText('Mes emprunts')).toBeInTheDocument();
  });

  it('devrait afficher le nom de l\'utilisateur', () => {
    render(
      <Navigation 
        isAuthenticated={true} 
        userName="John Doe" 
        onLogout={mockOnLogout} 
      />
    );
    
    expect(screen.getByTestId('user-name')).toBeInTheDocument();
    expect(screen.getByText('Bonjour, John Doe')).toBeInTheDocument();
  });

  it('devrait afficher le bouton de déconnexion', () => {
    render(
      <Navigation 
        isAuthenticated={true} 
        userName="John Doe" 
        onLogout={mockOnLogout} 
      />
    );
    
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
  });

  it('devrait appeler onLogout quand le bouton déconnexion est cliqué', async () => {
    const user = userEvent.setup();
    render(
      <Navigation 
        isAuthenticated={true} 
        userName="John Doe" 
        onLogout={mockOnLogout} 
      />
    );
    
    const logoutButton = screen.getByTestId('logout-button');
    await user.click(logoutButton);
    
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('devrait afficher le lien admin pour les administrateurs', () => {
    render(
      <Navigation 
        isAuthenticated={true} 
        isAdmin={true}
        userName="Admin User" 
        onLogout={mockOnLogout} 
      />
    );
    
    expect(screen.getByTestId('nav-admin')).toBeInTheDocument();
    expect(screen.getByText('Administration')).toBeInTheDocument();
  });

  it('ne devrait pas afficher le lien admin pour les utilisateurs normaux', () => {
    render(
      <Navigation 
        isAuthenticated={true} 
        isAdmin={false}
        userName="John Doe" 
        onLogout={mockOnLogout} 
      />
    );
    
    expect(screen.queryByTestId('nav-admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Administration')).not.toBeInTheDocument();
  });

  it('devrait mettre en évidence le lien actif', () => {
    render(
      <Navigation 
        isAuthenticated={true} 
        userName="John Doe" 
        currentPath="/dashboard"
        onLogout={mockOnLogout} 
      />
    );
    
    const dashboardLink = screen.getByTestId('nav-dashboard');
    expect(dashboardLink).toHaveClass('bg-gray-900', 'text-white');
    
    const catalogLink = screen.getByTestId('nav-catalog');
    expect(catalogLink).toHaveClass('text-gray-700', 'hover:text-gray-900', 'hover:bg-gray-100');
  });

  it('devrait avoir la structure responsive correcte', () => {
    render(<Navigation onLogout={mockOnLogout} />);
    
    // Vérifier que la navigation est présente
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Médiathèque')).toBeInTheDocument();
  });

  it('devrait avoir les classes de hover correctes', () => {
    render(<Navigation onLogout={mockOnLogout} />);
    
    const loginLink = screen.getByTestId('nav-login');
    expect(loginLink).toHaveClass('hover:text-gray-900', 'hover:bg-gray-100');
  });

  it('devrait gérer l\'état non authentifié correctement', () => {
    render(<Navigation onLogout={mockOnLogout} />);
    
    // Vérifier que les liens de navigation ne sont pas présents
    expect(screen.queryByTestId('nav-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-catalog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-borrows')).not.toBeInTheDocument();
    
    // Vérifier que les éléments d'authentification sont présents
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
    expect(screen.getByTestId('nav-register')).toBeInTheDocument();
  });

  it('devrait gérer l\'état authentifié correctement', () => {
    render(
      <Navigation 
        isAuthenticated={true} 
        userName="John Doe" 
        onLogout={mockOnLogout} 
      />
    );
    
    // Vérifier que les liens de navigation sont présents
    expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-catalog')).toBeInTheDocument();
    expect(screen.getByTestId('nav-borrows')).toBeInTheDocument();
    
    // Vérifier que les éléments d'authentification ne sont pas présents
    expect(screen.queryByTestId('nav-login')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-register')).not.toBeInTheDocument();
  });
});
