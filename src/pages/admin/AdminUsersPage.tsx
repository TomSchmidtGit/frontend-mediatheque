// src/pages/admin/AdminUsersPage.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  UserPlusIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/common/Pagination';
import UserEditModal from '../../components/admin/UserEditModal';
import adminUserService from '../../services/adminUserService';
import type { User } from '../../types';
import type { UserFilters } from '../../services/adminUserService';
import { formatDate, formatters, cn } from '../../utils';
import toast from 'react-hot-toast';

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Query pour récupérer les utilisateurs
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminUserService.getUsers(filters),
    staleTime: 2 * 60 * 1000,
  });

  // Query pour les statistiques
  const { data: userStats } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: () => adminUserService.getUserStats(),
    staleTime: 5 * 60 * 1000,
  });

  // Mutation pour toggle le statut utilisateur
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, currentStatus }: { userId: string; currentStatus: boolean }) => 
      adminUserService.toggleUserStatus(userId, currentStatus),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      
      const user = usersData?.data.find(u => u._id === userId);
      toast.success(`Utilisateur ${user?.actif ? 'désactivé' : 'activé'} avec succès`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors du changement de statut';
      toast.error(message);
    }
  });

  // Gestion de la recherche avec debounce
  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: value || undefined,
        page: 1
      }));
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    if (confirm(
      `Êtes-vous sûr de vouloir ${user.actif ? 'désactiver' : 'activer'} l'utilisateur ${user.name} ?`
    )) {
      toggleStatusMutation.mutate({ userId: user._id, currentStatus: user.actif });
    }
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
    setSearchInput('');
    setShowFilters(false);
  };

  const hasActiveFilters = !!(filters.search || filters.role || filters.status);

  const getRoleInfo = (role: string) => {
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

  if (error) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 mb-6">
            Impossible de récupérer la liste des utilisateurs.
          </p>
          <button
            onClick={() => refetch()}
            className="btn-primary"
            disabled={isLoading}
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Gestion des utilisateurs
              </h1>
              <p className="text-gray-600 text-lg">
                Administrez les comptes utilisateurs de votre médiathèque
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <p className="text-gray-600">Dernière mise à jour</p>
                <div className="flex items-center font-medium text-gray-900">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {dataUpdatedAt ? formatDate.timeAgo(new Date(dataUpdatedAt)) : 'Jamais'}
                </div>
              </div>
              
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="btn-secondary"
                title="Actualiser les données"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        {userStats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactifs</p>
                  <p className="text-2xl font-bold text-red-600">{userStats.inactive}</p>
                </div>
                <XCircleIcon className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats.byRole.admin}</p>
                </div>
                <ShieldCheckIcon className="h-8 w-8 text-purple-500" />
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
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="input pl-10 w-full"
                  disabled={isLoading}
                />
                {searchInput && (
                  <button
                    onClick={() => handleSearchInputChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions et filtres */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'btn-secondary flex items-center',
                  hasActiveFilters && 'bg-primary-50 text-primary-700 border-primary-200'
                )}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
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
                {isLoading ? 'Chargement...' : (
                  <>
                    {usersData?.totalItems || 0} utilisateur{(usersData?.totalItems || 0) > 1 ? 's' : ''} trouvé{(usersData?.totalItems || 0) > 1 ? 's' : ''}
                  </>
                )}
              </h2>
              
              <div className="text-sm text-gray-500">
                Page {usersData?.currentPage || 1} sur {usersData?.totalPages || 1}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des utilisateurs...</p>
            </div>
          ) : usersData && usersData.data && usersData.data.length > 0 ? (
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
                    {usersData?.data?.map((user) => {
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
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              roleInfo.color
                            )}>
                              <ShieldCheckIcon className="w-3 h-3 mr-1" />
                              {roleInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              user.actif 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            )}>
                              {user.actif ? (
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircleIcon className="w-3 h-3 mr-1" />
                              )}
                              {user.actif ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate.short(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {Array.isArray(user.favorites) ? user.favorites.length : 0}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Modifier l'utilisateur"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              
                              <Link
                                to={`/admin/users/${user._id}`}
                                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Voir le profil"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Link>
                              
                              <button
                                onClick={() => handleToggleStatus(user)}
                                disabled={toggleStatusMutation.isPending}
                                className={cn(
                                  'p-2 rounded-lg transition-colors',
                                  user.actif
                                    ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                    : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                )}
                                title={user.actif ? 'Désactiver' : 'Activer'}
                              >
                                {user.actif ? (
                                  <XCircleIcon className="h-4 w-4" />
                                ) : (
                                  <CheckCircleIcon className="h-4 w-4" />
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

              {/* Cards mobile */}
              <div className="lg:hidden divide-y divide-gray-200">
                {usersData?.data?.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  
                  return (
                    <div key={user._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={cn(
                                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                roleInfo.color
                              )}>
                                <ShieldCheckIcon className="w-3 h-3 mr-1" />
                                {roleInfo.label}
                              </span>
                              
                              <span className={cn(
                                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                user.actif 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              )}>
                                {user.actif ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-1">
                              Inscrit le {formatDate.short(user.createdAt)} • {Array.isArray(user.favorites) ? user.favorites.length : 0} favoris
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={toggleStatusMutation.isPending}
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              user.actif
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            )}
                          >
                            {user.actif ? (
                              <XCircleIcon className="h-4 w-4" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {usersData && usersData?.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={usersData?.currentPage || 1}
                totalPages={usersData?.totalPages || 1}
                totalItems={usersData?.totalItems || 0}
                itemsPerPage={filters.limit || 20}
                onPageChange={handlePageChange}
                loading={isLoading}
              />
            </div>
          )}
        </div>

        {/* Conseils d'administration */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <UsersIcon className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
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
    </div>
  );
};

export default AdminUsersPage;