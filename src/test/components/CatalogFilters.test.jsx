import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CatalogFilters from '../../components/catalog/CatalogFilters';

// Mock des utilitaires
vi.mock('../../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Données de test
const mockCategories = [
  { _id: 'fiction', name: 'Fiction' },
  { _id: 'non-fiction', name: 'Non-Fiction' },
  { _id: 'science-fiction', name: 'Science-Fiction' }
];

const mockTags = [
  { _id: 'action', name: 'Action' },
  { _id: 'drame', name: 'Drame' },
  { _id: 'comedie', name: 'Comédie' }
];

const mockFilters = {
  page: 1,
  limit: 12,
  type: '',
  category: '',
  tags: ''
};

describe('CatalogFilters', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnSearchInputChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le titre "Filtres" avec l\'icône', () => {
    render(
      <CatalogFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    expect(screen.getByText('Filtres')).toBeInTheDocument();
    expect(screen.getByText('Filtres')).toHaveClass('text-lg', 'font-semibold');
  });

  it('devrait afficher le champ de recherche avec l\'icône de loupe', () => {
    render(
      <CatalogFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Titre, auteur, description...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('input', 'pl-10');
  });

  it('devrait appeler onSearchInputChange lors de la saisie dans le champ de recherche', () => {
    render(
      <CatalogFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Titre, auteur, description...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(mockOnSearchInputChange).toHaveBeenCalledWith('test');
  });

  it('devrait afficher les types de médias avec leurs icônes', () => {
    render(
      <CatalogFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    expect(screen.getByText('Livres')).toBeInTheDocument();
    expect(screen.getByText('Films')).toBeInTheDocument();
    expect(screen.getByText('Musique')).toBeInTheDocument();
  });

  it('devrait appeler onFiltersChange lors de la sélection d\'un type de média', () => {
    render(
      <CatalogFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const bookTypeButton = screen.getByText('Livres');
    fireEvent.click(bookTypeButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      type: 'book',
      page: 1
    });
  });

  it('devrait afficher les catégories disponibles', () => {
    render(
      <CatalogFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('Non-Fiction')).toBeInTheDocument();
    expect(screen.getByText('Science-Fiction')).toBeInTheDocument();
  });

  it('devrait appeler onFiltersChange lors de la sélection d\'une catégorie', () => {
    render(
      <CatalogFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const fictionCategory = screen.getByText('Fiction');
    fireEvent.click(fictionCategory);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      category: 'fiction',
      page: 1
    });
  });

  it('devrait afficher les tags disponibles', () => {
    render(
      <CatalogFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    expect(screen.getByText('#Action')).toBeInTheDocument();
    expect(screen.getByText('#Drame')).toBeInTheDocument();
    expect(screen.getByText('#Comédie')).toBeInTheDocument();
  });

  it('devrait appeler onFiltersChange lors de la sélection d\'un tag', () => {
    render(
      <CatalogFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const actionTag = screen.getByText('#Action');
    fireEvent.click(actionTag);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      tags: 'action',
      page: 1
    });
  });

  it('devrait permettre la sélection multiple de tags', () => {
    const filtersWithTags = { ...mockFilters, tags: 'action' };
    
    render(
      <CatalogFilters
        filters={filtersWithTags}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const drameTag = screen.getByText('#Drame');
    fireEvent.click(drameTag);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithTags,
      tags: 'action,drame',
      page: 1
    });
  });

  it('devrait afficher le bouton "Tout effacer" quand des filtres sont actifs', () => {
    const activeFilters = { ...mockFilters, type: 'book', category: 'fiction' };
    
    render(
      <CatalogFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput="test"
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const clearButton = screen.getByText('Tout effacer');
    expect(clearButton).toBeInTheDocument();
  });

  it('devrait ne pas afficher le bouton "Tout effacer" quand aucun filtre n\'est actif', () => {
    // S'assurer qu'aucun filtre n'est actif
    const emptyFilters = {
      page: 1,
      limit: 12,
      type: '',
      category: '',
      tags: ''
    };
    
    render(
      <CatalogFilters
        filters={emptyFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const clearButton = screen.queryByText('Tout effacer');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('devrait appeler onFiltersChange avec des filtres réinitialisés lors du clic sur "Tout effacer"', () => {
    const activeFilters = { ...mockFilters, type: 'book', category: 'fiction' };
    
    render(
      <CatalogFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput="test"
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const clearButton = screen.getByText('Tout effacer');
    fireEvent.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      page: 1,
      limit: 12
    });
  });

  it('devrait désactiver les champs quand loading est true', () => {
    render(
      <CatalogFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        loading={true}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Titre, auteur, description...');
    expect(searchInput).toBeDisabled();
  });

  it('devrait réinitialiser la page à 1 lors de tout changement de filtre', () => {
    const filtersWithPage = { ...mockFilters, page: 3 };
    
    render(
      <CatalogFilters
        filters={filtersWithPage}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        tags={mockTags}
        searchInput=""
        onSearchInputChange={mockOnSearchInputChange}
      />
    );

    const bookTypeButton = screen.getByText('Livres');
    fireEvent.click(bookTypeButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithPage,
      type: 'book',
      page: 1
    });
  });
});
