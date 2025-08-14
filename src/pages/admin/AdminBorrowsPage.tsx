// src/pages/admin/AdminBorrowsPage.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserIcon,
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Pagination from '../../components/common/Pagination';
import CreateBorrowModal from '../../components/admin/CreateBorrowModal';
import { adminBorrowService } from '../../services';
import type { Borrow } from '../../types';
import { formatDate, dateUtils, formatters, cn } from '../../utils';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/modals/ConfirmDialog';
import { MetaTagsComponent } from '../../components/common/MetaTags';
import { generateMetaTags } from '../../config/metaTags';

interface BorrowFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'borrowed' | 'returned' | 'overdue';
  user?: string;
  mediaType?: 'book' | 'movie' | 'music';
}

const AdminBorrowsPage: React.FC = () => {
  const metaTags = generateMetaTags('adminBorrows');
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [filters, setFilters] = useState<BorrowFilters>(() => ({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as any) || 'all',
    user: searchParams.get('user') || '',
    mediaType: (searchParams.get('mediaType') as any) || '',
  }));

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmBorrow, setConfirmBorrow] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Query pour récupérer les emprunts
  const {
    data: borrowsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-borrows', filters],
    queryFn: () => adminBorrowService.getBorrows(filters),
    staleTime: 2 * 60 * 1000,
  });

  // Mutation pour retourner un emprunt
  const returnBorrowMutation = useMutation({
    mutationFn: (borrowId: string) => adminBorrowService.returnBorrow(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrows'] });
      queryClient.invalidateQueries({ queryKey: ['admin-borrow-stats'] });
      toast.success('Emprunt retourné avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors du retour';
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

  const handleReturnBorrow = (borrowId: string, mediaTitle: string) => {
    setConfirmBorrow({ id: borrowId, title: mediaTitle });
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
    setSearchInput('');
    setShowFilters(false);
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.status !== 'all' ||
    filters.user ||
    filters.mediaType
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

  const getStatusInfo = (borrow: Borrow) => {
    if (borrow.status === 'returned') {
      return {
        status: 'returned',
        label: 'Retourné',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
      };
    }

    if (dateUtils.isOverdue(borrow.dueDate)) {
      return {
        status: 'overdue',
        label: 'En retard',
        color: 'bg-red-100 text-red-800',
        icon: ExclamationTriangleIcon,
      };
    }

    if (dateUtils.isDueSoon(borrow.dueDate)) {
      return {
        status: 'due-soon',
        label: 'À rendre bientôt',
        color: 'bg-orange-100 text-orange-800',
        icon: ClockIcon,
      };
    }

    return {
      status: 'borrowed',
      label: 'En cours',
      color: 'bg-blue-100 text-blue-800',
      icon: ClockIcon,
    };
  };

  // Générer des données factices si pas de données du serveur
  const generateMockData = () => {
    const mockBorrows: Borrow[] = Array.from({ length: 15 }, (_, index) => ({
      _id: `admin-borrow-${index + 1}`,
      user: {
        _id: `user-${index + 1}`,
        name: [
          'Alice Martin',
          'Bob Dupont',
          'Claire Bernard',
          'David Moreau',
          'Emma Leroy',
          'François Simon',
          'Gabrielle Dubois',
          'Henri Petit',
        ][index % 8],
        email: `user${index + 1}@example.com`,
        role: 'user' as const,
        favorites: [],
        actif: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      media: {
        _id: `media-${index + 1}`,
        title: [
          'Le Seigneur des Anneaux',
          'Inception',
          'Daft Punk - RAM',
          'Harry Potter',
          'The Dark Knight',
          'Pink Floyd - The Wall',
          'Naruto',
          'Interstellar',
          'One Piece',
          'The Beatles',
        ][index % 10],
        type: ['book', 'movie', 'music'][index % 3] as any,
        author: [
          'J.R.R. Tolkien',
          'Christopher Nolan',
          'Daft Punk',
          'J.K. Rowling',
          'Christopher Nolan',
          'Pink Floyd',
        ][index % 6],
        year: 2000 + (index % 24),
        available: index >= 8, // Les 8 premiers sont empruntés
        description: `Description du média ${index + 1}`,
        imageUrl: `https://picsum.photos/300/400?random=${index + 200}`,
        reviews: [],
        averageRating: Math.random() * 5,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      borrowDate: new Date(
        Date.now() - (index * 2 + 1) * 24 * 60 * 60 * 1000
      ).toISOString(),
      dueDate: new Date(
        Date.now() + (14 - index) * 24 * 60 * 60 * 1000
      ).toISOString(),
      returnDate:
        index >= 8
          ? new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      status:
        index >= 8 ? 'returned' : ((index < 2 ? 'overdue' : 'borrowed') as any),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Appliquer les filtres
    let filteredBorrows = mockBorrows;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredBorrows = filteredBorrows.filter(
        borrow =>
          borrow.user?.name?.toLowerCase().includes(searchTerm) ||
          borrow.media?.title?.toLowerCase().includes(searchTerm) ||
          borrow.media?.author?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'overdue') {
        filteredBorrows = filteredBorrows.filter(
          borrow =>
            dateUtils.isOverdue(borrow.dueDate) && borrow.status !== 'returned'
        );
      } else {
        filteredBorrows = filteredBorrows.filter(
          borrow => borrow.status === filters.status
        );
      }
    }

    if (filters.mediaType) {
      filteredBorrows = filteredBorrows.filter(
        borrow => borrow.media?.type === filters.mediaType
      );
    }

    const startIndex = ((filters.page || 1) - 1) * (filters.limit || 20);
    const endIndex = startIndex + (filters.limit || 20);

    return {
      data: filteredBorrows.slice(startIndex, endIndex),
      currentPage: filters.page || 1,
      totalPages: Math.ceil(filteredBorrows.length / (filters.limit || 20)),
      totalItems: filteredBorrows.length,
    };
  };

  const displayData = borrowsData || generateMockData();

  if (error) {
    return (
      <div className='page-container py-16'>
        <div className='text-center'>
          <ClockIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Erreur de chargement
          </h1>
          <p className='text-gray-600 mb-6'>
            Impossible de récupérer la liste des emprunts.
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
                  Gestion des emprunts
                </h1>
                <p className='text-gray-600 text-lg'>
                  Administrez tous les emprunts de la médiathèque
                </p>
              </div>

              <div className='flex items-center space-x-4'>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className='btn-primary'
                >
                  <PlusIcon className='h-4 w-4 mr-2' />
                  Nouvel emprunt
                </button>
              </div>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            <div className='bg-white rounded-xl border border-gray-200 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>En cours</p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {
                      displayData.data.filter(
                        (b: Borrow) => b.status === 'borrowed'
                      ).length
                    }
                  </p>
                </div>
                <ClockIcon className='h-8 w-8 text-blue-500' />
              </div>
            </div>

            <div className='bg-white rounded-xl border border-gray-200 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>En retard</p>
                  <p className='text-2xl font-bold text-red-600'>
                    {
                      displayData.data.filter(
                        (b: Borrow) =>
                          dateUtils.isOverdue(b.dueDate) &&
                          b.status !== 'returned'
                      ).length
                    }
                  </p>
                </div>
                <ExclamationTriangleIcon className='h-8 w-8 text-red-500' />
              </div>
            </div>

            <div className='bg-white rounded-xl border border-gray-200 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Retournés</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {
                      displayData.data.filter(
                        (b: Borrow) => b.status === 'returned'
                      ).length
                    }
                  </p>
                </div>
                <CheckCircleIcon className='h-8 w-8 text-green-500' />
              </div>
            </div>

            <div className='bg-white rounded-xl border border-gray-200 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Total</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {displayData.totalItems}
                  </p>
                </div>
                <BookOpenIcon className='h-8 w-8 text-gray-500' />
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className='bg-white rounded-xl border border-gray-200 p-6 mb-6'>
            <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0'>
              {/* Recherche */}
              <div className='flex-1 max-w-md'>
                <div className='relative'>
                  <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Rechercher par utilisateur, média...'
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
                          filters.status !== 'all',
                          filters.user,
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
            </div>

            {/* Filtres expandables */}
            {showFilters && (
              <div className='mt-6 pt-6 border-t border-gray-200'>
                <div className='grid md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Statut
                    </label>
                    <select
                      value={filters.status || 'all'}
                      onChange={e =>
                        handleFilterChange('status', e.target.value)
                      }
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

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Utilisateur spécifique
                    </label>
                    <input
                      type='text'
                      placeholder="Nom ou email de l'utilisateur"
                      value={filters.user || ''}
                      onChange={e => handleFilterChange('user', e.target.value)}
                      className='input w-full'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Liste des emprunts */}
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  {isLoading ? (
                    'Chargement...'
                  ) : (
                    <>
                      {displayData.totalItems || 0} emprunt
                      {(displayData.totalItems || 0) > 1 ? 's' : ''} trouvé
                      {(displayData.totalItems || 0) > 1 ? 's' : ''}
                    </>
                  )}
                </h2>

                <div className='text-sm text-gray-500'>
                  Page {displayData.currentPage || 1} sur{' '}
                  {displayData.totalPages || 1}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className='p-8 text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>Chargement des emprunts...</p>
              </div>
            ) : displayData.data.length > 0 ? (
              <div className='divide-y divide-gray-200'>
                {displayData.data.map((borrow: Borrow) => {
                  // Vérifications de sécurité
                  if (!borrow.media || !borrow.user) {
                    return (
                      <div
                        key={borrow._id}
                        className='p-6 hover:bg-gray-50 transition-colors'
                      >
                        <div className='text-center text-gray-500'>
                          Données d'emprunt incomplètes
                        </div>
                      </div>
                    );
                  }

                  const statusInfo = getStatusInfo(borrow);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={borrow._id}
                      className='p-4 hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4'>
                        {/* Image du média */}
                        <div className='w-full h-40 sm:w-16 sm:h-20 bg-gray-100 rounded-lg overflow-hidden'>
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
                          <div className='flex flex-col gap-3 sm:flex-row sm:items-start'>
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

                              <h3 className='font-semibold text-gray-900 mb-1 break-words'>
                                {borrow.media.title}
                              </h3>

                              <div className='flex items-center text-sm text-gray-600 mb-2 min-w-0'>
                                <UserIcon className='h-4 w-4 mr-1 flex-shrink-0' />
                                <span className='font-medium truncate'>
                                  {borrow.user.name}
                                </span>
                                <span className='mx-2 flex-shrink-0'>•</span>
                                <span className='truncate'>
                                  {borrow.media.author}
                                </span>
                                <span className='mx-2 flex-shrink-0'>•</span>
                                <span className='flex-shrink-0'>
                                  {borrow.media.year}
                                </span>
                              </div>

                              <div className='grid sm:grid-cols-3 gap-4 text-sm'>
                                <div>
                                  <span className='text-gray-500'>
                                    Emprunté le :
                                  </span>
                                  <div className='font-medium'>
                                    {formatDate.short(borrow.borrowDate)}
                                  </div>
                                </div>
                                <div>
                                  <span className='text-gray-500'>
                                    À rendre le :
                                  </span>
                                  <div
                                    className={cn(
                                      'font-medium',
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
                                  </div>
                                </div>
                                {borrow.returnDate && (
                                  <div>
                                    <span className='text-gray-500'>
                                      Retourné le :
                                    </span>
                                    <div className='font-medium text-green-600'>
                                      {formatDate.short(borrow.returnDate)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className='flex flex-wrap gap-2 mt-2 sm:mt-0 sm:flex-col sm:items-end sm:space-y-2 sm:gap-0 sm:ml-auto sm:pl-2'>
                              <Link
                                to={`/media/${borrow.media._id}`}
                                className='flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                              >
                                <EyeIcon className='h-4 w-4 mr-1' />
                                Voir média
                              </Link>

                              <Link
                                to={`/admin/users/${borrow.user._id}`}
                                className='flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors'
                              >
                                <UserIcon className='h-4 w-4 mr-1' />
                                Voir profil
                              </Link>

                              {borrow.status !== 'returned' && (
                                <button
                                  type='button'
                                  onClick={() =>
                                    handleReturnBorrow(
                                      borrow._id,
                                      borrow.media.title
                                    )
                                  }
                                  disabled={returnBorrowMutation.isPending}
                                  className='flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-300 rounded-md hover:bg-green-50 transition-colors disabled:opacity-50'
                                >
                                  <CheckCircleIcon className='h-4 w-4 mr-1' />
                                  {returnBorrowMutation.isPending
                                    ? 'Retour...'
                                    : 'Marquer retourné'}
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
              <div className='p-12 text-center'>
                <ClockIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Aucun emprunt trouvé
                </h3>
                <p className='text-gray-600 mb-6'>
                  {hasActiveFilters
                    ? 'Aucun emprunt ne correspond à vos critères de recherche.'
                    : "Aucun emprunt n'a été effectué pour le moment."}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className='btn-primary'>
                    Effacer les filtres
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {displayData.totalPages > 1 && (
              <div className='px-6 py-4 border-t border-gray-200'>
                <Pagination
                  currentPage={displayData.currentPage}
                  totalPages={displayData.totalPages}
                  totalItems={displayData.totalItems}
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
              <ClockIcon className='h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0' />
              <div>
                <h3 className='font-semibold text-blue-900 mb-2'>
                  💡 Conseils de gestion des emprunts
                </h3>
                <ul className='text-sm text-blue-800 space-y-1'>
                  <li>
                    • Surveillez régulièrement les emprunts en retard pour
                    contacter les utilisateurs
                  </li>
                  <li>
                    • Utilisez les filtres pour identifier rapidement les
                    emprunts problématiques
                  </li>
                  <li>
                    • Les retours doivent être confirmés manuellement via cette
                    interface
                  </li>
                  <li>
                    • Contactez les utilisateurs en retard pour éviter les
                    pénalités
                  </li>
                  <li>
                    • Vérifiez l'état des médias lors des retours physiques
                  </li>
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
          title='Confirmer le retour'
          description={confirmBorrow ? `Média : ${confirmBorrow.title}` : ''}
          confirmText='Marquer comme retourné'
          onClose={() => setConfirmBorrow(null)}
          onConfirm={() => {
            if (confirmBorrow) {
              returnBorrowMutation.mutate(confirmBorrow.id);
            }
          }}
        />
      </div>
    </>
  );
};

export default AdminBorrowsPage;
