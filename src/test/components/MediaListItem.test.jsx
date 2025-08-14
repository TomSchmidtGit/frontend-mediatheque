import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaListItem from '../../components/catalog/MediaListItem';

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
  available: true,
  reviews: [{ _id: 'review1', rating: 4, comment: 'Great book' }]
};

const mockUser = {
  _id: 'user1',
  email: 'test@example.com',
  favorites: ['1', '2']
};

describe('MediaListItem', () => {
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
        <MediaListItem media={mockMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Media')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('This is a test media description')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('devrait afficher l\'icône de type correcte pour un livre', () => {
    render(
      <BrowserRouter>
        <MediaListItem media={mockMedia} />
      </BrowserRouter>
    );

    // Vérifier que l'icône de livre est présente
    const bookIcon = document.querySelector('.h-4.w-4');
    expect(bookIcon).toBeInTheDocument();
  });

  it('devrait afficher l\'icône de type correcte pour un film', () => {
    const movieMedia = { ...mockMedia, type: 'movie' };

    render(
      <BrowserRouter>
        <MediaListItem media={movieMedia} />
      </BrowserRouter>
    );

    // Vérifier que l'icône de film est présente
    const filmIcon = document.querySelector('.h-4.w-4');
    expect(filmIcon).toBeInTheDocument();
  });

  it('devrait afficher l\'icône de type correcte pour la musique', () => {
    const musicMedia = { ...mockMedia, type: 'music' };

    render(
      <BrowserRouter>
        <MediaListItem media={musicMedia} />
      </BrowserRouter>
    );

    // Vérifier que l'icône de musique est présente
    const musicIcon = document.querySelector('.h-4.w-4');
    expect(musicIcon).toBeInTheDocument();
  });

  it('devrait afficher le badge de disponibilité correctement', () => {
    render(
      <BrowserRouter>
        <MediaListItem media={mockMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('devrait afficher le badge "Emprunté" pour un média non disponible', () => {
    const unavailableMedia = { ...mockMedia, available: false };

    render(
      <BrowserRouter>
        <MediaListItem media={unavailableMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('Emprunté')).toBeInTheDocument();
  });

  it('devrait afficher le bouton favori comme actif si le média est dans les favoris', () => {
    render(
      <BrowserRouter>
        <MediaListItem media={mockMedia} />
      </BrowserRouter>
    );

    const favoriteButton = screen.getByRole('button', { name: /retirer des favoris/i });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('devrait afficher le bouton favori comme inactif si le média n\'est pas dans les favoris', () => {
    const mediaNotInFavorites = { ...mockMedia, _id: '999' };

    render(
      <BrowserRouter>
        <MediaListItem media={mediaNotInFavorites} />
      </BrowserRouter>
    );

    const favoriteButton = screen.getByRole('button', { name: /ajouter aux favoris/i });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('devrait appeler onToggleFavorite lors du clic sur le bouton favori', async () => {
    render(
      <BrowserRouter>
        <MediaListItem
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
        <MediaListItem media={mockMedia} />
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
        <MediaListItem media={mockMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(1 avis)')).toBeInTheDocument();

    // Vérifier que les icônes d'étoile sont présentes
    const starIcons = document.querySelectorAll('.h-3.w-3');
    expect(starIcons.length).toBeGreaterThan(0);
  });

  it('devrait afficher les tags correctement', () => {
    render(
      <BrowserRouter>
        <MediaListItem media={mockMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#example')).toBeInTheDocument();
  });

  it('devrait afficher le nombre de tags supplémentaires s\'il y en a plus de 3', () => {
    const mediaWithManyTags = {
      ...mockMedia,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
    };

    render(
      <BrowserRouter>
        <MediaListItem media={mediaWithManyTags} />
      </BrowserRouter>
    );

    expect(screen.getByText('+2 autres')).toBeInTheDocument();
  });

  it('devrait avoir un lien vers la page de détail du média', () => {
    render(
      <BrowserRouter>
        <MediaListItem media={mockMedia} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/media/1');
  });

  it('devrait afficher l\'année de sortie avec l\'icône de calendrier', () => {
    render(
      <BrowserRouter>
        <MediaListItem media={mockMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('2023')).toBeInTheDocument();
    // Vérifier que l'icône de calendrier est présente
    const calendarIcon = document.querySelector('.h-3.w-3');
    expect(calendarIcon).toBeInTheDocument();
  });

  it('devrait afficher l\'auteur avec l\'icône utilisateur', () => {
    render(
      <BrowserRouter>
        <MediaListItem media={mockMedia} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Author')).toBeInTheDocument();
    // Vérifier que l'icône utilisateur est présente
    const userIcon = document.querySelector('.h-3.w-3');
    expect(userIcon).toBeInTheDocument();
  });

  it('devrait gérer le cas où il n\'y a pas d\'image', () => {
    const mediaWithoutImage = { ...mockMedia, imageUrl: undefined };

    render(
      <BrowserRouter>
        <MediaListItem media={mediaWithoutImage} />
      </BrowserRouter>
    );

    // L'icône de type devrait être affichée à la place de l'image
    const typeIcon = document.querySelector('.h-4.w-4');
    expect(typeIcon).toBeInTheDocument();
  });

  it('devrait gérer le cas où il n\'y a pas de description', () => {
    const mediaWithoutDescription = { ...mockMedia, description: undefined };

    render(
      <BrowserRouter>
        <MediaListItem media={mediaWithoutDescription} />
      </BrowserRouter>
    );

    // Le titre et l'auteur devraient toujours être affichés
    expect(screen.getByText('Test Media')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('devrait gérer le cas où il n\'y a pas de tags', () => {
    const mediaWithoutTags = { ...mockMedia, tags: [] };

    render(
      <BrowserRouter>
        <MediaListItem media={mediaWithoutTags} />
      </BrowserRouter>
    );

    // Le composant devrait s'afficher sans erreur
    expect(screen.getByText('Test Media')).toBeInTheDocument();
  });

  it('devrait gérer le cas où il n\'y a pas de note', () => {
    const mediaWithoutRating = { ...mockMedia, averageRating: 0, reviews: [] };

    render(
      <BrowserRouter>
        <MediaListItem media={mediaWithoutRating} />
      </BrowserRouter>
    );

    // Le composant devrait s'afficher sans la section des notes
    expect(screen.getByText('Test Media')).toBeInTheDocument();
    expect(screen.queryByText('4.5')).not.toBeInTheDocument();
  });

  it('devrait afficher le bon style pour le bouton favori actif', () => {
    render(
      <BrowserRouter>
        <MediaListItem media={mockMedia} />
      </BrowserRouter>
    );

    const favoriteButton = screen.getByRole('button', { name: /retirer des favoris/i });
    expect(favoriteButton).toHaveClass('bg-red-500');
  });

  it('devrait afficher le bon style pour le bouton favori inactif', () => {
    const mediaNotInFavorites = { ...mockMedia, _id: '999' };

    render(
      <BrowserRouter>
        <MediaListItem media={mediaNotInFavorites} />
      </BrowserRouter>
    );

    const favoriteButton = screen.getByRole('button', { name: /ajouter aux favoris/i });
    expect(favoriteButton).toHaveClass('bg-gray-100');
  });

  it('devrait gérer le cas où isInFavoritesPage est true', () => {
    render(
      <BrowserRouter>
        <MediaListItem
          media={mockMedia}
          isInFavoritesPage={true}
        />
      </BrowserRouter>
    );

    // Le bouton devrait afficher "Retirer des favoris"
    const favoriteButton = screen.getByRole('button', { name: /retirer des favoris/i });
    expect(favoriteButton).toBeInTheDocument();
  });
});
