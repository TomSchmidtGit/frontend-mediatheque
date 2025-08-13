// src/components/catalog/CatalogFilters.tsx
import React from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import type { MediaFilters, Category, Tag } from '../../types';
import { cn } from '../../utils';

interface CatalogFiltersProps {
  filters: MediaFilters;
  onFiltersChange: (filters: MediaFilters) => void;
  categories: Category[];
  tags: Tag[];
  loading?: boolean;
  searchInput: string;
  onSearchInputChange: (search: string) => void;
}

const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  tags,
  loading = false,
  searchInput,
  onSearchInputChange,
}) => {
  // Types de médias avec icônes
  const mediaTypes = [
    {
      value: 'book',
      label: 'Livres',
      icon: BookOpenIcon,
      color: 'text-blue-600',
    },
    {
      value: 'movie',
      label: 'Films',
      icon: FilmIcon,
      color: 'text-purple-600',
    },
    {
      value: 'music',
      label: 'Musique',
      icon: MusicalNoteIcon,
      color: 'text-green-600',
    },
  ];

  // Mise à jour des filtres
  const updateFilter = (key: keyof MediaFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset à la première page lors du changement de filtre
    });
  };

  // Réinitialiser tous les filtres
  const clearAllFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 12,
    });
  };

  // ✅ Vérifier si des filtres sont actifs (SANS favorites)
  const hasActiveFilters = !!(
    searchInput ||
    filters.type ||
    filters.category ||
    filters.tags
  );

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <FunnelIcon className='h-5 w-5 text-gray-400' />
          <h3 className='text-lg font-semibold text-gray-900'>Filtres</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className='text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1'
          >
            <XMarkIcon className='h-4 w-4' />
            <span>Tout effacer</span>
          </button>
        )}
      </div>

      {/* Recherche */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>
          Rechercher
        </label>
        <div className='relative'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Titre, auteur, description...'
            value={searchInput}
            onChange={e => onSearchInputChange(e.target.value)}
            className='input pl-10 w-full'
            disabled={loading}
          />
          {searchInput && (
            <button
              onClick={() => onSearchInputChange('')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              <XMarkIcon className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>

      {/* Type de média */}
      <div className='space-y-3'>
        <label className='block text-sm font-medium text-gray-700'>
          Type de média
        </label>
        <div className='grid grid-cols-3 gap-2'>
          {mediaTypes.map(type => {
            const isSelected = filters.type === type.value;
            const Icon = type.icon;

            return (
              <button
                key={type.value}
                onClick={() =>
                  updateFilter('type', isSelected ? '' : type.value)
                }
                disabled={loading}
                className={cn(
                  'flex flex-col items-center space-y-2 p-3 rounded-lg border transition-all duration-200',
                  'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  isSelected
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isSelected ? type.color : 'text-gray-400'
                  )}
                />
                <span className='text-xs font-medium'>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catégories */}
      {categories.length > 0 && (
        <div className='space-y-3'>
          <label className='block text-sm font-medium text-gray-700'>
            Catégorie
          </label>
          <select
            value={filters.category || ''}
            onChange={e => updateFilter('category', e.target.value)}
            disabled={loading}
            className='input w-full text-base'
          >
            <option value=''>Toutes les catégories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className='space-y-3'>
          <label className='block text-sm font-medium text-gray-700'>
            Tags populaires
          </label>
          <div className='flex flex-wrap gap-2 max-h-32 overflow-y-auto'>
            {tags.slice(0, 15).map(tag => {
              const isSelected = filters.tags?.includes(tag._id);

              return (
                <button
                  key={tag._id}
                  onClick={() => {
                    const currentTags =
                      filters.tags?.split(',').filter(Boolean) || [];
                    const newTags = isSelected
                      ? currentTags.filter(id => id !== tag._id)
                      : [...currentTags, tag._id];

                    updateFilter('tags', newTags.join(','));
                  }}
                  disabled={loading}
                  className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    isSelected
                      ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  #{tag.name}
                  {isSelected && <XMarkIcon className='ml-1 h-3 w-3' />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Résumé des filtres actifs */}
      {hasActiveFilters && (
        <div className='pt-4 border-t border-gray-200'>
          <p className='text-sm text-gray-600 mb-2'>Filtres actifs :</p>
          <div className='flex flex-wrap gap-2'>
            {searchInput && (
              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                Recherche: "{searchInput}"
                <button
                  onClick={() => onSearchInputChange('')}
                  className='ml-1 hover:text-blue-600'
                >
                  <XMarkIcon className='h-3 w-3' />
                </button>
              </span>
            )}

            {filters.type && (
              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                Type: {mediaTypes.find(t => t.value === filters.type)?.label}
                <button
                  onClick={() => updateFilter('type', '')}
                  className='ml-1 hover:text-purple-600'
                >
                  <XMarkIcon className='h-3 w-3' />
                </button>
              </span>
            )}

            {filters.category && (
              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                Catégorie:{' '}
                {categories.find(c => c._id === filters.category)?.name}
                <button
                  onClick={() => updateFilter('category', '')}
                  className='ml-1 hover:text-green-600'
                >
                  <XMarkIcon className='h-3 w-3' />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogFilters;
