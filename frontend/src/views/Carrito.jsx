import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function Carrito() {
    const { cart, getSubtotal, removeFromCart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [resMsg, setResMsg] = useState({ error: '', success: '' });

    // Reglas aritméticas de la rúbrica (Cálculo del Impuesto al Valor Agregado)
    const subtotal = getSubtotal();
    const TASA_IVA = 0.16;
    const iva = subtotal * TASA_IVA;
    const totalConIva = subtotal + iva;

    const handleCheckout = async () => {
        setLoading(true);
        setResMsg({ error: '', success: '' });
        
        const token = localStorage.getItem('token');

        // Validación preventiva en cliente si se perdió la sesión
        if (!token) {
            setResMsg({ success: '', error: '⚠️ Operación rechazada: Debes iniciar sesión para procesar la transacción.' });
            setLoading(false);
            return;
        }

        // Estructura exacta requerida por tu ventasController.js en el Backend
        const orderPayload = {
            total: subtotal, // El backend calcula los impuestos internamente para la nota de remisión
            items: cart.map(item => ({
                id: item.id,
                cantidad: item.cantidad,
                precio: item.precio
            }))
        };

        try {
            // Petición POST enviando los Headers de autorización con el JWT
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/ventas/completar`, orderPayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setResMsg({ 
                    error: '', 
                    success: `🎉 ¡Transacción Exitosa! Venta #${response.data.ventaId} registrada en SERVER3. La nota de remisión detallada ha sido enviada a tu correo electrónico.` 
                });
                clearCart(); // Limpieza del estado global tras la compra exitosa
            }
        } catch (error) {
            // Captura los errores de negocio enviados por SQL Server (ej. Stock insuficiente)
            setResMsg({ 
                success: '', 
                error: `❌ Error de Transacción: ${error.response?.data?.message || 'Fallo al procesar la orden en SERVER3'}` 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-slate-800 mb-8 uppercase tracking-tight border-b border-slate-200 pb-3">
                Resumen de tu Pedido
            </h2>

            {/* Alertas de Estado del Servidor */}
            {resMsg.error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-6 font-medium text-sm">
                    {resMsg.error}
                </div>
            )}
            {resMsg.success && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-r-xl mb-6 font-medium text-sm">
                    {resMsg.success}
                </div>
            )}

            {cart.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 shadow-xs">
                    <ShoppingBag className="h-14 w-14 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold text-lg">Tu carrito está vacío</p>
                    <p className="text-sm text-slate-400 mt-1">Añade ejemplares de la granja desde el catálogo para generar una remisión.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Lista de Productos Añadidos */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-xs group hover:border-slate-300 transition-colors">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-amber-600 transition-colors">{item.nombre}</h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Cantidad: <span className="font-bold text-slate-700">{item.cantidad} unidades</span> x ${parseFloat(item.precio).toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <span className="font-black text-slate-900 text-lg">
                                        ${(item.cantidad * item.precio).toFixed(2)}
                                    </span>
                                    <button 
                                        onClick={() => removeFromCart(item.id)} 
                                        className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                                        title="Eliminar del carrito"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Panel Lateral de Totales y Caja */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
                        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-4">
                            <CreditCard className="h-5 w-5 text-amber-500" />
                            <h3 className="text-lg font-bold tracking-wide uppercase text-amber-400">Desglose Fiscal</h3>
                        </div>

                        <div className="space-y-3 text-sm font-medium">
                            <div className="flex justify-between text-slate-400">
                                <span>Subtotal Neto:</span>
                                <span className="font-mono">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>IVA Trasladado (16%):</span>
                                <span className="font-mono">${iva.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-white border-t border-slate-800 pt-4 mt-2">
                                <span className="text-amber-400">Total Facturado:</span>
                                <span className="font-mono text-2xl text-emerald-400">${totalConIva.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full mt-6 bg-amber-500 text-slate-950 py-3.5 rounded-xl font-black tracking-wider uppercase hover:bg-amber-400 active:scale-98 transition-all disabled:bg-slate-800 disabled:text-slate-600 shadow-md"
                        >
                            {loading ? 'Procesando en SERVER3...' : 'Confirmar Orden'}
                        </button>

                        <div className="mt-4 flex items-center justify-center space-x-2 text-[11px] font-mono text-slate-500 text-center">
                            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                            <span>Transacción Protegida con Aislamiento ACID</span>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}