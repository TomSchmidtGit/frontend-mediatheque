// src/pages/auth/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/forms/FormField';
import { registerSchema } from '../../utils/validation';
import type { RegisterFormData } from '../../utils/validation';
import { cn } from '../../utils';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirection automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Rediriger vers l'admin si c'est un admin, sinon vers le dashboard user
      const redirectTo = isAdmin ? '/admin' : '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, isAdmin]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Surveiller le mot de passe pour afficher les critères
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      // La redirection sera gérée par l'useEffect après l'inscription
    } catch (error: any) {
      // Gestion des erreurs spécifiques
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription';
      
      if (message.toLowerCase().includes('email')) {
        setError('email', { message });
      } else if (message.toLowerCase().includes('name') || message.toLowerCase().includes('nom')) {
        setError('name', { message });
      } else {
        setError('root', { message });
      }
    }
  };

  // Critères de validation du mot de passe
  const passwordCriteria = [
    { text: 'Au moins 6 caractères', valid: password && password.length >= 6 },
    { text: 'Une majuscule', valid: password && /[A-Z]/.test(password) },
    { text: 'Une minuscule', valid: password && /[a-z]/.test(password) },
    { text: 'Un chiffre', valid: password && /\d/.test(password) },
  ];

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, on ne devrait pas arriver ici grâce à l'useEffect,
  // mais on ajoute une sécurité supplémentaire
  if (isAuthenticated) {
    return null; // La redirection sera gérée par l'useEffect
  }

  return (
    <div className="min-h-screen flex auth-page">
      {/* Côté gauche - Formulaire */}
      <div className="flex-1 flex flex-col px-4 py-6 sm:px-6 lg:flex-none lg:px-20 xl:px-24 lg:py-0 lg:justify-center">
        {/* Sur mobile : pas de justify-center, sur desktop : justify-center */}
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-4 lg:mt-6 text-2xl lg:text-3xl font-bold text-gray-900">
              Créez votre compte
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Rejoignez notre communauté et accédez à toute notre collection
            </p>
          </div>

          {/* Formulaire */}
          <div className="mt-6 lg:mt-8">
            <form className="space-y-4 lg:space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Erreur générale */}
              {errors.root && (
                <div className="rounded-md bg-red-50 p-3 lg:p-4 border border-red-200">
                  <p className="text-sm text-red-800">{errors.root.message}</p>
                </div>
              )}

              <FormField
                {...register('name')}
                label="Nom complet"
                type="text"
                placeholder="Jean Dupont"
                error={errors.name?.message}
                autoComplete="name"
                disabled={isSubmitting || loading}
              />

              <FormField
                {...register('email')}
                label="Adresse email"
                type="email"
                placeholder="nom@exemple.com"
                error={errors.email?.message}
                autoComplete="email"
                disabled={isSubmitting || loading}
              />

              <div className="space-y-2">
                <FormField
                  {...register('password')}
                  label="Mot de passe"
                  placeholder="Créez un mot de passe sécurisé"
                  error={errors.password?.message}
                  showPasswordToggle
                  isPasswordVisible={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  autoComplete="new-password"
                  disabled={isSubmitting || loading}
                />
                
                {/* Critères du mot de passe (compacts sur mobile) */}
                {password && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-2">Critères du mot de passe :</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {passwordCriteria.map((criterion, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <CheckCircleIcon 
                            className={cn(
                              'h-3 w-3 mr-1 flex-shrink-0',
                              criterion.valid ? 'text-green-500' : 'text-gray-300'
                            )} 
                          />
                          <span className={criterion.valid ? 'text-green-700' : 'text-gray-500'}>
                            {criterion.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <FormField
                {...register('confirmPassword')}
                label="Confirmer le mot de passe"
                placeholder="Répétez votre mot de passe"
                error={errors.confirmPassword?.message}
                showPasswordToggle
                isPasswordVisible={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                autoComplete="new-password"
                disabled={isSubmitting || loading}
              />

              {/* Conditions d'utilisation (compactes sur mobile) */}
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    J'accepte les{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-500 font-medium">
                      conditions d'utilisation
                    </Link>
                    {' '}et la{' '}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-500 font-medium">
                      politique de confidentialité
                    </Link>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className={cn(
                  'w-full flex justify-center items-center py-2.5 lg:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
                  'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all duration-200 lg:transform lg:hover:-translate-y-0.5 lg:hover:shadow-md',
                  (isSubmitting || loading) && 'cursor-not-allowed opacity-50'
                )}
              >
                {isSubmitting || loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création du compte...
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Lien vers connexion */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Côté droit - Image/Design (Desktop uniquement) */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-green-600 via-green-700 to-green-800">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative h-full flex flex-col justify-center items-center text-white p-12">
            <div className="max-w-md text-center">
              <h3 className="text-3xl font-bold mb-4">
                Rejoignez notre communauté
              </h3>
              <p className="text-lg text-green-100 mb-8">
                Profitez d'un accès illimité à notre collection de médias et découvrez de nouveaux univers culturels.
              </p>
              
              {/* Avantages */}
              <div className="space-y-3 text-left">
                {[
                  'Emprunts illimités et gratuits',
                  'Recommandations personnalisées',
                  'Accès prioritaire aux nouveautés',
                  'Communauté active et bienveillante'
                ].map((advantage, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-300 mr-3" />
                    <span className="text-sm">{advantage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;