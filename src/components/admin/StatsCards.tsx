// src/components/admin/StatsCards.tsx
import React from 'react';
import {
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import type { DashboardStats } from '../../types';
import { cn } from '../../utils';

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className='bg-white rounded-xl border border-gray-200 p-6 animate-pulse'
          >
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <div className='h-4 bg-gray-200 rounded w-20 mb-2'></div>
                <div className='h-8 bg-gray-200 rounded w-12'></div>
              </div>
              <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: 'Utilisateurs totaux',
      value: stats.users.total,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: stats.users.newThisMonth,
      changeLabel: 'nouveaux ce mois',
    },
    {
      title: 'Utilisateurs actifs',
      value: stats.users.active,
      icon: UsersIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      subtitle: `${stats.users.inactive} inactifs`,
    },
    {
      title: 'Médias totaux',
      value: stats.media.total,
      icon: BookOpenIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      subtitle: `${stats.media.byType.book} livres, ${stats.media.byType.movie} films, ${stats.media.byType.music} musiques`,
    },
    {
      title: 'Emprunts actifs',
      value: stats.borrows.active,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      subtitle: `${stats.borrows.total} au total`,
    },
    {
      title: 'Emprunts en retard',
      value: stats.borrows.overdue,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      alert: stats.borrows.overdue > 0,
    },
    {
      title: 'Emprunts retournés',
      value: stats.borrows.returned,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Taux de retour',
      value: `${Math.round(
        (stats.borrows.returned / stats.borrows.total) * 100
      )}%`,
      icon: ArrowTrendingUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      isPercentage: true,
    },
    {
      title: 'Alertes actives',
      value: stats.alerts.filter(alert => alert.priority === 'high').length,
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      subtitle: `${stats.alerts.length} au total`,
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
      {statsData.map((stat, index) => (
        <div
          key={index}
          className={cn(
            'bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200',
            stat.alert && 'border-red-200 bg-red-50'
          )}
        >
          <div className='flex items-center justify-between'>
            <div className='flex-1 min-w-0'>
              <p
                className={cn(
                  'text-sm font-medium mb-2',
                  stat.alert ? 'text-red-800' : 'text-gray-600'
                )}
              >
                {stat.title}
              </p>
              <p
                className={cn(
                  'text-2xl font-bold mb-1',
                  stat.alert ? 'text-red-900' : 'text-gray-900'
                )}
              >
                {typeof stat.value === 'number'
                  ? stat.value.toLocaleString()
                  : stat.value}
              </p>

              {stat.subtitle && (
                <p
                  className={cn(
                    'text-xs break-words',
                    stat.alert ? 'text-red-600' : 'text-gray-500'
                  )}
                >
                  {stat.subtitle}
                </p>
              )}

              {stat.change && (
                <div className='flex items-center text-xs text-green-600 mt-1'>
                  <ArrowTrendingUpIcon className='h-3 w-3 mr-1' />+{stat.change}{' '}
                  {stat.changeLabel}
                </div>
              )}
            </div>

            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                stat.alert ? 'bg-red-200' : stat.bgColor
              )}
            >
              <stat.icon
                className={cn(
                  'h-6 w-6',
                  stat.alert ? 'text-red-700' : stat.color
                )}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
