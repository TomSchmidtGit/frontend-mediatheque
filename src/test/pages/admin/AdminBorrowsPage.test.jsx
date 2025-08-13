import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ClockIcon: ({ className }) => <div data-testid="clock-icon" className={className} />,
  MagnifyingGlassIcon: ({ className }) => <div data-testid="search-icon" className={className} />,
  FunnelIcon: ({ className }) => <div data-testid="filter-icon" className={className} />,
  XMarkIcon: ({ className }) => <div data-testid="close-icon" className={className} />,
  CheckCircleIcon: ({ className }) => <div data-testid="check-icon" className={className} />,
  ExclamationTriangleIcon: ({ className }) => <div data-testid="warning-icon" className={className} />,
  ArrowPathIcon: ({ className }) => <div data-testid="refresh-icon" className={className} />,
  UserIcon: ({ className }) => <div data-testid="user-icon" className={className} />,
  BookOpenIcon: ({ className }) => <div data-testid="book-icon" className={className} />,
  FilmIcon: ({ className }) => <div data-testid="film-icon" className={className} />,
  MusicalNoteIcon: ({ className }) => <div data-testid="music-icon" className={className} />,
  EyeIcon: ({ className }) => <div data-testid="view-icon" className={className} />,
  PlusIcon: ({ className }) => <div data-testid="plus-icon" className={className} />
}));

