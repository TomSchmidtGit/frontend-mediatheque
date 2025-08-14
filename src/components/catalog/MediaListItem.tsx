// src/components/catalog/MediaListItem.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  StarIcon,
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { Media } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

interface MediaListItemProps {
  media: Media;
  onToggleFavorite?: (mediaId: string) => void;
  isInFavoritesPage?: boolean;
}

const MediaListItem: React.FC<MediaListItemProps> = ({
  media,
  onToggleFavorite,
  isInFavoritesPage = false,
}) => {
  const { user, isAuthenticated, updateUser } = useAuth();

  const computeIsFavorite = (): boolean => {
    if (isInFavoritesPage) return true;
    return user?.favorites?.includes(media._id) || false;
  };

  const [isFavorite, setIsFavorite] = useState(computeIsFavorite());
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setIsFavorite(computeIsFavorite());
  }, [user?.favorites, media._id, isInFavoritesPage]);

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

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }

    if (isToggling) return;

    setIsToggling(true);

    try {
      const newFavoriteState = isInFavoritesPage ? false : !isFavorite;
      setIsFavorite(newFavoriteState);

      if (user) {
        const updatedFavorites = newFavoriteState
          ? [...(user.favorites || []), media._id]
          : (user.favorites || []).filter(id => id !== media._id);

        updateUser({ favorites: updatedFavorites });
      }

      if (onToggleFavorite) {
        await onToggleFavorite(media._id);
      }

      const message = isInFavoritesPage
        ? 'Retiré des favoris'
        : newFavoriteState
          ? 'Ajouté aux favoris'
          : 'Retiré des favoris';

      toast.success(message);
    } catch (error) {
      console.error('Erreur lors du toggle favori:', error);
      setIsFavorite(!isFavorite);

      if (user) {
        const rollbackFavorites = isFavorite
          ? [...(user.favorites || []), media._id]
          : (user.favorites || []).filter(id => id !== media._id);
        updateUser({ favorites: rollbackFavorites });
      }

      toast.error('Erreur lors de la modification');
    } finally {
      setIsToggling(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={cn(
          'h-3 w-3',
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        )}
      />
    ));
  };

  const getButtonText = () => {
    if (!isAuthenticated) return 'Connectez-vous pour ajouter aux favoris';
    if (isInFavoritesPage) return 'Retirer des favoris';
    return isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
  };

  return (
    <div className='group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200'>
      <Link
        to={`/media/${media._id}`}
        className='flex items-start space-x-4 p-4 hover:bg-gray-50 transition-colors'
      >
        {/* Image à gauche */}
        <div className='relative flex-shrink-0'>
          <div className='w-20 h-28 overflow-hidden bg-gray-100 rounded-md'>
            {media.imageUrl ? (
              <img
                src={media.imageUrl}
                alt={media.title}
                className='w-full h-full object-cover'
                loading='lazy'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
                {getTypeIcon(media.type)}
              </div>
            )}
          </div>

          {/* Badge de type */}
          <div className='absolute -top-1 -left-1'>
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                getTypeColor(media.type)
              )}
            >
              {getTypeIcon(media.type)}
            </span>
          </div>

          {/* Badge de disponibilité */}
          <div className='absolute -bottom-1 -right-1'>
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                media.available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full mr-1',
                  media.available ? 'bg-green-500' : 'bg-red-500'
                )}
              />
              {media.available ? 'Disponible' : 'Emprunté'}
            </span>
          </div>
        </div>

        {/* Contenu à droite */}
        <div className='flex-1 min-w-0 space-y-2'>
          {/* Titre et type */}
          <div className='flex items-start justify-between'>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2'>
                {media.title}
              </h3>
            </div>

            {/* Bouton favoris */}
            <button
              onClick={handleToggleFavorite}
              disabled={isToggling || !isAuthenticated}
              className={cn(
                'p-2 rounded-full transition-all duration-200 flex-shrink-0',
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                isFavorite
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
                (isToggling || !isAuthenticated) &&
                  'opacity-75 cursor-not-allowed'
              )}
              title={getButtonText()}
            >
              {isToggling ? (
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent' />
              ) : isFavorite ? (
                <HeartIconSolid className='h-4 w-4' />
              ) : (
                <HeartIcon className='h-4 w-4' />
              )}
            </button>
          </div>

          {/* Auteur et année */}
          <div className='flex items-center space-x-3 text-sm text-gray-600'>
            <div className='flex items-center space-x-1'>
              <UserIcon className='h-3 w-3' />
              <span className='truncate'>{media.author}</span>
            </div>
            <div className='flex items-center space-x-1'>
              <CalendarIcon className='h-3 w-3' />
              <span>{media.year}</span>
            </div>
          </div>

          {/* Note et avis */}
          {media.averageRating > 0 && (
            <div className='flex items-center space-x-2'>
              <div className='flex items-center space-x-1'>
                {renderStars(media.averageRating)}
              </div>
              <span className='text-sm text-gray-600'>
                {media.averageRating.toFixed(1)}
              </span>
              <span className='text-xs text-gray-500'>
                ({Array.isArray(media.reviews) ? media.reviews.length : 0} avis)
              </span>
            </div>
          )}

          {/* Description */}
          {media.description && (
            <p className='text-sm text-gray-600 line-clamp-2 leading-relaxed'>
              {media.description}
            </p>
          )}

          {/* Tags */}
          {Array.isArray(media.tags) && media.tags.length > 0 && (
            <div className='flex flex-wrap gap-1 pt-1'>
              {media.tags.slice(0, 3).map(tag => (
                <span
                  key={typeof tag === 'object' ? tag._id : tag}
                  className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700'
                >
                  #{typeof tag === 'object' ? tag.name : tag}
                </span>
              ))}
              {media.tags.length > 3 && (
                <span className='text-xs text-gray-500 py-1'>
                  +{media.tags.length - 3} autres
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default MediaListItem;
