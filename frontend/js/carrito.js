document.addEventListener('DOMContentLoaded', renderizarCarrito);

const obtenerCarrito = () =>
    JSON.parse(localStorage.getItem('carrito')) || [];

const guardarCarrito = carrito =>
    localStorage.setItem(
        'carrito',
        JSON.stringify(carrito)
    );

const formatoMoneda = valor =>
    `$${valor.toLocaleString(undefined, {
        minimumFractionDigits: 2
    })}`;

// Formato numérico sin símbolo de moneda (útil para insertar en elementos que ya contienen el signo $)
const formatoNumero = valor =>
    valor.toLocaleString(undefined, { minimumFractionDigits: 2 });

function obtenerTotalNumerico() {
    return obtenerCarrito()
        .reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

function renderizarCarrito() {

    const contenedor = document.getElementById('items-carrito');
    const totalElemento = document.getElementById('total-precio');

    if (!contenedor) return;

    let carrito = obtenerCarrito();
    if (!Array.isArray(carrito)) {
        console.warn('Carrito en localStorage no es un array. Reseteando.');
        carrito = [];
        guardarCarrito(carrito);
    }

    if (!carrito.length) {

        contenedor.innerHTML =
            '<p class="text-center py-10 text-gray-500">Tu carrito está vacío.</p>';

        if (totalElemento) totalElemento.textContent = formatoNumero(0);

        return;
    }

    let total = 0;

    contenedor.innerHTML = carrito.map((item, index) => {

        const subtotal = Number(item.precio) * Number(item.cantidad);

        total += subtotal;

        return `
            <div class="flex items-center justify-between border-b border-gray-100 py-4">

                <div class="flex items-center gap-4">
                    <img src="${item.imagen_url || 'https://via.placeholder.com/64'}" 
                         class="w-16 h-16 object-cover rounded-lg" 
                         alt="${item.nombre}">

                    <div>
                        <h3 class="font-bold text-gray-950">${item.nombre}</h3>
                        <p class="text-xs text-gray-400 uppercase">
                            ${item.categoria || 'General'}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-6">

                    <div class="flex items-center border border-gray-200 rounded-lg">

                        <button onclick="cambiarCantidad(${index}, -1)"
                                class="px-3 py-1 hover:bg-gray-50">
                            -
                        </button>

                        <span class="px-3 py-1 text-sm font-medium">
                            ${item.cantidad}
                        </span>

                        <button onclick="cambiarCantidad(${index}, 1)"
                                class="px-3 py-1 hover:bg-gray-50">
                            +
                        </button>
                    </div>

                    <span class="font-bold text-[#D65D46] w-24 text-right">
                        $${formatoNumero(subtotal)}
                    </span>

                    <button onclick="eliminarDelCarrito(${index})"
                            class="text-gray-400 hover:text-red-500">

                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                            </path>
                        </svg>
                    </button>

                </div>
            </div>
        `;
    }).join('');

    totalElemento.textContent = formatoNumero(total);
}

function cambiarCantidad(index, delta) {

    const carrito = obtenerCarrito();
    const item = carrito[index];

    const nuevaCantidad = item.cantidad + delta;
    const stockDisponible = item.stock || 99;

    if (nuevaCantidad <= 0) return;

    if (stockDisponible <= 30 && nuevaCantidad > 3) {
        return toastr.warning(
            'Solo puedes comprar máximo 3 unidades de este producto por inventario bajo'
        );
    }

    if (nuevaCantidad > stockDisponible) {
        return toastr.info(
            'Límite de stock alcanzado para este producto'
        );
    }

    item.cantidad = nuevaCantidad;

    guardarCarrito(carrito);

    renderizarCarrito();

    if (typeof actualizarContadorCarrito === 'function') {
        actualizarContadorCarrito();
    }
}

function eliminarDelCarrito(index) {

    const carrito = obtenerCarrito();

    carrito.splice(index, 1);

    guardarCarrito(carrito);

    renderizarCarrito();

    toastr.info('Producto eliminado del carrito');

    if (typeof actualizarContadorCarrito === 'function') {
        actualizarContadorCarrito();
    }
}

function toggleModal(mostrar = true) {

    const modal = document.getElementById('modal-confirmacion');

    modal.classList.toggle('hidden', !mostrar);

    modal.classList.toggle('flex', mostrar);
}

function finalizarCompra() {

    const token = localStorage.getItem('token');
    const carrito = obtenerCarrito();

    if (!token) {
        return toastr.warning(
            'Debes iniciar sesión para comprar'
        );
    }

    if (!carrito.length) {
        return toastr.error(
            'Tu carrito está vacío'
        );
    }

    const subtotal = obtenerTotalNumerico();
    const iva = subtotal * 0.16;
    const totalFinal = subtotal + iva;

    document.getElementById('modal-subtotal').textContent =
        formatoMoneda(subtotal);

    document.getElementById('modal-iva').textContent =
        formatoMoneda(iva);

    document.getElementById('modal-total').textContent =
        formatoMoneda(totalFinal);

    toggleModal(true);
}

function cerrarModalCompra() {
    toggleModal(false);
}

function descargarTicket(carrito, subtotal, iva, totalFinal) {

    const fecha = new Date().toLocaleString();

    let contenido = `
=====================================
        GRANJA PREMIUM
        TICKET DE COMPRA
=====================================

Fecha: ${fecha}

PRODUCTOS:

`;

    carrito.forEach(item => {

        const subtotalProducto =
            item.precio * item.cantidad;

        contenido += `
${item.nombre}
Cantidad: ${item.cantidad}
Precio unitario: $${item.precio}
Subtotal: $${subtotalProducto.toLocaleString()}
-------------------------------------
`;
    });

    contenido += `

=====================================
Subtotal: $${subtotal.toLocaleString()}
IVA (16%): $${iva.toLocaleString()}
TOTAL: $${totalFinal.toLocaleString()}
=====================================

Gracias por su compra.
`;

    const blob = new Blob(
        [contenido],
        { type: 'text/plain' }
    );

    const enlace = document.createElement('a');

    enlace.href = URL.createObjectURL(blob);

    enlace.download = `ticket-compra-${Date.now()}.txt`;

    enlace.click();

    URL.revokeObjectURL(enlace.href);
}

async function confirmarCompra() {

    toggleModal(false);

    const token = localStorage.getItem('token');
    const carrito = obtenerCarrito();

    // Validar que hay token
    if (!token) {
        toastr.error('La sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('carrito');
        setTimeout(() => {
            window.location.href = 'registrarse.html';
        }, 1500);
        return;
    }

    const subtotal = obtenerTotalNumerico();
    const iva = subtotal * 0.16;
    const totalFinal = subtotal + iva;

    const datosVenta = {
        total: subtotal,  // El backend calcula IVA, enviamos solo subtotal
        items: carrito.map(({ id, cantidad, precio }) => ({
            id,
            cantidad,
            precio
        }))
    };

    try {

        const response = await fetch('/api/ventas/completar', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },

            body: JSON.stringify(datosVenta)
        });

        // Log para debugging
        console.log('Status:', response.status);
        console.log('Token enviado:', token.substring(0, 20) + '...');

        // Si el servidor responde error, lo mostramos
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);

            if (response.status === 401) {
                toastr.error('Tu sesión ha expirado. Inicia sesión nuevamente.');
                localStorage.removeItem('token');
                localStorage.removeItem('carrito');
                setTimeout(() => {
                    window.location.href = 'registrarse.html';
                }, 1500);
                return;
            }

            return toastr.error(
                'Error: ' + (errorData.message || errorData.error || 'Error desconocido')
            );
        }

        const result = await response.json();

        if (!result.success) {
            return toastr.error(
                '❌ Error en la compra: ' + result.message
            );
        }

        toastr.success('🚀 ¡Venta realizada con éxito!');
        console.log('Venta completada:', result);

        descargarTicket(
            carrito,
            subtotal,
            iva,
            totalFinal
        );

        localStorage.removeItem('carrito');
        actualizarContadorCarrito();

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);

    } catch (error) {

        console.error('Error en la conexión:', error);

        toastr.error(
            '❌ Error de conexión: ' + error.message
        );
    }
}