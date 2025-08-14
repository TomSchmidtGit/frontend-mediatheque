// src/pages/public/AboutPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  HeartIcon,
  UsersIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { MetaTagsComponent } from '../../components/common/MetaTags';
import { generateMetaTags } from '../../config/metaTags';

const AboutPage: React.FC = () => {
  const metaTags = generateMetaTags('about');
  const teamMembers = [
    {
      name: "Marie Dubois",
      role: "Directrice de la médiathèque",
      description: "Passionnée de littérature avec 15 ans d'expérience dans la gestion culturelle.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "Pierre Martin",
      role: "Responsable collections numériques",
      description: "Expert en technologies éducatives et gestion des ressources multimédia.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "Sophie Leroy",
      role: "Bibliothécaire jeunesse",
      description: "Spécialisée dans l'animation culturelle et l'accompagnement des jeunes lecteurs.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "Thomas Moreau",
      role: "Chargé des partenariats",
      description: "Développe les collaborations avec les écoles et associations locales.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face"
    }
  ];

  const values = [
    {
      icon: BookOpenIcon,
      title: "Accès libre au savoir",
      description: "Nous croyons que la connaissance doit être accessible à tous, sans discrimination."
    },
    {
      icon: UsersIcon,
      title: "Communauté inclusive",
      description: "Nous favorisons les échanges et créons des liens entre les générations."
    },
    {
      icon: LightBulbIcon,
      title: "Innovation continue",
      description: "Nous intégrons les nouvelles technologies au service de nos usagers."
    },
    {
      icon: HeartIcon,
      title: "Passion culturelle",
      description: "Nous partageons notre amour pour la lecture, le cinéma et la musique."
    },
    {
      icon: GlobeAltIcon,
      title: "Ouverture sur le monde",
      description: "Nous proposons des contenus diversifiés reflétant la richesse culturelle mondiale."
    },
    {
      icon: AcademicCapIcon,
      title: "Accompagnement éducatif",
      description: "Nous soutenons l'apprentissage et la recherche à tous les niveaux."
    }
  ];

  const achievements = [
    { number: "1000+", label: "Médias disponibles" },
    { number: "500+", label: "Utilisateurs actifs" },
    { number: "41", label: "Années d'expérience" },
    { number: "50+", label: "Événements par an" }
  ];

  const services = [
    "Prêt de livres, films et musiques",
    "Accès aux ressources numériques",
    "Espaces de travail et de lecture",
    "Animations culturelles régulières",
    "Accueil de groupes scolaires",
    "Conseil et orientation documentaire"
  ];

  return (
    <>
      <MetaTagsComponent metaTags={metaTags} />
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>

        <div className="relative page-container py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
              À propos de notre
              <span className="block text-primary-200">Médiathèque</span>
            </h1>
            <p className="text-xl lg:text-2xl text-primary-100 mb-8 leading-relaxed animate-slide-in">
              Depuis 1984, nous mettons la culture à portée de tous avec passion et engagement.
              Découvrez notre histoire, notre équipe et notre vision pour l'avenir.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link
                to="/catalog"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200 transform hover:-translate-y-1 shadow-lg"
              >
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Explorer le catalogue
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-700 transition-all duration-200"
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Notre mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Démocratiser l'accès à la culture et au savoir en proposant une expérience
              moderne et inclusive pour tous les publics.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  🎯 Nos objectifs
                </h3>
                <div className="space-y-4">
                  {[
                    "Faciliter l'accès aux ressources culturelles",
                    "Accompagner les usagers dans leurs découvertes",
                    "Créer du lien social autour de la culture",
                    "Innover dans nos services et notre approche",
                    "Soutenir l'éducation et la formation"
                  ].map((objective, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {achievement.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Nos valeurs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des principes fondamentaux qui guident chacune de nos actions
              et définissent notre approche unique du service public culturel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Notre équipe
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des professionnels passionnés et expérimentés, unis par l'amour
              de la culture et le désir de vous accompagner dans vos découvertes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Nos services
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Une gamme complète de services pensés pour répondre aux besoins
                de tous nos publics, du plus jeune âge aux seniors.
              </p>

              <div className="grid gap-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">📍 Informations pratiques</h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPinIcon className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Adresse</div>
                    <div className="text-primary-100">
                      79 Rue des Jardiniers<br />
                      69400 Villefranche-sur-Saône
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <ClockIcon className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Horaires d'ouverture</div>
                    <div className="text-primary-100 text-sm">
                      Mardi, Mercredi, Vendredi, Samedi : 10h00 - 18h00<br />
                      Jeudi : 16h00 - 20h00<br />
                      Lundi et Dimanche : Fermé
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <PhoneIcon className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Contact</div>
                    <div className="text-primary-100">
                      04 74 60 00 00<br />
                      contact@mediatheque.fr
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-primary-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center px-4 py-3 text-white hover:text-primary-200 font-medium border-2 border-white rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <EnvelopeIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Formulaire de contact
                  </Link>
                  <a
                    href="tel:0474600000"
                    className="inline-flex items-center justify-center px-4 py-3 text-white hover:text-primary-200 font-medium border-2 border-white rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <PhoneIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Appeler maintenant
                  </a>
                </div>

                <div className="mt-4">
                  <a
                    href="mailto:contact@mediatheque.fr?subject=Contact depuis la page A propos"
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors group"
                  >
                    <EnvelopeIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    contact@mediatheque.fr
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section localisation avec carte */}
      <div className="page-container">
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
      </div>

      {/* Espace entre localisation et CTA */}
      <div className="py-16"></div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="page-container text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Rejoignez notre communauté !
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Inscrivez-vous dès aujourd'hui et découvrez tout ce que notre
            médiathèque peut vous offrir. C'est gratuit et sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200 transform hover:-translate-y-1 shadow-lg"
            >
              <UsersIcon className="w-5 h-5 mr-2" />
              S'inscrire maintenant
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-700 transition-all duration-200"
            >
              <BookOpenIcon className="w-5 h-5 mr-2" />
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AboutPage;
