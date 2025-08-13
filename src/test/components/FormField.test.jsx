import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  EyeIcon: ({ className, ...props }) => (
    <svg className={className} {...props} data-testid="eye-icon">👁️</svg>
  ),
  EyeSlashIcon: ({ className, ...props }) => (
    <svg className={className} {...props} data-testid="eye-slash-icon">🙈</svg>
  )
}));

// Mock de la fonction cn (utils)
vi.mock('../../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Importer le composant réel
import FormField from '../../components/forms/FormField';

describe('FormField Component', () => {
  const defaultProps = {
    label: 'Test Label',
    name: 'test-field'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le label', () => {
    render(<FormField {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('devrait afficher un input avec le bon type', () => {
    render(<FormField {...defaultProps} type="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('devrait afficher une erreur quand error est fourni', () => {
    render(<FormField {...defaultProps} error="Ce champ est requis" />);
    
    expect(screen.getByText('Ce champ est requis')).toBeInTheDocument();
    expect(screen.getByText('Ce champ est requis')).toHaveClass('text-red-600');
  });

  it('devrait appliquer les classes CSS d\'erreur à l\'input', () => {
    render(<FormField {...defaultProps} error="Erreur" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300');
  });

  it('devrait gérer le toggle de mot de passe', async () => {
    const user = userEvent.setup();
    const onTogglePassword = vi.fn();
    
    render(
      <FormField 
        {...defaultProps} 
        type="password"
        showPasswordToggle={true}
        isPasswordVisible={false}
        onTogglePassword={onTogglePassword}
      />
    );
    
    // Vérifier que l'icône œil est affichée
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    
    // Cliquer sur le bouton toggle
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);
    
    expect(onTogglePassword).toHaveBeenCalledTimes(1);
  });

  it('devrait changer l\'icône selon la visibilité du mot de passe', () => {
    // Test avec mot de passe caché
    const { rerender } = render(
      <FormField 
        {...defaultProps} 
        type="password"
        showPasswordToggle={true}
        isPasswordVisible={false}
      />
    );
    
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    
    // Test avec mot de passe visible
    rerender(
      <FormField 
        {...defaultProps} 
        type="password"
        showPasswordToggle={true}
        isPasswordVisible={true}
      />
    );
    
    expect(screen.getByTestId('eye-slash-icon')).toBeInTheDocument();
  });

  it('devrait afficher un élément à droite quand rightElement est fourni', () => {
    const rightElement = <span data-testid="right-element">🔍</span>;
    
    render(<FormField {...defaultProps} rightElement={rightElement} />);
    
    expect(screen.getByTestId('right-element')).toBeInTheDocument();
  });

  it('devrait appliquer la classe pr-10 quand showPasswordToggle ou rightElement est présent', () => {
    render(<FormField {...defaultProps} showPasswordToggle={true} />);
    
    const input = screen.getByDisplayValue('') || screen.getByRole('textbox');
    expect(input).toHaveClass('pr-10');
  });

  it('devrait passer les props supplémentaires à l\'input', () => {
    render(
      <FormField 
        {...defaultProps} 
        placeholder="Entrez votre email"
        required={true}
        data-testid="custom-input"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Entrez votre email');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('data-testid', 'custom-input');
  });

  it('devrait gérer la référence forwardRef', () => {
    const ref = vi.fn();
    
    render(<FormField {...defaultProps} ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('devrait avoir les classes CSS de base correctes', () => {
    render(<FormField {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'block',
      'w-full',
      'px-3',
      'py-2',
      'border',
      'border-gray-300',
      'rounded-md',
      'shadow-sm'
    );
  });

  it('devrait gérer le focus avec les bonnes classes', () => {
    render(<FormField {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('focus:ring-blue-500', 'focus:border-blue-500');
  });

  it('devrait afficher le point rouge pour les erreurs', () => {
    render(<FormField {...defaultProps} error="Erreur" />);
    
    const errorDot = screen.getByTestId('error-dot');
    expect(errorDot).toHaveClass('bg-red-600', 'rounded-full');
  });
});
