import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock du contexte d'authentification
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

const mockUseAuth = vi.mocked(await import('../../context/AuthContext')).useAuth;

// Composant de test pour simuler les routes
const TestApp = ({ children, initialEntries = ['/protected'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Routes>
      <Route path="/protected" element={children} />
      <Route path="/login" element={<div data-testid="login-page">Page de connexion</div>} />
      <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
    </Routes>
  </MemoryRouter>
);

// Importer le composant réel
import ProtectedRoute from '../../components/common/ProtectedRoute';

describe('ProtectedRoute Component', () => {
  const mockChildren = <div data-testid="protected-content">Contenu protégé</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le contenu quand l\'utilisateur est authentifié', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false
    });

    render(
      <TestApp>
        <ProtectedRoute>{mockChildren}</ProtectedRoute>
      </TestApp>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('devrait afficher le contenu quand l\'utilisateur est admin et admin requis', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      loading: false
    });

    render(
      <TestApp>
        <ProtectedRoute requireAdmin={true}>{mockChildren}</ProtectedRoute>
      </TestApp>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('devrait afficher le loading pendant la vérification', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: true
    });

    render(
      <TestApp>
        <ProtectedRoute>{mockChildren}</ProtectedRoute>
      </TestApp>
    );

    expect(screen.getByText('Vérification de votre session...')).toBeInTheDocument();
    expect(screen.getByText('Vérification de votre session...')).toHaveClass('text-gray-600');
  });

  it('devrait rediriger vers login si non authentifié', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    });

    render(
      <TestApp>
        <ProtectedRoute>{mockChildren}</ProtectedRoute>
      </TestApp>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('devrait rediriger vers dashboard si admin requis mais utilisateur normal', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false
    });

    render(
      <TestApp>
        <ProtectedRoute requireAdmin={true}>{mockChildren}</ProtectedRoute>
      </TestApp>
    );

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('devrait afficher le spinner de loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: true
    });

    render(
      <TestApp>
        <ProtectedRoute>{mockChildren}</ProtectedRoute>
      </TestApp>
    );

    // Vérifier que le spinner est présent
    expect(screen.getByText('Vérification de votre session...')).toBeInTheDocument();
  });

  it('devrait avoir la structure de loading correcte', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: true
    });

    render(
      <TestApp>
        <ProtectedRoute>{mockChildren}</ProtectedRoute>
      </TestApp>
    );

    // Vérifier que le loading est affiché
    expect(screen.getByText('Vérification de votre session...')).toBeInTheDocument();
  });

  it('devrait gérer le cas loading=false, isAuthenticated=false', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    });

    render(
      <TestApp>
        <ProtectedRoute>{mockChildren}</ProtectedRoute>
      </TestApp>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('devrait gérer le cas loading=false, isAuthenticated=true, isAdmin=true, requireAdmin=false', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      loading: false
    });

    render(
      <TestApp>
        <ProtectedRoute requireAdmin={false}>{mockChildren}</ProtectedRoute>
      </TestApp>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
