// src/components/dashboard/BorrowStats.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import borrowService from '../../services/borrowService';
import { useAuth } from '../../context/AuthContext';
import { dateUtils } from '../../utils';

const BorrowStats: React.FC = () => {
  const { user } = useAuth();

  const { data: borrowsData } = useQuery({
    queryKey: ['my-borrows-stats'],
    queryFn: () => borrowService.getMyBorrows({ page: 1, limit: 100 }), // Récupérer plus d'emprunts pour les stats
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Cache 2 minutes
  });

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    if (!borrowsData?.data) {
      return {
        active: 0,
        overdue: 0,
        returned: 0,
        total: 0,
      };
    }

    const active = borrowsData.data.filter(b => b.status === 'borrowed').length;
    const overdue = borrowsData.data.filter(
      b => dateUtils.isOverdue(b.dueDate) && b.status !== 'returned'
    ).length;
    const returned = borrowsData.data.filter(
      b => b.status === 'returned'
    ).length;

    return {
      active,
      overdue,
      returned,
      total: borrowsData.data.length,
    };
  }, [borrowsData?.data]);

  const statItems = [
    {
      label: 'En cours',
      value: stats.active,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/my-borrows?status=borrowed',
    },
    {
      label: 'En retard',
      value: stats.overdue,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      href: '/my-borrows?status=overdue',
    },
    {
      label: 'Retournés',
      value: stats.returned,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/my-borrows?status=returned',
    },
    {
      label: 'Total',
      value: stats.total,
      icon: BookOpenIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      href: '/my-borrows',
    },
  ];

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
      {statItems.map((item, index) => (
        <Link
          key={index}
          to={item.href}
          className='bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 group'
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors'>
                {item.value}
              </p>
              <p className='text-sm text-gray-600'>{item.label}</p>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bgColor} group-hover:scale-110 transition-transform`}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default BorrowStats;
