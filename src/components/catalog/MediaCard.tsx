// src/components/catalog/MediaCard.tsx - VERSION AVEC DEBUGGING AMÉLIORÉ
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  StarIcon, 
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { Media } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatters, cn } from '../../utils';
import toast from 'react-hot-toast';
import mediaService from '../../services/mediaService';

interface MediaCardProps {
  media: Media;
  onToggleFavorite?: (mediaId: string, isFavorite: boolean) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onToggleFavorite }) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  
  // ✅ Calcul correct de l'état favori depuis le contexte utilisateur
  const isFavoriteFromContext = user?.favorites?.includes(media._id) || false;
  
  // État local synchronisé avec le contexte
  const [isFavorite, setIsFavorite] = useState(isFavoriteFromContext);
  const [isToggling, setIsToggling] = useState(false);

  // ✅ Synchroniser l'état local avec le contexte utilisateur
  useEffect(() => {
    setIsFavorite(isFavoriteFromContext);
  }, [isFavoriteFromContext]);

  // ✅ Debug amélioré pour voir les valeurs
  useEffect(() => {
    console.log('MediaCard Debug:', {
      mediaId: media._id,
      mediaTitle: media.title,
      userFavorites: user?.favorites,
      userFavoritesLength: user?.favorites?.length || 0,
      isFavoriteFromContext,
      isFavorite,
      isAuthenticated,
      userId: user?._id
    });
  }, [media._id, media.title, user?.favorites, isFavoriteFromContext, isFavorite, isAuthenticated, user?._id]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <BookOpenIcon className="h-4 w-4" />;
      case 'movie':
        return <FilmIcon className="h-4 w-4" />;
      case 'music':
        return <MusicalNoteIcon className="h-4 w-4" />;
      default:
        return <BookOpenIcon className="h-4 w-4" />;
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
    const newFavoriteState = !isFavorite;
    
    console.log('🔄 Toggle favori:', {
      mediaId: media._id,
      currentState: isFavorite,
      newState: newFavoriteState,
      currentFavorites: user?.favorites
    });
    
    try {
      // ✅ Mise à jour optimiste immédiate
      setIsFavorite(newFavoriteState);
      
      // ✅ Mettre à jour le contexte utilisateur immédiatement
      if (user) {
        const updatedFavorites = newFavoriteState
          ? [...(user.favorites || []), media._id]
          : (user.favorites || []).filter(id => id !== media._id);
        
        console.log('🔄 Mise à jour contexte:', {
          before: user.favorites,
          after: updatedFavorites
        });
        
        updateUser({ favorites: updatedFavorites });
      }

      // ✅ Appel API avec meilleure gestion
      const result = await mediaService.toggleFavorite(media._id);
      console.log('✅ Résultat API toggle:', result);

      // Appeler la fonction de callback si fournie
      if (onToggleFavorite) {
        await onToggleFavorite(media._id, newFavoriteState);
      }

      toast.success(
        newFavoriteState 
          ? '💖 Ajouté aux favoris' 
          : '💔 Retiré des favoris'
      );
    } catch (error) {
      // ✅ Rollback en cas d'erreur
      console.error('❌ Erreur lors du toggle favori:', error);
      setIsFavorite(!newFavoriteState);
      
      if (user) {
        const rollbackFavorites = !newFavoriteState
          ? [...(user.favorites || []), media._id]
          : (user.favorites || []).filter(id => id !== media._id);
        
        console.log('↩️ Rollback contexte:', rollbackFavorites);
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
          'h-4 w-4',
          index < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        )}
      />
    ));
  };

  return (
    <Link
      to={`/media/${media._id}`}
      className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {media.imageUrl ? (
          <img
            src={media.imageUrl}
            alt={media.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            {getTypeIcon(media.type)}
          </div>
        )}

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            getTypeColor(media.type)
          )}>
            {getTypeIcon(media.type)}
            <span className="ml-1">{formatters.mediaType(media.type)}</span>
          </span>

          {/* ✅ Bouton favori avec debugging visuel */}
          <button
            onClick={handleToggleFavorite}
            disabled={isToggling || !isAuthenticated}
            className={cn(
              'p-2 rounded-full backdrop-blur-sm transition-all duration-200',
              'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              isFavorite 
                ? 'bg-red-500/90 hover:bg-red-600/90' 
                : 'bg-white/90 hover:bg-white',
              (isToggling || !isAuthenticated) && 'opacity-75 cursor-not-allowed'
            )}
            title={
              !isAuthenticated 
                ? 'Connectez-vous pour ajouter aux favoris' 
                : isFavorite 
                  ? 'Retirer des favoris' 
                  : 'Ajouter aux favoris'
            }
            style={{
              // ✅ Debug visuel : bordure colorée selon l'état
              border: isFavorite ? '2px solid red' : '2px solid gray'
            }}
          >
            {isToggling ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : isFavorite ? (
              <HeartIconSolid className="h-4 w-4 text-white" />
            ) : (
              <HeartIcon className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        <div className="absolute bottom-3 right-3">
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            media.available 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}>
            <span className={cn(
              'w-2 h-2 rounded-full mr-1',
              media.available ? 'bg-green-500' : 'bg-red-500'
            )} />
            {media.available ? 'Disponible' : 'Emprunté'}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {media.title}
        </h3>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <UserIcon className="h-3 w-3" />
          <span className="truncate">{media.author}</span>
          <span>•</span>
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{media.year}</span>
          </div>
        </div>

        {media.averageRating > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(media.averageRating)}
            </div>
            <span className="text-sm text-gray-600">
              {media.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({Array.isArray(media.reviews) ? media.reviews.length : 0} avis)
            </span>
          </div>
        )}

        {media.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {media.description}
          </p>
        )}

        {Array.isArray(media.tags) && media.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {media.tags.slice(0, 3).map((tag) => (
              <span
                key={typeof tag === 'object' ? tag._id : tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                #{typeof tag === 'object' ? tag.name : tag}
              </span>
            ))}
            {media.tags.length > 3 && (
              <span className="text-xs text-gray-500 py-1">
                +{media.tags.length - 3} autres
              </span>
            )}
          </div>
        )}
      </div>

      {/* ✅ Debug visuel en bas de la carte */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1">
          Fav: {isFavorite ? '❤️' : '🤍'} | Auth: {isAuthenticated ? '✅' : '❌'} | Count: {user?.favorites?.length || 0}
        </div>
      )}
    </Link>
  );
};

export default MediaCard;