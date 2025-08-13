// src/components/admin/RecentActivity.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  UserIcon,
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
  EyeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import type { DashboardStats } from '../../types';
import { formatDate, formatters, cn } from '../../utils';

interface RecentActivityProps {
  stats: DashboardStats;
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ stats, loading }) => {
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

  if (loading) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='h-5 bg-gray-200 rounded w-32 animate-pulse'></div>
          </div>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className='flex items-center space-x-3 animate-pulse'
              >
                <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
                <div className='flex-1'>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-1'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='h-5 bg-gray-200 rounded w-32 animate-pulse'></div>
          </div>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className='flex items-center justify-between animate-pulse'
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 bg-gray-200 rounded'></div>
                  <div className='h-4 bg-gray-200 rounded w-32'></div>
                </div>
                <div className='h-4 bg-gray-200 rounded w-12'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Emprunts récents */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
            <ClockIcon className='h-5 w-5 mr-2' />
            Emprunts récents
          </h3>
        </div>

        <div className='p-0'>
          {stats.recentBorrows && stats.recentBorrows.length > 0 ? (
            <div className='divide-y divide-gray-100'>
              {stats.recentBorrows.slice(0, 5).map(borrow => (
                <div
                  key={borrow._id}
                  className='p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center space-x-3'>
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        getTypeColor(borrow.media.type)
                      )}
                    >
                      {getTypeIcon(borrow.media.type)}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium text-gray-900 truncate'>
                          {borrow.media.title}
                        </p>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            borrow.status === 'borrowed'
                              ? 'bg-blue-100 text-blue-800'
                              : borrow.status === 'returned'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                          )}
                        >
                          {formatters.borrowStatus(borrow.status)}
                        </span>
                      </div>

                      <div className='flex items-center text-sm text-gray-600 mt-1 min-w-0'>
                        <UserIcon className='h-4 w-4 mr-1 flex-shrink-0' />
                        <span className='truncate'>{borrow.user.name}</span>
                        <span className='mx-2 flex-shrink-0'>•</span>
                        <CalendarIcon className='h-4 w-4 mr-1 flex-shrink-0' />
                        <span className='truncate'>
                          {formatDate.short(borrow.borrowDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='p-8 text-center'>
              <ClockIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500'>Aucun emprunt récent</p>
            </div>
          )}
        </div>

        <div className='px-6 py-3 bg-gray-50 border-t border-gray-200'>
          <Link
            to='/admin/borrows'
            className='text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center'
          >
            <EyeIcon className='h-4 w-4 mr-1' />
            Voir tous les emprunts
          </Link>
        </div>
      </div>

      {/* Top médias empruntés */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
            <BookOpenIcon className='h-5 w-5 mr-2' />
            Médias populaires
          </h3>
        </div>

        <div className='p-0'>
          {stats.topBorrowedMedia && stats.topBorrowedMedia.length > 0 ? (
            <div className='divide-y divide-gray-100'>
              {stats.topBorrowedMedia.slice(0, 5).map((media, index) => (
                <div
                  key={media._id}
                  className='p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 text-primary-700 text-sm font-bold'>
                        {index + 1}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 truncate'>
                          {media.title}
                        </p>
                        <div className='flex items-center text-sm text-gray-600'>
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2',
                              getTypeColor(media.type)
                            )}
                          >
                            {getTypeIcon(media.type)}
                            <span className='ml-1'>
                              {formatters.mediaType(media.type)}
                            </span>
                          </span>
                          <span className='truncate'>{media.author}</span>
                        </div>
                      </div>
                    </div>

                    <div className='text-right'>
                      <p className='text-lg font-bold text-primary-600'>
                        {media.borrowCount}
                      </p>
                      <p className='text-xs text-gray-500'>emprunts</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='p-8 text-center'>
              <BookOpenIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500'>Aucune donnée d'emprunt</p>
            </div>
          )}
        </div>

        <div className='px-6 py-3 bg-gray-50 border-t border-gray-200'>
          <Link
            to='/admin/media'
            className='text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center'
          >
            <EyeIcon className='h-4 w-4 mr-1' />
            Voir tous les médias
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
