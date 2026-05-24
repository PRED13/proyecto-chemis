import React from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
    return (
        <div className="relative bg-slate-900 overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
            {/* Contenedor de Texto Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                <div className="max-w-2xl">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                        Genética Avanzada y <span className="text-amber-500">Ejemplares Premium</span>
                    </h1>
                    <p className="mt-6 text-xl text-slate-300">
                        Sistema automatizado de control de existencias, comercialización y trazabilidad para aves de alta competencia y postura. 
                        Conexión directa con SERVER3.
                    </p>
                    <div className="mt-10 flex space-x-4">
                        <Link to="/catalogo" className="bg-amber-500 text-slate-950 px-8 py-4 rounded-md font-bold text-lg hover:bg-amber-400 transition-all shadow-lg hover:scale-105 active:scale-95">
                            Explorar Inventario Real
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decoración geométrica de fondo (Tailwind) */}
            <div className="absolute inset-y-0 right-0 w-1/2 bg-slate-800 opacity-20 hidden md:block" 
                 style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}></div>
        </div>
    );
}