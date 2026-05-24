import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Importación de Vistas
import Index from './views/Index';
import Catalogo from './views/Catalogo';
import Carrito from './views/Carrito';
import Registrarse from './views/Registrarse';
import Dashboard from './views/Dashboard';

// MODIFICACIÓN: Importamos el nuevo Panel de Control Administrativo con CRUD y validaciones
import Admin from './views/AdminPanel'; 

export default function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                {/* Barra de navegación superior fija en todas las pantallas */}
                <Navbar />
                
                {/* Contenedor dinámico de pantallas */}
                <div className="min-h-[calc(100vh-4rem)]">
                    <Routes>
                        {/* Rutas Públicas */}
                        <Route path="/" element={<Index />} />
                        <Route path="/catalogo" element={<Catalogo />} />
                        <Route path="/carrito" element={<Carrito />} />
                        <Route path="/registrarse" element={<Registrarse />} />
                        
                        {/* Ruta Protegida: Historial de Clientes Autenticados */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />

                        {/* Ruta Protegida de Alta Seguridad: Panel Admin (Filtra Token y Rol) */}
                        <Route path="/admin" element={
                            <ProtectedRoute requireAdmin={true}>
                                <Admin />
                            </ProtectedRoute>
                        } />

                        {/* Comodín: Redirige cualquier ruta rota o inexistente al Inicio */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </CartProvider>
    );
}