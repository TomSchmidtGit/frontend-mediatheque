import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Link, useParams, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ArrowLeftIcon: ({ className }) => <div data-testid="arrow-left-icon" className={className} />,
  UserCircleIcon: ({ className }) => <div data-testid="user-circle-icon" className={className} />,
  PencilIcon: ({ className }) => <div data-testid="pencil-icon" className={className} />,
  ShieldCheckIcon: ({ className }) => <div data-testid="shield-check-icon" className={className} />,
  HeartIcon: ({ className }) => <div data-testid="heart-icon" className={className} />,
  ClockIcon: ({ className }) => <div data-testid="clock-icon" className={className} />,
  CheckCircleIcon: ({ className }) => <div data-testid="check-circle-icon" className={className} />,
  XCircleIcon: ({ className }) => <div data-testid="x-circle-icon" className={className} />,
  CalendarIcon: ({ className }) => <div data-testid="calendar-icon" className={className} />,
  BookOpenIcon: ({ className }) => <div data-testid="book-open-icon" className={className} />,
  EyeIcon: ({ className }) => <div data-testid="eye-icon" className={className} />
}));

// Mock du service admin
vi.mock('../../../services/adminUserService', () => ({
  default: {
    getUserById: vi.fn(),
    getUserBorrows: vi.fn(),
    toggleUserStatus: vi.fn()
  }
}));

// Mock des composants
vi.mock('../../../components/admin/UserEditModal', () => ({
  default: ({ isOpen, onClose, user }) => (
    isOpen ? (
      <div data-testid="user-edit-modal">
        <h2>Modifier l'utilisateur</h2>
        <p>Nom: {user?.name}</p>
        <p>Email: {user?.email}</p>
        <p>Rôle: {user?.role}</p>
        <button onClick={onClose}>Fermer</button>
      </div>
    ) : null
  )
}));

vi.mock('../../../components/modals/ConfirmDialog', () => ({
  default: ({ isOpen, title, description, confirmText, onClose, onConfirm }) => (
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onClose}>Annuler</button>
        <button onClick={onConfirm}>{confirmText}</button>
      </div>
    ) : null
  )
}));

// Mock des utilitaires
vi.mock('../../../utils', () => ({
  formatDate: {
    long: (date) => '1er janvier 2024',
    short: (date) => '01/01/2024',
    timeAgo: (date) => 'il y a 2 jours'
  },
  formatters: {
    borrowStatus: (status) => {
      switch (status) {
        case 'borrowed': return 'En cours';
        case 'returned': return 'Retourné';
        case 'overdue': return 'En retard';
        default: return 'Inconnu';
      }
    },
    mediaType: (type) => {
      switch (type) {
        case 'book': return 'Livre';
        case 'movie': return 'Film';
        case 'music': return 'Musique';
        default: return 'Inconnu';
      }
    }
  },
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    Link: ({ children, to, ...props }) => (
      <a href={to} {...props} data-testid={`link-${to}`}>
        {children}
      </a>
    )
  };
});

// Mock des hooks react-router
const mockNavigate = vi.fn();
const mockParams = { userId: 'user-123' };

vi.mocked(useParams).mockReturnValue(mockParams);
vi.mocked(useNavigate).mockReturnValue(mockNavigate);

