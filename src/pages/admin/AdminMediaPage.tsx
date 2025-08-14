// src/pages/admin/AdminMediaPage.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Pagination from '../../components/common/Pagination';
import MediaFormModal from '../../components/admin/MediaFormModal';
import adminMediaService from '../../services/adminMediaService';
import type { Media } from '../../types';
import type { MediaFilters } from '../../services/adminMediaService';
import { formatters, cn } from '../../utils';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/modals/ConfirmDialog';
import { MetaTagsComponent } from '../../components/common/MetaTags';
import { generateMetaTags } from '../../config/metaTags';

const AdminMediaPage: React.FC = () => {
  const metaTags = generateMetaTags('adminMedia');
  const queryClient = useQueryClient();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [filters, setFilters] = useState<MediaFilters>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [confirmMedia, setConfirmMedia] = useState<Media | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Query pour récupérer les médias
  const {
    data: mediaData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-media', filters],
    queryFn: () => adminMediaService.getMedia(filters),
    staleTime: 2 * 60 * 1000,
  });

  // Query pour les statistiques
  const { data: mediaStats } = useQuery({
    queryKey: ['admin-media-stats'],
    queryFn: () => adminMediaService.getMediaStats(),
    staleTime: 5 * 60 * 1000,
  });

  // Query pour catégories et tags
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminMediaService.getCategories(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => adminMediaService.getTags(),
    staleTime: 30 * 60 * 1000,
  });

  // Mutation pour supprimer un média
  const deleteMediaMutation = useMutation({
    mutationFn: (mediaId: string) => adminMediaService.deleteMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      queryClient.invalidateQueries({ queryKey: ['admin-media-stats'] });
      toast.success('Média supprimé avec succès');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
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
        page: 1,
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

  const handleFilterChange = (key: keyof MediaFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === undefined ? undefined : value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateMedia = () => {
    setSelectedMedia(null);
    setIsFormModalOpen(true);
  };

  const handleEditMedia = (media: Media) => {
    setSelectedMedia(media);
    setIsFormModalOpen(true);
  };

  const handleDeleteMedia = (media: Media) => {
    setConfirmMedia(media);
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
    setSearchInput('');
    setShowFilters(false);
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.type ||
    filters.category ||
    filters.available !== undefined
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <BookOpenIcon className='h-4 w-4' />;
      case 'movie':
        return <FilmIcon className='h-4 w-4' />;
      case 'music':
        return <MusicalNoteIcon className='h-4 w-4' />;
      default:
        return <BookOpenIcon className='h-4 w-4' />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book':
        return 'bg-blue-100 text-blue-800';
      case 'movie':
        return 'bg-purple-100 text-purple-800';
      case 'music':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className='page-container py-16'>
        <div className='text-center'>
          <BookOpenIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Erreur de chargement
          </h1>
          <p className='text-gray-600 mb-6'>
            Impossible de récupérer la liste des médias.
          </p>
          <button
            onClick={() => refetch()}
            className='btn-primary'
            disabled={isLoading}
          >
            <ArrowPathIcon className='h-4 w-4 mr-2' />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTagsComponent metaTags={metaTags} />
      <div className='bg-gray-50 min-h-screen overflow-x-hidden'>
        <div className='page-container py-8'>
          {/* Header */}
          <div className='mb-8'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>
                  Gestion des médias
                </h1>
                <p className='text-gray-600 text-lg'>
                  Administrez la collection de médias de votre médiathèque
                </p>
              </div>

              <div className='flex items-center space-x-4'>
                <button onClick={handleCreateMedia} className='btn-primary'>
                  <PlusIcon className='h-4 w-4 mr-2' />
                  Ajouter un média
                </button>
              </div>
            </div>
          </div>

          {/* Statistiques rapides */}
          {mediaStats && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8'>
              <div className='bg-white rounded-xl border border-gray-200 p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Total</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {mediaStats.total}
                    </p>
                  </div>
                  <BookOpenIcon className='h-8 w-8 text-blue-500' />
                </div>
              </div>

              <div className='bg-white rounded-xl border border-gray-200 p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Disponibles
                    </p>
                    <p className='text-2xl font-bold text-green-600'>
                      {mediaStats.available}
                    </p>
                  </div>
                  <CheckCircleIcon className='h-8 w-8 text-green-500' />
                </div>
              </div>

              <div className='bg-white rounded-xl border border-gray-200 p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Empruntés
                    </p>
                    <p className='text-2xl font-bold text-red-600'>
                      {mediaStats.borrowed}
                    </p>
                  </div>
                  <XCircleIcon className='h-8 w-8 text-red-500' />
                </div>
              </div>

              <div className='bg-white rounded-xl border border-gray-200 p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Livres</p>
                    <p className='text-2xl font-bold text-blue-600'>
                      {mediaStats.byType.book}
                    </p>
                  </div>
                  <BookOpenIcon className='h-8 w-8 text-blue-500' />
                </div>
              </div>

              <div className='bg-white rounded-xl border border-gray-200 p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Films</p>
                    <p className='text-2xl font-bold text-purple-600'>
                      {mediaStats.byType.movie}
                    </p>
                  </div>
                  <FilmIcon className='h-8 w-8 text-purple-500' />
                </div>
              </div>

              <div className='bg-white rounded-xl border border-gray-200 p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Musiques
                    </p>
                    <p className='text-2xl font-bold text-green-600'>
                      {mediaStats.byType.music}
                    </p>
                  </div>
                  <MusicalNoteIcon className='h-8 w-8 text-green-500' />
                </div>
              </div>
            </div>
          )}

          {/* Barre de recherche et filtres */}
          <div className='bg-white rounded-xl border border-gray-200 p-6 mb-6'>
            <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0'>
              {/* Recherche */}
              <div className='flex-1 max-w-md'>
                <div className='relative'>
                  <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Rechercher par titre, auteur...'
                    value={searchInput}
                    onChange={e => handleSearchInputChange(e.target.value)}
                    className='input pl-10 w-full'
                    disabled={isLoading}
                  />
                  {searchInput && (
                    <button
                      onClick={() => handleSearchInputChange('')}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                      <XMarkIcon className='h-4 w-4' />
                    </button>
                  )}
                </div>
              </div>

              {/* Actions et filtres */}
              <div className='flex items-center space-x-4'>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'btn-secondary flex items-center',
                    hasActiveFilters &&
                      'bg-primary-50 text-primary-700 border-primary-200'
                  )}
                >
                  <FunnelIcon className='h-4 w-4 mr-2' />
                  Filtres
                  {hasActiveFilters && (
                    <span className='ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                      {
                        [
                          filters.type,
                          filters.category,
                          filters.available !== undefined,
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className='text-sm text-gray-600 hover:text-gray-900'
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            </div>

            {/* Filtres expandables */}
            {showFilters && (
              <div className='mt-6 pt-6 border-t border-gray-200'>
                <div className='grid md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Type
                    </label>
                    <select
                      value={filters.type || ''}
                      onChange={e => handleFilterChange('type', e.target.value)}
                      className='input w-full'
                    >
                      <option value=''>Tous les types</option>
                      <option value='book'>Livre</option>
                      <option value='movie'>Film</option>
                      <option value='music'>Musique</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Catégorie
                    </label>
                    <select
                      value={filters.category || ''}
                      onChange={e =>
                        handleFilterChange('category', e.target.value)
                      }
                      className='input w-full'
                    >
                      <option value=''>Toutes les catégories</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Disponibilité
                    </label>
                    <select
                      value={
                        filters.available !== undefined
                          ? filters.available.toString()
                          : ''
                      }
                      onChange={e => {
                        const value = e.target.value;
                        if (value === '') {
                          handleFilterChange('available', undefined);
                        } else {
                          const boolValue = value === 'true';
                          handleFilterChange('available', boolValue);
                        }
                      }}
                      className='input w-full'
                    >
                      <option value=''>Tous</option>
                      <option value='true'>Disponible</option>
                      <option value='false'>Emprunté</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  {isLoading ? (
                    'Chargement...'
                  ) : (
                    <>
                      {mediaData?.totalItems || 0} média
                      {(mediaData?.totalItems || 0) > 1 ? 's' : ''} trouvé
                      {(mediaData?.totalItems || 0) > 1 ? 's' : ''}
                    </>
                  )}
                </h2>

                <div className='text-sm text-gray-500'>
                  Page {mediaData?.currentPage || 1} sur{' '}
                  {mediaData?.totalPages || 1}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className='p-8 text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>Chargement des médias...</p>
              </div>
            ) : mediaData && mediaData.data && mediaData.data.length > 0 ? (
              <>
                {/* Table desktop */}
                <div className='hidden lg:block overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Média
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Type
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Auteur
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Année
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Statut
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Note
                        </th>
                        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {mediaData?.data?.map(media => (
                        <tr
                          key={media._id}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-6 py-4'>
                            <div className='flex items-center'>
                              <div className='flex-shrink-0 h-12 w-12'>
                                {media.imageUrl ? (
                                  <img
                                    src={media.imageUrl}
                                    alt={media.title}
                                    className='h-12 w-12 rounded-lg object-cover'
                                  />
                                ) : (
                                  <div className='h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center'>
                                    {getTypeIcon(media.type)}
                                  </div>
                                )}
                              </div>
                              <div className='ml-4 min-w-0'>
                                <div className='text-sm font-medium text-gray-900 truncate'>
                                  {media.title}
                                </div>
                                {media.category && (
                                  <div className='text-sm text-gray-500 truncate'>
                                    {media.category.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                getTypeColor(media.type)
                              )}
                            >
                              {getTypeIcon(media.type)}
                              <span className='ml-1'>
                                {formatters.mediaType(media.type)}
                              </span>
                            </span>
                          </td>
                          <td className='px-6 py-4 text-sm text-gray-900'>
                            {media.author}
                          </td>
                          <td className='px-6 py-4 text-sm text-gray-900'>
                            {media.year}
                          </td>
                          <td className='px-6 py-4'>
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                media.available
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              )}
                            >
                              {media.available ? (
                                <CheckCircleIcon className='w-3 h-3 mr-1' />
                              ) : (
                                <XCircleIcon className='w-3 h-3 mr-1' />
                              )}
                              {media.available ? 'Disponible' : 'Emprunté'}
                            </span>
                          </td>
                          <td className='px-6 py-4 text-sm text-gray-900'>
                            {media.averageRating > 0 ? (
                              <span className='flex items-center'>
                                <span className='text-yellow-400 mr-1'>★</span>
                                {media.averageRating.toFixed(1)}
                              </span>
                            ) : (
                              <span className='text-gray-400'>-</span>
                            )}
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <div className='flex items-center justify-end space-x-2'>
                              <button
                                type='button'
                                onClick={() => handleEditMedia(media)}
                                className='text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded-lg transition-colors'
                                title='Modifier le média'
                              >
                                <PencilIcon className='h-4 w-4' />
                              </button>

                              <Link
                                to={`/media/${media._id}`}
                                className='text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg transition-colors'
                                title='Voir le média'
                              >
                                <EyeIcon className='h-4 w-4' />
                              </Link>

                              <button
                                type='button'
                                onClick={() => handleDeleteMedia(media)}
                                disabled={deleteMediaMutation.isPending}
                                className='text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors'
                                title='Supprimer le média'
                              >
                                <TrashIcon className='h-4 w-4' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards mobile */}
                <div className='lg:hidden divide-y divide-gray-200'>
                  {mediaData?.data?.map(media => (
                    <div key={media._id} className='p-4'>
                      <div className='flex flex-col gap-3 sm:flex-row sm:items-start'>
                        <div className='w-full h-40 sm:w-16 sm:h-20'>
                          {media.imageUrl ? (
                            <img
                              src={media.imageUrl}
                              alt={media.title}
                              className='w-full h-full rounded-lg object-cover'
                            />
                          ) : (
                            <div className='w-full h-full rounded-lg bg-gray-100 flex items-center justify-center'>
                              {getTypeIcon(media.type)}
                            </div>
                          )}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                            <div className='min-w-0'>
                              <h3 className='font-medium text-gray-900 line-clamp-2'>
                                {media.title}
                              </h3>
                              <p className='text-sm text-gray-600 mt-1'>
                                {media.author} • {media.year}
                              </p>

                              <div className='flex items-center space-x-2 mt-2'>
                                <span
                                  className={cn(
                                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                    getTypeColor(media.type)
                                  )}
                                >
                                  {getTypeIcon(media.type)}
                                  <span className='ml-1'>
                                    {formatters.mediaType(media.type)}
                                  </span>
                                </span>

                                <span
                                  className={cn(
                                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                    media.available
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  )}
                                >
                                  {media.available ? 'Disponible' : 'Emprunté'}
                                </span>
                              </div>

                              {media.category && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Catégorie: {media.category.name}
                                </p>
                              )}

                              {media.averageRating > 0 && (
                                <div className='flex items-center mt-1'>
                                  <span className='text-yellow-400 text-sm mr-1'>
                                    ★
                                  </span>
                                  <span className='text-xs text-gray-600'>
                                    {media.averageRating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className='flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-auto'>
                              <button
                                onClick={() => handleEditMedia(media)}
                                className='text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded-lg transition-colors'
                              >
                                <PencilIcon className='h-4 w-4' />
                              </button>

                              <Link
                                to={`/media/${media._id}`}
                                className='text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg transition-colors'
                              >
                                <EyeIcon className='h-4 w-4' />
                              </Link>

                              <button
                                onClick={() => handleDeleteMedia(media)}
                                disabled={deleteMediaMutation.isPending}
                                className='text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors'
                              >
                                <TrashIcon className='h-4 w-4' />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className='p-12 text-center'>
                <BookOpenIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Aucun média trouvé
                </h3>
                <p className='text-gray-600 mb-6'>
                  {hasActiveFilters
                    ? 'Aucun média ne correspond à vos critères de recherche.'
                    : 'Commencez par ajouter votre premier média.'}
                </p>
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <button onClick={handleCreateMedia} className='btn-primary'>
                    <PlusIcon className='h-4 w-4 mr-2' />
                    Ajouter un média
                  </button>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className='btn-secondary'>
                      Effacer les filtres
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {mediaData && mediaData?.totalPages > 1 && (
              <div className='px-6 py-4 border-t border-gray-200'>
                <Pagination
                  currentPage={mediaData?.currentPage || 1}
                  totalPages={mediaData?.totalPages || 1}
                  totalItems={mediaData?.totalItems || 0}
                  itemsPerPage={filters.limit || 20}
                  onPageChange={handlePageChange}
                  loading={isLoading}
                />
              </div>
            )}
          </div>

          {/* Conseils d'administration */}
          <div className='mt-8 bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-lg p-6'>
            <div className='flex items-start'>
              <BookOpenIcon className='h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0' />
              <div>
                <h3 className='font-semibold text-blue-900 mb-2'>
                  💡 Conseils de gestion des médias
                </h3>
                <ul className='text-sm text-blue-800 space-y-1'>
                  <li>
                    • Veillez à bien remplir tous les champs lors de l'ajout
                    d'un média
                  </li>
                  <li>
                    • Utilisez des images de qualité pour améliorer l'expérience
                    utilisateur
                  </li>
                  <li>
                    • Assignez des catégories et tags pertinents pour faciliter
                    la recherche
                  </li>
                  <li>
                    • Surveillez les médias les plus empruntés pour ajuster
                    votre collection
                  </li>
                  <li>
                    • Mettez à jour régulièrement les informations des médias
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de formulaire */}
        <MediaFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedMedia(null);
          }}
          media={selectedMedia}
          categories={categories}
          tags={tags}
        />

        {/* Confirmation suppression média */}
        <ConfirmDialog
          isOpen={!!confirmMedia}
          title='Confirmer la suppression'
          description={confirmMedia ? `Média : ${confirmMedia.title}` : ''}
          confirmText='Supprimer'
          confirmVariant='danger'
          onClose={() => setConfirmMedia(null)}
          onConfirm={() => {
            if (confirmMedia) {
              deleteMediaMutation.mutate(confirmMedia._id);
            }
          }}
        />
      </div>
    </>
  );
};

export default AdminMediaPage;
