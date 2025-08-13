// src/pages/user/SettingsPage.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  UserCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/forms/FormField';
import DeactivateAccountModal from '../../components/modals/DeleteAccountModal';
import userService from '../../services/userService';
import borrowService from '../../services/borrowService';
import authService from '../../services/authService';
import { profileSchema, passwordSchema } from '../../utils/validation';
import type { ProfileFormData, PasswordFormData } from '../../utils/validation';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'account'
  >('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Récupérer les emprunts de l'utilisateur pour les statistiques
  const { data: borrowsData, isLoading: borrowsLoading } = useQuery({
    queryKey: ['my-borrows-settings'],
    queryFn: () => borrowService.getMyBorrows({ page: 1, limit: 100 }), // Récupérer plus d'emprunts pour les stats
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // Calculer les statistiques réelles
  const userStats = React.useMemo(() => {
    if (!borrowsData?.data) {
      return {
        activeLoans: 0,
        favoriteCount: Array.isArray(user?.favorites)
          ? user.favorites.length
          : 0,
        totalLoans: 0,
        overdueLoans: 0,
      };
    }

    const activeLoans = borrowsData.data.filter(
      b => b.status === 'borrowed'
    ).length;
    const overdueLoans = borrowsData.data.filter(
      b => new Date(b.dueDate) < new Date() && b.status !== 'returned'
    ).length;

    return {
      activeLoans,
      favoriteCount: Array.isArray(user?.favorites) ? user.favorites.length : 0,
      totalLoans: borrowsData.data.length,
      overdueLoans,
    };
  }, [borrowsData?.data, user?.favorites]);

  // Formulaire de profil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Formulaire de changement de mot de passe
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => userService.updateProfile(data),
    onSuccess: updatedUser => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Profil mis à jour avec succès');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    },
  });

  // Mutation pour changer le mot de passe
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) =>
      authService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      resetPassword();
      toast.success(
        'Mot de passe modifié avec succès. Vous allez être déconnecté pour des raisons de sécurité.'
      );
      // Déconnexion forcée après changement de mot de passe
      setTimeout(() => {
        logout();
      }, 2000);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Erreur lors du changement de mot de passe';
      toast.error(message);
    },
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const handleDeleteSuccess = () => {
    toast.success('Compte désactivé avec succès');
    logout();
  };

  const tabs = [
    {
      id: 'profile' as const,
      name: 'Profil',
      icon: UserCircleIcon,
      description: 'Informations personnelles',
    },
    {
      id: 'security' as const,
      name: 'Sécurité',
      icon: KeyIcon,
      description: 'Mot de passe et sécurité',
    },
    {
      id: 'account' as const,
      name: 'Compte',
      icon: ShieldCheckIcon,
      description: 'Gestion du compte',
    },
  ];

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='page-container py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>
            Paramètres
          </h1>
          <p className='text-gray-600 text-lg'>
            Gérez votre profil et vos préférences
          </p>
        </div>

        <div className='grid lg:grid-cols-4 gap-8'>
          {/* Sidebar avec onglets */}
          <div className='lg:col-span-1'>
            <nav className='space-y-1'>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200',
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon className='h-5 w-5 mr-3' />
                    <div>
                      <div className='font-medium'>{tab.name}</div>
                      <div className='text-xs text-gray-500'>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu principal */}
          <div className='lg:col-span-3'>
            {/* Onglet Profil */}
            {activeTab === 'profile' && (
              <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h2 className='text-lg font-semibold text-gray-900 flex items-center'>
                    <UserCircleIcon className='h-5 w-5 mr-2' />
                    Informations personnelles
                  </h2>
                  <p className='text-sm text-gray-600 mt-1'>
                    Mettez à jour vos informations de profil
                  </p>
                </div>

                <form
                  onSubmit={handleSubmitProfile(onSubmitProfile)}
                  className='p-6 space-y-6'
                >
                  <div className='grid md:grid-cols-2 gap-6'>
                    <FormField
                      {...registerProfile('name')}
                      label='Nom complet'
                      placeholder='Votre nom complet'
                      error={profileErrors.name?.message}
                      disabled={isSubmittingProfile}
                    />

                    <FormField
                      {...registerProfile('email')}
                      label='Adresse email'
                      type='email'
                      placeholder='votre@email.com'
                      error={profileErrors.email?.message}
                      disabled={isSubmittingProfile}
                    />
                  </div>

                  {/* Informations sur le compte */}
                  <div className='grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Rôle
                      </label>
                      <div className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600'>
                        {user?.role === 'admin'
                          ? 'Administrateur'
                          : user?.role === 'employee'
                            ? 'Employé'
                            : 'Utilisateur'}
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Membre depuis
                      </label>
                      <div className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600'>
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              'fr-FR',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-end pt-6 border-t border-gray-200'>
                    <button
                      type='button'
                      onClick={() => resetProfile()}
                      className='btn-secondary mr-3'
                      disabled={isSubmittingProfile}
                    >
                      Annuler
                    </button>
                    <button
                      type='submit'
                      disabled={isSubmittingProfile}
                      className='btn-primary'
                    >
                      {isSubmittingProfile ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2'></div>
                          Enregistrement...
                        </>
                      ) : (
                        'Enregistrer les modifications'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Onglet Sécurité */}
            {activeTab === 'security' && (
              <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h2 className='text-lg font-semibold text-gray-900 flex items-center'>
                    <KeyIcon className='h-5 w-5 mr-2' />
                    Sécurité du compte
                  </h2>
                  <p className='text-sm text-gray-600 mt-1'>
                    Gérez la sécurité de votre compte
                  </p>
                </div>

                <form
                  onSubmit={handleSubmitPassword(onSubmitPassword)}
                  className='p-6 space-y-6'
                >
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                    <div className='flex items-start'>
                      <ShieldCheckIcon className='h-5 w-5 text-blue-600 mr-3 mt-0.5' />
                      <div>
                        <h3 className='text-sm font-medium text-blue-900 mb-1'>
                          Changement de mot de passe
                        </h3>
                        <p className='text-sm text-blue-700'>
                          Utilisez un mot de passe fort avec au moins 6
                          caractères, incluant majuscules, minuscules et
                          chiffres.
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormField
                    {...registerPassword('currentPassword')}
                    label='Mot de passe actuel'
                    placeholder='Votre mot de passe actuel'
                    error={passwordErrors.currentPassword?.message}
                    showPasswordToggle
                    isPasswordVisible={showCurrentPassword}
                    onTogglePassword={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }
                    disabled={isSubmittingPassword}
                  />

                  <FormField
                    {...registerPassword('newPassword')}
                    label='Nouveau mot de passe'
                    placeholder='Votre nouveau mot de passe'
                    error={passwordErrors.newPassword?.message}
                    showPasswordToggle
                    isPasswordVisible={showNewPassword}
                    onTogglePassword={() =>
                      setShowNewPassword(!showNewPassword)
                    }
                    disabled={isSubmittingPassword}
                  />

                  <FormField
                    {...registerPassword('confirmPassword')}
                    label='Confirmer le nouveau mot de passe'
                    placeholder='Confirmez votre nouveau mot de passe'
                    error={passwordErrors.confirmPassword?.message}
                    showPasswordToggle
                    isPasswordVisible={showConfirmPassword}
                    onTogglePassword={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    disabled={isSubmittingPassword}
                  />

                  <div className='flex justify-end pt-6 border-t border-gray-200'>
                    <button
                      type='button'
                      onClick={() => resetPassword()}
                      className='btn-secondary mr-3'
                      disabled={isSubmittingPassword}
                    >
                      Annuler
                    </button>
                    <button
                      type='submit'
                      disabled={isSubmittingPassword}
                      className='btn-primary'
                    >
                      {isSubmittingPassword ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2'></div>
                          Modification...
                        </>
                      ) : (
                        'Changer le mot de passe'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Onglet Compte */}
            {activeTab === 'account' && (
              <div className='space-y-6'>
                {/* Statistiques du compte */}
                <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                  <div className='px-6 py-4 border-b border-gray-200'>
                    <h2 className='text-lg font-semibold text-gray-900 flex items-center'>
                      <ShieldCheckIcon className='h-5 w-5 mr-2' />
                      Informations du compte
                    </h2>
                  </div>
                  <div className='p-6'>
                    {borrowsLoading ? (
                      <div className='grid md:grid-cols-3 gap-6'>
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className='text-center p-4 bg-gray-50 rounded-lg'
                          >
                            <div className='animate-pulse'>
                              <div className='h-8 bg-gray-200 rounded mb-2'></div>
                              <div className='h-4 bg-gray-200 rounded'></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='grid md:grid-cols-3 gap-6'>
                        <div className='text-center p-4 bg-blue-50 rounded-lg'>
                          <div className='text-2xl font-bold text-gray-900'>
                            {userStats.favoriteCount}
                          </div>
                          <div className='text-sm text-gray-600'>Favoris</div>
                        </div>
                        <div className='text-center p-4 bg-green-50 rounded-lg'>
                          <div className='text-2xl font-bold text-green-600'>
                            {userStats.activeLoans}
                          </div>
                          <div className='text-sm text-gray-600'>
                            Emprunts en cours
                          </div>
                        </div>
                        <div className='text-center p-4 bg-purple-50 rounded-lg'>
                          <div className='text-2xl font-bold text-purple-600'>
                            {userStats.totalLoans}
                          </div>
                          <div className='text-sm text-gray-600'>
                            Total emprunts
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions de compte */}
                <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                  <div className='px-6 py-4 border-b border-gray-200'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Actions du compte
                    </h2>
                  </div>
                  <div className='p-6 space-y-4'>
                    <div className='flex items-center justify-between py-4'>
                      <div>
                        <h3 className='text-sm font-medium text-orange-900'>
                          Désactiver le compte
                        </h3>
                        <p className='text-xs text-orange-600 mt-1'>
                          Désactiver temporairement votre compte (réversible par
                          un administrateur)
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className='px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors'
                      >
                        <ExclamationTriangleIcon className='h-4 w-4 mr-1 inline' />
                        Désactiver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de désactivation de compte */}
        <DeactivateAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
