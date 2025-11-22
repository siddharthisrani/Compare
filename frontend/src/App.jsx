import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Compare from './pages/Compare';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPage from './pages/AdminPage';
import { useAuth } from './context/AuthProvider';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container">
        <Header />
        <main className="mt-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={user && (user.role === 'admin' || user.role === 'trainer') ? <AdminPage /> : <Navigate to="/login" replace />} />
            <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
