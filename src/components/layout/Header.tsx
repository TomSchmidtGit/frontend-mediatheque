// src/components/layout/Header.tsx
import React, { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { 
  Bars3Icon, 
  BookOpenIcon, 
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
  HeartIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="page-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo et menu mobile */}
          <div className="flex items-center">
            {/* Menu hamburger mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2 transition-colors"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            {/* Menu sidebar pour les utilisateurs connectés */}
            {isAuthenticated && (
              <button
                onClick={onMenuClick}
                className="hidden md:block lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2 transition-colors"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            )}
            
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-1 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors">
                <BookOpenIcon className="h-7 w-7 text-primary-600" />
              </div>
              <span className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                Médiathèque CRM
              </span>
            </Link>
          </div>

          {/* Navigation centrale */}
          <nav className="hidden md:flex space-x-1">
            <Link
              to="/catalog"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
            >
              Catalogue
            </Link>
            {!isAuthenticated && (
              <>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  À propos
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Contact
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
              >
                Tableau de bord
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center"
              >
                <ChartBarIcon className="h-4 w-4 mr-1" />
                Admin
              </Link>
            )}
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 p-1 hover:bg-gray-50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block font-medium text-gray-700 max-w-32 truncate">
                    {user?.name || 'Utilisateur'}
                  </span>
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/dashboard"
                            className={cn(
                              active ? 'bg-gray-50' : '',
                              'flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg transition-colors'
                            )}
                          >
                            <UserCircleIcon className="mr-3 h-4 w-4" />
                            Mon profil
                          </Link>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/favorites"
                            className={cn(
                              active ? 'bg-gray-50' : '',
                              'flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg transition-colors'
                            )}
                          >
                            <HeartIcon className="mr-3 h-4 w-4" />
                            Mes favoris
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/settings"
                            className={cn(
                              active ? 'bg-gray-50' : '',
                              'flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg transition-colors'
                            )}
                          >
                            <Cog6ToothIcon className="mr-3 h-4 w-4" />
                            Paramètres
                          </Link>
                        )}
                      </Menu.Item>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={cn(
                                active ? 'bg-red-50 text-red-700' : 'text-gray-700',
                                'flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors'
                              )}
                            >
                              <ArrowRightStartOnRectangleIcon className="mr-3 h-4 w-4" />
                              Se déconnecter
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              // ✅ Cacher les boutons en mobile
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm px-3 py-2 rounded-md hover:bg-gray-100 transition-all duration-200"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <Dialog open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} className="md:hidden">
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black opacity-25" />
          
          <div className="fixed top-0 left-0 w-full h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link 
                to="/" 
                className="flex items-center space-x-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="p-1 rounded-lg bg-primary-50">
                  <BookOpenIcon className="h-6 w-6 text-primary-600" />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  Médiathèque CRM
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 py-6 space-y-4">
              {/* Navigation principale */}
              <div className="space-y-2">
                <Link
                  to="/catalog"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Catalogue
                </Link>
                
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/about"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      À propos
                    </Link>
                    <Link
                      to="/contact"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tableau de bord
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mes favoris
                    </Link>
                    <Link
                      to="/my-borrows"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mes emprunts
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ChartBarIcon className="h-5 w-5 mr-2" />
                        Administration
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Actions utilisateur */}
              <div className="border-t border-gray-200 pt-4">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-3 py-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      to="/settings"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="h-5 w-5 mr-3" />
                      Paramètres
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                    >
                      <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3" />
                      Se déconnecter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </header>
  );
};

export default Header;