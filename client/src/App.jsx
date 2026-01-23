import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import RafflePage from './pages/RafflePage';
import RaffleView from './pages/RaffleView';
import RaffleResults from './pages/RaffleResults';
import RaffleHistory from './pages/RaffleHistory';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/" />;
  return children;
};

import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider

// ...

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <RaffleHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
             path="/raffle/new" 
             element={
               <ProtectedRoute>
                 <RafflePage />
               </ProtectedRoute>
             } 
           />
           <Route path="/raffle/:id" element={<RaffleView />} />
           <Route path="/raffle-results/:public_id" element={<RaffleResults />} />
        </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
