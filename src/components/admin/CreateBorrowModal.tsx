// src/components/admin/CreateBorrowModal.tsx
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  XMarkIcon, 
  ClockIcon,
  UserIcon,
  BookOpenIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import FormField from '../forms/FormField';
import adminBorrowService from '../../services/adminBorrowService';
import adminUserService from '../../services/adminUserService';
import adminMediaService from '../../services/adminMediaService';
import type { User, Media } from '../../types';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const createBorrowSchema = z.object({
  userId: z
    .string()
    .min(1, 'L\'utilisateur est requis'),
  mediaId: z
    .string()
    .min(1, 'Le média est requis'),
  dueDate: z
    .string()
    .optional()
});

type CreateBorrowFormData = z.infer<typeof createBorrowSchema>;

interface CreateBorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateBorrowModal: React.FC<CreateBorrowModalProps> = ({
  isOpen,
  onClose
}) => {
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [mediaSearch, setMediaSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<CreateBorrowFormData>({
    resolver: zodResolver(createBorrowSchema),
    defaultValues: {
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +14 jours
    }
  });

  // Recherche d'utilisateurs
  const { data: usersResponse } = useQuery({
    queryKey: ['admin-users-search', userSearch],
    queryFn: () => adminUserService.getUsers({ 
      search: userSearch,
      limit: 10,
      status: 'active'
    }),
    enabled: userSearch.length >= 2,
    staleTime: 30 * 1000,
  });

  // Recherche de médias disponibles
  const { data: mediaResults } = useQuery({
    queryKey: ['admin-media-search', mediaSearch],
    queryFn: () => adminMediaService.getMedia({ 
      search: mediaSearch,
      limit: 10,
      available: true
    }),
    enabled: mediaSearch.length >= 2,
    staleTime: 30 * 1000,
  });

  // Extraire les données des réponses paginées
  const users = usersResponse?.data || [];
  const media = mediaResults?.data || [];

  // Mutation pour créer l'emprunt
  const createBorrowMutation = useMutation({
    mutationFn: (data: CreateBorrowFormData) => adminBorrowService.createBorrow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrows'] });
      queryClient.invalidateQueries({ queryKey: ['admin-borrow-stats'] });
      toast.success('Emprunt créé avec succès');
      handleClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création de l\'emprunt';
      toast.error(message);
    }
  });

  const handleClose = () => {
    reset();
    setUserSearch('');
    setMediaSearch('');
    setSelectedUser(null);
    setSelectedMedia(null);
    onClose();
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setValue('userId', user._id);
    setUserSearch(user.name);
  };

  const handleSelectMedia = (media: Media) => {
    setSelectedMedia(media);
    setValue('mediaId', media._id);
    setMediaSearch(media.title);
  };

  const onSubmit = (data: CreateBorrowFormData) => {
    createBorrowMutation.mutate(data);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-3">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Créer un nouvel emprunt
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  Enregistrer un emprunt effectué en présentiel
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-6">
              {/* Recherche utilisateur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilisateur *
                </label>
                <div className="relative">
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className={cn(
                        'input pl-10 w-full',
                        selectedUser && 'bg-green-50 border-green-300'
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Résultats de recherche utilisateurs */}
                  {userSearch.length >= 2 && users.length > 0 && !selectedUser && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                      {users.slice(0, 5).map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedUser && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{selectedUser.name}</div>
                        <div className="text-sm text-gray-500">{selectedUser.email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setValue('userId', '');
                        setUserSearch('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {errors.userId && (
                  <p className="text-sm text-red-600 mt-1">{errors.userId.message}</p>
                )}
              </div>

              {/* Recherche média */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Média *
                </label>
                <div className="relative">
                  <div className="relative">
                    <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un média disponible..."
                      value={mediaSearch}
                      onChange={(e) => setMediaSearch(e.target.value)}
                      className={cn(
                        'input pl-10 w-full',
                        selectedMedia && 'bg-green-50 border-green-300'
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Résultats de recherche médias */}
                  {mediaSearch.length >= 2 && media.length > 0 && !selectedMedia && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                      {media.slice(0, 5).map((media) => (
                        <button
                          key={media._id}
                          type="button"
                          onClick={() => handleSelectMedia(media)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                        >
                          <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            {media.imageUrl ? (
                              <img
                                src={media.imageUrl}
                                alt={media.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <BookOpenIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{media.title}</div>
                            <div className="text-sm text-gray-500">{media.author} • {media.year}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedMedia && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {selectedMedia.imageUrl ? (
                          <img
                            src={selectedMedia.imageUrl}
                            alt={selectedMedia.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <BookOpenIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{selectedMedia.title}</div>
                        <div className="text-sm text-gray-500">{selectedMedia.author} • {selectedMedia.year}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMedia(null);
                        setValue('mediaId', '');
                        setMediaSearch('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {errors.mediaId && (
                  <p className="text-sm text-red-600 mt-1">{errors.mediaId.message}</p>
                )}
              </div>

              {/* Date d'échéance */}
              <div>
                <FormField
                  {...register('dueDate')}
                  label="Date d'échéance"
                  type="date"
                  error={errors.dueDate?.message}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Par défaut : 14 jours à partir d'aujourd'hui
                </p>
              </div>

              {/* Informations importantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 mb-2">
                      📋 Informations importantes
                    </h4>
                    <ul className="text-blue-800 space-y-1 list-disc list-inside">
                      <li>Contrôlez l'état du média avant l'emprunt</li>
                      <li>L'utilisateur recevra un email de confirmation automatique</li>
                      <li>Un rappel sera envoyé 2 jours avant l'échéance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedUser || !selectedMedia}
                className="flex-1 btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Création...
                  </>
                ) : (
                  'Créer l\'emprunt'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateBorrowModal;