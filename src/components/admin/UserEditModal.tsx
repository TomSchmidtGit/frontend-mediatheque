// src/components/admin/UserEditModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  XMarkIcon, 
  UserCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormField from '../forms/FormField';
import adminUserService from '../../services/adminUserService';
import type { User } from '../../types';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const userEditSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
  role: z.enum(['user', 'employee', 'admin'])
});

type UserEditFormData = z.infer<typeof userEditSchema>;

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const queryClient = useQueryClient();
  const [confirmRoleChange, setConfirmRoleChange] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema)
  });

  const currentRole = watch('role');

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role
      });
      setConfirmRoleChange(false);
    }
  }, [user, reset]);

  // Mutation pour mettre à jour l'utilisateur
  const updateUserMutation = useMutation({
    mutationFn: (data: UserEditFormData) => 
      adminUserService.updateUser(user!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user', user!._id] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      toast.success('Utilisateur mis à jour avec succès');
      handleClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    }
  });

  const handleClose = () => {
    reset();
    setConfirmRoleChange(false);
    onClose();
  };

  const onSubmit = async (data: UserEditFormData) => {
    if (!user) return;

    // Vérifier si le rôle a changé et si c'est sensible
    const roleChanged = data.role !== user.role;
    const isSensitiveRoleChange = roleChanged && (
      (user.role === 'admin' && data.role !== 'admin') ||
      (user.role !== 'admin' && data.role === 'admin')
    );

    if (isSensitiveRoleChange && !confirmRoleChange) {
      setConfirmRoleChange(true);
      return;
    }

    updateUserMutation.mutate(data);
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrateur',
          description: 'Accès complet à toutes les fonctionnalités',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      case 'employee':
        return {
          label: 'Employé',
          description: 'Gestion des emprunts et des médias',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'user':
      default:
        return {
          label: 'Utilisateur',
          description: 'Emprunt et consultation des médias',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Container scrollable */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-3">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Modifier l'utilisateur
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  {user.name} • {user.email}
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
            {/* Confirmation de changement de rôle */}
            {confirmRoleChange && (
              <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-orange-900 mb-2">
                      Confirmer le changement de rôle
                    </h4>
                    <p className="text-sm text-orange-800 mb-3">
                      Vous êtes sur le point de changer le rôle de <strong>{user.name}</strong> 
                      de <strong>{getRoleInfo(user.role).label}</strong> vers <strong>{getRoleInfo(currentRole).label}</strong>.
                    </p>
                    <p className="text-xs text-orange-700">
                      Cette action aura un impact sur les permissions de l'utilisateur.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <FormField
                {...register('name')}
                label="Nom complet"
                placeholder="Nom de l'utilisateur"
                error={errors.name?.message}
                disabled={isSubmitting}
              />

              <FormField
                {...register('email')}
                label="Adresse email"
                type="email"
                placeholder="email@exemple.com"
                error={errors.email?.message}
                disabled={isSubmitting}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle et permissions
                </label>
                <div className="space-y-3">
                  {(['user', 'employee', 'admin'] as const).map((role) => {
                    const roleInfo = getRoleInfo(role);
                    const isSelected = currentRole === role;
                    
                    return (
                      <label
                        key={role}
                        className={cn(
                          'flex items-start p-3 rounded-lg border cursor-pointer transition-all',
                          isSelected 
                            ? 'border-primary-200 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <input
                          {...register('role')}
                          type="radio"
                          value={role}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          disabled={isSubmitting}
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <span className={cn(
                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2',
                              roleInfo.bgColor,
                              roleInfo.color
                            )}>
                              <ShieldCheckIcon className="w-3 h-3 mr-1" />
                              {roleInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {roleInfo.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
                )}
              </div>

              {/* Informations supplémentaires */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Informations du compte</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Statut:</span>
                    <div className="mt-1">
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        user.actif 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      )}>
                        {user.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Favoris:</span>
                    <div className="mt-1 font-medium">
                      {Array.isArray(user.favorites) ? user.favorites.length : 0}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Inscrit le:</span>
                    <div className="mt-1 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={confirmRoleChange ? () => setConfirmRoleChange(false) : handleClose}
                disabled={isSubmitting}
                className="flex-1 btn-secondary"
              >
                {confirmRoleChange ? 'Annuler la confirmation' : 'Annuler'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'flex-1 btn-primary',
                  confirmRoleChange && 'bg-orange-600 hover:bg-orange-700'
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Enregistrement...
                  </>
                ) : confirmRoleChange ? (
                  'Confirmer le changement'
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default UserEditModal;