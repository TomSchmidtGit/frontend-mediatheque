// src/pages/admin/AdminDashboardPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import StatsCards from '../../components/admin/StatsCards';
import RecentActivity from '../../components/admin/RecentActivity';
import AlertsPanel from '../../components/admin/AlertsPanel';
import dashboardService from '../../services/dashboardService';
 

const AdminDashboardPage: React.FC = () => {
  const {
    data: dashboardStats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // Cache pendant 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch automatique toutes les 5 minutes
  });

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement du dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            Impossible de récupérer les statistiques du dashboard.
          </p>
          <button
            onClick={handleRefresh}
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
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Dashboard Administrateur
              </h1>
              <p className="text-gray-600 text-lg">
                Vue d'ensemble de votre médiathèque
              </p>
            </div>
            
          </div>
        </div>

        <div className="space-y-8">
          {/* Gestion administrateur */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Gestion administrateur
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Gestion des utilisateurs
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Voir et gérer tous les utilisateurs de la médiathèque
                </p>
                <Link 
                  to="/admin/users"
                  className="btn-primary w-full text-sm"
                >
                  Gérer les utilisateurs
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Gestion des médias
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ajouter, modifier ou supprimer des médias
                </p>
                <Link 
                  to="/admin/media"
                  className="btn-primary w-full text-sm"
                >
                  Gérer les médias
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Gestion des emprunts
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Suivre et gérer tous les emprunts en cours
                </p>
                <Link 
                  to="/admin/borrows"
                  className="btn-primary w-full text-sm"
                >
                  Gérer les emprunts
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  Gestion des catégories & tags
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Organiser la collection avec des catégories et tags
                </p>
                <Link 
                  to="/admin/categories"
                  className="btn-primary w-full text-sm"
                >
                  Gérer les catégories
                </Link>
              </div>
            </div>
          </section>

          {/* Cartes de statistiques */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Statistiques générales
            </h2>
            <StatsCards stats={dashboardStats!} loading={isLoading} />
          </section>

          {/* Activité récente */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Activité récente
            </h2>
            <RecentActivity stats={dashboardStats!} loading={isLoading} />
          </section>

          {/* Alertes et emprunts en retard */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Alertes et surveillance
            </h2>
            <AlertsPanel stats={dashboardStats!} loading={isLoading} />
          </section>

          {/* Utilisateurs les plus actifs */}
          {dashboardStats?.mostActiveUsers && dashboardStats.mostActiveUsers.length > 0 && (
            <section>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Utilisateurs les plus actifs
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Top 5 des utilisateurs par nombre d'emprunts
                  </p>
                </div>
                
                <div className="p-0">
                  <div className="divide-y divide-gray-100">
                    {dashboardStats.mostActiveUsers.slice(0, 5).map((user, index) => (
                      <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
                              {index + 1}
                            </div>
                            
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary-600">
                              {user.borrowCount}
                            </p>
                            <p className="text-xs text-gray-500">emprunts</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Informations système */}
          <section>
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
              <div className="flex items-start">
                <ChartBarIcon className="h-6 w-6 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">
                    💡 Conseils pour optimiser votre médiathèque
                  </h3>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li>• Surveillez régulièrement les emprunts en retard pour maintenir une bonne circulation</li>
                    <li>• Analysez les médias populaires pour identifier les tendances d'emprunt</li>
                    <li>• Encouragez les utilisateurs inactifs à découvrir de nouveaux contenus</li>
                    <li>• Utilisez les catégories et tags pour une meilleure organisation de votre collection</li>
                    <li>• Consultez les alertes pour anticiper les problèmes potentiels</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;