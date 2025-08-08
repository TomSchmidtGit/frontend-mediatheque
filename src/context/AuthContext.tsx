// src/context/AuthContext.tsx - CORRECTION SANS ROUTE PROFILE
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../types';
import { tokenManager } from '../services/api';
import authService from '../services/authService';
import userService from '../services/userService';
import mediaService from '../services/mediaService';
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

  // ✅ Fonction pour enrichir les données utilisateur avec les favoris
  const enrichUserWithFavorites = async (baseUser: User): Promise<User> => {
    try {
      // Récupérer les favoris depuis l'API
      const favoritesData = await mediaService.getFavorites(1, 1000); // Récupérer tous les favoris
      const favoriteIds = favoritesData.data.map(media => media._id);
      
      console.log('✅ Favoris récupérés:', favoriteIds);
      
      return {
        ...baseUser,
        favorites: favoriteIds
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des favoris:', error);
      return {
        ...baseUser,
        favorites: []
      };
    }
  };

  // ✅ Fonction pour récupérer les informations complètes de l'utilisateur
  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      const userProfile = await userService.getProfile();
      console.log('✅ Profil utilisateur récupéré:', userProfile.name, 'Rôle:', userProfile.role);
      return userProfile;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du profil:', error);
      return null;
    }
  };

  // ✅ Initialisation de l'auth au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = tokenManager.getAccessToken();
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('🔄 Restauration utilisateur depuis localStorage:', userData.name);
          
          // Récupérer les informations complètes depuis l'API
          const freshUserProfile = await fetchUserProfile();
          if (freshUserProfile) {
            // Enrichir avec les favoris à jour
            const enrichedUser = await enrichUserWithFavorites(freshUserProfile);
            setUser(enrichedUser);
            localStorage.setItem('user', JSON.stringify(enrichedUser));
            
            console.log('✅ Utilisateur restauré avec profil complet:', enrichedUser.name, 'Rôle:', enrichedUser.role, enrichedUser.favorites?.length, 'favoris');
          } else {
            console.log('❌ Impossible de récupérer le profil utilisateur, déconnexion');
            logout();
          }
        } else {
          console.log('❌ Pas de token ou d\'utilisateur en localStorage');
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
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
      const response = await authService.login(email, password);
      
      // Stocker les tokens
      tokenManager.setTokens(response.accessToken, response.refreshToken);

      // Récupérer les informations complètes de l'utilisateur
      const userProfile = await fetchUserProfile();
      if (!userProfile) {
        throw new Error('Impossible de récupérer les informations utilisateur');
      }

      // Enrichir avec les favoris
      const enrichedUser = await enrichUserWithFavorites(userProfile);
      setUser(enrichedUser);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      
      toast.success(`Bienvenue, ${enrichedUser.name} !`);
      console.log('✅ Connexion réussie:', enrichedUser.name, 'Rôle:', enrichedUser.role, enrichedUser.favorites?.length, 'favoris');
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
      const response = await authService.register(name, email, password);
      
      // Connexion automatique après inscription
      const token = response.token || response.accessToken;
      tokenManager.setTokens(token);

      // Récupérer les informations complètes de l'utilisateur
      const userProfile = await fetchUserProfile();
      if (!userProfile) {
        throw new Error('Impossible de récupérer les informations utilisateur');
      }

      setUser(userProfile);
      localStorage.setItem('user', JSON.stringify(userProfile));
      
      toast.success(`Bienvenue, ${response.name} ! Votre compte a été créé avec succès.`);
      console.log('✅ Inscription réussie:', userProfile.name, 'Rôle:', userProfile.role);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('🔄 Utilisateur mis à jour:', updatedUser.name, updatedUser.favorites?.length, 'favoris');
    }
  };

  const refreshUserData = async () => {
    if (user) {
      try {
        const freshUserProfile = await fetchUserProfile();
        if (freshUserProfile) {
          const enrichedUser = await enrichUserWithFavorites(freshUserProfile);
          setUser(enrichedUser);
          localStorage.setItem('user', JSON.stringify(enrichedUser));
          console.log('🔄 Données utilisateur rafraîchies:', enrichedUser.favorites?.length, 'favoris');
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des données:', error);
      }
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