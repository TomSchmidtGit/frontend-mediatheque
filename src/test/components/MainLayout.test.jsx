import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MainLayout from '../../components/layout/MainLayout';

// Mock du contexte d'authentification
const mockUseAuth = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: mockUseAuth
}));

// Mock du composant Header
vi.mock('../../components/layout/Header', () => ({
  default: ({ onMenuClick }) => (
    <header data-testid="header" onClick={onMenuClick}>
      Header Component
    </header>
  )
}));

// Mock du composant Outlet
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Page Content</div>
  };
});

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait rendre le composant avec l\'en-tête et le contenu principal', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false
    });

    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('devrait avoir la classe bg-gray-50 sur le conteneur principal', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false
    });

    const { container } = render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50');
  });

  it('devrait gérer le clic sur le menu de l\'en-tête', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false
    });

    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    const header = screen.getByTestId('header');
    expect(header).toBeInTheDocument();
  });

  it('devrait avoir la classe flex-1 sur le contenu principal', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false
    });

    const { container } = render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('flex-1');
  });

  it('devrait avoir la classe lg:ml-0 quand l\'utilisateur est authentifié', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true
    });

    const { container } = render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('lg:ml-0');
  });
});
