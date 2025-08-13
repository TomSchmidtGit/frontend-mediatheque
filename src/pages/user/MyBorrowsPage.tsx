// src/pages/user/MyBorrowsPage.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ClockIcon,
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
  CalendarIcon,
  // ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  UserIcon,
  EyeIcon,
  FunnelIcon,
  // XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import borrowService from '../../services/borrowService';
import { formatDate, dateUtils, formatters, cn } from '../../utils';
// import toast from 'react-hot-toast';
import type { Borrow } from '../../types';

interface BorrowFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'borrowed' | 'returned' | 'overdue';
  mediaType?: 'book' | 'movie' | 'music';
}

const MyBorrowsPage: React.FC = () => {
  const { user } = useAuth();
  // const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const limit = 12;

  const [filters, setFilters] = useState<BorrowFilters>(() => ({
    page: 1,
    limit: 12,
    search: '',
    status: 'all',
    mediaType: undefined,
  }));

  const {
    data: borrowsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-borrows', filters],
    queryFn: () => borrowService.getMyBorrows(filters),
    enabled: !!user,
    staleTime: 30 * 1000, // Cache 30 secondes
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

  const handleFilterChange = (key: keyof BorrowFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === undefined || value === '' ? undefined : value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      search: '',
      status: 'all',
      mediaType: undefined,
    });
    setSearchInput('');
    setShowFilters(false);
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.status !== 'all' ||
    filters.mediaType
  );

  // Utiliser les vraies données du serveur
  const displayData = borrowsData || {
    data: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <BookOpenIcon className='h-5 w-5' />;
      case 'movie':
        return <FilmIcon className='h-5 w-5' />;
      case 'music':
        return <MusicalNoteIcon className='h-5 w-5' />;
      default:
        return <BookOpenIcon className='h-5 w-5' />;
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

  const getStatusInfo = (borrow: Borrow) => {
    const isOverdue = dateUtils.isOverdue(borrow.dueDate);
    const isDueSoon = dateUtils.isDueSoon(borrow.dueDate);

    if (borrow.status === 'returned') {
      return {
        status: 'returned',
        label: 'Retourné',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
      };
    }

    if (isOverdue) {
      return {
        status: 'overdue',
        label: 'En retard',
        color: 'bg-red-100 text-red-800',
        icon: ExclamationTriangleIcon,
      };
    }

    if (isDueSoon) {
      return {
        status: 'due-soon',
        label: 'À rendre bientôt',
        color: 'bg-orange-100 text-orange-800',
        icon: ClockIcon,
      };
    }

    return {
      status: 'borrowed',
      label: 'Emprunté',
      color: 'bg-blue-100 text-blue-800',
      icon: ClockIcon,
    };
  };

  if (error) {
    return (
      <div className='page-container py-16'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Erreur de chargement
          </h1>
          <p className='text-gray-600 mb-4'>
            Impossible de charger vos emprunts.
          </p>
          <button onClick={() => refetch()} className='btn-primary'>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='page-container py-16'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Chargement de vos emprunts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='page-container py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <ClockIcon className='h-8 w-8 text-primary-600' />
            <h1 className='text-3xl lg:text-4xl font-bold text-gray-900'>
              Mes emprunts
            </h1>
          </div>
          <p className='text-gray-600 text-lg'>
            Gérez vos emprunts en cours et consultez votre historique
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white rounded-xl border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-blue-600'>
                  {displayData.data.filter(b => b.status === 'borrowed').length}
                </p>
                <p className='text-sm text-gray-600'>En cours</p>
              </div>
              <ClockIcon className='h-8 w-8 text-blue-500' />
            </div>
          </div>

          <div className='bg-white rounded-xl border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-red-600'>
                  {
                    displayData.data.filter(
                      b =>
                        dateUtils.isOverdue(b.dueDate) &&
                        b.status !== 'returned'
                    ).length
                  }
                </p>
                <p className='text-sm text-gray-600'>En retard</p>
              </div>
              <ExclamationTriangleIcon className='h-8 w-8 text-red-500' />
            </div>
          </div>

          <div className='bg-white rounded-xl border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-green-600'>
                  {displayData.data.filter(b => b.status === 'returned').length}
                </p>
                <p className='text-sm text-gray-600'>Retournés</p>
              </div>
              <CheckCircleIcon className='h-8 w-8 text-green-500' />
            </div>
          </div>

          <div className='bg-white rounded-xl border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {displayData.totalItems}
                </p>
                <p className='text-sm text-gray-600'>Total</p>
              </div>
              <BookOpenIcon className='h-8 w-8 text-gray-500' />
            </div>
          </div>
        </div>

        {/* Barre d'outils */}
        <div className='bg-white rounded-xl border border-gray-200 p-4 mb-6'>
          <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4'>
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
                          filters.search,
                          filters.status !== 'all',
                          filters.mediaType,
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

              <p className='text-sm text-gray-600'>
                {isLoading ? (
                  'Chargement...'
                ) : (
                  <>
                    <span className='font-medium'>
                      {displayData.totalItems}
                    </span>{' '}
                    emprunt{displayData.totalItems > 1 ? 's' : ''} trouvé
                    {displayData.totalItems > 1 ? 's' : ''}
                    {hasActiveFilters && (
                      <span className='text-primary-600 ml-2'>(filtré)</span>
                    )}
                  </>
                )}
              </p>
            </div>

            <div className='flex items-center space-x-2'>
              <span className='text-sm text-gray-600'>Affichage :</span>
              <div className='flex rounded-md border border-gray-300 overflow-hidden'>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 text-sm font-medium transition-colors',
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <ListBulletIcon className='h-4 w-4' />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 text-sm font-medium transition-colors border-l border-gray-300',
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Squares2X2Icon className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>

          {/* Filtres expandables */}
          {showFilters && (
            <div className='mt-6 pt-6 border-t border-gray-200'>
              <div className='grid md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Recherche
                  </label>
                  <input
                    type='text'
                    placeholder='Titre ou auteur du média...'
                    value={searchInput}
                    onChange={e => handleSearchInputChange(e.target.value)}
                    className='input w-full'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Statut
                  </label>
                  <select
                    value={filters.status || 'all'}
                    onChange={e => handleFilterChange('status', e.target.value)}
                    className='input w-full'
                  >
                    <option value='all'>Tous les statuts</option>
                    <option value='borrowed'>En cours</option>
                    <option value='overdue'>En retard</option>
                    <option value='returned'>Retournés</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Type de média
                  </label>
                  <select
                    value={filters.mediaType || ''}
                    onChange={e =>
                      handleFilterChange('mediaType', e.target.value)
                    }
                    className='input w-full'
                  >
                    <option value=''>Tous les types</option>
                    <option value='book'>Livre</option>
                    <option value='movie'>Film</option>
                    <option value='music'>Musique</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des emprunts */}
        {displayData.data.length > 0 ? (
          <>
            {viewMode === 'list' ? (
              <div className='bg-white rounded-xl border border-gray-200 overflow-hidden mb-8'>
                <div className='divide-y divide-gray-200'>
                  {displayData.data.map(borrow => {
                    const statusInfo = getStatusInfo(borrow);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div
                        key={borrow._id}
                        className='p-6 hover:bg-gray-50 transition-colors'
                      >
                        <div className='flex items-start space-x-4'>
                          {/* Image du média */}
                          <div className='flex-shrink-0 w-16 h-20 bg-gray-100 rounded-lg overflow-hidden'>
                            {borrow.media.imageUrl ? (
                              <img
                                src={borrow.media.imageUrl}
                                alt={borrow.media.title}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center'>
                                {getTypeIcon(borrow.media.type)}
                              </div>
                            )}
                          </div>

                          <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between'>
                              <div className='flex-1'>
                                <div className='flex items-center space-x-2 mb-2'>
                                  <span
                                    className={cn(
                                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                      getTypeColor(borrow.media.type)
                                    )}
                                  >
                                    {getTypeIcon(borrow.media.type)}
                                    <span className='ml-1'>
                                      {formatters.mediaType(borrow.media.type)}
                                    </span>
                                  </span>

                                  <span
                                    className={cn(
                                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                      statusInfo.color
                                    )}
                                  >
                                    <StatusIcon className='h-3 w-3 mr-1' />
                                    {statusInfo.label}
                                  </span>
                                </div>

                                <h3 className='font-semibold text-gray-900 mb-1'>
                                  {borrow.media.title}
                                </h3>

                                <div className='flex items-center text-sm text-gray-600 mb-2'>
                                  <UserIcon className='h-4 w-4 mr-1' />
                                  <span>{borrow.media.author}</span>
                                  <span className='mx-2'>•</span>
                                  <CalendarIcon className='h-4 w-4 mr-1' />
                                  <span>{borrow.media.year}</span>
                                </div>

                                <div className='grid sm:grid-cols-2 gap-4 text-sm'>
                                  <div>
                                    <span className='text-gray-500'>
                                      Emprunté le :
                                    </span>
                                    <span className='ml-2 font-medium'>
                                      {formatDate.short(borrow.borrowDate)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className='text-gray-500'>
                                      À rendre le :
                                    </span>
                                    <span
                                      className={cn(
                                        'ml-2 font-medium',
                                        dateUtils.isOverdue(borrow.dueDate) &&
                                          borrow.status !== 'returned'
                                          ? 'text-red-600'
                                          : dateUtils.isDueSoon(
                                                borrow.dueDate
                                              ) && borrow.status !== 'returned'
                                            ? 'text-orange-600'
                                            : ''
                                      )}
                                    >
                                      {formatDate.short(borrow.dueDate)}
                                    </span>
                                  </div>
                                  {borrow.returnDate && (
                                    <div>
                                      <span className='text-gray-500'>
                                        Retourné le :
                                      </span>
                                      <span className='ml-2 font-medium text-green-600'>
                                        {formatDate.short(borrow.returnDate)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className='flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-4'>
                                <Link
                                  to={`/media/${borrow.media._id}`}
                                  className='flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                                >
                                  <EyeIcon className='h-4 w-4 mr-1' />
                                  Voir détail
                                </Link>

                                {/* Info sur la gestion en présentiel */}
                                {borrow.status !== 'returned' && (
                                  <div className='text-xs text-gray-500 italic text-center px-2'>
                                    Retour et prolongation en présentiel
                                    uniquement
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
                {displayData.data.map(borrow => {
                  const statusInfo = getStatusInfo(borrow);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={borrow._id}
                      className='bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'
                    >
                      {/* Image du média */}
                      <div className='aspect-[3/4] bg-gray-100 overflow-hidden'>
                        {borrow.media.imageUrl ? (
                          <img
                            src={borrow.media.imageUrl}
                            alt={borrow.media.title}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            {getTypeIcon(borrow.media.type)}
                          </div>
                        )}
                      </div>

                      <div className='p-4'>
                        {/* Badges */}
                        <div className='flex items-center space-x-2 mb-3'>
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                              getTypeColor(borrow.media.type)
                            )}
                          >
                            {getTypeIcon(borrow.media.type)}
                            <span className='ml-1'>
                              {formatters.mediaType(borrow.media.type)}
                            </span>
                          </span>

                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                              statusInfo.color
                            )}
                          >
                            <StatusIcon className='h-3 w-3 mr-1' />
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Titre et auteur */}
                        <h3 className='font-semibold text-gray-900 mb-1 line-clamp-2'>
                          {borrow.media.title}
                        </h3>

                        <div className='flex items-center text-sm text-gray-600 mb-3'>
                          <UserIcon className='h-4 w-4 mr-1' />
                          <span className='truncate'>
                            {borrow.media.author}
                          </span>
                        </div>

                        {/* Dates */}
                        <div className='space-y-2 text-sm mb-4'>
                          <div>
                            <span className='text-gray-500'>Emprunté :</span>
                            <span className='ml-2 font-medium'>
                              {formatDate.short(borrow.borrowDate)}
                            </span>
                          </div>
                          <div>
                            <span className='text-gray-500'>À rendre :</span>
                            <span
                              className={cn(
                                'ml-2 font-medium',
                                dateUtils.isOverdue(borrow.dueDate) &&
                                  borrow.status !== 'returned'
                                  ? 'text-red-600'
                                  : dateUtils.isDueSoon(borrow.dueDate) &&
                                      borrow.status !== 'returned'
                                    ? 'text-orange-600'
                                    : ''
                              )}
                            >
                              {formatDate.short(borrow.dueDate)}
                            </span>
                          </div>
                          {borrow.returnDate && (
                            <div>
                              <span className='text-gray-500'>Retourné :</span>
                              <span className='ml-2 font-medium text-green-600'>
                                {formatDate.short(borrow.returnDate)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='flex flex-col space-y-2'>
                          <Link
                            to={`/media/${borrow.media._id}`}
                            className='w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                          >
                            <EyeIcon className='h-4 w-4 mr-1' />
                            Voir le détail
                          </Link>

                          {/* Info sur la gestion en présentiel */}
                          {borrow.status !== 'returned' && (
                            <div className='text-xs text-gray-500 italic text-center px-2'>
                              Retour et prolongation en présentiel uniquement
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {displayData.totalPages > 1 && (
              <Pagination
                currentPage={displayData.currentPage}
                totalPages={displayData.totalPages}
                totalItems={displayData.totalItems}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                loading={false}
              />
            )}
          </>
        ) : (
          <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
            <ClockIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              {!hasActiveFilters ? 'Aucun emprunt' : 'Aucun emprunt trouvé'}
            </h3>
            <p className='text-gray-600 mb-6'>
              {!hasActiveFilters
                ? "Vous n'avez encore effectué aucun emprunt. Commencez à explorer notre catalogue !"
                : 'Aucun emprunt ne correspond aux filtres appliqués.'}
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link to='/catalog' className='btn-primary'>
                Explorer le catalogue
              </Link>
              {hasActiveFilters && (
                <button onClick={clearFilters} className='btn-secondary'>
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conseils */}
        <div className='mt-8 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6'>
          <div className='flex items-start'>
            <ClockIcon className='h-6 w-6 text-primary-600 mr-3 mt-0.5 flex-shrink-0' />
            <div>
              <h3 className='font-semibold text-primary-900 mb-2'>
                ℹ️ Informations importantes
              </h3>
              <ul className='text-sm text-primary-800 space-y-1'>
                <li>
                  • Les emprunts et retours se font uniquement en présentiel à
                  la médiathèque
                </li>
                <li>• La durée standard d'emprunt est de 14 jours</li>
                <li>
                  • Vous pouvez demander une prolongation sur place si aucune
                  réservation n'est en attente
                </li>
                <li>
                  • Vous recevrez des rappels par email 2 jours avant l'échéance
                </li>
                <li>
                  • Cette page vous permet de consulter l'état de vos emprunts
                  en temps réel
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBorrowsPage;
