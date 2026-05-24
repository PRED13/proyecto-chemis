import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { Plus, Minus, AlertTriangle, X, ShoppingCart } from 'lucide-react';
import axios from 'axios';

export default function Catalogo() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useCart();

    // Estados para el modal
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        axios.get(`${API_BASE}/productos`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setProductos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando inventario:", err);
                setError('No se pudo conectar con el servidor central para obtener el inventario.');
                setLoading(false);
            });
    }, []);

    const abrirModalCantidad = (producto) => {
        setSelectedProduct(producto);
        setCantidadSeleccionada(1);
        setModalError('');
    };

    const cerrarModalCantidad = () => {
        setSelectedProduct(null);
        setCantidadSeleccionada(1);
        setModalError('');
    };

    // Manejador para cuando el usuario escribe directamente en el teclado
    const manejarCambioTeclado = (e) => {
        const valorIntroducido = e.target.value;
        
        // Permitir temporalmente el campo vacío por si están borrando para escribir
        if (valorIntroducido === '') {
            setCantidadSeleccionada('');
            return;
        }

        const cantidad = parseInt(valorIntroducido, 10);

        if (isNaN(cantidad) || cantidad <= 0) {
            setModalError("La cantidad debe ser mayor a 0.");
            setCantidadSeleccionada(1);
            return;
        }

        if (cantidad > selectedProduct.stock) {
            setModalError(`Límite máximo excedido. Solo hay ${selectedProduct.stock} uds disponibles.`);
            setCantidadSeleccionada(selectedProduct.stock);
            return;
        }

        // Si pasa los filtros, actualiza el estado limpamente
        setModalError('');
        setCantidadSeleccionada(cantidad);
    };

    const incrementarCantidad = () => {
        const actual = parseInt(cantidadSeleccionada, 10) || 0;
        if (actual < selectedProduct.stock) {
            setCantidadSeleccionada(actual + 1);
            setModalError('');
        } else {
            setModalError(`Límite máximo alcanzado (${selectedProduct.stock} uds disponibles).`);
        }
    };

    const decrementarCantidad = () => {
        const actual = parseInt(cantidadSeleccionada, 10) || 0;
        if (actual > 1) {
            setCantidadSeleccionada(actual - 1);
            setModalError('');
        }
    };

    const confirmarAdicionCarrito = () => {
        const cantidadFinal = parseInt(cantidadSeleccionada, 10);

        if (isNaN(cantidadFinal) || cantidadFinal <= 0) {
            setModalError("Por favor, ingrese una cantidad numérica válida.");
            return;
        }

        if (cantidadFinal > selectedProduct.stock) {
            setModalError(`Stock insuficiente en SERVER3. Máximo disponible: ${selectedProduct.stock} uds.`);
            return;
        }

        addToCart(selectedProduct, cantidadFinal);
        cerrarModalCantidad();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                <span className="ml-3 font-mono text-sm text-slate-600">Consultando SERVER3...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
                        Inventario Disponible
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Líneas de alta genética y postura controlada</p>
                </div>
                {error && (
                    <div className="mt-4 md:mt-0 flex items-center bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-xs font-mono">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                        {error}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {productos.map(prod => (
                    <div key={prod.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                        
                        <div className="relative overflow-hidden bg-slate-100 h-56">
                            <img 
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                src={prod.imagen_url || "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7"} 
                                alt={prod.nombre} 
                            />
                            {prod.stock <= 0 && (
                                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
                                    <span className="bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-md uppercase tracking-widest">
                                        Sin Existencias
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{prod.nombre}</h3>
                                    <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-mono font-bold shrink-0">
                                        ID: {prod.id}
                                    </span>
                                </div>
                                <p className="text-slate-600 mt-2 text-sm leading-relaxed line-clamp-3">
                                    {prod.descripcion || 'Sin descripción genética disponible actualmente.'}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Precio Unitario</span>
                                        <span className="text-2xl font-black text-emerald-600">${parseFloat(prod.precio).toFixed(2)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Disponibles</span>
                                        <span className={`text-sm font-bold px-2.5 py-0.5 rounded-md inline-block ${prod.stock <= 5 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {prod.stock} uds
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => abrirModalCantidad(prod)}
                                    disabled={prod.stock <= 0}
                                    className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-bold tracking-wide transition-all shadow-md active:scale-98 disabled:bg-slate-200 disabled:text-slate-400 disabled:scale-100 disabled:shadow-none cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>{prod.stock <= 0 ? 'Bloqueado por Stock' : 'Añadir al Carrito'}</span>
                                </button>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* MODAL CON ENTRADA DE TECLADO COMPLETAMENTE ESTILIZADO */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all scale-100">
                        
                        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <ShoppingCart className="h-5 w-5 text-amber-500" />
                                <h3 className="font-bold tracking-wide uppercase text-sm">Definir Cantidad</h3>
                            </div>
                            <button onClick={cerrarModalCantidad} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ejemplar</div>
                                <div className="text-lg font-black text-slate-800 mt-0.5">{selectedProduct.nombre}</div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/60 text-sm">
                                    <span className="text-slate-600">Precio U.: <strong className="text-slate-900">${parseFloat(selectedProduct.precio).toFixed(2)}</strong></span>
                                    <span className="text-slate-600">Existencias: <strong className="text-slate-900">{selectedProduct.stock} uds</strong></span>
                                </div>
                            </div>

                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
                                Ingrese o ajuste la cantidad
                            </label>

                            {/* Contenedor Mixto: Botones + Input de Teclado */}
                            <div className="flex items-center justify-center space-x-2 max-w-xs mx-auto">
                                <button
                                    type="button"
                                    onClick={decrementarCantidad}
                                    className="p-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold transition-all disabled:opacity-40 cursor-pointer shrink-0"
                                    disabled={(parseInt(cantidadSeleccionada, 10) || 0) <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                
                                {/* INPUT DE NÚMERO INTERACTIVO POR TECLADO */}
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedProduct.stock}
                                    value={cantidadSeleccionada}
                                    onChange={manejarCambioTeclado}
                                    className="w-full text-center text-2xl font-black text-slate-900 bg-white border border-slate-300 rounded-xl py-2 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />

                                <button
                                    type="button"
                                    onClick={incrementarCantidad}
                                    className="p-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold transition-all disabled:opacity-40 cursor-pointer shrink-0"
                                    disabled={(parseInt(cantidadSeleccionada, 10) || 0) >= selectedProduct.stock}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Total Proporcional */}
                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Subtotal:</span>
                                <span className="text-2xl font-black text-emerald-600">
                                    ${((parseInt(cantidadSeleccionada, 10) || 0) * selectedProduct.precio).toFixed(2)}
                                </span>
                            </div>

                            {modalError && (
                                <div className="mt-4 flex items-center bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-xs font-mono animate-pulse">
                                    <AlertTriangle className="h-4 w-4 mr-2 text-red-600 shrink-0" />
                                    <span>{modalError}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex space-x-3 justify-end">
                            <button
                                type="button"
                                onClick={cerrarModalCantidad}
                                className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarAdicionCarrito}
                                className="px-5 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                            >
                                Añadir al Carrito
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}