import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Composant Button simple pour les tests
const Button = ({ children, onClick, variant = 'primary', disabled = false }) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  
  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  );
};

describe('Button Component', () => {
  it('devrait afficher le texte fourni', () => {
    render(<Button>Cliquez-moi</Button>);
    
    expect(screen.getByText('Cliquez-moi')).toBeInTheDocument();
  });

  it('devrait appeler onClick quand cliqué', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Cliquez-moi</Button>);
    
    const button = screen.getByTestId('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('devrait avoir la classe CSS correcte selon la variante', () => {
    render(<Button variant="danger">Supprimer</Button>);
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('devrait être désactivé quand disabled est true', () => {
    render(<Button disabled>Désactivé</Button>);
    
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });

  it('devrait avoir la variante primary par défaut', () => {
    render(<Button>Défaut</Button>);
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-blue-600');
  });
});
