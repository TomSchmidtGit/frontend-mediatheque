import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import FormField from '../../components/forms/FormField';
import toast from 'react-hot-toast';
import { MetaTagsComponent } from '../../components/common/MetaTags';
import { generateMetaTags } from '../../config/metaTags';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const metaTags = generateMetaTags('forgotPassword');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) =>
      authService.forgotPassword(data.email),
    onSuccess: () => {
      setIsEmailSent(true);
      reset();
      toast.success('Email de réinitialisation envoyé');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erreur lors de l'envoi de l'email";
      toast.error(message);
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  if (isEmailSent) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <div className='text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100'>
                <EnvelopeIcon className='h-6 w-6 text-green-600' />
              </div>
              <h2 className='mt-6 text-3xl font-bold tracking-tight text-gray-900'>
                Email envoyé !
              </h2>
              <p className='mt-2 text-sm text-gray-600'>
                Si cet email existe dans notre base, vous recevrez un lien de
                réinitialisation dans quelques minutes.
              </p>
            </div>

            <div className='mt-6'>
              <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-blue-400'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-blue-800'>
                      Vérifiez votre boîte de réception
                    </h3>
                    <div className='mt-2 text-sm text-blue-700'>
                      <p>
                        N'oubliez pas de vérifier vos spams si vous ne recevez
                        pas l'email dans les prochaines minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-6 text-center'>
              <Link
                to='/login'
                className='text-sm text-blue-600 hover:text-blue-500'
              >
                ← Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTagsComponent metaTags={metaTags} />
      <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
              Mot de passe oublié ?
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              Entrez votre adresse email et nous vous enverrons un lien pour
              réinitialiser votre mot de passe.
            </p>
          </div>
        </div>

        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
              <FormField
                {...register('email')}
                name='email'
                label='Adresse email'
                type='email'
                error={errors.email?.message}
                placeholder='votre@email.com'
                required
              />

              <div>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting
                    ? 'Envoi en cours...'
                    : 'Envoyer le lien de réinitialisation'}
                </button>
              </div>
            </form>

            <div className='mt-6 text-center'>
              <Link
                to='/login'
                className='inline-flex items-center text-sm text-blue-600 hover:text-blue-500'
              >
                <ArrowLeftIcon className='h-4 w-4 mr-1' />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
