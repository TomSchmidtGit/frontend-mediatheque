import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ScrollToTop from '../../components/common/ScrollToTop';

// Mock de window.scrollTo
const mockScrollTo = vi.fn();

describe('ScrollToTop', () => {
  beforeEach(() => {
    // Reset du mock avant chaque test
    mockScrollTo.mockClear();
    Object.defineProperty(window, 'scrollTo', {
      value: mockScrollTo,
      writable: true
    });
  });

  it('devrait faire défiler vers le haut de la page lors du montage', () => {
    render(
      <BrowserRouter>
        <ScrollToTop />
      </BrowserRouter>
    );

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('devrait faire défiler vers le haut lors des changements de route', () => {
    render(
      <BrowserRouter>
        <ScrollToTop />
      </BrowserRouter>
    );

    // Le composant devrait appeler scrollTo au montage
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('devrait retourner null (composant sans rendu)', () => {
    const { container } = render(
      <BrowserRouter>
        <ScrollToTop />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });
});
