import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import externalApiService from '../../services/externalApiService';
import type { ExternalMedia } from '../../types/externalApi';
import { cn } from '../../utils';

interface ExternalMediaSearchProps {
  onMediaSelect: (media: ExternalMedia) => void;
  selectedType?: 'book' | 'movie' | 'music';
  className?: string;
}

const ExternalMediaSearch: React.FC<ExternalMediaSearchProps> = ({
  onMediaSelect,
  selectedType,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'book' | 'movie' | 'music'>(
    selectedType || 'book'
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown mobile quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMobileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const {
    data: searchResults,
    refetch,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['external-media-search', searchQuery, searchType],
    queryFn: () =>
      externalApiService.searchMedia({
        query: searchQuery,
        type: searchType,
        maxResults: 20,
      }),
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;

    setIsSearching(true);
    try {
      await refetch();
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'movie':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'music':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'google_books':
        return 'Google Books';
      case 'tmdb':
        return 'TMDB';
      case 'musicbrainz':
        return 'MusicBrainz';
      default:
        return source;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barre de recherche */}
      <div className='space-y-3 lg:space-y-0 lg:flex lg:space-x-3'>
        {/* Ligne 1: Barre de recherche */}
        <div className='relative lg:flex-1'>
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Rechercher un titre, auteur ou artiste...'
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
            disabled={isSearching}
          />
          <MagnifyingGlassIcon className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
        </div>

        {/* Ligne 2: Choix du type */}
        <div className='lg:w-48 relative' ref={mobileDropdownRef}>
          {/* Select natif - Visible uniquement sur desktop */}
          <select
            value={searchType}
            onChange={e => setSearchType(e.target.value as any)}
            className='hidden lg:block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base bg-white appearance-none cursor-pointer'
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem',
            }}
            disabled={isSearching}
          >
            <option value='book'>📚 Livres</option>
            <option value='movie'>🎬 Films</option>
            <option value='music'>🎵 Musique</option>
          </select>

          {/* Bouton dropdown personnalisé - Visible uniquement sur mobile */}
          <button
            type='button'
            onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
            className='lg:hidden w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base bg-white text-left cursor-pointer flex items-center justify-between'
            disabled={isSearching}
          >
            <span className='flex items-center'>
              {searchType === 'book' && '📚 Livres'}
              {searchType === 'movie' && '🎬 Films'}
              {searchType === 'music' && '🎵 Musique'}
            </span>
            <ChevronDownIcon
              className={cn(
                'h-5 w-5 text-gray-400 transition-transform',
                isMobileDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown personnalisé mobile - S'affiche en dessous */}
          {isMobileDropdownOpen && (
            <div className='lg:hidden absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'>
              <div className='py-1'>
                <button
                  type='button'
                  onClick={() => {
                    setSearchType('book');
                    setIsMobileDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-3 text-left text-lg hover:bg-gray-100 flex items-center',
                    searchType === 'book' && 'bg-blue-50 text-blue-700'
                  )}
                >
                  📚 Livres
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setSearchType('movie');
                    setIsMobileDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-3 text-left text-lg hover:bg-gray-100 flex items-center',
                    searchType === 'movie' && 'bg-blue-50 text-blue-700'
                  )}
                >
                  🎬 Films
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setSearchType('music');
                    setIsMobileDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-3 text-left text-lg hover:bg-gray-100 flex items-center',
                    searchType === 'music' && 'bg-blue-50 text-blue-700'
                  )}
                >
                  🎵 Musique
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Ligne 3: Bouton de recherche */}
        <div className='lg:w-auto'>
          <button
            onClick={handleSearch}
            disabled={searchQuery.trim().length < 2 || isSearching}
            className='w-full lg:w-auto px-4 py-3 lg:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium'
          >
            {isSearching ? '🔍 Recherche...' : '🔍 Rechercher'}
          </button>
        </div>
      </div>

      {/* Résultats de recherche */}
      {error && (
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-red-800 text-sm'>
            Erreur lors de la recherche: {error.message}
          </p>
        </div>
      )}

      {searchResults && searchResults.data.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium text-gray-900'>
              Résultats ({searchResults.total})
            </h3>
            <p className='text-sm text-gray-500'>
              Recherche: "{searchResults.query}"
            </p>
          </div>

          <div className='grid gap-3 max-h-96 overflow-y-auto'>
            {searchResults.data.map(media => (
              <div
                key={`${media.source}-${media.externalId}`}
                className='flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer'
                onClick={() => onMediaSelect(media)}
              >
                {/* Image */}
                <div className='flex-shrink-0 flex justify-center sm:justify-start'>
                  {media.imageUrl ? (
                    <img
                      src={media.imageUrl}
                      alt={media.title}
                      className='w-16 h-20 object-cover rounded-md'
                    />
                  ) : (
                    <div className='w-16 h-20 bg-gray-200 rounded-md flex items-center justify-center'>
                      {getTypeIcon(media.type)}
                    </div>
                  )}
                </div>

                {/* Informations */}
                <div className='flex-1 min-w-0'>
                  <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0'>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm font-medium text-gray-900 truncate'>
                        {media.title}
                      </h4>
                      <p className='text-sm text-gray-600 truncate'>
                        {media.author}
                      </p>
                      {media.year && (
                        <p className='text-xs text-gray-500'>{media.year}</p>
                      )}
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                          getTypeColor(media.type)
                        )}
                      >
                        {getTypeIcon(media.type)}
                        <span className='ml-1 capitalize'>
                          {media.type === 'movie'
                            ? 'Film'
                            : media.type === 'book'
                              ? 'Livre'
                              : 'Musique'}
                        </span>
                      </span>

                      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200'>
                        {getSourceLabel(media.source)}
                      </span>
                    </div>
                  </div>

                  {media.description && (
                    <p className='text-xs text-gray-600 mt-2 line-clamp-2'>
                      {media.description}
                    </p>
                  )}

                  {/* Informations supplémentaires selon le type */}
                  {media.type === 'book' && media.isbn && (
                    <p className='text-xs text-gray-500 mt-1'>
                      ISBN: {media.isbn}
                    </p>
                  )}

                  {media.type === 'movie' && media.runtime && (
                    <p className='text-xs text-gray-500 mt-1'>
                      Durée: {Math.floor(media.runtime / 60)}h
                      {media.runtime % 60}min
                    </p>
                  )}

                  {media.type === 'music' && media.media && media.media[0] && (
                    <p className='text-xs text-gray-500 mt-1'>
                      {media.media[0].format} - {media.media[0].trackCount}{' '}
                      piste{media.media[0].trackCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults &&
        searchResults.data.length === 0 &&
        searchQuery &&
        !isLoading && (
          <div className='text-center py-8'>
            <p className='text-gray-500'>
              Aucun résultat trouvé pour "{searchQuery}"
            </p>
            <p className='text-sm text-gray-400 mt-1'>
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}

      {isLoading && (
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto'></div>
          <p className='text-gray-500 mt-2'>Recherche en cours...</p>
        </div>
      )}
    </div>
  );
};

export default ExternalMediaSearch;
