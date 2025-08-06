// src/pages/public/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  FilmIcon, 
  MusicalNoteIcon,
  SparklesIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="page-container">
          <div className="relative z-10 pt-14 pb-16 sm:pb-20 md:pb-24 lg:pb-28 xl:pb-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
                Bienvenue à la{' '}
                <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Médiathèque
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-in">
                Découvrez notre riche collection de livres, films et musiques. 
                Une expérience de lecture et de divertissement unique vous attend.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                <Link 
                  to="/catalog" 
                  className="btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Explorer le catalogue
                </Link>
                <Link 
                  to="/register" 
                  className="btn-secondary text-lg px-8 py-4 hover:shadow-md transform hover:-translate-y-1 transition-all duration-200"
                >
                  Créer un compte gratuit
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-gradient-to-tr from-secondary-100 to-secondary-200 rounded-full opacity-20 animate-pulse"></div>
      </div>

      {/* Types de médias */}
      <div className="py-20 bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Notre collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explorez nos différents univers culturels
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpenIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Livres</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Romans, essais, bandes dessinées et bien plus encore. 
                Plongez dans des univers littéraires captivants.
              </p>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                  500+ titres
                </span>
              </div>
            </div>
            
            <div className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FilmIcon className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Films</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Découvrez notre sélection de films classiques et contemporains 
                pour tous les goûts et tous les âges.
              </p>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  300+ films
                </span>
              </div>
            </div>
            
            <div className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MusicalNoteIcon className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Musique</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Explorez notre collection musicale variée, 
                du classique au contemporain, en passant par le jazz.
              </p>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                  200+ albums
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="py-20">
        <div className="page-container">
          <div className="relative">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-12 lg:p-16 text-white overflow-hidden">
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    La médiathèque en chiffres
                  </h2>
                  <p className="text-primary-100 text-lg">
                    Une communauté dynamique et en constante croissance
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                      <BookOpenIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl lg:text-5xl font-bold mb-2">1000+</div>
                    <div className="text-primary-100 text-lg">Médias disponibles</div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                      <UsersIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl lg:text-5xl font-bold mb-2">250+</div>
                    <div className="text-primary-100 text-lg">Utilisateurs actifs</div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                      <ClockIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl lg:text-5xl font-bold mb-2">24/7</div>
                    <div className="text-primary-100 text-lg">Accès en ligne</div>
                  </div>
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-50">
        <div className="page-container">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Prêt à commencer votre aventure ?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Rejoignez notre communauté dès aujourd'hui et accédez à toute notre collection. 
              L'inscription est gratuite et ne prend que quelques secondes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register" 
                className="btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                S'inscrire gratuitement
              </Link>
              <Link 
                to="/catalog" 
                className="text-primary-600 hover:text-primary-700 font-medium text-lg underline decoration-2 underline-offset-4 hover:underline-offset-8 transition-all duration-200"
              >
                Ou explorer sans compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;