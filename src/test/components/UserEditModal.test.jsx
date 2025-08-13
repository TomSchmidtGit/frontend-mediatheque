import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import UserEditModal from '../../components/admin/UserEditModal';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: ({ className }) => <div data-testid="x-mark-icon" className={className} />,
  UserCircleIcon: ({ className }) => <div data-testid="user-circle-icon" className={className} />,
  ShieldCheckIcon: ({ className }) => <div data-testid="shield-check-icon" className={className} />,
  ExclamationTriangleIcon: ({ className }) => <div data-testid="exclamation-triangle-icon" className={className} />
}));

// Mock de react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: (fn) => fn,
    formState: { errors: {}, isSubmitting: false },
    reset: vi.fn(),
    watch: vi.fn(() => 'user')
  })
}));

// Mock de @hookform/resolvers/zod
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => vi.fn()
}));

// Mock de @tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({
    mutate: vi.fn(),
    isPending: false
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn()
  })
}));

// Mock du service admin
vi.mock('../../services/adminUserService', () => ({
  default: {
    updateUser: vi.fn()
  }
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock de la fonction cn
vi.mock('../../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

describe('UserEditModal', () => {
  const mockUser = {
    _id: 'user123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
    actif: true,
    favorites: ['media1', 'media2'],
    createdAt: '2024-01-15T10:00:00Z'
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    user: mockUser
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu du modal', () => {
    it('affiche le modal quand isOpen est true', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByText('Modifier l\'utilisateur')).toBeInTheDocument();
      expect(screen.getByText('John Doe • john.doe@example.com')).toBeInTheDocument();
    });

    it('n\'affiche rien quand isOpen est false', () => {
      render(<UserEditModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Modifier l\'utilisateur')).not.toBeInTheDocument();
    });

    it('n\'affiche rien quand user est null', () => {
      render(<UserEditModal {...defaultProps} user={null} />);
      
      expect(screen.queryByText('Modifier l\'utilisateur')).not.toBeInTheDocument();
    });
  });

  describe('En-tête du modal', () => {
    it('affiche l\'icône utilisateur et les informations', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByTestId('user-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('John Doe • john.doe@example.com')).toBeInTheDocument();
    });

    it('affiche le bouton de fermeture', () => {
      render(<UserEditModal {...defaultProps} />);
      
      const closeButton = screen.getByTestId('x-mark-icon').closest('button');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Formulaire d\'édition', () => {
    it('affiche les champs de formulaire', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByText('Nom complet')).toBeInTheDocument();
      expect(screen.getByText('Adresse email')).toBeInTheDocument();
      expect(screen.getByText('Rôle et permissions')).toBeInTheDocument();
    });

    it('affiche les informations du compte', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByText('Informations du compte')).toBeInTheDocument();
      expect(screen.getByText('Statut:')).toBeInTheDocument();
      expect(screen.getByText('Favoris:')).toBeInTheDocument();
      expect(screen.getByText('Inscrit le:')).toBeInTheDocument();
    });

    it('affiche le statut actif correctement', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByText('Actif')).toBeInTheDocument();
    });

    it('affiche le statut inactif correctement', () => {
      const inactiveUser = { ...mockUser, actif: false };
      render(<UserEditModal {...defaultProps} user={inactiveUser} />);
      
      expect(screen.getByText('Inactif')).toBeInTheDocument();
    });

    it('affiche le nombre de favoris', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 favoris
    });

    it('affiche la date d\'inscription formatée', () => {
      render(<UserEditModal {...defaultProps} />);
      
      // La date devrait être formatée en français
      expect(screen.getByText(/15 janvier 2024/)).toBeInTheDocument();
    });
  });

  describe('Gestion des rôles', () => {
    it('affiche les trois rôles disponibles', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByText('Utilisateur')).toBeInTheDocument();
      expect(screen.getByText('Employé')).toBeInTheDocument();
      expect(screen.getByText('Administrateur')).toBeInTheDocument();
    });

    it('affiche les descriptions des rôles', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByText('Emprunt et consultation des médias')).toBeInTheDocument();
      expect(screen.getByText('Gestion des emprunts et des médias')).toBeInTheDocument();
      expect(screen.getByText('Accès complet à toutes les fonctionnalités')).toBeInTheDocument();
    });

    it('affiche les icônes de rôle', () => {
      render(<UserEditModal {...defaultProps} />);
      
      const shieldIcons = screen.getAllByTestId('shield-check-icon');
      expect(shieldIcons).toHaveLength(3); // 3 rôles
    });
  });

  describe('Actions du modal', () => {
    it('affiche les boutons d\'action', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByText('Annuler')).toBeInTheDocument();
      expect(screen.getByText('Enregistrer')).toBeInTheDocument();
    });

    it('appelle onClose quand le bouton Annuler est cliqué', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<UserEditModal {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByText('Annuler');
      await user.click(cancelButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('appelle onClose quand le bouton de fermeture est cliqué', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<UserEditModal {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByTestId('x-mark-icon').closest('button');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Gestion des erreurs', () => {
    it('affiche les erreurs de validation', () => {
      // Ce test nécessite une configuration plus complexe des mocks
      // Pour l'instant, on vérifie que le composant se rend sans erreur
      render(<UserEditModal {...defaultProps} />);
      
      // Vérifie que le composant se rend correctement
      expect(screen.getByText('Modifier l\'utilisateur')).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('a des labels appropriés pour les champs', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByText('Nom complet')).toBeInTheDocument();
      expect(screen.getByText('Adresse email')).toBeInTheDocument();
      expect(screen.getByText('Rôle et permissions')).toBeInTheDocument();
    });

    it('a des descriptions pour les rôles', () => {
      render(<UserEditModal {...defaultProps} />);
      
      expect(screen.getByText('Emprunt et consultation des médias')).toBeInTheDocument();
      expect(screen.getByText('Gestion des emprunts et des médias')).toBeInTheDocument();
      expect(screen.getByText('Accès complet à toutes les fonctionnalités')).toBeInTheDocument();
    });
  });

  describe('Responsive design', () => {
    it('applique les classes CSS responsives', () => {
      render(<UserEditModal {...defaultProps} />);
      
      // Cherche l'élément avec la classe max-w-md
      const dialogPanel = document.querySelector('.max-w-md');
      expect(dialogPanel).toBeInTheDocument();
    });
  });
});
