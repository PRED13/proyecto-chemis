import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requireAdmin = false }) {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Escenario 1: No está logueado
    if (!token) {
        return <Navigate to="/registrarse" replace />;
    }

    // Escenario 2: Intenta entrar a panel admin pero es un cliente común
    if (requireAdmin && role !== 'admin') {
        return <Navigate to="/catalogo" replace />;
    }

    // Si pasa los filtros, renderiza la vista solicitada de forma segura
    return children;
}