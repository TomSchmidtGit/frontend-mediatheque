// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/forms/FormField';
import { loginSchema } from '../../utils/validation';
import type { LoginFormData } from '../../utils/validation';
import { cn } from '../../utils';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer la page de redirection ou aller au dashboard par défaut
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirection automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Si l'utilisateur est admin et qu'il n'y a pas de redirection spécifique,
      // on peut le rediriger vers l'admin, sinon vers le dashboard user
      const redirectTo = isAdmin && from === '/dashboard' ? '/admin' : from;
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from, isAdmin]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      // La redirection sera gérée par l'useEffect après la connexion
    } catch (error: any) {
      // Gestion des erreurs spécifiques
      const message =
        error.response?.data?.message || 'Erreur lors de la connexion';

      if (message.toLowerCase().includes('email')) {
        setError('email', { message });
      } else if (
        message.toLowerCase().includes('password') ||
        message.toLowerCase().includes('mot de passe')
      ) {
        setError('password', { message });
      } else {
        setError('root', { message });
      }
    }
  };

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Vérification de votre session...</p>
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
    <div className='min-h-screen flex auth-page'>
      {/* Côté gauche - Formulaire */}
      <div className='flex-1 flex flex-col px-4 py-6 sm:px-6 lg:flex-none lg:px-20 xl:px-24 lg:py-0 lg:justify-center'>
        {/* Sur mobile : pas de justify-center, sur desktop : justify-center */}
        <div className='mx-auto w-full max-w-sm lg:w-96'>
          {/* Header */}
          <div className='text-center'>
            <h2 className='mt-4 lg:mt-6 text-2xl lg:text-3xl font-bold text-gray-900'>
              Bon retour parmi nous !
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              Connectez-vous à votre compte pour accéder à votre espace
              personnel
            </p>
          </div>

          {/* Formulaire */}
          <div className='mt-6 lg:mt-8'>
            <form
              className='space-y-5 lg:space-y-6'
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Erreur générale */}
              {errors.root && (
                <div className='rounded-md bg-red-50 p-3 lg:p-4 border border-red-200'>
                  <p className='text-sm text-red-800'>{errors.root.message}</p>
                </div>
              )}

              <FormField
                {...register('email')}
                label='Adresse email'
                type='email'
                placeholder='nom@exemple.com'
                error={errors.email?.message}
                autoComplete='email'
                disabled={isSubmitting || loading}
              />

              <FormField
                {...register('password')}
                label='Mot de passe'
                placeholder='Votre mot de passe'
                error={errors.password?.message}
                showPasswordToggle
                isPasswordVisible={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                autoComplete='current-password'
                disabled={isSubmitting || loading}
              />

              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center'>
                  <input
                    id='remember-me'
                    name='remember-me'
                    type='checkbox'
                    className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                  />
                  <label
                    htmlFor='remember-me'
                    className='ml-2 block text-gray-700'
                  >
                    Se souvenir de moi
                  </label>
                </div>

                <Link
                  to='/forgot-password'
                  className='font-medium text-primary-600 hover:text-primary-500 transition-colors'
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type='submit'
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
                    <svg
                      className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRightIcon className='ml-2 h-4 w-4' />
                  </>
                )}
              </button>
            </form>

            {/* Lien vers inscription */}
            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-600'>
                Pas encore de compte ?{' '}
                <Link
                  to='/register'
                  className='font-medium text-primary-600 hover:text-primary-500 transition-colors'
                >
                  Créer un compte gratuitement
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Côté droit - Image/Design (Desktop uniquement) */}
      <div className='hidden lg:block relative w-0 flex-1'>
        <div className='absolute inset-0 h-full w-full bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800'>
          <div className='absolute inset-0 bg-black opacity-20'></div>
          <div className='relative h-full flex flex-col justify-center items-center text-white p-12'>
            <div className='max-w-md text-center'>
              <h3 className='text-3xl font-bold mb-4'>
                Accédez à votre univers culturel
              </h3>
              <p className='text-lg text-primary-100 mb-8'>
                Retrouvez vos emprunts, découvrez de nouveaux médias et gérez
                vos favoris en toute simplicité.
              </p>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div className='bg-white/10 rounded-lg p-3'>
                  <div className='font-semibold'>1000+</div>
                  <div className='text-primary-100'>Médias disponibles</div>
                </div>
                <div className='bg-white/10 rounded-lg p-3'>
                  <div className='font-semibold'>24/7</div>
                  <div className='text-primary-100'>Accès en ligne</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
