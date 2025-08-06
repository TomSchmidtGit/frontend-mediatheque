// src/pages/public/CatalogPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Squares2X2Icon, 
  ListBulletIcon, 
  AdjustmentsHorizontalIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import MediaCard from '../../components/catalog/MediaCard';
import CatalogFilters from '../../components/catalog/CatalogFilters';
import Pagination from '../../components/common/Pagination';
import type { MediaFilters } from '../../types';
import mediaService from '../../services/mediaService';
import { cn } from '../../utils'; 

// Interface pour les données de pagination
interface PaginatedData {
  data: any[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // État local pour la recherche (input en temps réel)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // État des filtres appliqués (pour les requêtes API)
  const [appliedFilters, setAppliedFilters] = useState<MediaFilters>(() => ({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12'),
    search: searchParams.get('search') || '',
    type: searchParams.get('type') as any || '',
    category: searchParams.get('category') || '',
    tags: searchParams.get('tags') || '',
    favorites: searchParams.get('favorites') === 'true' || false,
  }));

  // Fonction pour appliquer la recherche avec délai (sans changer l'URL)
  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
    
    // Annuler le timeout précédent
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Programmer la mise à jour des filtres après 500ms
    searchTimeoutRef.current = setTimeout(() => {
      setAppliedFilters(prev => ({
        ...prev,
        search: value,
        page: 1
      }));
    }, 500);
  }, []);

  // Cleanup du timeout au démontage
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Requête pour récupérer les médias
  const {
    data: mediaData,
    isLoading: mediaLoading,
    error: mediaError,
    refetch: refetchMedia
  } = useQuery({
    queryKey: ['media', appliedFilters],
    queryFn: () => mediaService.getMedia(appliedFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Requête pour récupérer les catégories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => mediaService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Requête pour récupérer les tags
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => mediaService.getTags(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Synchroniser les filtres avec l'URL (seulement pour les filtres non-recherche)
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    Object.entries(appliedFilters).forEach(([key, value]) => {
      // Ne pas mettre à jour l'URL pour chaque changement de recherche
      if (key === 'search' && searchTimeoutRef.current) {
        return; // Skip pendant la saisie
      }
      
      if (value && value !== '' && value !== 1 && value !== false) {
        newSearchParams.set(key, value.toString());
      }
    });

    // Mise à jour de l'URL seulement si ce ne sont pas des changements temporaires de recherche
    if (!searchTimeoutRef.current) {
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [appliedFilters, setSearchParams]);

  // Gestion du changement de filtres (sauf recherche)
  const handleFiltersChange = (newFilters: MediaFilters) => {
    setAppliedFilters(newFilters);
    // Synchroniser l'input de recherche si changé depuis les filtres
    if (newFilters.search !== searchInput) {
      setSearchInput(newFilters.search || '');
    }
  };

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    setAppliedFilters(prev => ({ ...prev, page }));
    // Scroll vers le haut lors du changement de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gestion des favoris
  const handleToggleFavorite = async (mediaId: string, isFavorite: boolean) => {
    try {
      await mediaService.toggleFavorite(mediaId);
    } catch (error) {
      throw error; // Laisser MediaCard gérer l'erreur
    }
  };

  // Génération de données factices pour la démo
  const generateMockData = () => {
    const mockMedia = Array.from({ length: 24 }, (_, index) => ({
      _id: `mock-${index + 1}`,
      title: [
        'Le Seigneur des Anneaux',
        'Inception',
        'Daft Punk - Random Access Memories',
        'One Piece',
        'Interstellar',
        'The Beatles - Abbey Road',
        'Harry Potter à l\'école des sorciers',
        'The Dark Knight',
        'Pink Floyd - The Wall',
        'Naruto',
        'Avatar',
        'Queen - A Night at the Opera'
      ][index % 12],
      type: ['book', 'movie', 'music'][index % 3] as any,
      author: [
        'J.R.R. Tolkien',
        'Christopher Nolan',
        'Daft Punk',
        'Eiichiro Oda',
        'Christopher Nolan',
        'The Beatles'
      ][index % 6],
      year: 2000 + (index % 24),
      available: Math.random() > 0.3,
      description: `Description du média ${index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      imageUrl: `https://picsum.photos/300/400?random=${index + 1}`,
      reviews: [],
      averageRating: Math.random() * 5,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Filtrer selon la recherche si présente
    let filteredMedia = mockMedia;
    if (appliedFilters.search) {
      const searchTerm = appliedFilters.search.toLowerCase();
      filteredMedia = mockMedia.filter(media => 
        media.title.toLowerCase().includes(searchTerm) ||
        media.author.toLowerCase().includes(searchTerm)
      );
    }

    const startIndex = ((appliedFilters.page || 1) - 1) * (appliedFilters.limit || 12);
    const endIndex = startIndex + (appliedFilters.limit || 12);

    return {
      data: filteredMedia.slice(startIndex, endIndex),
      currentPage: appliedFilters.page || 1,
      totalPages: Math.ceil(filteredMedia.length / (appliedFilters.limit || 12)),
      totalItems: filteredMedia.length
    };
  };

  // Utiliser les données factices si pas de données réelles
  const displayData: PaginatedData = mediaData || generateMockData();

  if (mediaError) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">Impossible de charger le catalogue des médias.</p>
          <button
            onClick={() => refetchMedia()}
            className="btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Catalogue des médias
          </h1>
          <p className="text-gray-600 text-lg">
            Découvrez notre collection de livres, films et musiques
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar avec filtres */}
          <aside className={cn(
            'lg:w-80 flex-shrink-0',
            showFilters ? 'block' : 'hidden lg:block'
          )}>
            <div className="sticky top-24">
              <CatalogFilters
                filters={appliedFilters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
                tags={tags}
                loading={mediaLoading}
                searchInput={searchInput}
                onSearchInputChange={handleSearchInputChange}
              />
            </div>
          </aside>

          {/* Contenu principal */}
          <main className="flex-1">
            {/* Barre d'outils */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                {/* Résultats */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden btn-secondary text-sm"
                  >
                    <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                    Filtres
                  </button>
                  
                  <p className="text-sm text-gray-600">
                    {mediaLoading ? (
                      'Chargement...'
                    ) : (
                      <>
                        <span className="font-medium">{displayData.totalItems}</span>
                        {' '}média{displayData.totalItems > 1 ? 's' : ''} trouvé{displayData.totalItems > 1 ? 's' : ''}
                      </>
                    )}
                  </p>
                </div>

                {/* Options d'affichage */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Affichage :</span>
                  <div className="flex rounded-md border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-2 text-sm font-medium transition-colors',
                        viewMode === 'grid'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <Squares2X2Icon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 text-sm font-medium transition-colors border-l border-gray-300',
                        viewMode === 'list'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <ListBulletIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grille des médias */}
            {mediaLoading ? (
              // État de chargement
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des médias...</p>
              </div>
            ) : displayData.data.length > 0 ? (
              <>
                <div className={cn(
                  'grid gap-6 mb-8',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                )}>
                  {displayData.data.map((media) => (
                    <MediaCard
                      key={media._id}
                      media={media}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={displayData.currentPage}
                  totalPages={displayData.totalPages}
                  totalItems={displayData.totalItems}
                  itemsPerPage={appliedFilters.limit || 12}
                  onPageChange={handlePageChange}
                  loading={mediaLoading}
                />
              </>
            ) : (
              // Aucun résultat
              <div className="text-center py-16">
                <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun média trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche.
                </p>
                <button
                  onClick={() => {
                    setAppliedFilters({ page: 1, limit: 12 });
                    handleSearchInputChange('');
                  }}
                  className="btn-primary"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;