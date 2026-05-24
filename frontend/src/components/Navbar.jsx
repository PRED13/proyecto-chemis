import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, ShieldAlert, Store } from 'lucide-react';

export default function Navbar() {
    const { cart } = useCart();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); 

    const handleLogout = () => {
        localStorage.clear(); // Limpia el JWT y el Rol
        navigate('/registrarse');
    };

    return (
        <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Nombre del Sistema */}
                    <div className="flex items-center space-x-3">
                        <Store className="h-6 w-6 text-amber-500" />
                        <Link to="/" className="text-xl font-bold tracking-wider text-amber-400">GRANJA PREMIUM</Link>
                    </div>

                    {/* Links de Navegación Condicional */}
                    <div className="flex items-center space-x-6">
                        <Link to="/catalogo" className="hover:text-amber-400 transition-colors font-medium">Catálogo</Link>
                        
                        {token && (
                            <Link to="/dashboard" className="hover:text-amber-400 transition-colors font-medium">Mis Compras</Link>
                        )}

                        {/* Si el rol de la base de datos es 'admin', despliega el acceso de seguridad */}
                        {userRole === 'admin' && (
                            <Link to="/admin" className="flex items-center space-x-1 bg-red-950 text-red-400 px-3 py-1 rounded-md border border-red-800 hover:bg-red-900 transition-colors text-sm font-bold">
                                <ShieldAlert className="h-4 w-4" />
                                <span>Panel Admin</span>
                            </Link>
                        )}

                        {/* Ícono de Carrito con Contador en Tiempo Real */}
                        <Link to="/carrito" className="relative flex items-center p-2 hover:text-amber-400 transition-colors">
                            <ShoppingCart className="h-6 w-6" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-xs font-black rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                    {cart.reduce((sum, item) => sum + item.cantidad, 0)}
                                </span>
                            )}
                        </Link>

                        {/* Botón de Autenticación */}
                        {token ? (
                            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 p-1 transition-colors" title="Cerrar Sesión">
                                <LogOut className="h-5 w-5" />
                            </button>
                        ) : (
                            <Link to="/registrarse" className="bg-amber-500 text-slate-950 px-4 py-2 rounded font-bold hover:bg-amber-400 transition-colors text-sm">Ingresar</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}