// src/pages/admin/AdminUserDetailPage.tsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  PencilIcon,
  ShieldCheckIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  BookOpenIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import UserEditModal from '../../components/admin/UserEditModal';
import adminUserService from '../../services/adminUserService';
import { formatDate, formatters, cn } from '../../utils';
import type { User } from '../../types';
import toast from 'react-hot-toast';

const AdminUserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Query pour récupérer l'utilisateur
  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminUserService.getUserById(userId!),
    enabled: !!userId,
  });

  // Query pour récupérer les emprunts de l'utilisateur
  const {
    data: userBorrows,
    isLoading: borrowsLoading
  } = useQuery({
    queryKey: ['admin-user-borrows', userId],
    queryFn: () => adminUserService.getUserBorrows(userId!, 1, 10),
    enabled: !!userId,
  });

  // Mutation pour toggle le statut
  const toggleStatusMutation = useMutation({
    mutationFn: () => adminUserService.toggleUserStatus(userId!, user!.actif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(`Utilisateur ${user?.actif ? 'désactivé' : 'activé'} avec succès`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors du changement de statut';
      toast.error(message);
    }
  });

  const handleToggleStatus = () => {
    if (!user) return;
    
    if (confirm(
      `Êtes-vous sûr de vouloir ${user.actif ? 'désactiver' : 'activer'} l'utilisateur ${user.name} ?`
    )) {
      toggleStatusMutation.mutate();
    }
  };

  const getRoleInfo = (role: string) => {
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

  if (error) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Utilisateur non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            L'utilisateur que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link to="/admin/users" className="btn-primary">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil utilisateur...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleInfo = getRoleInfo(user.role);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="page-container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/admin/users"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour à la gestion des utilisateurs
          </Link>
        </div>

        {/* Header du profil */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      roleInfo.bgColor,
                      roleInfo.color
                    )}>
                      <ShieldCheckIcon className="w-4 h-4 mr-1" />
                      {roleInfo.label}
                    </span>
                    
                    <span className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      user.actif 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    )}>
                      {user.actif ? (
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 mr-1" />
                      )}
                      {user.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn-secondary flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Modifier
                </button>
                
                <button
                  onClick={handleToggleStatus}
                  disabled={toggleStatusMutation.isPending}
                  className={cn(
                    'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    user.actif
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  )}
                >
                  {toggleStatusMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  ) : user.actif ? (
                    <XCircleIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                  )}
                  {user.actif ? 'Désactiver' : 'Activer'}
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
                    <span className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      roleInfo.bgColor,
                      roleInfo.color
                    )}>
                      <ShieldCheckIcon className="w-4 h-4 mr-1" />
                      {roleInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{roleInfo.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <div className="mt-1">
                    <span className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      user.actif 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    )}>
                      {user.actif ? (
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 mr-1" />
                      )}
                      {user.actif ? 'Compte actif' : 'Compte désactivé'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Inscription</label>
                  <div className="mt-1 flex items-center text-sm text-gray-900">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {formatDate.long(user.createdAt)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Dernière modification</label>
                  <div className="mt-1 flex items-center text-sm text-gray-900">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {formatDate.timeAgo(user.updatedAt)}
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
                  <HeartIcon className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {Array.isArray(user.favorites) ? user.favorites.length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Favoris</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {userBorrows?.data?.filter((b: any) => b.status === 'borrowed').length || 0}
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
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Emprunts récents
                  </h3>
                  
                  <Link
                    to={`/admin/borrows?user=${userId}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Voir tous les emprunts
                  </Link>
                </div>
              </div>

              <div className="p-0">
                {borrowsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des emprunts...</p>
                  </div>
                ) : userBorrows && userBorrows.data && userBorrows.data.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {userBorrows.data.map((borrow: any) => (
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
                                  <BookOpenIcon className="h-6 w-6 text-gray-400" />
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
                                <span>Emprunté le {formatDate.short(borrow.borrowDate)}</span>
                                <span>À rendre le {formatDate.short(borrow.dueDate)}</span>
                                {borrow.returnDate && (
                                  <span className="text-green-600">
                                    Retourné le {formatDate.short(borrow.returnDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <span className={cn(
                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                              borrow.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                              borrow.status === 'returned' ? 'bg-green-100 text-green-800' :
                              borrow.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {formatters.borrowStatus(borrow.status)}
                            </span>
                            
                            <span className={cn(
                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                              borrow.media.type === 'book' ? 'bg-blue-100 text-blue-800' :
                              borrow.media.type === 'movie' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            )}>
                              {formatters.mediaType(borrow.media.type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun emprunt enregistré</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Cet utilisateur n'a encore effectué aucun emprunt
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Favoris de l'utilisateur */}
            {Array.isArray(user.favorites) && user.favorites.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <HeartIcon className="h-5 w-5 mr-2" />
                    Favoris ({user.favorites.length})
                  </h3>
                </div>
                
                <div className="p-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.favorites.slice(0, 6).map((favorite, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                        <HeartIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {typeof favorite === 'object' && 'title' in favorite ? (favorite as any).title : 'Média favori'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {typeof favorite === 'object' && 'author' in favorite ? (favorite as any).author : `ID: ${favorite}`}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {user.favorites.length > 6 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">
                        Et {user.favorites.length - 6} autres favoris...
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
            <UserCircleIcon className="h-6 w-6 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary-900 mb-2">
                Actions administrateur
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center p-3 bg-white rounded-lg border border-primary-200 text-left hover:bg-primary-50 transition-colors"
                >
                  <PencilIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <div className="font-medium text-primary-900">Modifier le profil</div>
                    <div className="text-sm text-primary-700">Nom, email, rôle</div>
                  </div>
                </button>
                
                <Link
                  to={`/admin/borrows?user=${userId}`}
                  className="flex items-center p-3 bg-white rounded-lg border border-primary-200 text-left hover:bg-primary-50 transition-colors"
                >
                  <ClockIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <div className="font-medium text-primary-900">Voir tous les emprunts</div>
                    <div className="text-sm text-primary-700">Historique complet</div>
                  </div>
                </Link>
                
                <button
                  onClick={handleToggleStatus}
                  className="flex items-center p-3 bg-white rounded-lg border border-primary-200 text-left hover:bg-primary-50 transition-colors"
                >
                  {user.actif ? (
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-3" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                  )}
                  <div>
                    <div className={cn(
                      'font-medium',
                      user.actif ? 'text-red-900' : 'text-green-900'
                    )}>
                      {user.actif ? 'Désactiver le compte' : 'Réactiver le compte'}
                    </div>
                    <div className={cn(
                      'text-sm',
                      user.actif ? 'text-red-700' : 'text-green-700'
                    )}>
                      {user.actif ? 'Bloquer l\'accès' : 'Restaurer l\'accès'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default AdminUserDetailPage;