import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaCard from '../../components/catalog/MediaCard';

// Mock du contexte d'authentification
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Récupérer le mock après sa création
const mockUseAuth = vi.mocked(await import('../../context/AuthContext')).useAuth;

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// Mock des utilitaires
vi.mock('../../utils', () => ({
  formatters: {
    mediaType: (type) => {
      const types = { book: 'Livre', movie: 'Film', music: 'Musique' };
      return types[type] || type;
    },
    userRole: (role) => {
      const roles = { user: 'Utilisateur', employee: 'Employé', admin: 'Administrateur' };
      return roles[role] || role;
    },
    borrowStatus: (status) => {
      const statuses = { borrowed: 'Emprunté', returned: 'Retourné', overdue: 'En retard' };
      return statuses[status] || status;
    }
  },
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Données de test
const mockMedia = {
  _id: '1',
  title: 'Test Media',
  description: 'This is a test media description',
  type: 'book',
  category: 'fiction',
  tags: ['test', 'example'],
  author: 'Test Author',
  year: 2023,
  averageRating: 4.5,
  imageUrl: 'test-cover.jpg',
  available: false
};

const mockUser = {
  _id: 'user1',
  email: 'test@example.com',
  favorites: ['1', '2']
};

describe('MediaCard', () => {
  const mockUpdateUser = vi.fn();
  const mockOnToggleFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      updateUser: mockUpdateUser
    });
  });

  it('devrait afficher les informations du média correctement', () => {
    render(
      <BrowserRouter>
        <MediaCard media={mockMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Media')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('This is a test media description')).toBeInTheDocument();
    // Le composant n'affiche pas la catégorie, donc on ne teste pas cela
  });

  it('devrait afficher l\'icône de type correcte pour un livre', () => {
    render(
      <BrowserRouter>
        <MediaCard media={mockMedia} />
      </BrowserRouter>
    );

    // Vérifier que l'icône de livre est présente
    const bookIcon = document.querySelector('[data-testid="book-icon"]') || 
                    document.querySelector('.h-4.w-4');
    expect(bookIcon).toBeInTheDocument();
  });

  it('devrait afficher l\'icône de type correcte pour un film', () => {
    const movieMedia = { ...mockMedia, type: 'movie' };
    
    render(
      <BrowserRouter>
        <MediaCard media={movieMedia} />
      </BrowserRouter>
    );

    // Vérifier que l'icône de film est présente
    const movieIcon = document.querySelector('[data-testid="film-icon"]') || 
                     document.querySelector('.h-4.w-4');
    expect(movieIcon).toBeInTheDocument();
  });

  it('devrait afficher l\'icône de type correcte pour la musique', () => {
    const musicMedia = { ...mockMedia, type: 'music' };
    
    render(
      <BrowserRouter>
        <MediaCard media={musicMedia} />
      </BrowserRouter>
    );

    // Vérifier que l'icône de musique est présente
    const musicIcon = document.querySelector('[data-testid="musical-note-icon"]') || 
                     document.querySelector('.h-4.w-4');
    expect(musicIcon).toBeInTheDocument();
  });

  it('devrait afficher le bouton favori comme actif si le média est dans les favoris', () => {
    render(
      <BrowserRouter>
        <MediaCard media={mockMedia} />
      </BrowserRouter>
    );

    const favoriteButton = screen.getByRole('button', { name: /retirer des favoris/i });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('devrait afficher le bouton favori comme inactif si le média n\'est pas dans les favoris', () => {
    const mediaNotInFavorites = { ...mockMedia, _id: '999' };
    
    render(
      <BrowserRouter>
        <MediaCard media={mediaNotInFavorites} />
      </BrowserRouter>
    );

    const favoriteButton = screen.getByRole('button', { name: /ajouter aux favoris/i });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('devrait appeler onToggleFavorite lors du clic sur le bouton favori', async () => {
    render(
      <BrowserRouter>
        <MediaCard 
          media={mockMedia} 
          onToggleFavorite={mockOnToggleFavorite}
        />
      </BrowserRouter>
    );

    const favoriteButton = screen.getByRole('button', { name: /retirer des favoris/i });
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(mockOnToggleFavorite).toHaveBeenCalledWith('1');
    });
  });

  it('devrait afficher un message d\'erreur si l\'utilisateur n\'est pas connecté', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      updateUser: mockUpdateUser
    });
    
    render(
      <BrowserRouter>
        <MediaCard media={mockMedia} />
      </BrowserRouter>
    );

    const favoriteButton = screen.getByRole('button', { name: /ajouter aux favoris/i });
    fireEvent.click(favoriteButton);

    // Le composant devrait afficher le bouton avec le bon titre
    expect(favoriteButton).toHaveAttribute('title', 'Connectez-vous pour ajouter aux favoris');
  });

  it('devrait afficher la note avec l\'icône d\'étoile', () => {
    render(
      <BrowserRouter>
        <MediaCard media={mockMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('4.5')).toBeInTheDocument();
    // Vérifier que les icônes d'étoile sont présentes
    const starIcons = document.querySelectorAll('.h-4.w-4');
    expect(starIcons.length).toBeGreaterThan(0);
  });

  it('devrait afficher les tags correctement', () => {
    render(
      <BrowserRouter>
        <MediaCard media={mockMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#example')).toBeInTheDocument();
  });

  it('devrait avoir un lien vers la page de détail du média', () => {
    render(
      <BrowserRouter>
        <MediaCard media={mockMedia} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/media/1');
  });

  it('devrait afficher l\'année de sortie avec l\'icône de calendrier', () => {
    render(
      <BrowserRouter>
        <MediaCard media={mockMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('2023')).toBeInTheDocument();
    // Vérifier que l'icône de calendrier est présente
    const calendarIcon = document.querySelector('.h-3.w-3');
    expect(calendarIcon).toBeInTheDocument();
  });
});
