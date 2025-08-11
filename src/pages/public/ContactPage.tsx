// src/pages/public/ContactPage.tsx - VERSION AVEC LIENS INTERACTIFS
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  EnvelopeIcon, 
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  PaperAirplaneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import FormField from '../../components/forms/FormField';
import { contactService } from '../../services';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

// Schéma de validation pour le formulaire de contact
const contactSchema = z.object({
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
  subject: z
    .string()
    .min(1, 'Le sujet est requis')
    .min(5, 'Le sujet doit contenir au moins 5 caractères')
    .max(100, 'Le sujet ne peut pas dépasser 100 caractères'),
  message: z
    .string()
    .min(1, 'Le message est requis')
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\d\s\+\-\(\)]{10,}$/.test(val), {
      message: 'Format de téléphone invalide'
    })
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      phone: ''
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await contactService.sendMessage(data);
      setIsSubmitted(true);
      reset();
      toast.success('Message envoyé avec succès ! Nous vous répondrons rapidement.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi du message';
      toast.error(message);
    }
  };

  const contactInfo = [
    {
      icon: MapPinIcon,
      title: 'Adresse',
      details: [
        '79 Rue des Jardiniers',
        '69400 Villefranche-sur-Saône',
        'France'
      ],
      action: {
        type: 'maps',
        href: 'https://www.google.com/maps/search/?api=1&query=79+Rue+des+Jardiniers,+69400+Villefranche-sur-Saône',
        label: 'Voir sur Google Maps'
      }
    },
    {
      icon: PhoneIcon,
      title: 'Téléphone',
      details: [
        '04 74 60 00 00',
        'Du mardi au samedi'
      ],
      action: {
        type: 'phone',
        href: 'tel:0474600000',
        label: 'Appeler maintenant'
      }
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: [
        'contact@mediatheque.fr',
        'Réponse sous 24h'
      ],
      action: {
        type: 'email',
        href: 'mailto:contact@mediatheque.fr?subject=Contact depuis le site web',
        label: 'Envoyer un email'
      }
    },
    {
      icon: ClockIcon,
      title: 'Horaires',
      details: [
        'Mar, Mer, Ven, Sam : 10h00 - 18h00',
        'Jeudi : 16h00 - 20h00',
        'Lundi et Dimanche : Fermé'
      ]
    }
  ];

  const predefinedSubjects = [
    'Informations générales',
    'Inscription / Création de compte',
    'Problème technique',
    'Suggestion d\'amélioration',
    'Partenariat',
    'Autre'
  ];

  if (isSubmitted) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="page-container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Message envoyé avec succès !
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais, 
                généralement sous 24 heures.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="btn-primary"
                >
                  Envoyer un autre message
                </button>
                <a
                  href="/"
                  className="btn-secondary"
                >
                  Retour à l'accueil
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>
        
        <div className="relative page-container py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Une question, une suggestion ou besoin d'aide ? Notre équipe est là pour vous accompagner. 
              N'hésitez pas à nous contacter !
            </p>
          </div>
        </div>
      </div>

      <div className="page-container py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Informations de contact */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Nos coordonnées
            </h2>
            
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {info.title}
                        </h3>
                        <div className="space-y-1 mb-3">
                          {info.details.map((detail, detailIndex) => (
                            <p key={detailIndex} className="text-gray-600 text-sm">
                              {detail}
                            </p>
                          ))}
                        </div>
                        
                        {/* Action interactive */}
                        {info.action && (
                          <a
                            href={info.action.href}
                            target={info.action.type === 'maps' ? '_blank' : undefined}
                            rel={info.action.type === 'maps' ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors group"
                          >
                            {info.action.type === 'maps' && <MapPinIcon className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />}
                            {info.action.type === 'phone' && <PhoneIcon className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />}
                            {info.action.type === 'email' && <EnvelopeIcon className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />}
                            {info.action.label}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Envoyez-nous un message
                </h2>
                <p className="text-gray-600">
                  Nous nous efforçons de répondre à tous les messages dans les 24 heures.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    {...register('name')}
                    label="Nom complet *"
                    placeholder="Votre nom et prénom"
                    error={errors.name?.message}
                    disabled={isSubmitting}
                  />

                  <FormField
                    {...register('email')}
                    label="Adresse email *"
                    type="email"
                    placeholder="votre@email.com"
                    error={errors.email?.message}
                    disabled={isSubmitting}
                  />
                </div>

                <FormField
                  {...register('phone')}
                  label="Téléphone (optionnel)"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  error={errors.phone?.message}
                  disabled={isSubmitting}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <select
                    {...register('subject')}
                    className={cn(
                      'input w-full',
                      errors.subject && 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    )}
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionnez un sujet</option>
                    {predefinedSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    className={cn(
                      'input w-full resize-none',
                      errors.message && 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    )}
                    placeholder="Décrivez votre demande en détail..."
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <h4 className="font-medium text-blue-900 mb-1">
                        Protection des données
                      </h4>
                      <p className="text-blue-800">
                        Vos données personnelles sont utilisées uniquement pour traiter votre demande 
                        et vous contacter. Elles ne sont jamais partagées avec des tiers.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                  
                  <p className="text-sm text-gray-500">
                    * Champs obligatoires
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Section localisation avec carte */}
        <div className="mt-16 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              📍 Notre localisation
            </h3>
            <p className="text-gray-600">
              Venez nous rendre visite dans nos locaux situés au cœur de Villefranche-sur-Saône
            </p>
          </div>

          <div className="grid lg:grid-cols-2">
            {/* Informations de localisation */}
            <div className="p-8 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Adresse</h4>
                  <address className="text-gray-600 not-italic leading-relaxed">
                    Médiathèque<br />
                    79 Rue des Jardiniers<br />
                    69400 Villefranche-sur-Saône
                  </address>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Horaires d'ouverture</h4>
                  <div className="text-gray-600 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Mardi, Mercredi, Vendredi, Samedi</span>
                      <span className="font-medium">10h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jeudi</span>
                      <span className="font-medium">16h00 - 20h00</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Lundi et Dimanche</span>
                      <span className="font-medium">Fermé</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=79+Rue+des+Jardiniers,+69400+Villefranche-sur-Saône"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors group"
                >
                  <MapPinIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Voir sur Google Maps
                </a>
                <a
                  href="tel:0474600000"
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors group"
                >
                  <PhoneIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  04 74 60 00 00
                </a>
              </div>
            </div>

            {/* Carte interactive */}
            <div className="relative h-96 lg:h-full min-h-96 bg-gray-100">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=4.712486267089845%2C45.98685663589249%2C4.730691909790039%2C45.995128329306606&layer=mapnik&marker=45.99099243258677%2C4.721589088439942"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation de la Médiathèque CRM"
                className="rounded-none lg:rounded-r-xl"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Section d'aide rapide */}
        <div className="mt-16 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-8">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-primary-900 mb-4">
              Besoin d'une réponse rapide ?
            </h3>
            <p className="text-primary-800 mb-6">
              Pour les questions urgentes ou les problèmes techniques, 
              n'hésitez pas à nous appeler directement pendant nos heures d'ouverture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:0474600000"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors group"
              >
                <PhoneIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                04 74 60 00 00
              </a>
              <span className="text-primary-700">
                Mar-Sam : 10h-18h • Jeu : 16h-20h
              </span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-primary-200">
              <p className="text-primary-800 mb-4">
                Ou envoyez-nous un email pour une réponse détaillée :
              </p>
              <a
                href="mailto:contact@mediatheque.fr?subject=Contact depuis le site web"
                className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-700 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors group"
              >
                <EnvelopeIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                contact@mediatheque.fr
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;