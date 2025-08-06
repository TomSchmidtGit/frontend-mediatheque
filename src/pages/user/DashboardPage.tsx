// src/pages/user/DashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  HeartIcon, 
  ClockIcon,
  ChartBarIcon,
  UserCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { formatters } from '../../utils';

const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // Données factices à remplacer par des appels API
  const userStats = {
    activeLoans: 3,
    favoriteCount: 12,
    totalLoans: 47,
    overdueLoans: 0
  };

  const recentActivity = [
    { id: 1, action: 'Emprunté', title: 'Le Seigneur des Anneaux', date: '2025-08-05', type: 'book' },
    { id: 2, action: 'Retourné', title: 'Inception', date: '2025-08-04', type: 'movie' },
    { id: 3, action: 'Ajouté aux favoris', title: 'Daft Punk - Random Access Memories', date: '2025-08-03', type: 'music' }
  ];

  const quickActions = [
    {
      title: 'Explorer le catalogue',
      description: 'Découvrez de nouveaux médias',
      icon: BookOpenIcon,
      href: '/catalog',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Mes favoris',
      description: `${userStats.favoriteCount} médias sauvegardés`,
      icon: HeartIcon,
      href: '/favorites',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: 'Mes emprunts',
      description: `${userStats.activeLoans} emprunts en cours`,
      icon: ClockIcon,
      href: '/my-borrows',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="page-container py-8">
      {/* Header de bienvenue */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span className="text-lg font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Bonjour, {user?.name?.split(' ')[0] || 'Utilisateur'} ! 👋
            </h1>
            <p className="text-gray-600">
              {isAdmin ? 'Administrateur' : formatters.userRole(user?.role || 'user')} • 
              Connecté depuis votre espace personnel
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-800">
                Vous avez accès au 
                <Link to="/admin" className="underline hover:no-underline mx-1">
                  panneau d'administration
                </Link>
                pour gérer la médiathèque
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Statistiques rapides */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vue d'ensemble</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{userStats.activeLoans}</p>
                    <p className="text-sm text-gray-600">Emprunts en cours</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{userStats.favoriteCount}</p>
                    <p className="text-sm text-gray-600">Favoris</p>
                  </div>
                  <HeartIcon className="h-8 w-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{userStats.totalLoans}</p>
                    <p className="text-sm text-gray-600">Total emprunts</p>
                  </div>
                  <BookOpenIcon className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{userStats.overdueLoans}</p>
                    <p className="text-sm text-gray-600">En retard</p>
                  </div>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    userStats.overdueLoans > 0 ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      userStats.overdueLoans > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {userStats.overdueLoans > 0 ? '⚠️' : '✓'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activité récente</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'book' ? 'bg-blue-100' :
                          activity.type === 'movie' ? 'bg-purple-100' : 'bg-green-100'
                        }`}>
                          <BookOpenIcon className={`w-5 h-5 ${
                            activity.type === 'book' ? 'text-blue-600' :
                            activity.type === 'movie' ? 'text-purple-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action} : {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">{activity.date}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          activity.type === 'book' ? 'bg-blue-100 text-blue-800' :
                          activity.type === 'movie' ? 'bg-purple-100 text-purple-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {formatters.mediaType(activity.type)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune activité récente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Actions rapides */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} transition-colors`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Profil utilisateur */}
          <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <UserCircleIcon className="w-5 h-5 mr-2" />
              Mon profil
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Nom :</span>
                <span className="ml-2 font-medium">{user?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email :</span>
                <span className="ml-2 font-medium">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Statut :</span>
                <span className="ml-2 font-medium">{formatters.userRole(user?.role || 'user')}</span>
              </div>
            </div>
            <Link
              to="/settings"
              className="mt-3 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Modifier mon profil →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;