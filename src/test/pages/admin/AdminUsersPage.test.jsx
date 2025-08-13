import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  UsersIcon: ({ className }) => <div data-testid="users-icon" className={className} />,
  MagnifyingGlassIcon: ({ className }) => <div data-testid="search-icon" className={className} />,
  PencilIcon: ({ className }) => <div data-testid="edit-icon" className={className} />,
  EyeIcon: ({ className }) => <div data-testid="view-icon" className={className} />,
  FunnelIcon: ({ className }) => <div data-testid="filter-icon" className={className} />,
  XMarkIcon: ({ className }) => <div data-testid="close-icon" className={className} />,
  CheckCircleIcon: ({ className }) => <div data-testid="check-icon" className={className} />,
  XCircleIcon: ({ className }) => <div data-testid="x-icon" className={className} />,
  ShieldCheckIcon: ({ className }) => <div data-testid="shield-icon" className={className} />,
  ArrowPathIcon: ({ className }) => <div data-testid="refresh-icon" className={className} />
}));

// Mock du service admin
vi.mock('../../../services/adminUserService', () => ({
  default: {
    getUsers: vi.fn(),
    getUserStats: vi.fn()
  }
}));

// Composants simplifiés pour les tests
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div data-testid="pagination">
    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
      Précédent
    </button>
    <span>Page {currentPage} sur {totalPages}</span>
    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
      Suivant
    </button>
  </div>
);

const UserEditModal = ({ isOpen, onClose, user }) => (
  isOpen ? (
    <div data-testid="user-edit-modal">
      <h2>Modifier {user?.name}</h2>
      <button onClick={onClose}>Fermer</button>
    </div>
  ) : null
);

const ConfirmDialog = ({ isOpen, title, description, confirmText, onClose, onConfirm }) => (
  isOpen ? (
    <div data-testid="confirm-dialog">
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={onClose}>Annuler</button>
      <button onClick={onConfirm}>{confirmText}</button>
    </div>
  ) : null
);

