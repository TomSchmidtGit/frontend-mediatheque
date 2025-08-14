import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateBorrowModal from '../../../components/admin/CreateBorrowModal';

// Mock des services
vi.mock('../../../services/adminBorrowService', () => ({
  default: {
    createBorrow: vi.fn()
  }
}));

vi.mock('../../../services/adminUserService', () => ({
  default: {
    getUsers: vi.fn()
  }
}));

vi.mock('../../../services/adminMediaService', () => ({
  default: {
    getMedia: vi.fn()
  }
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock des composants enfants
vi.mock('../../../components/forms/FormField', () => ({
  default: ({ label, type, error, disabled, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        className={`input ${error ? 'border-red-500' : ''}`}
        disabled={disabled}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}));

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: ({ className, ...props }) => <span className={className} {...props}>✕</span>,
  ClockIcon: ({ className, ...props }) => <span className={className} {...props}>🕐</span>,
  UserIcon: ({ className, ...props }) => <span className={className} {...props}>👤</span>,
  BookOpenIcon: ({ className, ...props }) => <span className={className} {...props}>📖</span>,
  MagnifyingGlassIcon: ({ className, ...props }) => <span className={className} {...props}>🔍</span>
}));

// Mock de la fonction cn
vi.mock('../../../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

describe('CreateBorrowModal', () => {
  let queryClient;
  let mockOnClose;
  let mockCreateBorrow;
  let mockGetUsers;
  let mockGetMedia;
  let mockToastSuccess;
  let mockToastError;

  const mockUser = {
    _id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    favorites: [],
    actif: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockMedia = {
    _id: 'media1',
    title: 'Le Petit Prince',
    type: 'book',
    author: 'Antoine de Saint-Exupéry',
    year: 1943,
    available: true,
    description: 'Un conte poétique et philosophique',
    category: { _id: 'cat1', name: 'Littérature', slug: 'litterature' },
    tags: [{ _id: 'tag1', name: 'Roman', slug: 'roman' }],
    imageUrl: 'https://example.com/image.jpg',
    reviews: [],
    averageRating: 4.5,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    mockOnClose = vi.fn();
    mockCreateBorrow = vi.fn();
    mockGetUsers = vi.fn();
    mockGetMedia = vi.fn();
    mockToastSuccess = vi.fn();
    mockToastError = vi.fn();

    // Configuration des mocks
    const adminBorrowService = vi.mocked(await import('../../../services/adminBorrowService'));
    const adminUserService = vi.mocked(await import('../../../services/adminUserService'));
    const adminMediaService = vi.mocked(await import('../../../services/adminMediaService'));
    const toast = vi.mocked(await import('react-hot-toast'));

    adminBorrowService.default.createBorrow = mockCreateBorrow;
    adminUserService.default.getUsers = mockGetUsers;
    adminMediaService.default.getMedia = mockGetMedia;
    toast.default.success = mockToastSuccess;
    toast.default.error = mockToastError;
  });

  const renderModal = (isOpen = true) => {
    // Nettoyer le DOM avant chaque test pour éviter les doublons
    document.body.innerHTML = '';

    // Nettoyer aussi le portail Headless UI
    const portalRoot = document.getElementById('headlessui-portal-root');
    if (portalRoot) {
      portalRoot.innerHTML = '';
    }

    return render(
      <QueryClientProvider client={queryClient}>
        <CreateBorrowModal isOpen={isOpen} onClose={mockOnClose} />
      </QueryClientProvider>
    );
  };

  describe('Rendu du modal', () => {
    it('devrait afficher le modal quand isOpen est true', () => {
      renderModal(true);

      expect(screen.getByText('Créer un nouvel emprunt')).toBeInTheDocument();
      expect(screen.getByText('Enregistrer un emprunt effectué en présentiel')).toBeInTheDocument();
    });

    it('ne devrait pas afficher le modal quand isOpen est false', () => {
      renderModal(false);

      expect(screen.queryByText('Créer un nouvel emprunt')).not.toBeInTheDocument();
    });

    it('devrait afficher tous les champs requis', () => {
      renderModal();

      expect(screen.getByPlaceholderText('Rechercher un utilisateur...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher un média disponible...')).toBeInTheDocument();
      expect(screen.getByText('Date d\'échéance')).toBeInTheDocument();
    });

    it('devrait afficher les boutons d\'action', () => {
      renderModal();

      expect(screen.getByText('Annuler')).toBeInTheDocument();
      expect(screen.getByText('Créer l\'emprunt')).toBeInTheDocument();
    });

    it('devrait afficher les informations importantes', () => {
      renderModal();

      expect(screen.getByText('📋 Informations importantes')).toBeInTheDocument();
      expect(screen.getByText('Contrôlez l\'état du média avant l\'emprunt')).toBeInTheDocument();
      expect(screen.getByText('L\'utilisateur recevra un email de confirmation automatique')).toBeInTheDocument();
      expect(screen.getByText('Un rappel sera envoyé 2 jours avant l\'échéance')).toBeInTheDocument();
    });
  });

  describe('Recherche d\'utilisateurs', () => {
    it('devrait déclencher la recherche après 2 caractères', async () => {
      mockGetUsers.mockResolvedValue({
        data: [mockUser],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      renderModal();

      const userInput = screen.getByPlaceholderText('Rechercher un utilisateur...');
      fireEvent.change(userInput, { target: { value: 'Jo' } });

      await waitFor(() => {
        expect(mockGetUsers).toHaveBeenCalledWith({
          search: 'Jo',
          limit: 10,
          status: 'active'
        });
      });
    });

    it('devrait afficher les résultats de recherche utilisateur', async () => {
      mockGetUsers.mockResolvedValue({
        data: [mockUser],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      renderModal();

      const userInput = screen.getByPlaceholderText('Rechercher un utilisateur...');
      fireEvent.change(userInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    it('devrait permettre la sélection d\'un utilisateur', async () => {
      mockGetUsers.mockResolvedValue({
        data: [mockUser],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      renderModal();

      const userInput = screen.getByPlaceholderText('Rechercher un utilisateur...');
      fireEvent.change(userInput, { target: { value: 'John' } });

      await waitFor(() => {
        const userButton = screen.getByText('John Doe').closest('button');
        fireEvent.click(userButton);
      });

      // Vérifier que l'utilisateur est sélectionné
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('devrait afficher l\'utilisateur sélectionné avec ses informations', async () => {
      mockGetUsers.mockResolvedValue({
        data: [mockUser],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      renderModal();

      const userInput = screen.getByPlaceholderText('Rechercher un utilisateur...');
      fireEvent.change(userInput, { target: { value: 'John' } });

      await waitFor(() => {
        const userButton = screen.getByText('John Doe').closest('button');
        fireEvent.click(userButton);
      });

      // Vérifier que l'utilisateur est sélectionné et affiché
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();

      // Vérifier que l'input utilisateur a la valeur sélectionnée
      expect(userInput.value).toBe('John Doe');
    });
  });

  describe('Recherche de médias', () => {
    it('devrait déclencher la recherche après 2 caractères', async () => {
      mockGetMedia.mockResolvedValue({
        data: [mockMedia],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      renderModal();

      const mediaInput = screen.getByPlaceholderText('Rechercher un média disponible...');
      fireEvent.change(mediaInput, { target: { value: 'Pet' } });

      await waitFor(() => {
        expect(mockGetMedia).toHaveBeenCalledWith({
          search: 'Pet',
          limit: 10,
          available: true
        });
      });
    });

    it('devrait afficher les résultats de recherche média', async () => {
      mockGetMedia.mockResolvedValue({
        data: [mockMedia],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      renderModal();

      const mediaInput = screen.getByPlaceholderText('Rechercher un média disponible...');
      fireEvent.change(mediaInput, { target: { value: 'Petit Prince' } });

      await waitFor(() => {
        expect(screen.getByText('Le Petit Prince')).toBeInTheDocument();
        expect(screen.getByText('Antoine de Saint-Exupéry • 1943')).toBeInTheDocument();
      });
    });

    it('devrait permettre la sélection d\'un média', async () => {
      mockGetMedia.mockResolvedValue({
        data: [mockMedia],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      renderModal();

      const mediaInput = screen.getByPlaceholderText('Rechercher un média disponible...');
      fireEvent.change(mediaInput, { target: { value: 'Petit Prince' } });

      await waitFor(() => {
        const mediaButton = screen.getByText('Le Petit Prince').closest('button');
        fireEvent.click(mediaButton);
      });

      // Vérifier que le média est sélectionné
      expect(screen.getByText('Le Petit Prince')).toBeInTheDocument();
      expect(screen.getByText('Antoine de Saint-Exupéry • 1943')).toBeInTheDocument();
    });

    it('devrait afficher le média sélectionné avec ses informations', async () => {
      mockGetMedia.mockResolvedValue({
        data: [mockMedia],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      renderModal();

      const mediaInput = screen.getByPlaceholderText('Rechercher un média disponible...');
      fireEvent.change(mediaInput, { target: { value: 'Petit Prince' } });

      await waitFor(() => {
        const mediaButton = screen.getByText('Le Petit Prince').closest('button');
        fireEvent.click(mediaButton);
      });

      // Vérifier que le média est sélectionné et affiché
      expect(screen.getByText('Le Petit Prince')).toBeInTheDocument();
      expect(screen.getByText('Antoine de Saint-Exupéry • 1943')).toBeInTheDocument();

      // Vérifier que l'input média a la valeur sélectionnée
      expect(mediaInput.value).toBe('Le Petit Prince');
    });
  });

  describe('Gestion du formulaire', () => {
    it('devrait avoir une date d\'échéance par défaut (14 jours)', () => {
      renderModal();

      const dueDateInput = screen.getByText('Date d\'échéance').nextElementSibling;
      const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      expect(dueDateInput.value).toBe(defaultDate);
    });

    it('devrait désactiver le bouton de soumission si aucun utilisateur ou média n\'est sélectionné', () => {
      renderModal();

      const submitButton = screen.getByText('Créer l\'emprunt');
      expect(submitButton).toBeDisabled();
    });

    it('devrait activer le bouton de soumission quand utilisateur et média sont sélectionnés', async () => {
      mockGetUsers.mockResolvedValue({
        data: [mockUser],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      mockGetMedia.mockResolvedValue({
        data: [mockMedia],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      renderModal();

      // Sélectionner un utilisateur
      const userInput = screen.getByPlaceholderText('Rechercher un utilisateur...');
      fireEvent.change(userInput, { target: { value: 'John' } });

      await waitFor(() => {
        const userButton = screen.getByText('John Doe').closest('button');
        fireEvent.click(userButton);
      });

      // Sélectionner un média
      const mediaInput = screen.getByPlaceholderText('Rechercher un média disponible...');
      fireEvent.change(mediaInput, { target: { value: 'Petit Prince' } });

      await waitFor(() => {
        const mediaButton = screen.getByText('Le Petit Prince').closest('button');
        fireEvent.click(mediaButton);
      });

      const submitButton = screen.getByText('Créer l\'emprunt');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Soumission du formulaire', () => {
    beforeEach(async () => {
      mockGetUsers.mockResolvedValue({
        data: [mockUser],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      mockGetMedia.mockResolvedValue({
        data: [mockMedia],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      mockCreateBorrow.mockResolvedValue({
        _id: 'borrow1',
        user: mockUser,
        media: mockMedia,
        borrowDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'borrowed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    it('devrait créer un emprunt avec succès', async () => {
      renderModal();

      // Sélectionner un utilisateur
      const userInput = screen.getByPlaceholderText('Rechercher un utilisateur...');
      fireEvent.change(userInput, { target: { value: 'John' } });

      await waitFor(() => {
        const userButton = screen.getByText('John Doe').closest('button');
        fireEvent.click(userButton);
      });

      // Sélectionner un média
      const mediaInput = screen.getByPlaceholderText('Rechercher un média disponible...');
      fireEvent.change(mediaInput, { target: { value: 'Petit Prince' } });

      await waitFor(() => {
        const mediaButton = screen.getByText('Le Petit Prince').closest('button');
        fireEvent.click(mediaButton);
      });

      // Soumettre le formulaire
      const submitButton = screen.getByText('Créer l\'emprunt');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateBorrow).toHaveBeenCalledWith({
          userId: 'user1',
          mediaId: 'media1',
          dueDate: expect.any(String)
        });
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Emprunt créé avec succès');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de création', async () => {
      const errorMessage = 'Erreur lors de la création de l\'emprunt';
      mockCreateBorrow.mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      renderModal();

      // Sélectionner un utilisateur et un média
      const userInput = screen.getByPlaceholderText('Rechercher un utilisateur...');
      fireEvent.change(userInput, { target: { value: 'John' } });

      await waitFor(() => {
        const userButton = screen.getByText('John Doe').closest('button');
        fireEvent.click(userButton);
      });

      const mediaInput = screen.getByPlaceholderText('Rechercher un média disponible...');
      fireEvent.change(mediaInput, { target: { value: 'Petit Prince' } });

      await waitFor(() => {
        const mediaButton = screen.getByText('Le Petit Prince').closest('button');
        fireEvent.click(mediaButton);
      });

      // Soumettre le formulaire
      const submitButton = screen.getByText('Créer l\'emprunt');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('devrait soumettre le formulaire avec les bonnes données', async () => {
      renderModal();

      // Sélectionner un utilisateur et un média
      const userInput = screen.getByPlaceholderText('Rechercher un utilisateur...');
      fireEvent.change(userInput, { target: { value: 'John' } });

      await waitFor(() => {
        const userButton = screen.getByText('John Doe').closest('button');
        fireEvent.click(userButton);
      });

      const mediaInput = screen.getByPlaceholderText('Rechercher un média disponible...');
      fireEvent.change(mediaInput, { target: { value: 'Petit Prince' } });

      await waitFor(() => {
        const mediaButton = screen.getByText('Le Petit Prince').closest('button');
        fireEvent.click(mediaButton);
      });

      // Soumettre le formulaire
      const submitButton = screen.getByText('Créer l\'emprunt');
      fireEvent.click(submitButton);

      // Vérifier que le service a été appelé
      await waitFor(() => {
        expect(mockCreateBorrow).toHaveBeenCalledWith({
          userId: 'user1',
          mediaId: 'media1',
          dueDate: expect.any(String)
        });
      });
    });
  });

  describe('Fermeture du modal', () => {
    it('devrait appeler onClose quand le bouton Annuler est cliqué', () => {
      renderModal();

      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('devrait appeler onClose quand le bouton X est cliqué', () => {
      renderModal();

      const closeButton = screen.getByRole('button', { name: /✕/ });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('devrait réinitialiser le formulaire à la fermeture', async () => {
      mockGetUsers.mockResolvedValue({
        data: [mockUser],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      mockGetMedia.mockResolvedValue({
        data: [mockMedia],
        totalItems: 1,
        page: 1,
        limit: 10
      });

      renderModal();

      // Sélectionner un utilisateur et un média
      const userInput = screen.getByPlaceholderText('Rechercher un utilisateur...');
      fireEvent.change(userInput, { target: { value: 'John' } });

      await waitFor(() => {
        const userButton = screen.getByText('John Doe').closest('button');
        fireEvent.click(userButton);
      });

      const mediaInput = screen.getByPlaceholderText('Rechercher un média disponible...');
      fireEvent.change(mediaInput, { target: { value: 'Petit Prince' } });

      await waitFor(() => {
        const mediaButton = screen.getByText('Le Petit Prince').closest('button');
        fireEvent.click(mediaButton);
      });

      // Fermer le modal
      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);

      // Rouvrir le modal
      renderModal();

      // Vérifier que les champs sont vides
      expect(screen.getByPlaceholderText('Rechercher un utilisateur...').value).toBe('');
      expect(screen.getByPlaceholderText('Rechercher un média disponible...').value).toBe('');
    });
  });

  describe('Accessibilité et UX', () => {
    it('devrait avoir des labels appropriés pour tous les champs', () => {
      renderModal();

      expect(screen.getByText('Utilisateur *')).toBeInTheDocument();
      expect(screen.getByText('Média *')).toBeInTheDocument();
      expect(screen.getByText('Date d\'échéance')).toBeInTheDocument();
    });

    it('devrait avoir des placeholders informatifs', () => {
      renderModal();

      expect(screen.getByPlaceholderText('Rechercher un utilisateur...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher un média disponible...')).toBeInTheDocument();
    });

    it('devrait afficher des messages d\'aide pour la date d\'échéance', () => {
      renderModal();

      expect(screen.getByText('Par défaut : 14 jours à partir d\'aujourd\'hui')).toBeInTheDocument();
    });

    it('devrait avoir des icônes visuelles appropriées', () => {
      renderModal();

      expect(screen.getAllByText('🕐')).toHaveLength(2); // ClockIcon (header + info)
      expect(screen.getByText('👤')).toBeInTheDocument(); // UserIcon
      expect(screen.getByText('📖')).toBeInTheDocument(); // BookOpenIcon
    });
  });
});
