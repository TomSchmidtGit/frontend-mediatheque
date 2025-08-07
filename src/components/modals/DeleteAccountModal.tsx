// src/components/modals/DeleteAccountModal.tsx
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import FormField from '../forms/FormField';
import userService from '../../services/userService';
import { deleteAccountSchema } from '../../utils/validation';
import type { DeleteAccountFormData } from '../../utils/validation';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema)
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (data: DeleteAccountFormData) => userService.deleteAccount(data.password),
    onSuccess: () => {
      toast.success('Compte supprimé avec succès');
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression du compte';
      toast.error(message);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: DeleteAccountFormData) => {
    deleteAccountMutation.mutate(data);
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
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Supprimer le compte
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  Cette action est irréversible
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
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-medium text-red-900 mb-2">
                      Attention : cette action est définitive !
                    </h4>
                    <ul className="text-red-800 space-y-1 list-disc list-inside">
                      <li>Votre compte sera définitivement supprimé</li>
                      <li>Tous vos favoris seront perdus</li>
                      <li>Votre historique d'emprunts sera supprimé</li>
                      <li>Cette action ne peut pas être annulée</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  {...register('password')}
                  label="Mot de passe actuel"
                  placeholder="Confirmez votre mot de passe"
                  error={errors.password?.message}
                  showPasswordToggle
                  isPasswordVisible={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                />

                <div>
                  <FormField
                    {...register('confirmation')}
                    label='Tapez "SUPPRIMER" pour confirmer'
                    placeholder="SUPPRIMER"
                    error={errors.confirmation?.message}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Vous devez taper exactement "SUPPRIMER" (en majuscules) pour confirmer.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
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
                disabled={isSubmitting}
                className={cn(
                  'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white',
                  'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Suppression...
                  </>
                ) : (
                  'Supprimer définitivement'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DeleteAccountModal;