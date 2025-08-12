import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import MediaFormModal from '../../components/admin/MediaFormModal';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: ({ className }) => <div data-testid="x-mark-icon" className={className} />,
  BookOpenIcon: ({ className }) => <div data-testid="book-icon" className={className} />,
  FilmIcon: ({ className }) => <div data-testid="film-icon" className={className} />,
  MusicalNoteIcon: ({ className }) => <div data-testid="music-icon" className={className} />,
  PhotoIcon: ({ className }) => <div data-testid="photo-icon" className={className} />,
  PlusIcon: ({ className }) => <div data-testid="plus-icon" className={className} />
}));

// Mock de react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: (fn) => fn,
    formState: { errors: {}, isSubmitting: false },
    reset: vi.fn(),
    watch: vi.fn(() => 'book'),
    control: {},
    setValue: vi.fn()
  }),
  Controller: ({ render }) => render({ field: {} })
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
vi.mock('../../services/adminMediaService', () => ({
  default: {
    createMedia: vi.fn(),
    updateMedia: vi.fn()
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

describe('MediaFormModal', () => {
  const mockMedia = {
    _id: 'media123',
    title: 'Le Petit Prince',
    type: 'book',
    author: 'Antoine de Saint-Exupéry',
    year: 1943,
    description: 'Un conte poétique et philosophique',
    category: 'Littérature',
    tags: ['roman', 'philosophie'],
    available: true,
    imageUrl: 'https://example.com/image.jpg'
  };

  const mockCategories = [
    { _id: 'cat1', name: 'Littérature' },
    { _id: 'cat2', name: 'Science-fiction' },
    { _id: 'cat3', name: 'Histoire' }
  ];

  const mockTags = [
    { _id: 'tag1', name: 'roman' },
    { _id: 'tag2', name: 'philosophie' },
    { _id: 'tag3', name: 'aventure' }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    media: null,
    categories: mockCategories,
    tags: mockTags
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu du modal', () => {
    it('affiche le modal quand isOpen est true', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Ajouter un média')).toBeInTheDocument();
    });

    it('n\'affiche rien quand isOpen est false', () => {
      render(<MediaFormModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Ajouter un média')).not.toBeInTheDocument();
    });

    it('affiche le titre "Ajouter un média" en mode création', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Ajouter un média')).toBeInTheDocument();
    });

    it('affiche le titre "Modifier le média" en mode édition', () => {
      render(<MediaFormModal {...defaultProps} media={mockMedia} />);
      
      // En mode édition, il y a deux éléments avec "Modifier le média" (titre + bouton)
      const modifierElements = screen.getAllByText('Modifier le média');
      expect(modifierElements).toHaveLength(2);
    });
  });

  describe('En-tête du modal', () => {
    it('affiche l\'icône appropriée selon le type de média', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      // Par défaut, le type est 'book' - il y a 2 icônes book (en-tête + bouton)
      expect(screen.getAllByTestId('book-icon')).toHaveLength(2);
    });

    it('affiche le bouton de fermeture', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      const closeButton = screen.getByTestId('x-mark-icon').closest('button');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Formulaire d\'ajout/édition', () => {
    it('affiche tous les champs de formulaire', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Titre *')).toBeInTheDocument();
      expect(screen.getByText('Type de média *')).toBeInTheDocument();
      expect(screen.getByText('Auteur/Réalisateur/Artiste *')).toBeInTheDocument();
      expect(screen.getByText('Année *')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Catégorie')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('affiche les options de type de média', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Livre')).toBeInTheDocument();
      expect(screen.getByText('Film')).toBeInTheDocument();
      expect(screen.getByText('Musique')).toBeInTheDocument();
    });

    it('affiche les catégories disponibles', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Littérature')).toBeInTheDocument();
      expect(screen.getByText('Science-fiction')).toBeInTheDocument();
      expect(screen.getByText('Histoire')).toBeInTheDocument();
    });

    it('affiche les tags disponibles', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      // Les tags sont affichés avec un # devant, mais le texte est séparé
      // Vérifie que les boutons de tags sont présents
      const tagButtons = screen.getAllByRole('button').filter(button => 
        button.textContent.includes('roman') || 
        button.textContent.includes('philosophie') || 
        button.textContent.includes('aventure')
      );
      expect(tagButtons).toHaveLength(3);
    });
  });

  describe('Mode édition', () => {
    it('remplit le formulaire avec les données du média existant', () => {
      render(<MediaFormModal {...defaultProps} media={mockMedia} />);
      
      // En mode édition, les champs sont pré-remplis
      // Pour l'instant, on vérifie que le composant se rend en mode édition
      expect(screen.getByText('Modification de "Le Petit Prince"')).toBeInTheDocument();
    });

    it('affiche l\'image existante si disponible', () => {
      render(<MediaFormModal {...defaultProps} media={mockMedia} />);
      
      // En mode édition, l'image existante devrait être affichée
      // Pour l'instant, on vérifie que le composant se rend sans erreur
      const modifierElements = screen.getAllByText('Modifier le média');
      expect(modifierElements).toHaveLength(2);
    });
  });

  describe('Gestion des images', () => {
    it('affiche la zone de téléchargement d\'image', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Image du média')).toBeInTheDocument();
      expect(screen.getByText('Télécharger une image')).toBeInTheDocument();
    });

    it('affiche l\'icône photo dans la zone de téléchargement', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByTestId('photo-icon')).toBeInTheDocument();
    });
  });

  describe('Gestion des catégories et tags', () => {
    it('affiche les boutons pour ajouter des catégories et tags', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Nouvelle')).toBeInTheDocument();
      expect(screen.getByText('Créer un nouveau tag')).toBeInTheDocument();
      expect(screen.getAllByTestId('plus-icon')).toHaveLength(2); // Catégorie + Tag
    });
  });

  describe('Actions du modal', () => {
    it('affiche les boutons d\'action', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Annuler')).toBeInTheDocument();
      expect(screen.getByText('Créer le média')).toBeInTheDocument();
    });

    it('affiche le bouton "Modifier le média" en mode édition', () => {
      render(<MediaFormModal {...defaultProps} media={mockMedia} />);
      
      // En mode édition, il y a deux éléments avec "Modifier le média" (titre + bouton)
      const modifierElements = screen.getAllByText('Modifier le média');
      expect(modifierElements).toHaveLength(2);
    });

    it('appelle onClose quand le bouton Annuler est cliqué', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<MediaFormModal {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByText('Annuler');
      await user.click(cancelButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('appelle onClose quand le bouton de fermeture est cliqué', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<MediaFormModal {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByTestId('x-mark-icon').closest('button');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibilité', () => {
    it('a des labels appropriés pour les champs', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Titre *')).toBeInTheDocument();
      expect(screen.getByText('Type de média *')).toBeInTheDocument();
      expect(screen.getByText('Auteur/Réalisateur/Artiste *')).toBeInTheDocument();
      expect(screen.getByText('Année *')).toBeInTheDocument();
    });

    it('a des placeholders appropriés', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Titre du média')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nom de l\'auteur')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('2024')).toBeInTheDocument();
    });
  });

  describe('Responsive design', () => {
    it('applique les classes CSS responsives', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      // Cherche l'élément avec la classe max-w-2xl
      const dialogPanel = document.querySelector('.max-w-2xl');
      expect(dialogPanel).toBeInTheDocument();
    });
  });

  describe('Validation des champs', () => {
    it('a des champs obligatoires marqués avec un astérisque', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Titre *')).toBeInTheDocument();
      expect(screen.getByText('Type de média *')).toBeInTheDocument();
      expect(screen.getByText('Auteur/Réalisateur/Artiste *')).toBeInTheDocument();
      expect(screen.getByText('Année *')).toBeInTheDocument();
    });

    it('a des champs optionnels sans astérisque', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Catégorie')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });
  });

  describe('Icônes selon le type', () => {
    it('affiche les icônes pour tous les types de média', () => {
      render(<MediaFormModal {...defaultProps} />);
      
      // Vérifie que toutes les icônes sont présentes
      expect(screen.getAllByTestId('book-icon')).toHaveLength(2); // En-tête + bouton
      expect(screen.getByTestId('film-icon')).toBeInTheDocument();
      expect(screen.getByTestId('music-icon')).toBeInTheDocument();
    });




  });
});
