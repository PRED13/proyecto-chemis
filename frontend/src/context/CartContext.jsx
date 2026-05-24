import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Añadir producto al carrito aplicando reglas de negocio
    const addToCart = (product, qty) => {
        setCart((prev) => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                const nuevaCantidad = existing.cantidad + qty;
                
                // Validación en cliente: Bloquear si excede la capacidad máxima de la granja (100)
                if (nuevaCantidad > 100) {
                    alert("❌ Operación denegada: No puedes exceder el límite máximo de 100 unidades por ejemplar.");
                    return prev;
                }
                return prev.map(item => 
                    item.id === product.id ? { ...item, cantidad: nuevaCantidad } : item
                );
            }
            return [...prev, { ...product, cantidad: qty }];
        });
    };

    // Eliminar un artículo individual del carrito
    const removeFromCart = (id) => {
        setCart((prev) => prev.filter(item => item.id !== id));
    };

    // Vaciar el carrito tras una compra exitosa
    const clearCart = () => setCart([]);

    // Calcular el subtotal base (multiplicación de cantidad por precio unitario)
    const getSubtotal = () => cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getSubtotal }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook personalizado para consumir el carrito de forma sencilla en los componentes
export const useCart = () => useContext(CartContext);