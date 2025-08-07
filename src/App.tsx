// src/App.tsx
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
import CatalogPage from './pages/public/CatalogPage';
import MediaDetailPage from './pages/media/MediaDetailPage';

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
                
                {/* Routes protégées */}
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
                    <div className="page-container py-16 text-center"><h1>Paramètres (à venir)</h1></div>
                  </ProtectedRoute>
                } />
                
                {/* Routes admin */}
                <Route path="admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <div className="page-container py-16 text-center"><h1>Admin Dashboard (à venir)</h1></div>
                  </ProtectedRoute>
                } />
                
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