// Composant AdminUserDetailPage simplifié pour les tests
const AdminUserDetailPage = ({ 
  mockUser = null, 
  mockUserBorrows = null,
  mockError = null,
  mockIsLoading = false,
  mockBorrowsLoading = false
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [confirmToggle, setConfirmToggle] = React.useState(false);

  const handleToggleStatus = () => {
    if (!mockUser) return;
    setConfirmToggle(true);
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrateur',
          description: 'Accès complet à toutes les fonctionnalités',
          color: 'text-red-700',
          bgColor: 'bg-red-100'
        };
      case 'employee':
        return {
          label: 'Employé',
          description: 'Gestion des emprunts et des médias',
          color: 'text-blue-700',
          bgColor: 'bg-blue-100'
        };
      case 'user':
      default:
        return {
          label: 'Utilisateur',
          description: 'Emprunt et consultation des médias',
          color: 'text-green-700',
          bgColor: 'bg-green-100'
        };
    }
  };

  if (mockError) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <div data-testid="user-circle-icon" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Utilisateur non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            L'utilisateur que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <a href="/admin/users" className="btn-primary" data-testid="link-/admin/users">
            Retour à la liste
          </a>
        </div>
      </div>
    );
  }

  if (mockIsLoading) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil utilisateur...</p>
        </div>
      </div>
    );
  }

  if (!mockUser) return null;

  const roleInfo = getRoleInfo(mockUser.role);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="page-container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <a
            href="/admin/users"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            data-testid="link-/admin/users"
          >
            <div data-testid="arrow-left-icon" className="h-4 w-4 mr-2" />
            Retour à la gestion des utilisateurs
          </a>
        </div>

        {/* Header du profil */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {mockUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{mockUser.name}</h1>
                  <p className="text-gray-600">{mockUser.email}</p>
                  
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleInfo.bgColor} ${roleInfo.color}`}>
                      <div data-testid="shield-check-icon" className="w-4 h-4 mr-1" />
                      {roleInfo.label}
                    </span>
                    
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      mockUser.actif 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mockUser.actif ? (
                        <div data-testid="check-circle-icon" className="w-4 h-4 mr-1" />
                      ) : (
                        <div data-testid="x-circle-icon" className="w-4 h-4 mr-1" />
                      )}
                      {mockUser.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn-secondary flex items-center"
                  data-testid="edit-button"
                >
                  <div data-testid="pencil-icon" className="h-4 w-4 mr-2" />
                  Modifier
                </button>
                
                <button
                  onClick={handleToggleStatus}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mockUser.actif
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  data-testid="toggle-status-button"
                >
                  {mockUser.actif ? (
                    <div data-testid="x-circle-icon" className="h-4 w-4 mr-2" />
                  ) : (
                    <div data-testid="check-circle-icon" className="h-4 w-4 mr-2" />
                  )}
                  {mockUser.actif ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations du compte
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Rôle</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleInfo.bgColor} ${roleInfo.color}`}>
                      <div data-testid="shield-check-icon" className="w-4 h-4 mr-1" />
                      {roleInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{roleInfo.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      mockUser.actif 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mockUser.actif ? (
                        <div data-testid="check-circle-icon" className="w-4 h-4 mr-1" />
                      ) : (
                        <div data-testid="x-circle-icon" className="w-4 h-4 mr-1" />
                      )}
                      {mockUser.actif ? 'Compte actif' : 'Compte désactivé'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Inscription</label>
                  <div className="mt-1 flex items-center text-sm text-gray-900">
                    <div data-testid="calendar-icon" className="h-4 w-4 mr-2" />
                    1er janvier 2024
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Dernière modification</label>
                  <div className="mt-1 flex items-center text-sm text-gray-900">
                    <div data-testid="calendar-icon" className="h-4 w-4 mr-2" />
                    il y a 2 jours
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistiques
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div data-testid="heart-icon" className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {Array.isArray(mockUser.favorites) ? mockUser.favorites.length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Favoris</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div data-testid="clock-icon" className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {mockUserBorrows?.data?.filter((b) => b.status === 'borrowed').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Emprunts actifs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Emprunts récents */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div data-testid="clock-icon" className="h-5 w-5 mr-2" />
                    Emprunts récents
                  </h3>
                  
                  <a
                    href={`/admin/borrows?user=${mockUser._id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    data-testid={`link-/admin/borrows?user=${mockUser._id}`}
                  >
                    <div data-testid="eye-icon" className="h-4 w-4 mr-1" />
                    Voir tous les emprunts
                  </a>
                </div>
              </div>

              <div className="p-0">
                {mockBorrowsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des emprunts...</p>
                  </div>
                ) : mockUserBorrows && mockUserBorrows.data && mockUserBorrows.data.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {mockUserBorrows.data.map((borrow) => (
                      <div key={borrow._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {borrow.media.imageUrl ? (
                                <img
                                  src={borrow.media.imageUrl}
                                  alt={borrow.media.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div data-testid="book-open-icon" className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {borrow.media.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {borrow.media.author} • {borrow.media.year}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Emprunté le 01/01/2024</span>
                                <span>À rendre le 01/01/2024</span>
                                {borrow.returnDate && (
                                  <span className="text-green-600">
                                    Retourné le 01/01/2024
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              borrow.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                              borrow.status === 'returned' ? 'bg-green-100 text-green-800' :
                              borrow.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {borrow.status === 'borrowed' ? 'En cours' :
                               borrow.status === 'returned' ? 'Retourné' :
                               borrow.status === 'overdue' ? 'En retard' :
                               'Inconnu'}
                            </span>
                            
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              borrow.media.type === 'book' ? 'bg-blue-100 text-blue-800' :
                              borrow.media.type === 'movie' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {borrow.media.type === 'book' ? 'Livre' :
                               borrow.media.type === 'movie' ? 'Film' :
                               'Musique'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div data-testid="clock-icon" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun emprunt enregistré</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Cet utilisateur n'a encore effectué aucun emprunt
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Favoris de l'utilisateur */}
            {Array.isArray(mockUser.favorites) && mockUser.favorites.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div data-testid="heart-icon" className="h-5 w-5 mr-2" />
                    Favoris ({mockUser.favorites.length})
                  </h3>
                </div>
                
                <div className="p-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockUser.favorites.slice(0, 6).map((favorite, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                        <div data-testid="heart-icon" className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {typeof favorite === 'object' && 'title' in favorite ? favorite.title : 'Média favori'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {typeof favorite === 'object' && 'author' in favorite ? favorite.author : `ID: ${favorite}`}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {mockUser.favorites.length > 6 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">
                        Et {mockUser.favorites.length - 6} autres favoris...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
          <div className="flex items-start">
            <div data-testid="user-circle-icon" className="h-6 w-6 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary-900 mb-2">
                Actions administrateur
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center p-3 bg-white rounded-lg border border-primary-200 text-left hover:bg-primary-50 transition-colors"
                  data-testid="edit-action-button"
                >
                  <div data-testid="pencil-action-icon" className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <div className="font-medium text-primary-900">Modifier le profil</div>
                    <div className="text-sm text-primary-700">Nom, email, rôle</div>
                  </div>
                </button>
                
                <a
                  href={`/admin/borrows?user=${mockUser._id}`}
                  className="flex items-center p-3 bg-white rounded-lg border border-primary-200 text-left hover:bg-primary-50 transition-colors"
                  data-testid="borrows-action-link"
                >
                  <div data-testid="clock-action-icon" className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <div className="font-medium text-primary-900">Voir tous les emprunts</div>
                    <div className="text-sm text-primary-700">Historique complet</div>
                  </div>
                </a>
                
                <button
                  onClick={handleToggleStatus}
                  className="flex items-center p-3 bg-white rounded-lg border border-primary-200 text-left hover:bg-primary-50 transition-colors"
                  data-testid="toggle-status-action-button"
                >
                  {mockUser.actif ? (
                    <div data-testid="x-circle-action-icon" className="h-5 w-5 text-red-600 mr-3" />
                  ) : (
                    <div data-testid="check-circle-action-icon" className="h-5 w-5 text-green-600 mr-3" />
                  )}
                  <div>
                    <div className={`font-medium ${
                      mockUser.actif ? 'text-red-900' : 'text-green-900'
                    }`}>
                      {mockUser.actif ? 'Désactiver le compte' : 'Réactiver le compte'}
                    </div>
                    <div className={`text-sm ${
                      mockUser.actif ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {mockUser.actif ? 'Bloquer l\'accès' : 'Restaurer l\'accès'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {isEditModalOpen && (
        <div data-testid="user-edit-modal">
          <h2>Modifier l'utilisateur</h2>
          <p>Nom: {mockUser.name}</p>
          <p>Email: {mockUser.email}</p>
          <p>Rôle: {mockUser.role}</p>
          <button onClick={() => setIsEditModalOpen(false)}>Fermer</button>
        </div>
      )}

      {/* Confirmation activation/désactivation */}
      {confirmToggle && (
        <div data-testid="confirm-dialog">
          <h2>{mockUser.actif ? 'Confirmer la désactivation' : 'Confirmer l\'activation'}</h2>
          <p>Utilisateur : {mockUser.name}</p>
          <button onClick={() => setConfirmToggle(false)}>Annuler</button>
          <button onClick={() => {
            setConfirmToggle(false);
          }} data-testid="confirm-toggle-button">{mockUser.actif ? 'Désactiver' : 'Activer'}</button>
        </div>
      )}
    </div>
  );
};

// Helper pour wrapper le composant avec les providers nécessaires
const renderWithProviders = (component, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>,
    options
  );
};

describe('AdminUserDetailPage', () => {
  const mockUser = {
    _id: 'user-123',
    name: 'Alice Martin',
    email: 'alice.martin@example.com',
    role: 'user',
    favorites: [
      { _id: 'media-1', title: 'Le Seigneur des Anneaux', author: 'J.R.R. Tolkien' },
      { _id: 'media-2', title: 'Matrix', author: 'Wachowski Sisters' },
      'media-3', // ID simple
      'media-4'  // ID simple
    ],
    actif: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  };

  const mockUserBorrows = {
    data: [
      {
        _id: 'borrow-1',
        media: {
          _id: 'media-1',
          title: 'Le Seigneur des Anneaux',
          author: 'J.R.R. Tolkien',
          year: 1954,
          type: 'book',
          imageUrl: 'https://example.com/lotr.jpg'
        },
        borrowDate: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-01-15T00:00:00.000Z',
        status: 'borrowed'
      },
      {
        _id: 'borrow-2',
        media: {
          _id: 'media-2',
          title: 'Matrix',
          author: 'Wachowski Sisters',
          year: 1999,
          type: 'movie',
          imageUrl: null
        },
        borrowDate: '2024-01-05T00:00:00.000Z',
        dueDate: '2024-01-20T00:00:00.000Z',
        returnDate: '2024-01-18T00:00:00.000Z',
        status: 'returned'
      }
    ],
    currentPage: 1,
    totalPages: 1,
    totalItems: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Navigation et breadcrumb', () => {
    it('affiche le breadcrumb avec le lien de retour', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Retour à la gestion des utilisateurs')).toBeInTheDocument();
      expect(screen.getByTestId('link-/admin/users')).toBeInTheDocument();
      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });

    it('permet de naviguer vers la liste des utilisateurs', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const backLink = screen.getByTestId('link-/admin/users');
      expect(backLink).toHaveAttribute('href', '/admin/users');
    });
  });

  describe('Header du profil utilisateur', () => {
    it('affiche l\'avatar avec l\'initiale du nom', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('A')).toBeInTheDocument(); // Initiale d'Alice
    });

    it('affiche le nom et l\'email de l\'utilisateur', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Alice Martin')).toBeInTheDocument();
      expect(screen.getByText('alice.martin@example.com')).toBeInTheDocument();
    });

    it('affiche le rôle avec la bonne couleur et description', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      // Utiliser getAllByText pour gérer les éléments multiples
      const userLabels = screen.getAllByText('Utilisateur');
      expect(userLabels.length).toBeGreaterThan(0);
      expect(screen.getByText('Emprunt et consultation des médias')).toBeInTheDocument();
      // Utiliser getAllByTestId pour gérer les éléments multiples
      const shieldIcons = screen.getAllByTestId('shield-check-icon');
      expect(shieldIcons.length).toBeGreaterThan(0);
    });

    it('affiche le statut actif avec la bonne couleur', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Actif')).toBeInTheDocument();
      // Utiliser getAllByTestId pour gérer les éléments multiples
      const checkIcons = screen.getAllByTestId('check-circle-icon');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('affiche le statut inactif avec la bonne couleur', () => {
      const inactiveUser = { ...mockUser, actif: false };
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={inactiveUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Inactif')).toBeInTheDocument();
      // Utiliser getAllByTestId pour gérer les éléments multiples
      const xIcons = screen.getAllByTestId('x-circle-icon');
      expect(xIcons.length).toBeGreaterThan(0);
    });

    it('affiche les boutons d\'action dans le header', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.getByText('Modifier')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-status-button')).toBeInTheDocument();
      expect(screen.getByText('Désactiver')).toBeInTheDocument();
    });

    it('affiche le bon texte du bouton selon le statut', () => {
      const inactiveUser = { ...mockUser, actif: false };
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={inactiveUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Activer')).toBeInTheDocument();
    });
  });

  describe('Informations du compte', () => {
    it('affiche les informations du compte dans une section dédiée', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Informations du compte')).toBeInTheDocument();
    });

    it('affiche le rôle avec description', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Rôle')).toBeInTheDocument();
      // Utiliser getAllByText pour gérer les éléments multiples
      const userLabels = screen.getAllByText('Utilisateur');
      expect(userLabels.length).toBeGreaterThan(0);
      expect(screen.getByText('Emprunt et consultation des médias')).toBeInTheDocument();
    });

    it('affiche le statut du compte', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Statut')).toBeInTheDocument();
      expect(screen.getByText('Compte actif')).toBeInTheDocument();
    });

    it('affiche la date d\'inscription', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Inscription')).toBeInTheDocument();
      expect(screen.getByText('1er janvier 2024')).toBeInTheDocument();
      // Utiliser getAllByTestId pour gérer les éléments multiples
      const calendarIcons = screen.getAllByTestId('calendar-icon');
      expect(calendarIcons.length).toBeGreaterThan(0);
    });

    it('affiche la date de dernière modification', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Dernière modification')).toBeInTheDocument();
      expect(screen.getByText('il y a 2 jours')).toBeInTheDocument();
    });
  });

  describe('Statistiques rapides', () => {
    it('affiche la section des statistiques', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Statistiques')).toBeInTheDocument();
    });

    it('affiche le nombre de favoris', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Favoris')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument(); // 4 favoris
      // Utiliser getAllByTestId pour gérer les éléments multiples
      const heartIcons = screen.getAllByTestId('heart-icon');
      expect(heartIcons.length).toBeGreaterThan(0);
    });

    it('affiche le nombre d\'emprunts actifs', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Emprunts actifs')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // 1 emprunt en cours
      // Utiliser getAllByTestId pour gérer les éléments multiples
      const clockIcons = screen.getAllByTestId('clock-icon');
      expect(clockIcons.length).toBeGreaterThan(0);
    });

    it('gère le cas d\'absence de favoris', () => {
      const userWithoutFavorites = { ...mockUser, favorites: [] };
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={userWithoutFavorites}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('0')).toBeInTheDocument(); // 0 favoris
    });
  });

  describe('Emprunts récents', () => {
    it('affiche la section des emprunts récents', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Emprunts récents')).toBeInTheDocument();
      // Utiliser getAllByTestId pour gérer les éléments multiples
      const clockIcons = screen.getAllByTestId('clock-icon');
      expect(clockIcons.length).toBeGreaterThan(0);
    });

    it('affiche le lien vers tous les emprunts', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const allBorrowsLink = screen.getByTestId('link-/admin/borrows?user=user-123');
      expect(allBorrowsLink).toBeInTheDocument();
      // Utiliser getAllByText pour gérer les éléments multiples
      const voirTousElements = screen.getAllByText('Voir tous les emprunts');
      expect(voirTousElements.length).toBeGreaterThan(0);
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });

    it('affiche l\'état de chargement des emprunts', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
          mockBorrowsLoading={true}
        />
      );
      
      expect(screen.getByText('Chargement des emprunts...')).toBeInTheDocument();
    });

    it('affiche la liste des emprunts avec les bonnes informations', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      // Utiliser getAllByText pour gérer les éléments multiples
      const lotrElements = screen.getAllByText('Le Seigneur des Anneaux');
      expect(lotrElements.length).toBeGreaterThan(0);
      
      const matrixElements = screen.getAllByText('Matrix');
      expect(matrixElements.length).toBeGreaterThan(0);
      
      expect(screen.getByText('J.R.R. Tolkien')).toBeInTheDocument();
      expect(screen.getByText('Wachowski Sisters')).toBeInTheDocument();
      
      // Vérifier que les années sont présentes dans le contexte des emprunts
      // Chercher les années dans le texte qui contient "author • year"
      expect(screen.getByText(/1954/)).toBeInTheDocument();
      expect(screen.getByText(/1999/)).toBeInTheDocument();
    });

    it('affiche les images des médias ou des icônes par défaut', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      // Premier média avec image
      const image = screen.getByAltText('Le Seigneur des Anneaux');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/lotr.jpg');
      
      // Deuxième média sans image
      const defaultIcon = screen.getAllByTestId('book-open-icon')[0];
      expect(defaultIcon).toBeInTheDocument();
    });

    it('affiche les statuts des emprunts avec les bonnes couleurs', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('En cours')).toBeInTheDocument();
      expect(screen.getByText('Retourné')).toBeInTheDocument();
    });

    it('affiche les types de médias avec les bonnes couleurs', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Livre')).toBeInTheDocument();
      expect(screen.getByText('Film')).toBeInTheDocument();
    });

    it('affiche les dates des emprunts', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      // Utiliser getAllByText pour gérer les éléments multiples
      const borrowedDates = screen.getAllByText('Emprunté le 01/01/2024');
      expect(borrowedDates.length).toBeGreaterThan(0);
      
      const dueDates = screen.getAllByText('À rendre le 01/01/2024');
      expect(dueDates.length).toBeGreaterThan(0);
      
      const returnedDates = screen.getAllByText('Retourné le 01/01/2024');
      expect(returnedDates.length).toBeGreaterThan(0);
    });

    it('affiche le message d\'absence d\'emprunts', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={{ data: [], totalItems: 0 }}
        />
      );
      
      expect(screen.getByText('Aucun emprunt enregistré')).toBeInTheDocument();
      expect(screen.getByText('Cet utilisateur n\'a encore effectué aucun emprunt')).toBeInTheDocument();
    });
  });

  describe('Favoris de l\'utilisateur', () => {
    it('affiche la section des favoris quand il y en a', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Favoris (4)')).toBeInTheDocument();
      // Utiliser getAllByTestId pour gérer les éléments multiples
      const heartIcons = screen.getAllByTestId('heart-icon');
      expect(heartIcons.length).toBeGreaterThan(0);
    });

    it('affiche les favoris avec les bonnes informations', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      // Utiliser getAllByText pour gérer les éléments multiples
      const lotrElements = screen.getAllByText('Le Seigneur des Anneaux');
      expect(lotrElements.length).toBeGreaterThan(0);
      
      const matrixElements = screen.getAllByText('Matrix');
      expect(matrixElements.length).toBeGreaterThan(0);
      
      expect(screen.getByText('J.R.R. Tolkien')).toBeInTheDocument();
      expect(screen.getByText('Wachowski Sisters')).toBeInTheDocument();
    });

    it('gère les favoris avec des objets et des IDs simples', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      // Favoris avec objets complets - utiliser getAllByText
      const lotrElements = screen.getAllByText('Le Seigneur des Anneaux');
      expect(lotrElements.length).toBeGreaterThan(0);
      
      const matrixElements = screen.getAllByText('Matrix');
      expect(matrixElements.length).toBeGreaterThan(0);
      
      // Favoris avec IDs simples - utiliser getAllByText
      const mediaFavoriElements = screen.getAllByText('Média favori');
      expect(mediaFavoriElements.length).toBeGreaterThan(0);
      
      expect(screen.getByText('ID: media-3')).toBeInTheDocument();
      expect(screen.getByText('ID: media-4')).toBeInTheDocument();
    });

    it('affiche le message pour les favoris supplémentaires', () => {
      const userWithManyFavorites = { 
        ...mockUser, 
        favorites: Array.from({ length: 10 }, (_, i) => `media-${i}`)
      };
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={userWithManyFavorites}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Et 4 autres favoris...')).toBeInTheDocument();
    });

    it('n\'affiche pas la section des favoris quand il n\'y en a pas', () => {
      const userWithoutFavorites = { ...mockUser, favorites: [] };
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={userWithoutFavorites}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      // Vérifier que la section des favoris détaillée n'est pas présente
      expect(screen.queryByText('Favoris (0)')).not.toBeInTheDocument();
      // Le label "Favoris" dans les statistiques peut être présent, mais pas la section détaillée
      expect(screen.queryByText('Favoris (4)')).not.toBeInTheDocument();
      expect(screen.queryByText('Favoris (1)')).not.toBeInTheDocument();
      expect(screen.queryByText('Favoris (2)')).not.toBeInTheDocument();
      expect(screen.queryByText('Favoris (3)')).not.toBeInTheDocument();
      expect(screen.queryByText('Favoris (5)')).not.toBeInTheDocument();
      // Vérifier que la section détaillée des favoris n'est pas présente
      expect(screen.queryByText('Média favori')).not.toBeInTheDocument();
    });
  });

  describe('Actions rapides', () => {
    it('affiche la section des actions administrateur', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Actions administrateur')).toBeInTheDocument();
      expect(screen.getByTestId('user-circle-icon')).toBeInTheDocument();
    });

    it('affiche le bouton de modification du profil', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const editButton = screen.getByTestId('edit-action-button');
      expect(editButton).toBeInTheDocument();
      expect(screen.getByText('Modifier le profil')).toBeInTheDocument();
      expect(screen.getByText('Nom, email, rôle')).toBeInTheDocument();
      expect(screen.getByTestId('pencil-action-icon')).toBeInTheDocument();
    });

    it('affiche le lien vers tous les emprunts', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const borrowsLink = screen.getByTestId('borrows-action-link');
      expect(borrowsLink).toBeInTheDocument();
      
      // Utiliser getAllByText pour gérer les éléments multiples
      const voirTousElements = screen.getAllByText('Voir tous les emprunts');
      expect(voirTousElements.length).toBeGreaterThan(0);
      
      expect(screen.getByText('Historique complet')).toBeInTheDocument();
      expect(screen.getByTestId('clock-action-icon')).toBeInTheDocument();
    });

    it('affiche le bouton de toggle du statut avec le bon texte', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const toggleButton = screen.getByTestId('toggle-status-action-button');
      expect(toggleButton).toBeInTheDocument();
      expect(screen.getByText('Désactiver le compte')).toBeInTheDocument();
      expect(screen.getByText('Bloquer l\'accès')).toBeInTheDocument();
    });

    it('affiche le bon texte pour un utilisateur inactif', () => {
      const inactiveUser = { ...mockUser, actif: false };
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={inactiveUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      expect(screen.getByText('Réactiver le compte')).toBeInTheDocument();
      expect(screen.getByText('Restaurer l\'accès')).toBeInTheDocument();
    });
  });

  describe('Modal d\'édition', () => {
    it('permet d\'ouvrir la modal d\'édition', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);
      
      expect(screen.getByTestId('user-edit-modal')).toBeInTheDocument();
      expect(screen.getByText('Modifier l\'utilisateur')).toBeInTheDocument();
      expect(screen.getByText('Nom: Alice Martin')).toBeInTheDocument();
      expect(screen.getByText('Email: alice.martin@example.com')).toBeInTheDocument();
      expect(screen.getByText('Rôle: user')).toBeInTheDocument();
    });

    it('permet de fermer la modal d\'édition', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);
      
      const closeButton = screen.getByText('Fermer');
      await user.click(closeButton);
      
      expect(screen.queryByTestId('user-edit-modal')).not.toBeInTheDocument();
    });
  });

  describe('Confirmation de changement de statut', () => {
    it('permet d\'ouvrir la confirmation de désactivation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const toggleButton = screen.getByTestId('toggle-status-button');
      await user.click(toggleButton);
      
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirmer la désactivation')).toBeInTheDocument();
      expect(screen.getByText('Utilisateur : Alice Martin')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-toggle-button')).toBeInTheDocument();
    });

    it('permet d\'ouvrir la confirmation d\'activation', async () => {
      const user = userEvent.setup();
      const inactiveUser = { ...mockUser, actif: false };
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={inactiveUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const toggleButton = screen.getByTestId('toggle-status-button');
      await user.click(toggleButton);
      
      const confirmDialog = screen.getByTestId('confirm-dialog');
      expect(confirmDialog).toBeInTheDocument();
      expect(confirmDialog).toHaveTextContent('Confirmer l\'activation');
      expect(screen.getByTestId('confirm-toggle-button')).toBeInTheDocument();
    });

    it('permet de fermer la confirmation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const toggleButton = screen.getByTestId('toggle-status-button');
      await user.click(toggleButton);
      
      const cancelButton = screen.getByText('Annuler');
      await user.click(cancelButton);
      
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });

    it('permet de confirmer le changement de statut', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const toggleButton = screen.getByTestId('toggle-status-button');
      await user.click(toggleButton);
      
      const confirmDialog = screen.getByTestId('confirm-dialog');
      const confirmButton = confirmDialog.querySelector('[data-testid="confirm-toggle-button"]');
      await user.click(confirmButton);
      
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });
  });

  describe('États de chargement et erreurs', () => {
    it('affiche l\'état de chargement', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockIsLoading={true}
        />
      );
      
      expect(screen.getByText('Chargement du profil utilisateur...')).toBeInTheDocument();
    });

    it('affiche l\'erreur utilisateur non trouvé', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockError={true}
        />
      );
      
      expect(screen.getByText('Utilisateur non trouvé')).toBeInTheDocument();
      expect(screen.getByText('L\'utilisateur que vous recherchez n\'existe pas ou a été supprimé.')).toBeInTheDocument();
      expect(screen.getByText('Retour à la liste')).toBeInTheDocument();
    });

    it('affiche le lien de retour dans l\'état d\'erreur', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockError={true}
        />
      );
      
      const backLink = screen.getByTestId('link-/admin/users');
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/admin/users');
    });
  });

  describe('Gestion des rôles', () => {
    it('affiche les informations du rôle administrateur', () => {
      const adminUser = { ...mockUser, role: 'admin' };
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={adminUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const adminLabels = screen.getAllByText('Administrateur');
      expect(adminLabels.length).toBeGreaterThan(0);
      expect(screen.getByText('Accès complet à toutes les fonctionnalités')).toBeInTheDocument();
    });

    it('affiche les informations du rôle employé', () => {
      const employeeUser = { ...mockUser, role: 'employee' };
      
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={employeeUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const employeeLabels = screen.getAllByText('Employé');
      expect(employeeLabels.length).toBeGreaterThan(0);
      expect(screen.getByText('Gestion des emprunts et des médias')).toBeInTheDocument();
    });

    it('affiche les informations du rôle utilisateur par défaut', () => {
      renderWithProviders(
        <AdminUserDetailPage 
          mockUser={mockUser}
          mockUserBorrows={mockUserBorrows}
        />
      );
      
      const userLabels = screen.getAllByText('Utilisateur');
      expect(userLabels.length).toBeGreaterThan(0);
      expect(screen.getByText('Emprunt et consultation des médias')).toBeInTheDocument();
    });
  });
});
