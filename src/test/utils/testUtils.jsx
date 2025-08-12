import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Wrapper pour les composants avec Router et QueryClient
export const renderWithProviders = (ui, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Wrapper simple avec Router seulement
export const renderWithRouter = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Utilitaire pour attendre qu'un élément soit visible
export const waitForElement = async (selector, options = {}) => {
  return await waitFor(() => {
    const element = screen.queryByTestId(selector) || 
                   screen.queryByRole(selector) || 
                   screen.queryByText(selector);
    expect(element).toBeInTheDocument();
    return element;
  }, options);
};

// Utilitaire pour simuler une connexion utilisateur
export const mockUser = {
  _id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  actif: true
};

// Utilitaire pour simuler un utilisateur admin
export const mockAdmin = {
  _id: 'test-admin-id',
  name: 'Test Admin',
  email: 'admin@example.com',
  role: 'admin',
  actif: true
};

// Utilitaire pour simuler des données de média
export const mockMedia = {
  _id: 'test-media-id',
  title: 'Test Media',
  type: 'book',
  author: 'Test Author',
  year: 2024,
  description: 'Test description',
  available: true,
  category: 'test-category-id',
  tags: ['test-tag-id']
};

// Utilitaire pour simuler des données de catégorie
export const mockCategory = {
  _id: 'test-category-id',
  name: 'Test Category',
  description: 'Test category description',
  color: '#000000'
};

// Utilitaire pour simuler des données de tag
export const mockTag = {
  _id: 'test-tag-id',
  name: 'Test Tag',
  description: 'Test tag description'
};

// Utilitaire pour simuler des données d'emprunt
export const mockBorrow = {
  _id: 'test-borrow-id',
  user: 'test-user-id',
  media: 'test-media-id',
  borrowDate: new Date(),
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  status: 'borrowed'
};

// Utilitaire pour nettoyer les mocks
export const cleanupMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};

// Utilitaire pour simuler une réponse API réussie
export const mockApiSuccess = (data) => ({
  data,
  status: 200,
  statusText: 'OK'
});

// Utilitaire pour simuler une réponse API d'erreur
export const mockApiError = (status = 400, message = 'Error') => ({
  data: { message },
  status,
  statusText: 'Error'
});

// Export des utilitaires de Testing Library
export { render, screen, waitFor, fireEvent } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
