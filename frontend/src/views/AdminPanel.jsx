import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, ShieldAlert, Package, X } from 'lucide-react';

export default function AdminPanel() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState('');
    const [formError, setFormError] = useState('');
    const [modalMode, setModalMode] = useState(null); // 'create' o 'edit'
    const [selectedProduct, setSelectedProduct] = useState({
        nombre: '', descripcion: '', precio: '', imagen_url: '', stock: 0
    });

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // --- BLOQUE AÑADIDO: Disparador automático ---
    useEffect(() => {
        cargarInventario();
    }, []);
    // ---------------------------------------------

    const cargarInventario = () => {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('userToken');

        if (!token) {
            setGlobalError('No se encontró token de sesión. Inicie sesión nuevamente.');
            setLoading(false);
            return;
        }

        axios.get(`${API_BASE}/admin/inventario`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setProductos(res.data);
            setLoading(false); // Garantiza que el spinner desaparezca
        })
        .catch(err => {
            console.error("Error cargando inventario:", err);
            setGlobalError(err.response?.data?.message || 'Error al conectar con el servidor.');
            setLoading(false); // Garantiza que el spinner desaparezca ante error
        });
    };

    const abrirCrear = () => {
        setFormError('');
        setSelectedProduct({ nombre: '', descripcion: '', precio: '', imagen_url: '', stock: 0 });
        setModalMode('create');
    };

    const abrirEditar = (prod) => {
        setFormError('');
        setSelectedProduct({ ...prod });
        setModalMode('edit');
    };

    const manejarGuardar = (e) => {
        e.preventDefault();
        setFormError('');
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (modalMode === 'create') {
            axios.post(`${API_BASE}/admin/productos`, selectedProduct, config)
                .then(() => { setModalMode(null); cargarInventario(); })
                .catch(err => setFormError(err.response?.data?.message || 'Error al crear producto.'));
        } else {
            axios.put(`${API_BASE}/admin/productos/${selectedProduct.id}`, selectedProduct, config)
                .then(() => { setModalMode(null); cargarInventario(); })
                .catch(err => setFormError(err.response?.data?.message || 'Error al modificar producto.'));
        }
    };

    const manejarEliminar = (id) => {
        if (!window.confirm('¿Está seguro de eliminar este producto?')) return;
        const token = localStorage.getItem('token');
        axios.delete(`${API_BASE}/admin/productos/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => cargarInventario())
            .catch(err => alert(err.response?.data?.message || 'Error al eliminar.'));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                <span className="ml-3 font-mono text-sm text-slate-600">Sincronizando panel con SERVER3...</span>
            </div>
        );
    }

    if (globalError) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
                <ShieldAlert className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-black text-red-900 uppercase">Fallo de Autenticación</h3>
                <p className="text-sm text-red-700 mt-2">{globalError}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-5">
                <h2 className="text-3xl font-black text-slate-800 uppercase">Panel de Control</h2>
                {/* --- BLOQUE CORREGIDO: onClick={abrirCrear} --- */}
                <button
                    onClick={abrirCrear} 
                    className="flex items-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-5 rounded-xl transition-all cursor-pointer"
                >
                    <Plus className="h-4 w-4 mr-2" /> AÑADIR NUEVO PRODUCTO
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900 text-white text-xs uppercase">
                        <tr>
                            <th className="p-4 text-center">ID</th>
                            <th className="p-4">Nombre</th>
                            <th className="p-4">Descripción</th>
                            <th className="p-4 text-right">Precio</th>
                            <th className="p-4 text-center">Stock</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {productos.map(prod => (
                            <tr key={prod.id} className="hover:bg-slate-50">
                                <td className="p-4 font-mono text-center">{prod.id}</td>
                                <td className="p-4 font-bold">{prod.nombre}</td>
                                <td className="p-4 text-slate-600 truncate max-w-xs">{prod.descripcion}</td>
                                <td className="p-4 text-right font-bold text-emerald-600">${parseFloat(prod.precio).toFixed(2)}</td>
                                <td className="p-4 text-center">{prod.stock} uds</td>
                                <td className="p-4 flex justify-center space-x-2">
                                    <button onClick={() => abrirEditar(prod)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"><Edit2 size={16} /></button>
                                    <button onClick={() => manejarEliminar(prod.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <form onSubmit={manejarGuardar} className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold uppercase">{modalMode === 'create' ? 'Nuevo' : 'Editar'} Producto</h3>
                            <button type="button" onClick={() => setModalMode(null)} className="cursor-pointer"><X /></button>
                        </div>
                        
                        {/* Campos existentes */}
                        <input type="text" placeholder="Nombre" required className="w-full mb-3 p-2 border rounded" value={selectedProduct.nombre} onChange={(e) => setSelectedProduct({...selectedProduct, nombre: e.target.value})} />
                        <textarea placeholder="Descripción" className="w-full mb-3 p-2 border rounded" value={selectedProduct.descripcion} onChange={(e) => setSelectedProduct({...selectedProduct, descripcion: e.target.value})}></textarea>
                        <input type="number" placeholder="Precio" required className="w-full mb-3 p-2 border rounded" value={selectedProduct.precio} onChange={(e) => setSelectedProduct({...selectedProduct, precio: e.target.value})} />
                        <input type="number" placeholder="Stock" required className="w-full mb-3 p-2 border rounded" value={selectedProduct.stock} onChange={(e) => setSelectedProduct({...selectedProduct, stock: e.target.value})} />

                        {/* --- BLOQUE AÑADIDO: Input para la URL de la imagen --- */}
                        <input 
                            type="url" 
                            placeholder="URL de la imagen (ej: https://ejemplo.com/foto.jpg)" 
                            className="w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-amber-500" 
                            value={selectedProduct.imagen_url || ''} 
                            onChange={(e) => setSelectedProduct({...selectedProduct, imagen_url: e.target.value})} 
                        />
                        {/* ---------------------------------------------------- */}

                        {formError && <p className="text-red-500 text-xs mb-3">{formError}</p>}
                        <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-xl font-bold cursor-pointer">GUARDAR</button>
                    </form>
                </div>
            )}
        </div>
    );
}