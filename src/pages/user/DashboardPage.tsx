// src/pages/user/DashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpenIcon,
  HeartIcon,
  ClockIcon,
  ChartBarIcon,
  UserCircleIcon,
  SparklesIcon,
  FilmIcon,
  MusicalNoteIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import borrowService from '../../services/borrowService';
import mediaService from '../../services/mediaService';
import { formatters, formatDate, dateUtils, cn } from '../../utils';

const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // Récupérer les emprunts de l'utilisateur
  const { data: borrowsData, isLoading: borrowsLoading } = useQuery({
    queryKey: ['my-borrows-dashboard'],
    queryFn: () => borrowService.getMyBorrows({ page: 1, limit: 20 }), // Récupérer plus d'emprunts pour les stats
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // Récupérer les favoris de l'utilisateur
  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites-dashboard'],
    queryFn: () => mediaService.getFavorites(1, 5), // Récupérer les 5 premiers favoris
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // Calculer les statistiques réelles
  const userStats = React.useMemo(() => {
    if (!borrowsData?.data) {
      return {
        activeLoans: 0,
        favoriteCount: Array.isArray(user?.favorites)
          ? user.favorites.length
          : 0,
        totalLoans: 0,
        overdueLoans: 0,
      };
    }

    const activeLoans = borrowsData.data.filter(
      b => b.status === 'borrowed'
    ).length;
    const overdueLoans = borrowsData.data.filter(
      b => dateUtils.isOverdue(b.dueDate) && b.status !== 'returned'
    ).length;

    return {
      activeLoans,
      favoriteCount: Array.isArray(user?.favorites) ? user.favorites.length : 0,
      totalLoans: borrowsData.data.length,
      overdueLoans,
    };
  }, [borrowsData?.data, user?.favorites]);

  // Générer l'activité récente à partir des vraies données
  const recentActivity = React.useMemo(() => {
    if (!borrowsData?.data) return [];

    // Trier par date de création (les plus récents en premier)
    const sortedBorrows = [...borrowsData.data]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5); // Prendre les 5 plus récents

    return sortedBorrows.map(borrow => ({
      id: borrow._id,
      action: borrow.status === 'returned' ? 'Retourné' : 'Emprunté',
      title: borrow.media.title,
      date:
        borrow.status === 'returned' && borrow.returnDate
          ? borrow.returnDate
          : borrow.borrowDate,
      type: borrow.media.type,
    }));
  }, [borrowsData?.data]);

  const quickActions = [
    {
      title: 'Explorer le catalogue',
      description: 'Découvrez de nouveaux médias',
      icon: BookOpenIcon,
      href: '/catalog',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Mes favoris',
      description: `${userStats.favoriteCount} média${
        userStats.favoriteCount > 1 ? 's' : ''
      } sauvegardé${userStats.favoriteCount > 1 ? 's' : ''}`,
      icon: HeartIcon,
      href: '/favorites',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      title: 'Mes emprunts',
      description: `${userStats.activeLoans} emprunt${
        userStats.activeLoans > 1 ? 's' : ''
      } en cours`,
      icon: ClockIcon,
      href: '/my-borrows',
      color: 'bg-green-500 hover:bg-green-600',
    },
  ];

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

  return (
    <div className='page-container py-8'>
      {/* Header de bienvenue */}
      <div className='mb-8'>
        <div className='flex items-center space-x-3 mb-4'>
          <div className='h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center'>
            <span className='text-lg font-semibold text-white'>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h1 className='text-2xl lg:text-3xl font-bold text-gray-900'>
              Bonjour, {user?.name?.split(' ')[0] || 'Utilisateur'} ! 👋
            </h1>
            <p className='text-gray-600'>
              {isAdmin
                ? 'Administrateur'
                : formatters.userRole(user?.role || 'user')}{' '}
              • Connecté depuis votre espace personnel
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className='bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <ChartBarIcon className='h-5 w-5 text-primary-600 mr-2' />
              <span className='text-sm font-medium text-primary-800'>
                Vous avez accès au
                <Link to='/admin' className='underline hover:no-underline mx-1'>
                  panneau d'administration
                </Link>
                pour gérer la médiathèque
              </span>
            </div>
          </div>
        )}
      </div>

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Colonne principale */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Statistiques rapides */}
          <div>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Vue d'ensemble
            </h2>
            <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-gray-900'>
                      {borrowsLoading ? '...' : userStats.activeLoans}
                    </p>
                    <p className='text-sm text-gray-600'>Emprunts en cours</p>
                  </div>
                  <ClockIcon
                    className='h-8 w-8 text-blue-500'
                    data-testid='clock-icon'
                  />
                </div>
              </div>

              <div className='bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-gray-900'>
                      {favoritesLoading ? '...' : userStats.favoriteCount}
                    </p>
                    <p className='text-sm text-gray-600'>Favoris</p>
                  </div>
                  <HeartIcon
                    className='h-8 w-8 text-red-500'
                    data-testid='heart-icon'
                  />
                </div>
              </div>

              <div className='bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-gray-900'>
                      {borrowsLoading ? '...' : userStats.totalLoans}
                    </p>
                    <p className='text-sm text-gray-600'>Total emprunts</p>
                  </div>
                  <BookOpenIcon
                    className='h-8 w-8 text-green-500'
                    data-testid='book-icon'
                  />
                </div>
              </div>

              <div className='bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-gray-900'>
                      {borrowsLoading ? '...' : userStats.overdueLoans}
                    </p>
                    <p className='text-sm text-gray-600'>En retard</p>
                  </div>
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      userStats.overdueLoans > 0 ? 'bg-red-100' : 'bg-green-100'
                    }`}
                  >
                    {userStats.overdueLoans > 0 ? (
                      <ExclamationTriangleIcon className='h-5 w-5 text-red-600' />
                    ) : (
                      <span className='text-sm font-bold text-green-600'>
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Activité récente
            </h2>
            <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
              {borrowsLoading ? (
                <div className='p-8 text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4'></div>
                  <p className='text-gray-600'>
                    Chargement de votre activité...
                  </p>
                </div>
              ) : recentActivity.length > 0 ? (
                <div className='divide-y divide-gray-100'>
                  {recentActivity.map(activity => (
                    <div
                      key={activity.id}
                      className='p-4 hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center space-x-3'>
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            getTypeColor(activity.type)
                          )}
                        >
                          {getTypeIcon(activity.type)}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900 truncate'>
                            {activity.action} : {activity.title}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {formatDate.timeAgo(activity.date)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full flex-shrink-0',
                            getTypeColor(activity.type)
                          )}
                        >
                          {formatters.mediaType(activity.type)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='p-8 text-center'>
                  <SparklesIcon
                    className='h-12 w-12 text-gray-400 mx-auto mb-4'
                    data-testid='sparkles-icon'
                  />
                  <p className='text-gray-500 mb-2'>Aucune activité récente</p>
                  <p className='text-sm text-gray-400'>
                    Commencez à emprunter des médias pour voir votre activité
                    ici
                  </p>
                  <Link
                    to='/catalog'
                    className='btn-primary mt-4 inline-flex items-center'
                  >
                    <BookOpenIcon
                      className='h-4 w-4 mr-2'
                      data-testid='book-icon'
                    />
                    Explorer le catalogue
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Favoris récents */}
          {favoritesData && favoritesData.data.length > 0 && (
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Mes favoris récents
                </h2>
                <Link
                  to='/favorites'
                  className='text-sm text-primary-600 hover:text-primary-700 font-medium'
                >
                  Voir tous ({userStats.favoriteCount})
                </Link>
              </div>
              <div className='bg-white rounded-xl border border-gray-200 p-4'>
                <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {favoritesData.data.slice(0, 3).map(media => (
                    <Link
                      key={media._id}
                      to={`/media/${media._id}`}
                      className='flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <div className='w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0'>
                        {media.imageUrl ? (
                          <img
                            src={media.imageUrl}
                            alt={media.title}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            {getTypeIcon(media.type)}
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-sm font-medium text-gray-900 truncate'>
                          {media.title}
                        </h3>
                        <p className='text-xs text-gray-600 truncate'>
                          {media.author}
                        </p>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1',
                            getTypeColor(media.type)
                          )}
                        >
                          {formatters.mediaType(media.type)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Actions rapides */}
        <div className='lg:col-span-1'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Actions rapides
          </h2>
          <div className='space-y-4'>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className='block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1'
              >
                <div className='flex items-start space-x-3'>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} transition-colors`}
                  >
                    <action.icon className='w-5 h-5 text-white' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-medium text-gray-900 mb-1'>
                      {action.title}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Profil utilisateur */}
          <div className='mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4'>
            <h3 className='font-medium text-gray-900 mb-3 flex items-center'>
              <UserCircleIcon
                className='w-5 h-5 mr-2'
                data-testid='user-icon'
              />
              Mon profil
            </h3>
            <div className='space-y-2 text-sm'>
              <div>
                <span className='text-gray-600'>Nom :</span>
                <span className='ml-2 font-medium'>{user?.name}</span>
              </div>
              <div>
                <span className='text-gray-600'>Email :</span>
                <span className='ml-2 font-medium'>{user?.email}</span>
              </div>
              <div>
                <span className='text-gray-600'>Statut :</span>
                <span className='ml-2 font-medium'>
                  {formatters.userRole(user?.role || 'user')}
                </span>
              </div>
              {user?.createdAt && (
                <div>
                  <span className='text-gray-600'>Membre depuis :</span>
                  <span className='ml-2 font-medium'>
                    {formatDate.short(user.createdAt)}
                  </span>
                </div>
              )}
            </div>
            <Link
              to='/settings'
              className='mt-3 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium'
            >
              Modifier mon profil →
            </Link>
          </div>

          {/* Alertes pour emprunts en retard */}
          {userStats.overdueLoans > 0 && (
            <div className='mt-6 bg-red-50 border border-red-200 rounded-xl p-4'>
              <div className='flex items-start'>
                <ExclamationTriangleIcon className='h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <h3 className='font-medium text-red-900 mb-1'>
                    Emprunts en retard
                  </h3>
                  <p className='text-sm text-red-700 mb-3'>
                    Vous avez {userStats.overdueLoans} emprunt
                    {userStats.overdueLoans > 1 ? 's' : ''} en retard. Pensez à
                    les retourner rapidement.
                  </p>
                  <Link
                    to='/my-borrows?status=overdue'
                    className='text-sm text-red-600 hover:text-red-700 font-medium'
                  >
                    Voir les emprunts en retard →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
