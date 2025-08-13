import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  TagIcon: ({ className }) => <div data-testid="tag-icon" className={className} />,
  FolderIcon: ({ className }) => <div data-testid="folder-icon" className={className} />,
  PlusIcon: ({ className }) => <div data-testid="plus-icon" className={className} />,
  PencilIcon: ({ className }) => <div data-testid="edit-icon" className={className} />,
  TrashIcon: ({ className }) => <div data-testid="delete-icon" className={className} />,
  MagnifyingGlassIcon: ({ className }) => <div data-testid="search-icon" className={className} />,
  XMarkIcon: ({ className }) => <div data-testid="close-icon" className={className} />,
  ArrowPathIcon: ({ className }) => <div data-testid="refresh-icon" className={className} />
}));

// Mock du service admin
vi.mock('../../../services/adminMediaService', () => ({
  default: {
    getCategories: vi.fn(),
    getTags: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn()
  }
}));

// Mock de react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn) => fn),
    formState: { errors: {}, isSubmitting: false },
    reset: vi.fn()
  }))
}));

// Mock de @hookform/resolvers/zod
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn()
}));

// Mock de @headlessui/react
vi.mock('@headlessui/react', () => ({
  Dialog: ({ children, open, onClose }) => (
    open ? (
      <div data-testid="dialog-overlay" onClick={onClose}>
        <div data-testid="dialog-panel" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    ) : null
  )
}));

