// src/pages/admin/AdminCategoriesPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TagIcon,
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '../../components/forms/FormField';
import adminMediaService from '../../services/adminMediaService';
import type { Category, Tag } from '../../types';
import { cn } from '../../utils';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/modals/ConfirmDialog';
import { MetaTagsComponent } from '../../components/common/MetaTags';
import { generateMetaTags } from '../../config/metaTags';

// Schémas de validation
const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
});

const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(30, 'Le nom ne peut pas dépasser 30 caractères'),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type TagFormData = z.infer<typeof tagSchema>;

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  item: Category | Tag | null;
  type: 'category' | 'tag';
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  item,
  type,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!item;
  const schema = type === 'category' ? categorySchema : tagSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormData | TagFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name || '',
    },
  });

  React.useEffect(() => {
    if (item) {
      reset({ name: item.name });
    } else {
      reset({ name: '' });
    }
  }, [item, reset]);

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData | TagFormData) => {
      if (type === 'category') {
        if (isEditMode) {
          return adminMediaService.updateCategory(item!._id, data.name);
        } else {
          return adminMediaService.createCategory(data.name);
        }
      } else {
        if (isEditMode) {
          return adminMediaService.updateTag(item!._id, data.name);
        } else {
          return adminMediaService.createTag(data.name);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success(
        `${type === 'category' ? 'Catégorie' : 'Tag'} ${
          isEditMode ? 'modifié(e)' : 'créé(e)'
        } avec succès`
      );
      handleClose();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        `Erreur lors de la ${isEditMode ? 'modification' : 'création'}`;
      toast.error(message);
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CategoryFormData | TagFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className='relative z-50'>
      <div className='fixed inset-0 bg-black/30' aria-hidden='true' />

      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <Dialog.Panel className='mx-auto max-w-md w-full bg-white rounded-xl shadow-xl'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center'>
                {type === 'category' ? (
                  <FolderIcon className='w-6 h-6 text-primary-600' />
                ) : (
                  <TagIcon className='w-6 h-6 text-primary-600' />
                )}
              </div>
              <div className='ml-3'>
                <Dialog.Title className='text-lg font-medium text-gray-900'>
                  {title}
                </Dialog.Title>
              </div>
            </div>
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='p-6'>
            <FormField
              {...register('name')}
              label='Nom'
              placeholder={`Nom ${
                type === 'category' ? 'de la catégorie' : 'du tag'
              }`}
              error={errors.name?.message}
              disabled={isSubmitting}
            />

            <div className='flex space-x-3 mt-6'>
              <button
                type='button'
                onClick={handleClose}
                disabled={isSubmitting}
                className='flex-1 btn-secondary'
              >
                Annuler
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex-1 btn-primary'
              >
                {isSubmitting ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2'></div>
                    {isEditMode ? 'Modification...' : 'Création...'}
                  </>
                ) : isEditMode ? (
                  'Modifier'
                ) : (
                  'Créer'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const AdminCategoriesPage: React.FC = () => {
  const metaTags = generateMetaTags('adminCategories');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>(
    'categories'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Category | Tag | null>(null);
  const [confirmItem, setConfirmItem] = useState<Category | Tag | null>(null);

  // Queries
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminMediaService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: tags = [],
    isLoading: tagsLoading,
    error: tagsError,
    refetch: refetchTags,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: () => adminMediaService.getTags(),
    staleTime: 5 * 60 * 1000,
  });

  // Mutations pour supprimer
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) =>
      adminMediaService.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie supprimée avec succès');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (tagId: string) => adminMediaService.deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag supprimé avec succès');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Category | Tag) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: Category | Tag) => {
    setConfirmItem(item);
  };

  const getFilteredItems = () => {
    const items = activeTab === 'categories' ? categories : tags;
    if (!searchTerm) return items;

    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const isLoading = categoriesLoading || tagsLoading;
  const error = categoriesError || tagsError;

  if (error) {
    return (
      <div className='page-container py-16'>
        <div className='text-center'>
          <FolderIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Erreur de chargement
          </h1>
          <p className='text-gray-600 mb-6'>
            Impossible de récupérer les catégories et tags.
          </p>
          <button
            onClick={() => {
              refetchCategories();
              refetchTags();
            }}
            className='btn-primary'
            disabled={isLoading}
          >
            <ArrowPathIcon className='h-4 w-4 mr-2' />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <>
      <MetaTagsComponent metaTags={metaTags} />
      <div className='bg-gray-50 min-h-screen'>
        <div className='page-container py-8'>
          {/* Header */}
          <div className='mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>
                  Gestion des catégories et tags
                </h1>
                <p className='text-gray-600 text-lg'>
                  Organisez votre collection avec des catégories et tags
                </p>
              </div>

              <button onClick={handleCreate} className='btn-primary'>
                <PlusIcon className='h-4 w-4 mr-2' />
                Ajouter{' '}
                {activeTab === 'categories' ? 'une catégorie' : 'un tag'}
              </button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className='grid sm:grid-cols-2 gap-4 mb-8'>
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-2xl font-bold text-blue-600'>
                    {categories.length}
                  </p>
                  <p className='text-sm text-gray-600'>Catégories</p>
                </div>
                <FolderIcon className='h-8 w-8 text-blue-500' />
              </div>
            </div>

            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-2xl font-bold text-green-600'>
                    {tags.length}
                  </p>
                  <p className='text-sm text-gray-600'>Tags</p>
                </div>
                <TagIcon className='h-8 w-8 text-green-500' />
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <div className='border-b border-gray-200'>
              <nav className='-mb-px flex'>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={cn(
                    'flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors',
                    activeTab === 'categories'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <FolderIcon className='h-5 w-5 inline mr-2' />
                  Catégories ({categories.length})
                </button>
                <button
                  onClick={() => setActiveTab('tags')}
                  className={cn(
                    'flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors',
                    activeTab === 'tags'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <TagIcon className='h-5 w-5 inline mr-2' />
                  Tags ({tags.length})
                </button>
              </nav>
            </div>

            {/* Barre de recherche */}
            <div className='p-6 border-b border-gray-200'>
              <div className='relative max-w-md'>
                <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder={`Rechercher ${
                    activeTab === 'categories' ? 'une catégorie' : 'un tag'
                  }...`}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='input pl-10 w-full'
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    <XMarkIcon className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>

            {/* Liste des éléments */}
            <div className='p-0'>
              {isLoading ? (
                <div className='p-8 text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4'></div>
                  <p className='text-gray-600'>Chargement...</p>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className='divide-y divide-gray-200'>
                  {filteredItems.map(item => (
                    <div
                      key={item._id}
                      className='p-4 hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex items-center space-x-3'>
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              activeTab === 'categories'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-green-100 text-green-600'
                            )}
                          >
                            {activeTab === 'categories' ? (
                              <FolderIcon className='h-5 w-5' />
                            ) : (
                              <TagIcon className='h-5 w-5' />
                            )}
                          </div>

                          <div className='min-w-0'>
                            <h3 className='font-medium text-gray-900'>
                              {item.name}
                            </h3>
                            <p className='text-sm text-gray-500'>
                              Slug: {item.slug}
                            </p>
                          </div>
                        </div>

                        <div className='flex flex-wrap gap-2 sm:ml-auto'>
                          <button
                            onClick={() => handleEdit(item)}
                            className='text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded-lg transition-colors'
                            title='Modifier'
                          >
                            <PencilIcon className='h-4 w-4' />
                          </button>

                          <button
                            onClick={() => handleDelete(item)}
                            disabled={
                              deleteCategoryMutation.isPending ||
                              deleteTagMutation.isPending
                            }
                            className='text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors'
                            title='Supprimer'
                          >
                            <TrashIcon className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='p-12 text-center'>
                  {activeTab === 'categories' ? (
                    <FolderIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                  ) : (
                    <TagIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                  )}
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    {searchTerm
                      ? `Aucun${
                          activeTab === 'categories' ? 'e catégorie' : ' tag'
                        } trouvé${activeTab === 'categories' ? 'e' : ''}`
                      : `Aucun${
                          activeTab === 'categories' ? 'e catégorie' : ' tag'
                        } pour le moment`}
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    {searchTerm
                      ? 'Essayez de modifier votre recherche.'
                      : `Commencez par créer ${
                          activeTab === 'categories'
                            ? 'votre première catégorie'
                            : 'votre premier tag'
                        }.`}
                  </p>
                  <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <button onClick={handleCreate} className='btn-primary'>
                      <PlusIcon className='h-4 w-4 mr-2' />
                      Créer{' '}
                      {activeTab === 'categories' ? 'une catégorie' : 'un tag'}
                    </button>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className='btn-secondary'
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
          <div className='mt-8 bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-lg p-6'>
            <div className='flex items-start'>
              {activeTab === 'categories' ? (
                <FolderIcon className='h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0' />
              ) : (
                <TagIcon className='h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0' />
              )}
              <div>
                <h3 className='font-semibold text-blue-900 mb-2'>
                  💡 Conseils d'utilisation
                </h3>
                {activeTab === 'categories' ? (
                  <ul className='text-sm text-blue-800 space-y-1'>
                    <li>
                      • Utilisez les catégories pour organiser vos médias par
                      genre principal
                    </li>
                    <li>
                      • Évitez de créer trop de catégories pour garder une
                      organisation claire
                    </li>
                    <li>
                      • Les catégories servent de filtres principaux dans le
                      catalogue
                    </li>
                    <li>
                      • Chaque média ne peut appartenir qu'à une seule catégorie
                    </li>
                  </ul>
                ) : (
                  <ul className='text-sm text-blue-800 space-y-1'>
                    <li>
                      • Les tags permettent d'ajouter des descripteurs précis
                      aux médias
                    </li>
                    <li>
                      • Un média peut avoir plusieurs tags pour une recherche
                      optimale
                    </li>
                    <li>
                      • Utilisez des tags courts et explicites (ex:
                      "science-fiction", "primé")
                    </li>
                    <li>
                      • Les tags facilitent la découverte de contenus similaires
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de formulaire */}
        <FormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`${selectedItem ? 'Modifier' : 'Créer'} ${
            activeTab === 'categories' ? 'une catégorie' : 'un tag'
          }`}
          item={selectedItem}
          type={activeTab === 'categories' ? 'category' : 'tag'}
        />

        {/* Confirmation suppression catégorie/tag */}
        <ConfirmDialog
          isOpen={!!confirmItem}
          title={`Supprimer ${
            activeTab === 'categories' ? 'cette catégorie' : 'ce tag'
          } ?`}
          description={
            confirmItem
              ? `${activeTab === 'categories' ? 'Catégorie' : 'Tag'}: ${
                  confirmItem.name
                }`
              : ''
          }
          confirmText='Supprimer'
          confirmVariant='danger'
          onClose={() => setConfirmItem(null)}
          onConfirm={() => {
            if (!confirmItem) return;
            if (activeTab === 'categories') {
              deleteCategoryMutation.mutate((confirmItem as Category)._id);
            } else {
              deleteTagMutation.mutate((confirmItem as Tag)._id);
            }
          }}
        />
      </div>
    </>
  );
};

export default AdminCategoriesPage;
