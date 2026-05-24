import React, { useEffect, useState } from 'react';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${import.meta.env.VITE_API_URL}/ventas/historial`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            if (res.data.success) {
                setHistorial(res.data.data);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error("Error al recuperar remisiones:", err);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-slate-800 mb-8 uppercase tracking-tight border-b pb-3">
                Mis Notas de Remisión
            </h2>

            {historial.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 p-6">
                    Aún no registras transacciones con tu cuenta.
                </div>
            ) : (
                <div className="space-y-6">
                    {historial.map(v => (
                        <div key={v.ventaId} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-100 pb-4 mb-4 gap-2">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5 text-amber-500" />
                                    <span className="text-sm font-bold text-slate-500">Folio de Remisión:</span>
                                    <span className="font-black text-slate-900">#{v.ventaId}</span>
                                </div>
                                <div className="flex items-center text-slate-500 text-sm font-medium space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(v.fecha).toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="divide-y divide-slate-100 mb-4">
                                {v.items.map((item, idx) => (
                                    <div key={idx} className="py-2.5 flex justify-between text-sm font-medium">
                                        <span className="text-slate-700">{item.productoNombre} <span className="text-slate-400 text-xs font-bold">x{item.cantidad}</span></span>
                                        <span className="text-slate-900 font-mono">${parseFloat(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex justify-end items-center font-black text-slate-900 text-lg border-t border-slate-100 pt-4">
                                <div className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                                    <DollarSign className="h-5 w-5 -mr-1" />
                                    <span>Total Liquidado (c/IVA): ${parseFloat(v.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}