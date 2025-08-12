import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Composant Header simple pour les tests
const Header = ({ title, subtitle, showBackButton = false, onBackClick }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {showBackButton && (
              <button
                onClick={onBackClick}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                data-testid="back-button"
              >
                ← Retour
              </button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900" data-testid="header-title">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500" data-testid="header-subtitle">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

describe('Header Component', () => {
  it('devrait afficher le titre principal', () => {
    render(<Header title="Médiathèque" />);
    
    expect(screen.getByTestId('header-title')).toHaveTextContent('Médiathèque');
  });

  it('devrait afficher le sous-titre quand fourni', () => {
    render(<Header title="Médiathèque" subtitle="Gestion des médias" />);
    
    expect(screen.getByTestId('header-subtitle')).toHaveTextContent('Gestion des médias');
  });

  it('ne devrait pas afficher le sous-titre quand non fourni', () => {
    render(<Header title="Médiathèque" />);
    
    expect(screen.queryByTestId('header-subtitle')).not.toBeInTheDocument();
  });

  it('devrait afficher le bouton retour quand showBackButton est true', () => {
    render(<Header title="Médiathèque" showBackButton={true} />);
    
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('ne devrait pas afficher le bouton retour par défaut', () => {
    render(<Header title="Médiathèque" />);
    
    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
  });

  it('devrait appeler onBackClick quand le bouton retour est cliqué', () => {
    const mockOnBackClick = vi.fn();
    render(<Header title="Médiathèque" showBackButton={true} onBackClick={mockOnBackClick} />);
    
    const backButton = screen.getByTestId('back-button');
    backButton.click();
    
    expect(mockOnBackClick).toHaveBeenCalledTimes(1);
  });

  it('devrait avoir les classes CSS correctes', () => {
    render(<Header title="Médiathèque" />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b');
  });
});
