// src/context/AuthContext.tsx - VERSION CORRIGÉE
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

  // Fonction pour récupérer les données utilisateur complètes
  const fetchUserData = async (): Promise<User | null> => {
    try {
      const userData = await authService.getCurrentUser();
      console.log('✅ Données utilisateur récupérées:', userData);
      return userData;
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

        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Récupérer les données à jour depuis l'API
          const freshUserData = await fetchUserData();
          if (freshUserData) {
            setUser(freshUserData);
            localStorage.setItem('user', JSON.stringify(freshUserData));
          }
          
          console.log('✅ Utilisateur restauré et mis à jour:', freshUserData?.name);
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

      // Récupérer les données complètes de l'utilisateur
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success(`Bienvenue, ${userData.name} !`);
      } else {
        // Fallback avec les données de base
        const fallbackUser: User = {
          _id: response._id,
          name: response.name,
          email: response.email,
          role: 'user',
          favorites: [],
          actif: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        toast.success(`Bienvenue, ${response.name} !`);
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
      const response = await authService.register(name, email, password);
      
      // Connexion automatique après inscription
      const token = response.token || response.accessToken;
      tokenManager.setTokens(token);

      // Récupérer les données complètes
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Fallback
        const fallbackUser: User = {
          _id: response._id,
          name: response.name,
          email: response.email,
          role: 'user',
          favorites: [],
          actif: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
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
    }
  };

  const refreshUserData = async () => {
    const freshUserData = await fetchUserData();
    if (freshUserData) {
      setUser(freshUserData);
      localStorage.setItem('user', JSON.stringify(freshUserData));
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