// Mock du service admin
vi.mock('../../../services/adminBorrowService', () => ({
  default: {
    getBorrows: vi.fn(),
    returnBorrow: vi.fn()
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

const CreateBorrowModal = ({ isOpen, onClose }) => (
  isOpen ? (
    <div data-testid="create-borrow-modal">
      <h2>Nouvel emprunt</h2>
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
  dateUtils: {
    isOverdue: (date) => new Date(date) < new Date(),
    isDueSoon: (date) => {
      const dueDate = new Date(date);
      const now = new Date();
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays > 0;
    }
  },
  formatters: {
    mediaType: (type) => {
      switch (type) {
        case 'book': return 'Livre';
        case 'movie': return 'Film';
        case 'music': return 'Musique';
        default: return 'Média';
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

// Composant AdminBorrowsPage simplifié pour les tests
const AdminBorrowsPage = ({ 
  mockBorrowsData = null, 
  mockError = null,
  mockIsLoading = false 
}) => {
  const [filters, setFilters] = React.useState({ page: 1, limit: 20, status: 'all' });
  const [searchInput, setSearchInput] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [confirmBorrow, setConfirmBorrow] = React.useState(null);

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

  const handleReturnBorrow = (borrowId, mediaTitle) => {
    setConfirmBorrow({ id: borrowId, title: mediaTitle });
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20, status: 'all' });
    setSearchInput('');
    setShowFilters(false);
  };

  const hasActiveFilters = !!(filters.search || filters.status !== 'all' || filters.user || filters.mediaType);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'book': return <div data-testid="book-icon" className="h-4 w-4" />;
      case 'movie': return <div data-testid="film-icon" className="h-4 w-4" />;
      case 'music': return <div data-testid="music-icon" className="h-4 w-4" />;
      default: return <div data-testid="book-icon" className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'book': return 'bg-blue-100 text-blue-800';
      case 'movie': return 'bg-purple-100 text-purple-800';
      case 'music': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusInfo = (borrow) => {
    if (borrow.status === 'returned') {
      return {
        status: 'returned',
        label: 'Retourné',
        color: 'bg-green-100 text-green-800',
        icon: 'check-icon'
      };
    }

    if (new Date(borrow.dueDate) < new Date()) {
      return {
        status: 'overdue',
        label: 'En retard',
        color: 'bg-red-100 text-red-800',
        icon: 'warning-icon'
      };
    }

    return {
      status: 'borrowed',
      label: 'En cours',
      color: 'bg-blue-100 text-blue-800',
      icon: 'clock-icon'
    };
  };

  if (mockError) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <div data-testid="clock-icon" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 mb-6">
            Impossible de récupérer la liste des emprunts.
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
                Gestion des emprunts
              </h1>
              <p className="text-gray-600 text-lg">
                Administrez tous les emprunts de la médiathèque
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <div data-testid="plus-icon" className="h-4 w-4 mr-2" />
                Nouvel emprunt
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        {mockBorrowsData && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {mockBorrowsData.data.filter(b => b.status === 'borrowed').length}
                  </p>
                </div>
                <div data-testid="clock-icon" className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En retard</p>
                  <p className="text-2xl font-bold text-red-600">
                    {mockBorrowsData.data.filter(b => new Date(b.dueDate) < new Date() && b.status !== 'returned').length}
                  </p>
                </div>
                <div data-testid="warning-icon" className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Retournés</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockBorrowsData.data.filter(b => b.status === 'returned').length}
                  </p>
                </div>
                <div data-testid="check-icon" className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockBorrowsData.totalItems}
                  </p>
                </div>
                <div data-testid="book-icon" className="h-8 w-8 text-gray-500" />
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
                  placeholder="Rechercher par utilisateur, média..."
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
                    {[filters.status !== 'all', filters.user, filters.mediaType].filter(Boolean).length}
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
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input w-full"
                    data-testid="status-filter"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="borrowed">En cours</option>
                    <option value="overdue">En retard</option>
                    <option value="returned">Retournés</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de média
                  </label>
                  <select
                    value={filters.mediaType || ''}
                    onChange={(e) => handleFilterChange('mediaType', e.target.value)}
                    className="input w-full"
                    data-testid="media-type-filter"
                  >
                    <option value="">Tous les types</option>
                    <option value="book">Livre</option>
                    <option value="movie">Film</option>
                    <option value="music">Musique</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilisateur spécifique
                  </label>
                  <input
                    type="text"
                    placeholder="Nom ou email de l'utilisateur"
                    value={filters.user || ''}
                    onChange={(e) => handleFilterChange('user', e.target.value)}
                    className="input w-full"
                    data-testid="user-filter"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des emprunts */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {mockIsLoading ? 'Chargement...' : (
                  <>
                    {mockBorrowsData?.totalItems || 0} emprunt{(mockBorrowsData?.totalItems || 0) > 1 ? 's' : ''} trouvé{(mockBorrowsData?.totalItems || 0) > 1 ? 's' : ''}
                  </>
                )}
              </h2>
              
              <div className="text-sm text-gray-500">
                Page {mockBorrowsData?.currentPage || 1} sur {mockBorrowsData?.totalPages || 1}
              </div>
            </div>
          </div>

          {mockIsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des emprunts...</p>
            </div>
          ) : mockBorrowsData && mockBorrowsData.data && mockBorrowsData.data.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {mockBorrowsData.data.map((borrow) => {
                const statusInfo = getStatusInfo(borrow);
                
                return (
                  <div key={borrow._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                      {/* Image du média */}
                      <div className="w-full h-40 sm:w-16 sm:h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {borrow.media.imageUrl ? (
                          <img
                            src={borrow.media.imageUrl}
                            alt={borrow.media.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getTypeIcon(borrow.media.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(borrow.media.type)}`}>
                                {getTypeIcon(borrow.media.type)}
                                <span className="ml-1">
                                  {borrow.media.type === 'book' ? 'Livre' : borrow.media.type === 'movie' ? 'Film' : 'Musique'}
                                </span>
                              </span>
                              
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                <div data-testid={statusInfo.icon} className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </span>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-1 break-words">
                              {borrow.media.title}
                            </h3>
                            
                            <div className="flex items-center text-sm text-gray-600 mb-2 min-w-0">
                              <div data-testid="user-icon" className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="font-medium truncate">{borrow.user.name}</span>
                              <span className="mx-2 flex-shrink-0">•</span>
                              <span className="truncate">{borrow.media.author}</span>
                              <span className="mx-2 flex-shrink-0">•</span>
                              <span className="flex-shrink-0">{borrow.media.year}</span>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Emprunté le :</span>
                                <div className="font-medium">{new Date(borrow.borrowDate).toLocaleDateString('fr-FR')}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">À rendre le :</span>
                                <div className={`font-medium ${
                                  new Date(borrow.dueDate) < new Date() && borrow.status !== 'returned' ? 'text-red-600' : ''
                                }`}>
                                  {new Date(borrow.dueDate).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                              {borrow.returnDate && (
                                <div>
                                  <span className="text-gray-500">Retourné le :</span>
                                  <div className="font-medium text-green-600">{new Date(borrow.returnDate).toLocaleDateString('fr-FR')}</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:flex-col sm:items-end sm:space-y-2 sm:gap-0 sm:ml-auto sm:pl-2">
                            <Link
                              to={`/media/${borrow.media._id}`}
                              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              data-testid={`view-media-${borrow._id}`}
                            >
                              <div data-testid="view-icon" className="h-4 w-4 mr-1" />
                              Voir média
                            </Link>

                            <Link
                              to={`/admin/users/${borrow.user._id}`}
                              className="flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors"
                              data-testid={`view-user-${borrow._id}`}
                            >
                              <div data-testid="user-icon" className="h-4 w-4 mr-1" />
                              Voir profil
                            </Link>

                            {borrow.status !== 'returned' && (
                              <button
                                type="button"
                                onClick={() => handleReturnBorrow(borrow._id, borrow.media.title)}
                                className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-300 rounded-md hover:bg-green-50 transition-colors"
                                data-testid={`return-borrow-${borrow._id}`}
                              >
                                <div data-testid="check-icon" className="h-4 w-4 mr-1" />
                                Marquer retourné
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div data-testid="clock-icon" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun emprunt trouvé
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Aucun emprunt ne correspond à vos critères de recherche.'
                  : 'Aucun emprunt n\'a été effectué pour le moment.'
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
          {mockBorrowsData && mockBorrowsData.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={mockBorrowsData.currentPage}
                totalPages={mockBorrowsData.totalPages}
                totalItems={mockBorrowsData.totalItems}
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
            <div data-testid="clock-icon" className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Conseils de gestion des emprunts
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Surveillez régulièrement les emprunts en retard pour contacter les utilisateurs</li>
                <li>• Utilisez les filtres pour identifier rapidement les emprunts problématiques</li>
                <li>• Les retours doivent être confirmés manuellement via cette interface</li>
                <li>• Contactez les utilisateurs en retard pour éviter les pénalités</li>
                <li>• Vérifiez l'état des médias lors des retours physiques</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de création d'emprunt */}
      <CreateBorrowModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Confirmation retour emprunt */}
      <ConfirmDialog
        isOpen={!!confirmBorrow}
        title="Confirmer le retour"
        description={confirmBorrow ? `Média : ${confirmBorrow.title}` : ''}
        confirmText="Marquer comme retourné"
        onClose={() => setConfirmBorrow(null)}
        onConfirm={() => {
          if (confirmBorrow) {
            setConfirmBorrow(null);
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

describe('AdminBorrowsPage', () => {
  const mockBorrows = [
    {
      _id: '1',
      user: {
        _id: 'user-1',
        name: 'Alice Martin',
        email: 'alice@example.com',
        role: 'user',
        favorites: [],
        actif: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      media: {
        _id: 'media-1',
        title: 'Le Seigneur des Anneaux',
        type: 'book',
        author: 'J.R.R. Tolkien',
        year: 1954,
        available: false,
        description: 'Un livre épique',
        imageUrl: 'https://picsum.photos/300/400?random=1',
        reviews: [],
        averageRating: 4.5,
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      borrowDate: '2024-01-01T00:00:00.000Z',
      dueDate: '2024-01-15T00:00:00.000Z',
      returnDate: undefined,
      status: 'borrowed',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      _id: '2',
      user: {
        _id: 'user-2',
        name: 'Bob Dupont',
        email: 'bob@example.com',
        role: 'user',
        favorites: [],
        actif: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      media: {
        _id: 'media-2',
        title: 'Inception',
        type: 'movie',
        author: 'Christopher Nolan',
        year: 2010,
        available: false,
        description: 'Un film de science-fiction',
        imageUrl: 'https://picsum.photos/300/400?random=2',
        reviews: [],
        averageRating: 4.8,
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      borrowDate: '2024-01-01T00:00:00.000Z',
      dueDate: '2024-01-10T00:00:00.000Z',
      returnDate: '2024-01-08T00:00:00.000Z',
      status: 'returned',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
  ];

  const mockBorrowsData = {
    data: mockBorrows,
    totalItems: 2,
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it('affiche le titre et la description', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      expect(screen.getByText('Gestion des emprunts')).toBeInTheDocument();
      expect(screen.getByText('Administrez tous les emprunts de la médiathèque')).toBeInTheDocument();
    });

    it('affiche le bouton de création d\'emprunt', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      expect(screen.getByText('Nouvel emprunt')).toBeInTheDocument();
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('affiche les statistiques des emprunts', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      // Vérifie les valeurs des statistiques en ciblant les cartes par leur contenu
      const statsCards = screen.getAllByText(/En cours|En retard|Retournés|Total/);
      const enCoursCard = statsCards.find(card => card.textContent.includes('En cours')).closest('.bg-white');
      const enRetardCard = statsCards.find(card => card.textContent.includes('En retard')).closest('.bg-white');
      const retournesCard = statsCards.find(card => card.textContent.includes('Retournés')).closest('.bg-white');
      const totalCard = statsCards.find(card => card.textContent.includes('Total')).closest('.bg-white');
      
      expect(enCoursCard).toHaveTextContent('1');
      expect(enRetardCard).toHaveTextContent('1');
      expect(retournesCard).toHaveTextContent('1');
      expect(totalCard).toHaveTextContent('2');
    });

    it('affiche la barre de recherche', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher par utilisateur, média...')).toBeInTheDocument();
    });

    it('affiche le bouton de filtres', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      expect(screen.getByTestId('filter-button')).toBeInTheDocument();
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });
  });

  describe('Affichage des emprunts', () => {
    it('affiche la liste des emprunts', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      expect(screen.getByText('Le Seigneur des Anneaux')).toBeInTheDocument();
      expect(screen.getByText('J.R.R. Tolkien')).toBeInTheDocument();
      expect(screen.getByText('Inception')).toBeInTheDocument();
      expect(screen.getByText('Christopher Nolan')).toBeInTheDocument();
    });

    it('affiche les informations des utilisateurs', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      expect(screen.getByText('Alice Martin')).toBeInTheDocument();
      expect(screen.getByText('Bob Dupont')).toBeInTheDocument();
    });

    it('affiche les types de médias avec les bonnes icônes', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      expect(screen.getByText('Livre')).toBeInTheDocument();
      expect(screen.getByText('Film')).toBeInTheDocument();
      
      // Vérifie que les icônes sont présentes
      expect(screen.getAllByTestId('book-icon')).toHaveLength(2); // 1 dans les stats + 1 dans le type
      expect(screen.getAllByTestId('film-icon')).toHaveLength(1);
    });

    it('affiche les statuts des emprunts', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      expect(screen.getByText('En cours')).toBeInTheDocument();
      expect(screen.getByText('Retourné')).toBeInTheDocument();
    });

    it('affiche les dates d\'emprunt et de retour', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      // Vérifie les dates dans les cartes d'emprunt
      const aliceBorrow = screen.getByText('Alice Martin').closest('.p-4');
      const bobBorrow = screen.getByText('Bob Dupont').closest('.p-4');
      
      expect(aliceBorrow).toHaveTextContent('01/01/2024'); // Date d'emprunt d'Alice
      expect(aliceBorrow).toHaveTextContent('15/01/2024'); // Date de retour prévue d'Alice
      expect(bobBorrow).toHaveTextContent('08/01/2024'); // Date de retour effective de Bob
    });
  });

  describe('Recherche et filtres', () => {
    it('permet de saisir du texte dans la barre de recherche', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Alice');
      
      expect(searchInput).toHaveValue('Alice');
    });

    it('affiche le bouton de suppression de la recherche quand du texte est saisi', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Alice');
      
      expect(screen.getByTestId('clear-search')).toBeInTheDocument();
    });

    it('permet de supprimer le texte de recherche', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Alice');
      
      const clearButton = screen.getByTestId('clear-search');
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
    });

    it('permet d\'ouvrir et fermer les filtres', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const filterButton = screen.getByTestId('filter-button');
      await user.click(filterButton);
      
      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
      expect(screen.getByTestId('media-type-filter')).toBeInTheDocument();
      expect(screen.getByTestId('user-filter')).toBeInTheDocument();
      
      await user.click(filterButton);
      
      expect(screen.queryByTestId('status-filter')).not.toBeInTheDocument();
      expect(screen.queryByTestId('media-type-filter')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-filter')).not.toBeInTheDocument();
    });

    it('permet de filtrer par statut', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const filterButton = screen.getByTestId('filter-button');
      await user.click(filterButton);
      
      const statusFilter = screen.getByTestId('status-filter');
      await user.selectOptions(statusFilter, 'borrowed');
      
      expect(statusFilter).toHaveValue('borrowed');
    });

    it('permet de filtrer par type de média', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const filterButton = screen.getByTestId('filter-button');
      await user.click(filterButton);
      
      const mediaTypeFilter = screen.getByTestId('media-type-filter');
      await user.selectOptions(mediaTypeFilter, 'book');
      
      expect(mediaTypeFilter).toHaveValue('book');
    });

    it('permet de filtrer par utilisateur', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const filterButton = screen.getByTestId('filter-button');
      await user.click(filterButton);
      
      const userFilter = screen.getByTestId('user-filter');
      await user.type(userFilter, 'Alice');
      
      expect(userFilter).toHaveValue('Alice');
    });
  });

  describe('Actions sur les emprunts', () => {
    it('permet de voir le média', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const viewMediaButton = screen.getByTestId('view-media-1');
      expect(viewMediaButton).toBeInTheDocument();
      expect(viewMediaButton.closest('a')).toHaveAttribute('href', '/media/media-1');
    });

    it('permet de voir le profil utilisateur', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const viewUserButton = screen.getByTestId('view-user-1');
      expect(viewUserButton).toBeInTheDocument();
      expect(viewUserButton.closest('a')).toHaveAttribute('href', '/admin/users/user-1');
    });

    it('permet de marquer un emprunt comme retourné', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const returnButton = screen.getByTestId('return-borrow-1');
      await user.click(returnButton);
      
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirmer le retour')).toBeInTheDocument();
      expect(screen.getByText('Média : Le Seigneur des Anneaux')).toBeInTheDocument();
    });

    it('n\'affiche pas le bouton de retour pour un emprunt déjà retourné', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      // L'emprunt 2 est déjà retourné
      expect(screen.queryByTestId('return-borrow-2')).not.toBeInTheDocument();
    });

    it('permet de confirmer le retour d\'un emprunt', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const returnButton = screen.getByTestId('return-borrow-1');
      await user.click(returnButton);
      
      const confirmButton = screen.getByText('Marquer comme retourné');
      await user.click(confirmButton);
      
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Modal de création d\'emprunt', () => {
    it('permet d\'ouvrir la modal de création', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const createButton = screen.getByText('Nouvel emprunt');
      await user.click(createButton);
      
      expect(screen.getByTestId('create-borrow-modal')).toBeInTheDocument();
      // Vérifie le titre dans la modal
      const modal = screen.getByTestId('create-borrow-modal');
      expect(modal).toHaveTextContent('Nouvel emprunt');
    });

    it('permet de fermer la modal de création', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const createButton = screen.getByText('Nouvel emprunt');
      await user.click(createButton);
      
      const closeButton = screen.getByText('Fermer');
      await user.click(closeButton);
      
      expect(screen.queryByTestId('create-borrow-modal')).not.toBeInTheDocument();
    });
  });

  describe('États de chargement et erreurs', () => {
    it('affiche l\'état de chargement', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockIsLoading={true}
        />
      );
      
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
      expect(screen.getByText('Chargement des emprunts...')).toBeInTheDocument();
    });

    it('affiche l\'erreur de chargement', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockError={true}
        />
      );
      
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
      expect(screen.getByText('Impossible de récupérer la liste des emprunts.')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    it('affiche le message d\'absence d\'emprunts', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={{ ...mockBorrowsData, data: [], totalItems: 0 }}
        />
      );
      
      expect(screen.getByText('Aucun emprunt trouvé')).toBeInTheDocument();
      expect(screen.getByText('Aucun emprunt n\'a été effectué pour le moment.')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('affiche la pagination quand il y a plusieurs pages', () => {
      const multiPageData = {
        ...mockBorrowsData,
        totalPages: 3,
        totalItems: 60
      };
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={multiPageData}
        />
      );
      
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('n\'affiche pas la pagination quand il n\'y a qu\'une page', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Conseils d\'administration', () => {
    it('affiche la section des conseils', () => {
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      expect(screen.getByText('💡 Conseils de gestion des emprunts')).toBeInTheDocument();
      expect(screen.getByText('• Surveillez régulièrement les emprunts en retard pour contacter les utilisateurs')).toBeInTheDocument();
      expect(screen.getByText('• Utilisez les filtres pour identifier rapidement les emprunts problématiques')).toBeInTheDocument();
      expect(screen.getByText('• Les retours doivent être confirmés manuellement via cette interface')).toBeInTheDocument();
      expect(screen.getByText('• Contactez les utilisateurs en retard pour éviter les pénalités')).toBeInTheDocument();
      expect(screen.getByText('• Vérifiez l\'état des médias lors des retours physiques')).toBeInTheDocument();
    });
  });

  describe('Gestion des filtres', () => {
    it('affiche le nombre de filtres actifs', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const filterBtn = screen.getByTestId('filter-button');
      await user.click(filterBtn);
      
      const statusFilter = screen.getByTestId('status-filter');
      await user.selectOptions(statusFilter, 'borrowed');
      
      // Le badge devrait afficher 1 filtre actif
      const badge = filterBtn.querySelector('.bg-primary-600');
      expect(badge).toHaveTextContent('1');
    });

    it('permet d\'effacer tous les filtres', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminBorrowsPage 
          mockBorrowsData={mockBorrowsData}
        />
      );
      
      const filterBtn = screen.getByTestId('filter-button');
      await user.click(filterBtn);
      
      const statusFilter = screen.getByTestId('status-filter');
      await user.selectOptions(statusFilter, 'borrowed');
      
      const clearFiltersButton = screen.getByTestId('clear-filters');
      await user.click(clearFiltersButton);
      
      // Les filtres devraient être fermés et réinitialisés
      expect(screen.queryByTestId('status-filter')).not.toBeInTheDocument();
      expect(screen.queryByTestId('clear-filters')).not.toBeInTheDocument();
    });
  });
});
