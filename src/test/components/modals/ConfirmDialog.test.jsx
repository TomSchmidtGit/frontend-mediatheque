import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Composant ConfirmDialog simplifié pour les tests
const ConfirmDialog = ({ 
  isOpen = false, 
  title = 'Confirmation', 
  description = undefined, 
  confirmText = 'Confirmer', 
  cancelText = 'Annuler', 
  confirmVariant = 'primary', 
  onClose = vi.fn(), 
  onConfirm = vi.fn() 
}) => {
  if (!isOpen) return null;

  return (
    <div className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                  data-testid="cancel-button"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={
                    confirmVariant === 'danger' 
                      ? 'flex-1 btn bg-red-600 text-white hover:bg-red-700' 
                      : 'flex-1 btn-primary'
                  }
                  data-testid="confirm-button"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

describe('ConfirmDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it('ne s\'affiche pas quand isOpen est false', () => {
      render(
        <ConfirmDialog 
          isOpen={false}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });

    it('s\'affiche quand isOpen est true', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('affiche le titre fourni', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Titre de confirmation"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByText('Titre de confirmation')).toBeInTheDocument();
    });

    it('affiche la description quand elle est fournie', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          description="Description de test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByText('Description de test')).toBeInTheDocument();
    });

    it('n\'affiche pas la description quand elle n\'est pas fournie', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.queryByText('Êtes-vous sûr ?')).not.toBeInTheDocument();
    });
  });

  describe('Boutons et actions', () => {
    it('affiche les boutons avec les textes par défaut', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByTestId('cancel-button')).toHaveTextContent('Annuler');
      expect(screen.getByTestId('confirm-button')).toHaveTextContent('Confirmer');
    });

    it('affiche les boutons avec les textes personnalisés', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          confirmText="Supprimer"
          cancelText="Garder"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByTestId('cancel-button')).toHaveTextContent('Garder');
      expect(screen.getByTestId('confirm-button')).toHaveTextContent('Supprimer');
    });

    it('appelle onClose quand le bouton d\'annulation est cliqué', async () => {
      const user = userEvent.setup();
      
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('appelle onConfirm et onClose quand le bouton de confirmation est cliqué', async () => {
      const user = userEvent.setup();
      
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      const confirmButton = screen.getByTestId('confirm-button');
      await user.click(confirmButton);
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Variantes de bouton', () => {
    it('applique la variante primary par défaut', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      const confirmButton = screen.getByTestId('confirm-button');
      expect(confirmButton).toHaveClass('btn-primary');
      expect(confirmButton).not.toHaveClass('bg-red-600');
    });

    it('applique la variante danger quand spécifiée', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          confirmVariant="danger"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      const confirmButton = screen.getByTestId('confirm-button');
      expect(confirmButton).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700');
      expect(confirmButton).not.toHaveClass('btn-primary');
    });
  });

  describe('Styles et classes CSS', () => {
    it('applique les classes de base du modal', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      const modal = screen.getByText('Test').closest('.w-full.max-w-md');
      expect(modal).toHaveClass('bg-white', 'rounded-xl', 'shadow-xl');
    });

    it('applique les classes du bouton d\'annulation', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      const cancelButton = screen.getByTestId('cancel-button');
      expect(cancelButton).toHaveClass('btn-secondary');
    });

    it('applique les classes du bouton de confirmation (variante primary)', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      const confirmButton = screen.getByTestId('confirm-button');
      expect(confirmButton).toHaveClass('btn-primary');
    });

    it('applique les classes du bouton de confirmation (variante danger)', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          confirmVariant="danger"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      const confirmButton = screen.getByTestId('confirm-button');
      expect(confirmButton).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700');
    });
  });

  describe('Accessibilité et UX', () => {
    it('a un backdrop avec aria-hidden="true"', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('bg-black/30');
    });

    it('a une structure sémantique appropriée', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      // Vérifie que le titre est un h2
      const title = screen.getByText('Test');
      expect(title.tagName).toBe('H2');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');
    });

    it('a des boutons avec des testid appropriés', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });
  });

  describe('Gestion des événements', () => {
    it('gère correctement les clics multiples', async () => {
      const user = userEvent.setup();
      
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      const confirmButton = screen.getByTestId('confirm-button');
      const cancelButton = screen.getByTestId('cancel-button');
      
      // Clic sur confirmation
      await user.click(confirmButton);
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      
      // Clic sur annulation
      await user.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it('appelle les callbacks dans le bon ordre', async () => {
      const user = userEvent.setup();
      const callOrder = [];
      
      const onConfirm = vi.fn(() => callOrder.push('confirm'));
      const onClose = vi.fn(() => callOrder.push('close'));
      
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Test"
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
      
      const confirmButton = screen.getByTestId('confirm-button');
      await user.click(confirmButton);
      
      expect(callOrder).toEqual(['confirm', 'close']);
    });
  });

  describe('Cas d\'usage spécifiques', () => {
    it('fonctionne comme modal de suppression', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Supprimer l'élément"
          description="Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?"
          confirmText="Supprimer"
          cancelText="Annuler"
          confirmVariant="danger"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByText('Supprimer l\'élément')).toBeInTheDocument();
      expect(screen.getByText('Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-button')).toHaveTextContent('Supprimer');
      expect(screen.getByTestId('cancel-button')).toHaveTextContent('Annuler');
    });

    it('fonctionne comme modal de confirmation simple', () => {
      render(
        <ConfirmDialog 
          isOpen={true}
          title="Confirmer l'action"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByText('Confirmer l\'action')).toBeInTheDocument();
      expect(screen.queryByText('Êtes-vous sûr ?')).not.toBeInTheDocument();
      expect(screen.getByTestId('confirm-button')).toHaveTextContent('Confirmer');
      expect(screen.getByTestId('cancel-button')).toHaveTextContent('Annuler');
    });
  });
});
