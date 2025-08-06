// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/public/HomePage';
// import LoginPage from './pages/auth/LoginPage'; // On les créera plus tard
// import RegisterPage from './pages/auth/RegisterPage';

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
                <Route path="login" element={<div className="page-container py-16 text-center"><h1>Page de connexion (à venir)</h1></div>} />
                <Route path="register" element={<div className="page-container py-16 text-center"><h1>Page d'inscription (à venir)</h1></div>} />
                
                {/* Routes protégées - on les ajoutera plus tard */}
                <Route path="dashboard" element={<div className="page-container py-16 text-center"><h1>Dashboard (à venir)</h1></div>} />
                <Route path="favorites" element={<div className="page-container py-16 text-center"><h1>Favoris (à venir)</h1></div>} />
                <Route path="settings" element={<div className="page-container py-16 text-center"><h1>Paramètres (à venir)</h1></div>} />
                <Route path="catalog" element={<div className="page-container py-16 text-center"><h1>Catalogue (à venir)</h1></div>} />
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