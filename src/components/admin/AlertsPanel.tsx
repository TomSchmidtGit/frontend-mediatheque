// src/components/admin/AlertsPanel.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import type { DashboardStats } from '../../types';
import { formatDate, cn } from '../../utils';

interface AlertsPanelProps {
  stats: DashboardStats;
  loading?: boolean;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ stats, loading }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return ExclamationTriangleIcon;
      case 'info': return InformationCircleIcon;
      case 'error': return XCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  const getAlertColor = (type: string, priority: string) => {
    if (priority === 'high') {
      switch (type) {
        case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
        case 'error': return 'bg-red-50 border-red-200 text-red-800';
        default: return 'bg-blue-50 border-blue-200 text-blue-800';
      }
    } else if (priority === 'medium') {
      switch (type) {
        case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        case 'error': return 'bg-red-50 border-red-200 text-red-800';
        default: return 'bg-blue-50 border-blue-200 text-blue-800';
      }
    } else {
      return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'high') {
      switch (type) {
        case 'warning': return 'text-orange-600';
        case 'error': return 'text-red-600';
        default: return 'text-blue-600';
      }
    } else if (priority === 'medium') {
      switch (type) {
        case 'warning': return 'text-yellow-600';
        case 'error': return 'text-red-600';
        default: return 'text-blue-600';
      }
    } else {
      return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-5 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg animate-pulse">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Alertes système */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Alertes système
            {stats.alerts.filter(alert => alert.priority === 'high').length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {stats.alerts.filter(alert => alert.priority === 'high').length} priorité haute
              </span>
            )}
          </h3>
        </div>

        <div className="p-4">
          {stats.alerts && stats.alerts.length > 0 ? (
            <div className="space-y-3">
              {stats.alerts.slice(0, 5).map((alert, index) => {
                const AlertIcon = getAlertIcon(alert.type);

                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start space-x-3 p-3 rounded-lg border',
                      getAlertColor(alert.type, alert.priority)
                    )}
                  >
                    <AlertIcon className={cn('h-5 w-5 mt-0.5', getIconColor(alert.type, alert.priority))} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <div className="flex items-center mt-1 text-xs">
                        <span className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mr-2',
                          alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        )}>
                          {alert.priority === 'high' ? 'Haute' :
                           alert.priority === 'medium' ? 'Moyenne' : 'Faible'}
                        </span>
                        <span className="text-current opacity-75">
                          {alert.type === 'warning' ? 'Avertissement' :
                           alert.type === 'error' ? 'Erreur' : 'Information'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune alerte active</p>
              <p className="text-sm text-gray-400 mt-1">Tous les emprunts sont à jour !</p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <Link
            to="/admin/borrows?status=overdue"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Voir tous les retards
          </Link>
        </div>
      </div>

      {/* Emprunts en retard */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Emprunts en retard
            </h3>
            {stats.borrows.overdue > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {stats.borrows.overdue} en retard
              </span>
            )}
          </div>
        </div>

        <div className="p-0">
          {stats.overdueDetails && stats.overdueDetails.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.overdueDetails.slice(0, 5).map((overdue) => (
                <div key={overdue._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
                        <UserIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {overdue.user.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {overdue.media.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Échéance : {formatDate.short(overdue.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {overdue.daysOverdue} jour{overdue.daysOverdue > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-red-500">de retard</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun emprunt en retard</p>
              <p className="text-sm text-gray-400 mt-1">Tout fonctionne normalement !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;