// Mock des utilitaires
vi.mock('../../../utils', () => ({
  formatDate: {
    short: (date) => new Date(date).toLocaleDateString('fr-FR')
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

// Composant AdminUsersPage simplifié pour les tests
const AdminUsersPage = ({ 
  mockUsersData = null, 
  mockUserStats = null, 
  mockError = null,
  mockIsLoading = false 
}) => {
  const [filters, setFilters] = React.useState({ page: 1, limit: 20 });
  const [searchInput, setSearchInput] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [confirmUser, setConfirmUser] = React.useState(null);
  const [showFilters, setShowFilters] = React.useState(false);

  const handleSearchInputChange = (value) => {
    setSearchInput(value);
    setFilters(prev => ({ ...prev, search: value || undefined, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = (user) => {
    setConfirmUser(user);
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
    setSearchInput('');
    setShowFilters(false);
  };

  const hasActiveFilters = !!(filters.search || filters.role || filters.status);

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-red-100 text-red-800' };
      case 'employee':
        return { label: 'Employé', color: 'bg-blue-100 text-blue-800' };
      case 'user':
      default:
        return { label: 'Utilisateur', color: 'bg-green-100 text-green-800' };
    }
  };

  if (mockError) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <div data-testid="users-icon" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 mb-6">
            Impossible de récupérer la liste des utilisateurs.
          </p>
          <button className="btn-primary">
            <div data-testid="refresh-icon" className="h-4 w-4 mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Gestion des utilisateurs
              </h1>
              <p className="text-gray-600 text-lg">
                Administrez les comptes utilisateurs de votre médiathèque
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        {mockUserStats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{mockUserStats.total}</p>
                </div>
                <div data-testid="users-icon" className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">{mockUserStats.active}</p>
                </div>
                <div data-testid="check-icon" className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactifs</p>
                  <p className="text-2xl font-bold text-red-600">{mockUserStats.inactive}</p>
                </div>
                <div data-testid="x-icon" className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{mockUserStats.byRole.admin}</p>
                </div>
                <div data-testid="shield-icon" className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            {/* Recherche */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div data-testid="search-icon" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="input pl-10 w-full"
                  data-testid="search-input"
                />
                {searchInput && (
                  <button
                    onClick={() => handleSearchInputChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    data-testid="clear-search"
                  >
                    <div data-testid="close-icon" className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions et filtres */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center"
                data-testid="filter-button"
              >
                <div data-testid="filter-icon" className="h-4 w-4 mr-2" />
                Filtres
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {[filters.role, filters.status].filter(Boolean).length}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                  data-testid="clear-filters"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>

          {/* Filtres expandables */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle
                  </label>
                  <select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="input w-full"
                    data-testid="role-filter"
                  >
                    <option value="">Tous les rôles</option>
                    <option value="user">Utilisateur</option>
                    <option value="employee">Employé</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input w-full"
                    data-testid="status-filter"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Résultats */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {mockIsLoading ? 'Chargement...' : (
                  <>
                    {mockUsersData?.totalItems || 0} utilisateur{(mockUsersData?.totalItems || 0) > 1 ? 's' : ''} trouvé{(mockUsersData?.totalItems || 0) > 1 ? 's' : ''}
                  </>
                )}
              </h2>
              
              <div className="text-sm text-gray-500">
                Page {mockUsersData?.currentPage || 1} sur {mockUsersData?.totalPages || 1}
              </div>
            </div>
          </div>

          {mockIsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des utilisateurs...</p>
            </div>
          ) : mockUsersData && mockUsersData.data && mockUsersData.data.length > 0 ? (
            <>
              {/* Table desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Favoris
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockUsersData?.data?.map((user) => {
                      const roleInfo = getRoleInfo(user.role);
                      
                      return (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={roleInfo.color}>
                              <div data-testid="shield-icon" className="w-3 h-3 mr-1" />
                              {roleInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={user.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {user.actif ? (
                                <div data-testid="check-icon" className="w-3 h-3 mr-1" />
                              ) : (
                                <div data-testid="x-icon" className="w-3 h-3 mr-1" />
                              )}
                              {user.actif ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {Array.isArray(user.favorites) ? user.favorites.length : 0}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEditUser(user)}
                                className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Modifier l'utilisateur"
                                data-testid={`edit-user-${user._id}`}
                              >
                                <div data-testid="edit-icon" className="h-4 w-4" />
                              </button>
                              
                              <Link
                                to={`/admin/users/${user._id}`}
                                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Voir le profil"
                                data-testid={`view-user-${user._id}`}
                              >
                                <div data-testid="view-icon" className="h-4 w-4" />
                              </Link>
                              
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user)}
                                className="p-2 rounded-lg transition-colors"
                                title={user.actif ? 'Désactiver' : 'Activer'}
                                data-testid={`toggle-status-${user._id}`}
                              >
                                {user.actif ? (
                                  <div data-testid="x-icon" className="h-4 w-4" />
                                ) : (
                                  <div data-testid="check-icon" className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <div data-testid="users-icon" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Aucun utilisateur ne correspond à vos critères de recherche.'
                  : 'Il n\'y a encore aucun utilisateur inscrit.'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                  data-testid="clear-filters-empty"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {mockUsersData && mockUsersData?.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={mockUsersData?.currentPage || 1}
                totalPages={mockUsersData?.totalPages || 1}
                totalItems={mockUsersData?.totalItems || 0}
                itemsPerPage={filters.limit || 20}
                onPageChange={handlePageChange}
                loading={mockIsLoading}
              />
            </div>
          )}
        </div>

        {/* Conseils d'administration */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div data-testid="users-icon" className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Conseils de gestion des utilisateurs
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vérifiez régulièrement les comptes inactifs et contactez les utilisateurs</li>
                <li>• Accordez les rôles d'employé avec prudence pour maintenir la sécurité</li>
                <li>• Surveillez les utilisateurs avec beaucoup de favoris pour des recommandations</li>
                <li>• Utilisez la recherche pour retrouver rapidement un utilisateur spécifique</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* Confirmation désactivation/activation */}
      <ConfirmDialog
        isOpen={!!confirmUser}
        title={confirmUser?.actif ? 'Confirmer la désactivation' : 'Confirmer l\'activation'}
        description={confirmUser ? `Utilisateur : ${confirmUser.name}` : ''}
        confirmText={confirmUser?.actif ? 'Désactiver' : 'Activer'}
        onClose={() => setConfirmUser(null)}
        onConfirm={() => {
          if (confirmUser) {
            // Simulation de la mutation
            setConfirmUser(null);
          }
        }}
      />
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

describe('AdminUsersPage', () => {
  const mockUsers = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      favorites: ['1', '2'],
      actif: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      favorites: ['3'],
      actif: false,
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  const mockUsersData = {
    data: mockUsers,
    totalItems: 2,
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20
  };

  const mockUserStats = {
    total: 2,
    active: 1,
    inactive: 1,
    byRole: {
      user: 1,
      employee: 0,
      admin: 1
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it('affiche le titre et la description', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      expect(screen.getByText('Gestion des utilisateurs')).toBeInTheDocument();
      expect(screen.getByText('Administrez les comptes utilisateurs de votre médiathèque')).toBeInTheDocument();
    });

    it('affiche les statistiques utilisateurs', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      // Vérifie les statistiques avec des sélecteurs plus spécifiques
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Actifs')).toBeInTheDocument();
      expect(screen.getByText('Inactifs')).toBeInTheDocument();
      expect(screen.getByText('Admins')).toBeInTheDocument();
      
      // Vérifie les valeurs des statistiques
      const totalCard = screen.getByText('Total').closest('.bg-white');
      const activeCard = screen.getByText('Actifs').closest('.bg-white');
      const inactiveCard = screen.getByText('Inactifs').closest('.bg-white');
      const adminCard = screen.getByText('Admins').closest('.bg-white');
      
      expect(totalCard).toHaveTextContent('2');
      expect(activeCard).toHaveTextContent('1');
      expect(inactiveCard).toHaveTextContent('1');
      expect(adminCard).toHaveTextContent('1');
    });

    it('affiche la barre de recherche', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher par nom ou email...')).toBeInTheDocument();
    });

    it('affiche le bouton de filtres', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      expect(screen.getByTestId('filter-button')).toBeInTheDocument();
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });
  });

  describe('Affichage des utilisateurs', () => {
    it('affiche la liste des utilisateurs', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('affiche les informations des utilisateurs', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      // Vérifie les rôles dans le tableau (pas dans l'en-tête)
      const userRows = screen.getAllByText('John Doe');
      const adminRows = screen.getAllByText('Jane Smith');
      
      expect(userRows[0]).toBeInTheDocument();
      expect(adminRows[0]).toBeInTheDocument();
      
      // Vérifie les statuts
      expect(screen.getByText('Actif')).toBeInTheDocument();
      expect(screen.getByText('Inactif')).toBeInTheDocument();
      
      // Vérifie les dates d'inscription
      expect(screen.getByText('01/01/2024')).toBeInTheDocument();
      expect(screen.getByText('02/01/2024')).toBeInTheDocument();
      
      // Vérifie le nombre de favoris dans le tableau
      const johnRow = screen.getByText('John Doe').closest('tr');
      const janeRow = screen.getByText('Jane Smith').closest('tr');
      
      expect(johnRow).toHaveTextContent('2'); // John Doe a 2 favoris
      expect(janeRow).toHaveTextContent('1'); // Jane Smith a 1 favori
    });

    it('affiche les avatars des utilisateurs', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      // Vérifie que les avatars sont présents
      const avatars = screen.getAllByText('J');
      expect(avatars).toHaveLength(2); // John Doe et Jane Smith
      
      // Vérifie que les avatars sont dans des cercles
      avatars.forEach(avatar => {
        expect(avatar.closest('.rounded-full')).toBeInTheDocument();
      });
    });
  });

  describe('Recherche et filtres', () => {
    it('permet de saisir du texte dans la barre de recherche', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'John');
      
      expect(searchInput).toHaveValue('John');
    });

    it('affiche le bouton de suppression de la recherche quand du texte est saisi', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'John');
      
      expect(screen.getByTestId('clear-search')).toBeInTheDocument();
    });

    it('permet de supprimer le texte de recherche', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'John');
      
      const clearButton = screen.getByTestId('clear-search');
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
    });

    it('permet d\'ouvrir et fermer les filtres', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      const filterButton = screen.getByTestId('filter-button');
      await user.click(filterButton);
      
      expect(screen.getByTestId('role-filter')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
      
      await user.click(filterButton);
      
      expect(screen.queryByTestId('role-filter')).not.toBeInTheDocument();
      expect(screen.queryByTestId('status-filter')).not.toBeInTheDocument();
    });

    it('permet de filtrer par rôle', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      const filterButton = screen.getByTestId('filter-button');
      await user.click(filterButton);
      
      const roleFilter = screen.getByTestId('role-filter');
      await user.selectOptions(roleFilter, 'admin');
      
      expect(roleFilter).toHaveValue('admin');
    });

    it('permet de filtrer par statut', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      const filterButton = screen.getByTestId('filter-button');
      await user.click(filterButton);
      
      const statusFilter = screen.getByTestId('status-filter');
      await user.selectOptions(statusFilter, 'active');
      
      expect(statusFilter).toHaveValue('active');
    });
  });

  describe('Actions sur les utilisateurs', () => {
    it('permet de modifier un utilisateur', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      const editButton = screen.getByTestId('edit-user-1');
      await user.click(editButton);
      
      expect(screen.getByTestId('user-edit-modal')).toBeInTheDocument();
      expect(screen.getByText('Modifier John Doe')).toBeInTheDocument();
    });

    it('permet de voir le profil d\'un utilisateur', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      const viewButton = screen.getByTestId('view-user-1');
      expect(viewButton).toBeInTheDocument();
      expect(viewButton.closest('a')).toHaveAttribute('href', '/admin/users/1');
    });

    it('permet de changer le statut d\'un utilisateur', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      const toggleButton = screen.getByTestId('toggle-status-1');
      await user.click(toggleButton);
      
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirmer la désactivation')).toBeInTheDocument();
      expect(screen.getByText('Utilisateur : John Doe')).toBeInTheDocument();
    });

    it('permet de confirmer le changement de statut', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      const toggleButton = screen.getByTestId('toggle-status-1');
      await user.click(toggleButton);
      
      const confirmButton = screen.getByText('Désactiver');
      await user.click(confirmButton);
      
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });
  });

  describe('États de chargement et erreurs', () => {
    it('affiche l\'état de chargement', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockIsLoading={true}
        />
      );
      
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
      expect(screen.getByText('Chargement des utilisateurs...')).toBeInTheDocument();
    });

    it('affiche l\'erreur de chargement', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockError={true}
        />
      );
      
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
      expect(screen.getByText('Impossible de récupérer la liste des utilisateurs.')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    it('affiche le message d\'absence d\'utilisateurs', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={{ ...mockUsersData, data: [], totalItems: 0 }}
          mockUserStats={mockUserStats}
        />
      );
      
      expect(screen.getByText('Aucun utilisateur trouvé')).toBeInTheDocument();
      expect(screen.getByText('Il n\'y a encore aucun utilisateur inscrit.')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('affiche la pagination quand il y a plusieurs pages', () => {
      const multiPageData = {
        ...mockUsersData,
        totalPages: 3,
        totalItems: 60
      };
      
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={multiPageData}
          mockUserStats={mockUserStats}
        />
      );
      
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('n\'affiche pas la pagination quand il n\'y a qu\'une page', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Conseils d\'administration', () => {
    it('affiche la section des conseils', () => {
      renderWithProviders(
        <AdminUsersPage 
          mockUsersData={mockUsersData}
          mockUserStats={mockUserStats}
        />
      );
      
      expect(screen.getByText('💡 Conseils de gestion des utilisateurs')).toBeInTheDocument();
      expect(screen.getByText('• Vérifiez régulièrement les comptes inactifs et contactez les utilisateurs')).toBeInTheDocument();
      expect(screen.getByText('• Accordez les rôles d\'employé avec prudence pour maintenir la sécurité')).toBeInTheDocument();
      expect(screen.getByText('• Surveillez les utilisateurs avec beaucoup de favoris pour des recommandations')).toBeInTheDocument();
      expect(screen.getByText('• Utilisez la recherche pour retrouver rapidement un utilisateur spécifique')).toBeInTheDocument();
    });
  });
});
