import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Registrarse() {
    const [isLogin, setIsLogin] = useState(true); // Cambia entre Login y Registro
    const [formData, setFormData] = useState({ nombre: '', correo: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const endpoint = isLogin ? '/auth/login' : '/auth/registrar';
        
        try {
            // URL desde tu archivo .env (http://localhost:3000/api)
            const res = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, formData);
            
            if (res.data.success) {
                // GUARDADO CRÍTICO: Token para peticiones y Role para permisos de admin
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.usuario?.rol || 'cliente');
                
                navigate('/catalogo'); // Redirige al éxito
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error de comunicación con el servidor central');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                        {isLogin ? 'ACCESO AL SISTEMA' : 'REGISTRO DE CLIENTE'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-2">Ingresa tus credenciales para SERVER3</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Completo</label>
                            <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
                                   value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
                        <input type="email" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
                               value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contraseña</label>
                        <input type="password" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
                               value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>

                    <button type="submit" disabled={loading}
                            className="w-full bg-slate-900 text-white p-4 rounded-lg font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:bg-slate-400 shadow-lg">
                        {loading ? 'Validando...' : (isLogin ? 'Entrar' : 'Crear Cuenta')}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <button type="button" className="text-sm font-bold text-amber-600 hover:text-amber-700" 
                            onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya eres miembro? Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
}