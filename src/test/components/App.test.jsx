import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '../utils/testUtils.jsx';
import App from '../../App';

describe('App Component', () => {
  beforeEach(() => {
    // Nettoyer les mocks avant chaque test
    vi.clearAllMocks();
  });

  it('devrait se charger sans erreur', () => {
    expect(() => renderWithProviders(<App />)).not.toThrow();
  });

  it('devrait afficher l\'application', () => {
    renderWithProviders(<App />);
    
    // Vérifier que l'app se charge (pas d'erreur de rendu)
    expect(document.body).toBeInTheDocument();
  });
});
