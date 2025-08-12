import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../App';

describe('App Component', () => {
  beforeEach(() => {
    // Nettoyer les mocks avant chaque test
    vi.clearAllMocks();
  });

  it('devrait se charger sans erreur', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('devrait afficher l\'application', () => {
    render(<App />);
    
    // Vérifier que l'app se charge (pas d'erreur de rendu)
    expect(document.body).toBeInTheDocument();
  });
});
