// src/components/admin/MediaFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  XMarkIcon,
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
  PhotoIcon,
  PlusIcon,
  GlobeAltIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormField from '../forms/FormField';
import adminMediaService from '../../services/adminMediaService';
import externalApiService from '../../services/externalApiService';
import ExternalMediaSearch from './ExternalMediaSearch';
import type { Media, Category, Tag } from '../../types';
import type { ExternalMedia } from '../../types/externalApi';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const mediaFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .min(2, 'Le titre doit contenir au moins 2 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  type: z.enum(['book', 'movie', 'music']),
  author: z
    .string()
    .min(1, "L'auteur est requis")
    .min(2, "L'auteur doit contenir au moins 2 caractères")
    .max(100, "L'auteur ne peut pas dépasser 100 caractères"),
  year: z
    .number()
    .min(1000, "L'année doit être supérieure à 999")
    .max(
      new Date().getFullYear() + 1,
      "L'année ne peut pas être dans le futur"
    ),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  available: z.boolean().optional(),
});

type MediaFormData = z.infer<typeof mediaFormSchema>;

interface MediaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: Media | null;
  categories: Category[];
  tags: Tag[];
}

const MediaFormModal: React.FC<MediaFormModalProps> = ({
  isOpen,
  onClose,
  media,
  categories,
  tags,
}) => {
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'external'>('manual');
  const [selectedExternalMedia, setSelectedExternalMedia] =
    useState<ExternalMedia | null>(null);

  const isEditMode = !!media;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    control,
    setValue,
    getValues,
  } = useForm<MediaFormData>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      available: true,
    },
  });

  const watchedType = watch('type');

  // Reset form when media changes
  useEffect(() => {
    if (media) {
      reset({
        title: media.title,
        type: media.type,
        author: media.author,
        year: media.year,
        description: media.description || '',
        category: media.category?._id || '',
        tags:
          media.tags?.map(tag => (typeof tag === 'object' ? tag._id : tag)) ||
          [],
        available: media.available,
      });
      setImagePreview(media.imageUrl || null);
    } else {
      reset({
        title: '',
        type: 'book',
        author: '',
        year: new Date().getFullYear(),
        description: '',
        category: '',
        tags: [],
        available: true,
      });
      setImagePreview(null);
    }
    setSelectedImage(null);
  }, [media, reset]);

  // Mutation pour créer/modifier un média
  const saveMediaMutation = useMutation({
    mutationFn: async (data: MediaFormData) => {
      const formData: any = {
        ...data,
        image: selectedImage || undefined,
      };

      // Si on est en mode édition et qu'il n'y a pas d'image sélectionnée mais qu'il y avait une image avant
      if (isEditMode && !selectedImage && !imagePreview && media?.imageUrl) {
        // L'utilisateur a supprimé l'image
        formData.imageUrl = null;
      }

      if (isEditMode) {
        return adminMediaService.updateMedia(media!._id, formData);
      } else {
        return adminMediaService.createMedia(formData as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      queryClient.invalidateQueries({ queryKey: ['admin-media-stats'] });
      toast.success(`Média ${isEditMode ? 'modifié' : 'créé'} avec succès`);
      handleClose();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        `Erreur lors de la ${isEditMode ? 'modification' : 'création'}`;
      toast.error(message);
    },
  });

  // Mutation pour créer une catégorie
  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => adminMediaService.createCategory(name),
    onSuccess: newCategory => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setValue('category', newCategory._id);
      setNewCategoryName('');
      setShowNewCategoryForm(false);
      toast.success('Catégorie créée avec succès');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la création';
      toast.error(message);
    },
  });

  // Mutation pour créer un tag
  const createTagMutation = useMutation({
    mutationFn: (name: string) => adminMediaService.createTag(name),
    onSuccess: newTag => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      const currentTags = watch('tags') || [];
      setValue('tags', [...currentTags, newTag._id]);
      setNewTagName('');
      setShowNewTagForm(false);
      toast.success('Tag créé avec succès');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la création';
      toast.error(message);
    },
  });

  // Mutation pour créer un média à partir de données externes
  const createExternalMediaMutation = useMutation({
    mutationFn: async (externalMedia: ExternalMedia) => {
      const mediaData = {
        title: externalMedia.title,
        type: externalMedia.type,
        author: externalMedia.author,
        year: externalMedia.year || new Date().getFullYear(),
        description: externalMedia.description || '',
        category: '',
        tags: [],
        externalData: {
          source: externalMedia.source,
          externalId: externalMedia.externalId,
          imageUrl: externalMedia.imageUrl,
          isbn: externalMedia.isbn,
          publisher: externalMedia.publisher,
          pageCount: externalMedia.pageCount,
          language: externalMedia.language,
          runtime: externalMedia.runtime,
          genres: externalMedia.genres,
          backdropUrl: externalMedia.backdropUrl,
          releaseDate: externalMedia.releaseDate,
          originalTitle: externalMedia.originalTitle,
          budget: externalMedia.budget,
          revenue: externalMedia.revenue,
          status: externalMedia.status,
          country: externalMedia.country,
          barcode: externalMedia.barcode,
          asin: externalMedia.asin,
          media: externalMedia.media,
        },
      };

      return externalApiService.createMediaFromExternal(mediaData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      queryClient.invalidateQueries({ queryKey: ['admin-media-stats'] });
      toast.success('Média ajouté avec succès depuis les données publiques');
      handleClose();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la création';
      toast.error(message);
    },
  });

  const handleClose = () => {
    reset();
    setSelectedImage(null);
    setImagePreview(null);
    setShowNewCategoryForm(false);
    setShowNewTagForm(false);
    setNewCategoryName('');
    setNewTagName('');
    setActiveTab('manual');
    setSelectedExternalMedia(null);
    onClose();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: MediaFormData) => {
    // Si un média externe est sélectionné, utiliser createExternalMediaMutation
    if (selectedExternalMedia) {
      // Créer un objet ExternalMedia avec les données du formulaire
      const externalMediaData = {
        ...selectedExternalMedia,
        title: data.title,
        author: data.author,
        year: data.year,
        description: data.description || '', // Assurer que description n'est jamais undefined
      };
      createExternalMediaMutation.mutate(externalMediaData);
    } else {
      // Sinon, utiliser saveMediaMutation pour un média manuel
      saveMediaMutation.mutate(data);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <BookOpenIcon className='h-5 w-5' />;
      case 'movie':
        return <FilmIcon className='h-5 w-5' />;
      case 'music':
        return <MusicalNoteIcon className='h-5 w-5' />;
      default:
        return <BookOpenIcon className='h-5 w-5' />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book':
        return 'border-blue-300 bg-blue-50 text-blue-700';
      case 'movie':
        return 'border-purple-300 bg-purple-50 text-purple-700';
      case 'music':
        return 'border-green-300 bg-green-50 text-green-700';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  const handleExternalMediaSelect = (externalMedia: ExternalMedia) => {
    setSelectedExternalMedia(externalMedia);

    // Pré-remplir le formulaire avec les données externes
    reset({
      title: externalMedia.title,
      type: externalMedia.type,
      author: externalMedia.author,
      year: externalMedia.year || new Date().getFullYear(),
      description: externalMedia.description || '',
      category: '',
      tags: [],
      available: true,
    });

    setImagePreview(externalMedia.imageUrl);

    // Basculer vers l'onglet manuel pour finaliser
    setActiveTab('manual');
  };

  const handleCreateFromExternal = () => {
    if (selectedExternalMedia) {
      // Récupérer les valeurs actuelles du formulaire si elles ont été modifiées
      const currentFormData = getValues();
      const externalMediaData = {
        ...selectedExternalMedia,
        title: currentFormData.title,
        author: currentFormData.author,
        year: currentFormData.year,
        description:
          currentFormData.description ||
          selectedExternalMedia.description ||
          '',
      };
      createExternalMediaMutation.mutate(externalMediaData);
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className='relative z-50'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/30' aria-hidden='true' />

      {/* Container */}
      <div className='fixed inset-0 flex items-center justify-center p-4 overflow-y-auto'>
        <Dialog.Panel className='mx-auto max-w-4xl w-full bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center'>
                {watchedType ? (
                  getTypeIcon(watchedType)
                ) : (
                  <BookOpenIcon className='w-6 h-6 text-primary-600' />
                )}
              </div>
              <div className='ml-3'>
                <Dialog.Title className='text-lg font-medium text-gray-900'>
                  {isEditMode ? 'Modifier le média' : 'Ajouter un média'}
                </Dialog.Title>
                <p className='text-sm text-gray-500'>
                  {isEditMode
                    ? `Modification de "${media?.title}"`
                    : 'Créer un nouveau média'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          {/* Onglets */}
          {!isEditMode && (
            <div className='px-6 pt-2'>
              <div className='border-b border-gray-200'>
                <nav className='-mb-px flex space-x-8'>
                  <button
                    onClick={() => setActiveTab('manual')}
                    className={cn(
                      'py-2 px-1 border-b-2 font-medium text-sm',
                      activeTab === 'manual'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <PencilIcon className='h-4 w-4 inline mr-2' />
                    Ajout manuel
                  </button>
                  <button
                    onClick={() => setActiveTab('external')}
                    className={cn(
                      'py-2 px-1 border-b-2 font-medium text-sm',
                      activeTab === 'external'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <GlobeAltIcon className='h-4 w-4 inline mr-2' />
                    Données publiques
                  </button>
                </nav>
              </div>
            </div>
          )}

          {/* Contenu des onglets */}
          {activeTab === 'external' && !isEditMode && (
            <div className='p-6'>
              <div className='mb-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Rechercher dans les bases de données publiques
                </h3>
                <p className='text-sm text-gray-600'>
                  Recherchez des médias via Google Books, TMDB et MusicBrainz
                  pour récupérer automatiquement les informations.
                </p>
              </div>

              <ExternalMediaSearch
                onMediaSelect={handleExternalMediaSelect}
                selectedType={watch('type')}
              />

              {selectedExternalMedia && (
                <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='text-sm font-medium text-green-800'>
                        Média sélectionné: {selectedExternalMedia.title}
                      </h4>
                      <p className='text-sm text-green-600'>
                        Cliquez sur "Ajouter depuis données publiques" pour
                        l'ajouter directement, ou utilisez l'onglet "Ajout
                        manuel" pour personnaliser.
                      </p>
                    </div>
                    <button
                      onClick={handleCreateFromExternal}
                      disabled={createExternalMediaMutation.isPending}
                      className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50'
                    >
                      {createExternalMediaMutation.isPending
                        ? 'Ajout...'
                        : 'Ajouter depuis données publiques'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet ajout manuel */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSubmit(onSubmit)} className='p-6'>
              <div className='grid lg:grid-cols-2 gap-6'>
                {/* Colonne gauche - Image */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Image du média
                  </label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-4'>
                    {imagePreview ? (
                      <div className='relative'>
                        <img
                          src={imagePreview}
                          alt='Preview'
                          className='w-full h-48 object-cover rounded-lg'
                        />
                        <button
                          type='button'
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedImage(null);
                          }}
                          className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                        >
                          <XMarkIcon className='h-4 w-4' />
                        </button>
                      </div>
                    ) : (
                      <div className='text-center'>
                        <PhotoIcon className='mx-auto h-12 w-12 text-gray-400' />
                        <div className='mt-2'>
                          <label
                            htmlFor='image-upload'
                            className='cursor-pointer'
                          >
                            <span className='text-primary-600 hover:text-primary-500 font-medium'>
                              Télécharger une image
                            </span>
                            <input
                              id='image-upload'
                              type='file'
                              accept='image/*'
                              onChange={handleImageChange}
                              className='sr-only'
                            />
                          </label>
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                          PNG, JPG, JPEG jusqu'à 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonne droite - Informations */}
                <div className='space-y-4'>
                  <FormField
                    {...register('title')}
                    label='Titre *'
                    placeholder='Titre du média'
                    error={errors.title?.message}
                    disabled={isSubmitting}
                  />

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Type de média *
                    </label>
                    <Controller
                      name='type'
                      control={control}
                      render={({ field }) => (
                        <div className='grid grid-cols-3 gap-2'>
                          {(['book', 'movie', 'music'] as const).map(type => {
                            const isSelected = field.value === type;
                            const typeLabels = {
                              book: 'Livre',
                              movie: 'Film',
                              music: 'Musique',
                            };

                            return (
                              <button
                                key={type}
                                type='button'
                                onClick={() => field.onChange(type)}
                                className={cn(
                                  'flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all',
                                  isSelected
                                    ? getTypeColor(type)
                                    : 'border-gray-200 hover:border-gray-300'
                                )}
                              >
                                {getTypeIcon(type)}
                                <span className='text-sm font-medium'>
                                  {typeLabels[type]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                    {errors.type && (
                      <p className='text-sm text-red-600 mt-1'>
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <FormField
                    {...register('author')}
                    label='Auteur/Réalisateur/Artiste *'
                    placeholder="Nom de l'auteur"
                    error={errors.author?.message}
                    disabled={isSubmitting}
                  />

                  <FormField
                    {...register('year', { valueAsNumber: true })}
                    label='Année *'
                    type='number'
                    placeholder='2024'
                    error={errors.year?.message}
                    disabled={isSubmitting}
                  />

                  {isEditMode && (
                    <div className='flex items-center'>
                      <input
                        {...register('available')}
                        type='checkbox'
                        className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                      />
                      <label className='ml-2 text-sm text-gray-700'>
                        Média disponible
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className='mt-6'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className='input w-full resize-none'
                  placeholder='Description du média...'
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Catégorie */}
              <div className='mt-6'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Catégorie
                </label>
                <div className='flex space-x-2'>
                  <select
                    {...register('category')}
                    className='input flex-1'
                    disabled={isSubmitting}
                  >
                    <option value=''>Aucune catégorie</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type='button'
                    onClick={() => setShowNewCategoryForm(true)}
                    className='btn-secondary flex items-center'
                  >
                    <PlusIcon className='h-4 w-4 mr-1' />
                    Nouvelle
                  </button>
                </div>

                {showNewCategoryForm && (
                  <div className='mt-2 flex space-x-2'>
                    <input
                      type='text'
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder='Nom de la catégorie'
                      className='input flex-1'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        createCategoryMutation.mutate(newCategoryName)
                      }
                      disabled={
                        !newCategoryName.trim() ||
                        createCategoryMutation.isPending
                      }
                      className='btn-primary'
                    >
                      {createCategoryMutation.isPending
                        ? 'Création...'
                        : 'Créer'}
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        setShowNewCategoryForm(false);
                        setNewCategoryName('');
                      }}
                      className='btn-secondary'
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className='mt-6'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tags
                </label>
                <Controller
                  name='tags'
                  control={control}
                  render={({ field }) => (
                    <div>
                      <div className='flex flex-wrap gap-2 mb-2'>
                        {tags.map(tag => {
                          const isSelected = field.value?.includes(tag._id);
                          return (
                            <button
                              key={tag._id}
                              type='button'
                              onClick={() => {
                                const currentTags = field.value || [];
                                if (isSelected) {
                                  field.onChange(
                                    currentTags.filter(id => id !== tag._id)
                                  );
                                } else {
                                  field.onChange([...currentTags, tag._id]);
                                }
                              }}
                              className={cn(
                                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors',
                                isSelected
                                  ? 'bg-primary-100 text-primary-800 border border-primary-300'
                                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                              )}
                            >
                              #{tag.name}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type='button'
                        onClick={() => setShowNewTagForm(true)}
                        className='text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center'
                      >
                        <PlusIcon className='h-4 w-4 mr-1' />
                        Créer un nouveau tag
                      </button>

                      {showNewTagForm && (
                        <div className='mt-2 flex space-x-2'>
                          <input
                            type='text'
                            value={newTagName}
                            onChange={e => setNewTagName(e.target.value)}
                            placeholder='Nom du tag'
                            className='input flex-1'
                          />
                          <button
                            type='button'
                            onClick={() => createTagMutation.mutate(newTagName)}
                            disabled={
                              !newTagName.trim() || createTagMutation.isPending
                            }
                            className='btn-primary'
                          >
                            {createTagMutation.isPending
                              ? 'Création...'
                              : 'Créer'}
                          </button>
                          <button
                            type='button'
                            onClick={() => {
                              setShowNewTagForm(false);
                              setNewTagName('');
                            }}
                            className='btn-secondary'
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Actions */}
              <div className='flex space-x-3 mt-8 pt-6 border-t border-gray-200'>
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
                    'Modifier le média'
                  ) : (
                    'Créer le média'
                  )}
                </button>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MediaFormModal;
