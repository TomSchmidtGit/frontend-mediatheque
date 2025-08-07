// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../types';
import { tokenManager } from '../services/api';
import authService from '../services/authService';
import userService from '../services/userService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fonction pour récupérer les données utilisateur complètes avec debugging
  const fetchUserData = async (): Promise<User | null> => {
    try {
      console.log('🔄 Récupération des données utilisateur...');
      
      // ✅ Essayer d'abord avec l'endpoint /auth/me
      let userData: User;
      try {
        userData = await authService.getCurrentUser();
        console.log('✅ Données reçues de /auth/me:', userData);
      } catch (error) {
        console.log('❌ Erreur avec /auth/me, essai avec /users/profile...');
        // ✅ Fallback avec userService si authService échoue
        userData = await userService.getCurrentUser();
        console.log('✅ Données reçues de /users/profile:', userData);
      }

      // ✅ Vérifier et corriger la structure des données
      if (userData && typeof userData === 'object') {
        // Assurer que favorites est un tableau
        if (!Array.isArray(userData.favorites)) {
          console.log('⚠️ Correction: favorites n\'est pas un tableau, initialisation...');
          userData.favorites = [];
        }
        
        console.log('✅ Données utilisateur finales:', {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          favorites: userData.favorites,
          favoritesCount: userData.favorites?.length || 0
        });
        
        return userData;
      } else {
        console.error('❌ Données utilisateur invalides:', userData);
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  };

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = tokenManager.getAccessToken();
        const storedUser = localStorage.getItem('user');

        console.log('🔍 Initialisation auth - Token présent:', !!token);
        console.log('🔍 Utilisateur en localStorage:', !!storedUser);

        if (token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('📦 Utilisateur depuis localStorage:', userData);
            setUser(userData);
            
            // ✅ Récupérer les données à jour depuis l'API
            const freshUserData = await fetchUserData();
            if (freshUserData) {
              console.log('🔄 Mise à jour avec données fraîches:', freshUserData);
              setUser(freshUserData);
              localStorage.setItem('user', JSON.stringify(freshUserData));
            }
          } catch (parseError) {
            console.error('❌ Erreur parsing localStorage:', parseError);
            localStorage.removeItem('user');
          }
        } else if (token) {
          // ✅ Token présent mais pas d'utilisateur en localStorage
          console.log('🔄 Token présent, récupération des données...');
          const freshUserData = await fetchUserData();
          if (freshUserData) {
            setUser(freshUserData);
            localStorage.setItem('user', JSON.stringify(freshUserData));
          } else {
            // Token invalide, nettoyer
            tokenManager.clearTokens();
          }
        } else {
          console.log('❌ Pas de token, utilisateur non connecté');
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de l\'auth:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('🔑 Tentative de connexion pour:', email);
      
      const response = await authService.login(email, password);
      console.log('✅ Réponse de connexion:', response);
      
      // Stocker les tokens
      tokenManager.setTokens(response.accessToken, response.refreshToken);

      // ✅ Récupérer les données complètes de l'utilisateur
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success(`Bienvenue, ${userData.name} !`);
        console.log('✅ Connexion réussie avec favoris:', userData.favorites?.length || 0);
      } else {
        // ✅ Fallback avec les données de base de la réponse
        const fallbackUser: User = {
          _id: response._id,
          name: response.name,
          email: response.email,
          role: 'user',
          favorites: [], // ✅ Initialiser comme tableau vide
          actif: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        toast.success(`Bienvenue, ${response.name} !`);
        console.log('⚠️ Utilisation des données fallback');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la connexion';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('📝 Tentative d\'inscription pour:', email);
      
      const response = await authService.register(name, email, password);
      console.log('✅ Réponse d\'inscription:', response);
      
      // Connexion automatique après inscription
      const token = response.token || response.accessToken;
      tokenManager.setTokens(token);

      // ✅ Récupérer les données complètes
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ Inscription réussie avec favoris:', userData.favorites?.length || 0);
      } else {
        // ✅ Fallback
        const fallbackUser: User = {
          _id: response._id,
          name: response.name,
          email: response.email,
          role: 'user',
          favorites: [], // ✅ Initialiser comme tableau vide
          actif: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        console.log('⚠️ Utilisation des données fallback pour inscription');
      }
      
      toast.success(`Bienvenue, ${response.name} ! Votre compte a été créé avec succès.`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Déconnexion');
    setUser(null);
    tokenManager.clearTokens();
    
    // Appeler l'API de déconnexion si l'utilisateur était connecté
    if (user) {
      authService.logout().catch(console.error);
      toast.success('Déconnexion réussie');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      console.log('🔄 Mise à jour utilisateur:', {
        before: user.favorites?.length || 0,
        after: updatedUser.favorites?.length || 0
      });
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshUserData = async () => {
    console.log('🔄 Rafraîchissement des données utilisateur...');
    const freshUserData = await fetchUserData();
    if (freshUserData) {
      setUser(freshUserData);
      localStorage.setItem('user', JSON.stringify(freshUserData));
      console.log('✅ Données utilisateur rafraîchies');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};