// src/App.tsx - Mise à jour avec routes admin média
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/user/DashboardPage';
import FavoritesPage from './pages/user/FavoritesPages';
import MyBorrowsPage from './pages/user/MyBorrowsPage';
import SettingsPage from './pages/user/SettingsPage';
import CatalogPage from './pages/public/CatalogPage';
import MediaDetailPage from './pages/media/MediaDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminMediaPage from './pages/admin/AdminMediaPage';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                
                {/* Routes protégées utilisateur */}
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="favorites" element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                } />
                <Route path="my-borrows" element={
                  <ProtectedRoute>
                    <MyBorrowsPage />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                
                {/* Routes admin */}
                <Route path="admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="admin/users" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                } />
                <Route path="admin/users/:userId" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminUserDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="admin/media" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminMediaPage />
                  </ProtectedRoute>
                } />
                
                {/* TODO: Ajouter les autres routes admin */}
                {/* 
                <Route path="admin/borrows" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminBorrowsPage />
                  </ProtectedRoute>
                } />
                <Route path="admin/categories" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminCategoriesPage />
                  </ProtectedRoute>
                } />
                */}
                
                {/* Routes publiques */}
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="media/:id" element={<MediaDetailPage />} />
                <Route path="about" element={<div className="page-container py-16 text-center"><h1>À propos (à venir)</h1></div>} />
                <Route path="contact" element={<div className="page-container py-16 text-center"><h1>Contact (à venir)</h1></div>} />
                
                {/* Route 404 */}
                <Route path="*" element={<div className="page-container py-16 text-center"><h1>Page non trouvée</h1></div>} />
              </Route>
            </Routes>
            
            {/* Notifications toast */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;