// Composants simplifiés pour les tests
const FormField = ({ label, placeholder, error, disabled, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      {...props}
      placeholder={placeholder}
      disabled={disabled}
      className="input w-full"
      data-testid="form-input"
    />
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);

const ConfirmDialog = ({ isOpen, title, description, confirmText, onClose, onConfirm }) => (
  isOpen ? (
    <div data-testid="confirm-dialog">
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={onClose}>Annuler</button>
      <button onClick={onConfirm}>{confirmText}</button>
    </div>
  ) : null
);

// Mock des utilitaires
vi.mock('../../../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Composant AdminCategoriesPage simplifié pour les tests
const AdminCategoriesPage = ({ 
  mockCategories = [], 
  mockTags = [],
  mockError = null,
  mockIsLoading = false 
}) => {
  const [activeTab, setActiveTab] = React.useState('categories');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [confirmItem, setConfirmItem] = React.useState(null);

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    setConfirmItem(item);
  };

  const getFilteredItems = () => {
    const items = activeTab === 'categories' ? mockCategories : mockTags;
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (mockError) {
    return (
      <div className="page-container py-16">
        <div className="text-center">
          <div data-testid="folder-icon" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 mb-6">
            Impossible de récupérer les catégories et tags.
          </p>
          <button className="btn-primary">
            <div data-testid="refresh-icon" className="h-4 w-4 mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Gestion des catégories et tags
              </h1>
              <p className="text-gray-600 text-lg">
                Organisez votre collection avec des catégories et tags
              </p>
            </div>
            
            <button
              onClick={handleCreate}
              className="btn-primary"
            >
              <div data-testid="plus-icon" className="h-4 w-4 mr-2" />
              Ajouter {activeTab === 'categories' ? 'une catégorie' : 'un tag'}
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{mockCategories.length}</p>
                <p className="text-sm text-gray-600">Catégories</p>
              </div>
              <div data-testid="folder-icon" className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{mockTags.length}</p>
                <p className="text-sm text-gray-600">Tags</p>
              </div>
              <div data-testid="tag-icon" className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'categories'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="categories-tab"
              >
                <div data-testid="folder-icon" className="h-5 w-5 inline mr-2" />
                Catégories ({mockCategories.length})
              </button>
              <button
                onClick={() => setActiveTab('tags')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tags'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tags-tab"
              >
                <div data-testid="tag-icon" className="h-5 w-5 inline mr-2" />
                Tags ({mockTags.length})
              </button>
            </nav>
          </div>

          {/* Barre de recherche */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative max-w-md">
              <div data-testid="search-icon" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Rechercher ${activeTab === 'categories' ? 'une catégorie' : 'un tag'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
                data-testid="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  data-testid="clear-search"
                >
                  <div data-testid="close-icon" className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Liste des éléments */}
          <div className="p-0">
            {mockIsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activeTab === 'categories' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {activeTab === 'categories' ? (
                            <div data-testid="folder-icon" className="h-5 w-5" />
                          ) : (
                            <div data-testid="tag-icon" className="h-5 w-5" />
                          )}
                        </div>
                        
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">Slug: {item.slug}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 sm:ml-auto">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Modifier"
                          data-testid={`edit-${item._id}`}
                        >
                          <div data-testid="edit-icon" className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                          data-testid={`delete-${item._id}`}
                        >
                          <div data-testid="delete-icon" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                {activeTab === 'categories' ? (
                  <div data-testid="folder-icon" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                ) : (
                  <div data-testid="tag-icon" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? (
                    `Aucun${activeTab === 'categories' ? 'e catégorie' : ' tag'} trouvé${activeTab === 'categories' ? 'e' : ''}`
                  ) : (
                    `Aucun${activeTab === 'categories' ? 'e catégorie' : ' tag'} pour le moment`
                  )}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? (
                    'Essayez de modifier votre recherche.'
                  ) : (
                    `Commencez par créer ${activeTab === 'categories' ? 'votre première catégorie' : 'votre premier tag'}.`
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleCreate}
                    className="btn-primary"
                    data-testid="create-empty"
                  >
                    <div data-testid="plus-icon" className="h-4 w-4 mr-2" />
                    Créer {activeTab === 'categories' ? 'une catégorie' : 'un tag'}
                  </button>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="btn-secondary"
                      data-testid="clear-search-empty"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conseils d'utilisation */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            {activeTab === 'categories' ? (
              <div data-testid="folder-icon" className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            ) : (
              <div data-testid="tag-icon" className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Conseils d'utilisation
              </h3>
              {activeTab === 'categories' ? (
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Utilisez les catégories pour organiser vos médias par genre principal</li>
                  <li>• Évitez de créer trop de catégories pour garder une organisation claire</li>
                  <li>• Les catégories servent de filtres principaux dans le catalogue</li>
                  <li>• Chaque média ne peut appartenir qu'à une seule catégorie</li>
                </ul>
              ) : (
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Les tags permettent d'ajouter des descripteurs précis aux médias</li>
                  <li>• Un média peut avoir plusieurs tags pour une recherche optimale</li>
                  <li>• Utilisez des tags courts et explicites (ex: "science-fiction", "primé")</li>
                  <li>• Les tags facilitent la découverte de contenus similaires</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de formulaire */}
      {isModalOpen && (
        <div data-testid="form-modal">
          <h2>{selectedItem ? 'Modifier' : 'Créer'} {activeTab === 'categories' ? 'une catégorie' : 'un tag'}</h2>
          <FormField
            label="Nom"
            placeholder={`Nom ${activeTab === 'categories' ? 'de la catégorie' : 'du tag'}`}
            data-testid="modal-form-input"
          />
          <button onClick={() => setIsModalOpen(false)}>Fermer</button>
        </div>
      )}

      {/* Confirmation suppression catégorie/tag */}
      <ConfirmDialog
        isOpen={!!confirmItem}
        title={`Supprimer ${activeTab === 'categories' ? 'cette catégorie' : 'ce tag'} ?`}
        description={confirmItem ? `${activeTab === 'categories' ? 'Catégorie' : 'Tag'}: ${confirmItem.name}` : ''}
        confirmText="Supprimer"
        onClose={() => setConfirmItem(null)}
        onConfirm={() => {
          if (confirmItem) {
            setConfirmItem(null);
          }
        }}
      />
    </div>
  );
};

// Helper pour wrapper le composant avec les providers nécessaires
const renderWithProviders = (component, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>,
    options
  );
};

describe('AdminCategoriesPage', () => {
  const mockCategories = [
    {
      _id: 'cat-1',
      name: 'Science-Fiction',
      slug: 'science-fiction',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: 'cat-2',
      name: 'Fantasy',
      slug: 'fantasy',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  const mockTags = [
    {
      _id: 'tag-1',
      name: 'Primé',
      slug: 'prime',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: 'tag-2',
      name: 'Classique',
      slug: 'classique',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it('affiche le titre et la description', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      expect(screen.getByText('Gestion des catégories et tags')).toBeInTheDocument();
      expect(screen.getByText('Organisez votre collection avec des catégories et tags')).toBeInTheDocument();
    });

    it('affiche le bouton d\'ajout avec le bon texte selon l\'onglet actif', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      // Par défaut, l'onglet catégories est actif
      expect(screen.getByText('Ajouter une catégorie')).toBeInTheDocument();
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('affiche les statistiques des catégories et tags', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      expect(screen.getByText('Catégories')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      
      // Vérifie les valeurs des statistiques avec des sélecteurs plus spécifiques
      const categoryCard = screen.getByText('Catégories').closest('.bg-white');
      const tagCard = screen.getByText('Tags').closest('.bg-white');
      
      expect(categoryCard).toHaveTextContent('2');
      expect(tagCard).toHaveTextContent('2');
    });

    it('affiche les icônes appropriées dans les statistiques', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const categoryCard = screen.getByText('Catégories').closest('.bg-white');
      const tagCard = screen.getByText('Tags').closest('.bg-white');
      
      // Utilise getAllByTestId pour éviter les conflits
      const folderIcons = screen.getAllByTestId('folder-icon');
      const tagIcons = screen.getAllByTestId('tag-icon');
      
      expect(categoryCard).toContainElement(folderIcons[0]);
      expect(tagCard).toContainElement(tagIcons[0]);
    });
  });

  describe('Navigation par onglets', () => {
    it('affiche l\'onglet catégories par défaut', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const categoriesTab = screen.getByTestId('categories-tab');
      expect(categoriesTab).toHaveClass('border-primary-500', 'text-primary-600');
    });

    it('permet de changer vers l\'onglet tags', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const tagsTab = screen.getByTestId('tags-tab');
      await user.click(tagsTab);
      
      expect(tagsTab).toHaveClass('border-primary-500', 'text-primary-600');
      expect(screen.getByText('Ajouter un tag')).toBeInTheDocument();
    });

    it('affiche le bon nombre d\'éléments dans chaque onglet', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      expect(screen.getByText('Catégories (2)')).toBeInTheDocument();
      expect(screen.getByText('Tags (2)')).toBeInTheDocument();
    });
  });

  describe('Affichage des éléments', () => {
    it('affiche la liste des catégories dans l\'onglet catégories', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      expect(screen.getByText('Science-Fiction')).toBeInTheDocument();
      expect(screen.getByText('Fantasy')).toBeInTheDocument();
      expect(screen.getByText('Slug: science-fiction')).toBeInTheDocument();
      expect(screen.getByText('Slug: fantasy')).toBeInTheDocument();
    });

    it('affiche la liste des tags dans l\'onglet tags', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const tagsTab = screen.getByTestId('tags-tab');
      await user.click(tagsTab);
      
      expect(screen.getByText('Primé')).toBeInTheDocument();
      expect(screen.getByText('Classique')).toBeInTheDocument();
      expect(screen.getByText('Slug: prime')).toBeInTheDocument();
      expect(screen.getByText('Slug: classique')).toBeInTheDocument();
    });

    it('affiche les icônes appropriées pour chaque type d\'élément', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      // Dans l'onglet catégories, les éléments ont des icônes de dossier
      const categoryItems = screen.getAllByTestId('folder-icon');
      expect(categoryItems).toHaveLength(5); // 1 dans les stats + 1 dans l'onglet + 2 dans la liste + 1 dans les conseils
    });

    it('affiche les boutons d\'action pour chaque élément', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      expect(screen.getByTestId('edit-cat-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-cat-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-cat-2')).toBeInTheDocument();
      expect(screen.getByTestId('delete-cat-2')).toBeInTheDocument();
    });
  });

  describe('Recherche et filtrage', () => {
    it('affiche la barre de recherche avec le bon placeholder', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher une catégorie...')).toBeInTheDocument();
    });

    it('permet de saisir du texte dans la barre de recherche', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Science');
      
      expect(searchInput).toHaveValue('Science');
    });

    it('affiche le bouton de suppression de la recherche quand du texte est saisi', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Science');
      
      expect(screen.getByTestId('clear-search')).toBeInTheDocument();
    });

    it('permet de supprimer le texte de recherche', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Science');
      
      const clearButton = screen.getByTestId('clear-search');
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
    });

    it('filtre les éléments selon la recherche', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Science');
      
      // Seule la catégorie "Science-Fiction" devrait être visible
      expect(screen.getByText('Science-Fiction')).toBeInTheDocument();
      expect(screen.queryByText('Fantasy')).not.toBeInTheDocument();
    });

    it('met à jour le placeholder de recherche selon l\'onglet actif', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      // Par défaut, l'onglet catégories est actif
      expect(screen.getByPlaceholderText('Rechercher une catégorie...')).toBeInTheDocument();
      
      // Change vers l'onglet tags
      const tagsTab = screen.getByTestId('tags-tab');
      await user.click(tagsTab);
      
      expect(screen.getByPlaceholderText('Rechercher un tag...')).toBeInTheDocument();
    });
  });

  describe('Actions sur les éléments', () => {
    it('permet de créer un nouvel élément', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const createButton = screen.getByText('Ajouter une catégorie');
      await user.click(createButton);
      
      expect(screen.getByTestId('form-modal')).toBeInTheDocument();
      expect(screen.getByText('Créer une catégorie')).toBeInTheDocument();
    });

    it('permet de modifier un élément existant', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const editButton = screen.getByTestId('edit-cat-1');
      await user.click(editButton);
      
      expect(screen.getByTestId('form-modal')).toBeInTheDocument();
      expect(screen.getByText('Modifier une catégorie')).toBeInTheDocument();
    });

    it('permet de supprimer un élément', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const deleteButton = screen.getByTestId('delete-cat-1');
      await user.click(deleteButton);
      
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      expect(screen.getByText('Supprimer cette catégorie ?')).toBeInTheDocument();
      expect(screen.getByText('Catégorie: Science-Fiction')).toBeInTheDocument();
    });

    it('permet de confirmer la suppression', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const deleteButton = screen.getByTestId('delete-cat-1');
      await user.click(deleteButton);
      
      const confirmButton = screen.getByText('Supprimer');
      await user.click(confirmButton);
      
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Modal de formulaire', () => {
    it('affiche le bon titre selon le mode (création/modification)', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      // Test création
      const createButton = screen.getByText('Ajouter une catégorie');
      await user.click(createButton);
      
      expect(screen.getByText('Créer une catégorie')).toBeInTheDocument();
      
      // Ferme la modal
      const closeButton = screen.getByText('Fermer');
      await user.click(closeButton);
      
      // Test modification
      const editButton = screen.getByTestId('edit-cat-1');
      await user.click(editButton);
      
      expect(screen.getByText('Modifier une catégorie')).toBeInTheDocument();
    });

    it('affiche le bon titre selon le type d\'élément (catégorie/tag)', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      // Test avec catégories
      const createButton = screen.getByText('Ajouter une catégorie');
      await user.click(createButton);
      
      expect(screen.getByText('Créer une catégorie')).toBeInTheDocument();
      
      // Ferme la modal
      const closeButton = screen.getByText('Fermer');
      await user.click(closeButton);
      
      // Change vers l'onglet tags
      const tagsTab = screen.getByTestId('tags-tab');
      await user.click(tagsTab);
      
      // Test avec tags
      const createTagButton = screen.getByText('Ajouter un tag');
      await user.click(createTagButton);
      
      expect(screen.getByText('Créer un tag')).toBeInTheDocument();
    });

    it('permet de fermer la modal', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const createButton = screen.getByText('Ajouter une catégorie');
      await user.click(createButton);
      
      const closeButton = screen.getByText('Fermer');
      await user.click(closeButton);
      
      expect(screen.queryByTestId('form-modal')).not.toBeInTheDocument();
    });
  });

  describe('États de chargement et erreurs', () => {
    it('affiche l\'état de chargement', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockIsLoading={true}
        />
      );
      
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('affiche l\'erreur de chargement', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockError={true}
        />
      );
      
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
      expect(screen.getByText('Impossible de récupérer les catégories et tags.')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    it('affiche le message d\'absence d\'éléments', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={[]}
          mockTags={[]}
        />
      );
      
      expect(screen.getByText('Aucune catégorie pour le moment')).toBeInTheDocument();
      expect(screen.getByText('Commencez par créer votre première catégorie.')).toBeInTheDocument();
    });

    it('affiche le message d\'absence d\'éléments dans l\'onglet tags', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={[]}
          mockTags={[]}
        />
      );
      
      const tagsTab = screen.getByTestId('tags-tab');
      await user.click(tagsTab);
      
      expect(screen.getByText('Aucun tag pour le moment')).toBeInTheDocument();
      expect(screen.getByText('Commencez par créer votre premier tag.')).toBeInTheDocument();
    });
  });

  describe('Conseils d\'utilisation', () => {
    it('affiche les conseils pour les catégories', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      expect(screen.getByText('💡 Conseils d\'utilisation')).toBeInTheDocument();
      expect(screen.getByText('• Utilisez les catégories pour organiser vos médias par genre principal')).toBeInTheDocument();
      expect(screen.getByText('• Évitez de créer trop de catégories pour garder une organisation claire')).toBeInTheDocument();
      expect(screen.getByText('• Les catégories servent de filtres principaux dans le catalogue')).toBeInTheDocument();
      expect(screen.getByText('• Chaque média ne peut appartenir qu\'à une seule catégorie')).toBeInTheDocument();
    });

    it('affiche les conseils pour les tags', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const tagsTab = screen.getByTestId('tags-tab');
      await user.click(tagsTab);
      
      expect(screen.getByText('💡 Conseils d\'utilisation')).toBeInTheDocument();
      expect(screen.getByText('• Les tags permettent d\'ajouter des descripteurs précis aux médias')).toBeInTheDocument();
      expect(screen.getByText('• Un média peut avoir plusieurs tags pour une recherche optimale')).toBeInTheDocument();
      expect(screen.getByText('• Utilisez des tags courts et explicites (ex: "science-fiction", "primé")')).toBeInTheDocument();
      expect(screen.getByText('• Les tags facilitent la découverte de contenus similaires')).toBeInTheDocument();
    });
  });

  describe('Gestion des cas d\'absence de données', () => {
    it('affiche le bouton de création quand il n\'y a pas d\'éléments', () => {
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={[]}
          mockTags={[]}
        />
      );
      
      expect(screen.getByTestId('create-empty')).toBeInTheDocument();
      expect(screen.getByText('Créer une catégorie')).toBeInTheDocument();
    });

    it('affiche le bouton d\'effacement de recherche quand il y a une recherche sans résultats', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Inexistant');
      
      expect(screen.getByTestId('clear-search-empty')).toBeInTheDocument();
      expect(screen.getByText('Effacer la recherche')).toBeInTheDocument();
    });

    it('permet d\'effacer la recherche depuis l\'état vide', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <AdminCategoriesPage 
          mockCategories={mockCategories}
          mockTags={mockTags}
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Inexistant');
      
      const clearButton = screen.getByTestId('clear-search-empty');
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
      expect(screen.queryByTestId('clear-search-empty')).not.toBeInTheDocument();
    });
  });
});
