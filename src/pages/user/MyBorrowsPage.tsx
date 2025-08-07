// src/pages/user/MyBorrowsPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ClockIcon,
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
  CalendarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import borrowService from '../../services/borrowService';
import { formatDate, dateUtils, formatters, cn } from '../../utils';
import toast from 'react-hot-toast';
import type { Borrow } from '../../types';

const MyBorrowsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const limit = 12;

  const {
    data: borrowsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['my-borrows', currentPage, statusFilter],
    queryFn: () => borrowService.getMyBorrows(currentPage, limit),
    enabled: !!user,
    staleTime: 30 * 1000, // Cache 30 secondes
  });

  // Mutation pour retourner un livre - DÉSACTIVÉE (géré en présentiel)
  // const returnBorrowMutation = useMutation({
  //   mutationFn: (borrowId: string) => borrowService.returnBorrow(borrowId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['my-borrows'] });
  //     toast.success('Média retourné avec succès');
  //   },
  //   onError: (error: any) => {
  //     console.error('Erreur lors du retour:', error);
  //     toast.error('Erreur lors du retour du média');
  //   }
  // });

  // Mutation pour prolonger un emprunt - DÉSACTIVÉE (géré en présentiel)
  // const extendBorrowMutation = useMutation({
  //   mutationFn: (borrowId: string) => borrowService.extendBorrow(borrowId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['my-borrows'] });
  //     toast.success('Emprunt prolongé avec succès');
  //   },
  //   onError: (error: any) => {
  //     console.error('Erreur lors de la prolongation:', error);
  //     toast.error('Erreur lors de la prolongation');
  //   }
  // });

  // Générer des données factices pour la démo
  const generateMockData = () => {
    const mockBorrows: Borrow[] = Array.from({ length: 8 }, (_, index) => ({
      _id: `borrow-${index + 1}`,
      user: {
        _id: user?._id || 'user1',
        name: user?.name || 'Utilisateur',
        email: user?.email || 'user@example.com',
        role: 'user' as const,
        favorites: [],
        actif: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      media: {
        _id: `media-${index + 1}`,
        title: [
          'Le Seigneur des Anneaux - La Communauté',
          'Inception',
          'Daft Punk - Random Access Memories',
          'Harry Potter à l\'école des sorciers',
          'The Dark Knight',
          'Pink Floyd - The Wall',
          'Naruto - Tome 1',
          'Interstellar'
        ][index] || `Média ${index + 1}`,
        type: ['book', 'movie', 'music'][index % 3] as any,
        author: [
          'J.R.R. Tolkien',
          'Christopher Nolan',
          'Daft Punk',
          'J.K. Rowling',
          'Christopher Nolan',
          'Pink Floyd',
          'Masashi Kishimoto',
          'Christopher Nolan'
        ][index] || `Auteur ${index + 1}`,
        year: 2000 + (index % 24),
        available: index >= 3, // Les 3 premiers sont empruntés
        description: `Description du média ${index + 1}`,
        imageUrl: `https://picsum.photos/300/400?random=${index + 100}`,
        reviews: [],
        averageRating: Math.random() * 5,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      borrowDate: new Date(Date.now() - (index * 3 + 1) * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + (14 - index * 2) * 24 * 60 * 60 * 1000).toISOString(),
      returnDate: index >= 3 ? new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString() : undefined,
      status: index >= 3 ? 'returned' : (index === 0 ? 'overdue' : 'borrowed') as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Filtrer par statut si nécessaire
    let filteredBorrows = mockBorrows;
    if (statusFilter !== 'all') {
      filteredBorrows = mockBorrows.filter(borrow => borrow.status === statusFilter);
    }

    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: filteredBorrows.slice(startIndex, endIndex),
      currentPage,
      totalPages: Math.ceil(filteredBorrows.length / limit),
      totalItems: filteredBorrows.length
    };
  };

  const displayData = borrowsData || generateMockData();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpenIcon className="h-5 w-5" />;
      case 'movie': return <FilmIcon className="h-5 w-5" />;
      case 'music': return <MusicalNoteIcon className="h-5 w-5" />;
      default: return <BookOpenIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'bg-blue-100 text-blue-800';
      case 'movie': return 'bg-purple-100 text-purple-800';
      case 'music': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
        icon: CheckCircleIcon
      };
    }

    if (isOverdue) {
      return {
        status: 'overdue',
        label: 'En retard',
        color: 'bg-red-100 text-red-800',
        icon: ExclamationTriangleIcon
      };
    }

    if (isDueSoon) {
      return {
        status: 'due-soon',
        label: 'À rendre bientôt',
        color: 'bg-orange-100 text-orange-800',
        icon: ClockIcon
      };
    }

    return {
      status: 'borrowed',
      label: 'Emprunté',
      color: 'bg-blue-100 text-blue-800',
      icon: ClockIcon
    };
  };

  // Actions désactivées - gestion en présentiel uniquement
  // const handleReturn = (borrowId: string) => {
  //   if (confirm('Êtes-vous sûr de vouloir retourner ce média ?')) {
  //     returnBorrowMutation.mutate(borrowId);
  //   }
  // };

  // const handleExtend = (borrowId: string) => {
  //   if (confirm('Voulez-vous prolonger cet emprunt de 14 jours ?')) {
  //     extendBorrowMutation.mutate(borrowId);
  //   }
  // };

  const statusOptions = [
    { value: 'all', label: 'Tous les emprunts' },
    { value: 'borrowed', label: 'En cours' },
    { value: 'overdue', label: 'En retard' },
    { value: 'returned', label: 'Retournés' }
  ];

  if (error) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">Impossible de charger vos emprunts.</p>
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
          <p className="text-gray-600">Chargement de vos emprunts...</p>
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
            <ClockIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Mes emprunts
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Gérez vos emprunts en cours et consultez votre historique
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {displayData.data.filter(b => b.status === 'borrowed').length}
                </p>
                <p className="text-sm text-gray-600">En cours</p>
              </div>
              <ClockIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {displayData.data.filter(b => dateUtils.isOverdue(b.dueDate) && b.status !== 'returned').length}
                </p>
                <p className="text-sm text-gray-600">En retard</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {displayData.data.filter(b => b.status === 'returned').length}
                </p>
                <p className="text-sm text-gray-600">Retournés</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {displayData.totalItems}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <BookOpenIcon className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Barre d'outils */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input text-base"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <p className="text-sm text-gray-600">
                {isLoading ? (
                  'Chargement...'
                ) : (
                  <>
                    <span className="font-medium">{displayData.totalItems}</span>
                    {' '}emprunt{displayData.totalItems > 1 ? 's' : ''} trouvé{displayData.totalItems > 1 ? 's' : ''}
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Affichage :</span>
              <div className="flex rounded-md border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 text-sm font-medium transition-colors',
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <ListBulletIcon className="h-4 w-4" />
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
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des emprunts */}
        {displayData.data.length > 0 ? (
          <>
            {viewMode === 'list' ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                <div className="divide-y divide-gray-200">
                  {displayData.data.map((borrow) => {
                    const statusInfo = getStatusInfo(borrow);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div key={borrow._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-4">
                          {/* Image du média */}
                          <div className="flex-shrink-0 w-16 h-20 bg-gray-100 rounded-lg overflow-hidden">
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
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={cn(
                                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                    getTypeColor(borrow.media.type)
                                  )}>
                                    {getTypeIcon(borrow.media.type)}
                                    <span className="ml-1">{formatters.mediaType(borrow.media.type)}</span>
                                  </span>
                                  
                                  <span className={cn(
                                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                    statusInfo.color
                                  )}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusInfo.label}
                                  </span>
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {borrow.media.title}
                                </h3>
                                
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                  <UserIcon className="h-4 w-4 mr-1" />
                                  <span>{borrow.media.author}</span>
                                  <span className="mx-2">•</span>
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  <span>{borrow.media.year}</span>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Emprunté le :</span>
                                    <span className="ml-2 font-medium">{formatDate.short(borrow.borrowDate)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">À rendre le :</span>
                                    <span className={cn(
                                      'ml-2 font-medium',
                                      dateUtils.isOverdue(borrow.dueDate) && borrow.status !== 'returned' ? 'text-red-600' :
                                      dateUtils.isDueSoon(borrow.dueDate) && borrow.status !== 'returned' ? 'text-orange-600' : ''
                                    )}>
                                      {formatDate.short(borrow.dueDate)}
                                    </span>
                                  </div>
                                  {borrow.returnDate && (
                                    <div>
                                      <span className="text-gray-500">Retourné le :</span>
                                      <span className="ml-2 font-medium text-green-600">{formatDate.short(borrow.returnDate)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-4">
                                <Link
                                  to={`/media/${borrow.media._id}`}
                                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  Voir détail
                                </Link>

                                {/* Info sur la gestion en présentiel */}
                                {borrow.status !== 'returned' && (
                                  <div className="text-xs text-gray-500 italic max-w-32">
                                    Retour en présentiel uniquement
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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
                {displayData.data.map((borrow) => {
                  const statusInfo = getStatusInfo(borrow);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={borrow._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-[3/4] bg-gray-100 relative">
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

                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                          <span className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            getTypeColor(borrow.media.type)
                          )}>
                            {getTypeIcon(borrow.media.type)}
                            <span className="ml-1">{formatters.mediaType(borrow.media.type)}</span>
                          </span>

                          <span className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            statusInfo.color
                          )}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                          {borrow.media.title}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <span className="truncate">{borrow.media.author}</span>
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Emprunté :</span>
                            <span className="ml-2 font-medium">{formatDate.short(borrow.borrowDate)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">À rendre :</span>
                            <span className={cn(
                              'ml-2 font-medium',
                              dateUtils.isOverdue(borrow.dueDate) && borrow.status !== 'returned' ? 'text-red-600' :
                              dateUtils.isDueSoon(borrow.dueDate) && borrow.status !== 'returned' ? 'text-orange-600' : ''
                            )}>
                              {formatDate.short(borrow.dueDate)}
                            </span>
                          </div>
                          {borrow.returnDate && (
                            <div>
                              <span className="text-gray-500">Retourné :</span>
                              <span className="ml-2 font-medium text-green-600">{formatDate.short(borrow.returnDate)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Link
                            to={`/media/${borrow.media._id}`}
                            className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Voir le détail
                          </Link>

                          {/* Info sur la gestion en présentiel */}
                          {borrow.status !== 'returned' && (
                            <div className="text-xs text-gray-500 italic text-center px-2">
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
                onPageChange={setCurrentPage}
                loading={false}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? 'Aucun emprunt' : `Aucun emprunt ${statusOptions.find(opt => opt.value === statusFilter)?.label.toLowerCase()}`}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? "Vous n'avez encore effectué aucun emprunt. Commencez à explorer notre catalogue !"
                : "Aucun emprunt ne correspond à ce filtre."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog" className="btn-primary">
                Explorer le catalogue
              </Link>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="btn-secondary"
                >
                  Voir tous les emprunts
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conseils */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
          <div className="flex items-start">
            <ClockIcon className="h-6 w-6 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary-900 mb-2">ℹ️ Informations importantes</h3>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• Les emprunts et retours se font uniquement en présentiel à la médiathèque</li>
                <li>• La durée standard d'emprunt est de 14 jours</li>
                <li>• Vous pouvez demander une prolongation sur place si aucune réservation n'est en attente</li>
                <li>• Vous recevrez des rappels par email 2 jours avant l'échéance</li>
                <li>• Cette page vous permet de consulter l'état de vos emprunts en temps réel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBorrowsPage;