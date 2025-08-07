// src/pages/user/FavoritesPage.tsx - VERSION CORRIGÉE
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HeartIcon,
  SparklesIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import MediaCard from '../../components/catalog/MediaCard';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import mediaService from '../../services/mediaService';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const FavoritesPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const limit = 12;

  // ✅ Requête corrigée pour utiliser la méthode spécialisée getFavorites
  const {
    data: favoritesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['favorites', currentPage],
    queryFn: () => mediaService.getFavorites(currentPage, limit),
    enabled: !!user,
    staleTime: 0, // ✅ Pas de cache pour les favoris
  });

  // ✅ Mutation améliorée avec invalidation du cache
  const removeFavoriteMutation = useMutation({
    mutationFn: (mediaId: string) => mediaService.toggleFavorite(mediaId),
    onMutate: async (mediaId: string) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      
      // Mise à jour optimiste du contexte utilisateur
      if (user?.favorites) {
        const updatedFavorites = user.favorites.filter(id => id !== mediaId);
        updateUser({ favorites: updatedFavorites });
      }
      
      // Retirer de la sélection si présent
      setSelectedItems(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(mediaId);
        setShowBulkActions(newSelection.size > 0);
        return newSelection;
      });
    },
    onSuccess: () => {
      // ✅ Invalider tous les caches liés aux favoris et médias
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Retiré des favoris');
    },
    onError: (error, mediaId) => {
      // Rollback en cas d'erreur
      if (user?.favorites) {
        const restoredFavorites = [...user.favorites, mediaId];
        updateUser({ favorites: restoredFavorites });
      }
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  });

  // ✅ Mutation pour suppression groupée avec invalidation
  const removeBulkFavoritesMutation = useMutation({
    mutationFn: async (mediaIds: string[]) => {
      const promises = mediaIds.map(id => mediaService.toggleFavorite(id));
      await Promise.all(promises);
    },
    onMutate: async (mediaIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      
      // Mise à jour optimiste
      if (user?.favorites) {
        const updatedFavorites = user.favorites.filter(id => !mediaIds.includes(id));
        updateUser({ favorites: updatedFavorites });
      }
      
      setSelectedItems(new Set());
      setShowBulkActions(false);
    },
    onSuccess: () => {
      // ✅ Invalidation complète des caches
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Favoris supprimés');
    },
    onError: (error, mediaIds) => {
      // Rollback
      if (user?.favorites) {
        const restoredFavorites = [...user.favorites, ...mediaIds];
        updateUser({ favorites: restoredFavorites });
      }
      console.error('Erreur lors de la suppression groupée:', error);
      toast.error('Erreur lors de la suppression');
    }
  });

  // Gestion des sélections multiples
  const handleSelectItem = (mediaId: string, selected: boolean) => {
    const newSelection = new Set(selectedItems);
    if (selected) {
      newSelection.add(mediaId);
    } else {
      newSelection.delete(mediaId);
    }
    setSelectedItems(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const handleSelectAll = () => {
    if (!favoritesData?.data) return;
    
    if (selectedItems.size === favoritesData.data.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(favoritesData.data.map(media => media._id));
      setSelectedItems(allIds);
      setShowBulkActions(true);
    }
  };

  // ✅ Gestion améliorée du toggle favoris avec invalidation
  const handleToggleFavorite = async (mediaId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      // L'utilisateur retire des favoris
      await removeFavoriteMutation.mutateAsync(mediaId);
    }
  };

  // Gestion des actions groupées
  const handleBulkRemove = () => {
    if (selectedItems.size > 0) {
      removeBulkFavoritesMutation.mutate(Array.from(selectedItems));
    }
  };

  if (error) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">Impossible de charger vos favoris.</p>
          <button onClick={() => refetch()} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  // Si pas de données ou pas de favoris
  if (!favoritesData || favoritesData.data.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="page-container py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <HeartIcon className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Mes favoris
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Retrouvez tous les médias que vous avez ajoutés à vos favoris
            </p>
          </div>

          {/* État vide */}
          <div className="text-center py-20">
            <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-medium text-gray-900 mb-4">
              Aucun favori pour le moment
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Commencez à explorer notre catalogue et ajoutez vos médias préférés 
              en cliquant sur le cœur. Ils apparaîtront ici !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog" className="btn-primary">
                <SparklesIcon className="h-4 w-4 mr-2" />
                Explorer le catalogue
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <HeartIcon className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Mes favoris
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Retrouvez tous les médias que vous avez ajoutés à vos favoris
          </p>
        </div>

        {/* Barre d'outils */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            {/* Compteur et sélections */}
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{favoritesData.totalItems}</span>
                {' '}favori{favoritesData.totalItems > 1 ? 's' : ''}
              </p>
              
              {/* Actions de sélection */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedItems.size === favoritesData.data.length && favoritesData.data.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">
                  Tout sélectionner
                </label>
              </div>

              {selectedItems.size > 0 && (
                <span className="text-sm text-primary-600 font-medium">
                  {selectedItems.size} sélectionné{selectedItems.size > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Actions et vue */}
            <div className="flex items-center space-x-4">
              {/* Actions groupées */}
              {showBulkActions && (
                <button
                  onClick={handleBulkRemove}
                  disabled={removeBulkFavoritesMutation.isPending}
                  className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  {removeBulkFavoritesMutation.isPending ? 'Suppression...' : 'Retirer la sélection'}
                </button>
              )}

              {/* Mode d'affichage */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Affichage :</span>
                <div className="flex rounded-md border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 text-sm font-medium transition-colors',
                      viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 text-sm font-medium transition-colors border-l border-gray-300',
                      viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des médias */}
        <div className={cn(
          'grid gap-6 mb-8',
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        )}>
          {favoritesData.data.map((media) => (
            <div key={media._id} className="relative">
              {/* Checkbox de sélection */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.has(media._id)}
                  onChange={(e) => handleSelectItem(media._id, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-white rounded shadow-sm bg-white/90 backdrop-blur-sm"
                />
              </div>
              
              <MediaCard
                media={media}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {favoritesData.totalPages > 1 && (
          <Pagination
            currentPage={favoritesData.currentPage}
            totalPages={favoritesData.totalPages}
            totalItems={favoritesData.totalItems}
            itemsPerPage={limit}
            onPageChange={setCurrentPage}
            loading={false}
          />
        )}

        {/* Message informatif */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <SparklesIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium mb-1">💡 Conseil :</p>
              <p className="text-blue-700">
                Vos favoris sont synchronisés sur tous vos appareils. 
                N'hésitez pas à ajouter tous les médias qui vous intéressent !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;