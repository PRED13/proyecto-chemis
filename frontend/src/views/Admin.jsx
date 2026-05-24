import React, { useState, useEffect } from 'react';
import { Package, ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function Admin() {
    const [productos, setProductos] = useState([]);
    const [statusMsg, setStatusMsg] = useState('');

    const cargarStock = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/productos`)
            .then(res => setProductos(res.data))
            .catch(err => console.error("Error al actualizar tabla:", err));
    };

    useEffect(() => { cargarStock(); }, []);

    const modificarStock = async (id, nuevoStock) => {
        setStatusMsg('');
        const token = localStorage.getItem('token');
        
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/productos/${id}/stock`, 
                { stock: parseInt(nuevoStock) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setStatusMsg(`✅ Cambios inyectados con éxito en la tabla Productos.`);
                cargarStock();
            }
        } catch (err) {
            setStatusMsg(`❌ Error de validación: ${err.response?.data?.message || 'Límites excedidos'}`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
            <div className="border-b border-slate-200 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Control de Red e Inventarios</h2>
                    <p className="text-sm text-slate-500 mt-1">Gestor corporativo de capacidades límites de la granja (Restricción: 0 - 100)</p>
                </div>
                <button onClick={cargarStock} className="flex items-center space-x-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors border border-slate-200">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refrescar DB</span>
                </button>
            </div>

            {statusMsg && (
                <div className="bg-slate-900 text-amber-400 p-4 rounded-xl mb-6 font-mono text-xs shadow-md border border-slate-800">
                    {statusMsg}
                </div>
            )}
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm font-medium">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Ejemplar de Competencia</th>
                                <th className="px-6 py-4">Costo Base</th>
                                <th className="px-6 py-4 text-center">Existencia Real (SERVER3)</th>
                                <th className="px-6 py-4 text-center">Acciones de Ajuste Operativo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                            {productos.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{p.id}</td>
                                    <td className="px-6 py-4 text-slate-900 font-bold flex items-center space-x-2">
                                        <Package className="h-4 w-4 text-slate-400" />
                                        <span>{p.nombre}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono">${parseFloat(p.precio).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${p.stock <= 5 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                                            {p.stock} unidades
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center space-x-2">
                                        <button 
                                            onClick={() => modificarStock(p.id, p.stock + 10)} 
                                            disabled={p.stock + 10 > 100}
                                            className="bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800 text-xs font-bold transition-all disabled:bg-slate-100 disabled:text-slate-300"
                                        >
                                            +10 Uds
                                        </button>
                                        <button 
                                            onClick={() => modificarStock(p.id, 0)} 
                                            disabled={p.stock === 0}
                                            className="bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg hover:bg-red-100 text-xs font-bold transition-all disabled:opacity-40"
                                        >
                                            Forzar Merma (0)
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}