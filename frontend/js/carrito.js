document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrito();
});

// Función auxiliar para obtener el total numérico (necesaria para finalizarCompra)
function obtenerTotalNumerico() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    return carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
}

function renderizarCarrito() {
    const contenedor = document.getElementById('items-carrito');
    const totalElemento = document.getElementById('total-precio');
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p class="text-center py-10 text-gray-500">Tu carrito está vacío.</p>';
        if (totalElemento) totalElemento.textContent = '0.00';
        return;
    }

    contenedor.innerHTML = '';
    let total = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        contenedor.innerHTML += `
            <div class="flex items-center justify-between border-b border-gray-100 py-4">
                <div class="flex items-center gap-4">
                    <img src="${item.imagen_url}" class="w-16 h-16 object-cover rounded-lg" alt="${item.nombre}">
                    <div>
                        <h3 class="font-bold text-gray-950">${item.nombre}</h3>
                        <p class="text-xs text-gray-400 uppercase">${item.categoria || 'General'}</p>
                    </div>
                </div>
                <div class="flex items-center gap-6">
                    <div class="flex items-center border border-gray-200 rounded-lg">
                        <button onclick="cambiarCantidad(${index}, -1)" class="px-3 py-1 hover:bg-gray-50">-</button>
                        <span class="px-3 py-1 text-sm font-medium">${item.cantidad}</span>
                        <button onclick="cambiarCantidad(${index}, 1)" class="px-3 py-1 hover:bg-gray-50">+</button>
                    </div>
                    <span class="font-bold text-[#D65D46] w-24 text-right">$${subtotal.toLocaleString()}</span>
                    <button onclick="eliminarDelCarrito(${index})" class="text-gray-400 hover:text-red-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    });

    if (totalElemento) totalElemento.textContent = total.toLocaleString();
}

function cambiarCantidad(index, delta) {
    let carrito = JSON.parse(localStorage.getItem('carrito'));
    const nuevaCantidad = carrito[index].cantidad + delta;

    // Validación contra stock y límite inferior
    if (nuevaCantidad > 0 && nuevaCantidad <= (carrito[index].stock || 99)) {
        carrito[index].cantidad = nuevaCantidad;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();
    }
}

function eliminarDelCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito'));
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();
}

async function finalizarCompra() {
    const token = localStorage.getItem('token');
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = obtenerTotalNumerico();

    if (!token) {
        alert('Debes iniciar sesión para completar tu compra.');
        window.location.href = 'registrarse.html';
        return;
    }

    if (carrito.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    const datosVenta = {
        total: total,
        items: carrito.map(item => ({
            id: item.id,
            cantidad: item.cantidad,
            precio: item.precio
        }))
    };

    try {
        const response = await fetch('http://localhost:3000/api/ventas/completar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datosVenta)
        });

        const result = await response.json();

        if (result.success) {
            alert('🚀 ¡Venta realizada con éxito! El stock ha sido actualizado.');
            localStorage.removeItem('carrito');
            window.location.href = 'index.html';
        } else {
            alert('Error al procesar la venta: ' + result.message);
        }
    } catch (error) {
        console.error('Error en la conexión:', error);
        alert('No se pudo conectar con el servidor de ventas.');
    }
}