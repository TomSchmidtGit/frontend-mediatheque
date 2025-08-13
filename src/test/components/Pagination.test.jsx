import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: ({ className, ...props }) => (
    <svg className={className} {...props} data-testid="chevron-left">←</svg>
  ),
  ChevronRightIcon: ({ className, ...props }) => (
    <svg className={className} {...props} data-testid="chevron-right">→</svg>
  )
}));

// Mock de la fonction cn (utils)
vi.mock('../../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Importer le composant réel
import Pagination from '../../components/common/Pagination';

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
    totalItems: 100,
    itemsPerPage: 20
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ne devrait pas s\'afficher s\'il n\'y a qu\'une seule page', () => {
    const { container } = render(
      <Pagination {...defaultProps} totalPages={1} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('devrait afficher les informations de pagination', () => {
    render(<Pagination {...defaultProps} />);
    
    // Vérifier que les nombres sont présents (utiliser getAllByText pour "1")
    expect(screen.getAllByText('1')).toHaveLength(2); // span + button
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('devrait afficher le bon nombre de pages', () => {
    render(<Pagination {...defaultProps} totalPages={3} />);
    
    // Vérifier que chaque page est présente
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('devrait appeler onPageChange quand une page est cliquée', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);
    
    const page2Button = screen.getByText('2');
    await user.click(page2Button);
    
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('devrait désactiver le bouton précédent sur la première page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    const prevButton = screen.getByText('Précédent');
    expect(prevButton).toBeDisabled();
  });

  it('devrait désactiver le bouton suivant sur la dernière page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    
    const nextButton = screen.getByText('Suivant');
    expect(nextButton).toBeDisabled();
  });

  it('devrait mettre en évidence la page courante', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('bg-primary-600');
  });

  it('devrait afficher les ellipses pour beaucoup de pages', () => {
    render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />);
    
    const ellipses = screen.getAllByText('...');
    expect(ellipses).toHaveLength(2);
  });

  it('devrait calculer correctement les éléments affichés', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    // Page 3 avec 20 éléments par page = éléments 41 à 60
    expect(screen.getByText('41')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('devrait gérer le mode loading', () => {
    render(<Pagination {...defaultProps} loading={true} />);
    
    const prevButton = screen.getByText('Précédent');
    const nextButton = screen.getByText('Suivant');
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('devrait appeler onPageChange avec la page précédente', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);
    
    const prevButton = screen.getByText('Précédent');
    await user.click(prevButton);
    
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('devrait appeler onPageChange avec la page suivante', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);
    
    const nextButton = screen.getByText('Suivant');
    await user.click(nextButton);
    
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('devrait afficher correctement les icônes', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
  });
});
