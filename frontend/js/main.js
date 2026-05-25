document.addEventListener('DOMContentLoaded', () => {

    actualizarInterfazUsuario();
    actualizarContadorCarrito();

    if (document.getElementById('contenedor-productos')) {
        cargarCatalogo();
    }
});

// ===============================
// AUTENTICACIÓN
// ===============================

function actualizarInterfazUsuario() {

    const authContainer =
        document.getElementById('auth-links');

    const token =
        localStorage.getItem('token');

    if (!authContainer) return;

    if (!token) {
        return renderizarBotonesLogin(authContainer);
    }

    try {

        const base64Url =
            token.split('.')[1];

        const base64 =
            base64Url
                .replace(/-/g, '+')
                .replace(/_/g, '/');

        const payload =
            JSON.parse(window.atob(base64));

        authContainer.innerHTML = `
            <div class="flex items-center gap-4">

                <a href="dashboard.html"
                   class="text-sm font-medium hover:text-[#D65D46] transition">

                    Hola,
                    <span class="font-bold">
                        ${payload.nombre}
                    </span>

                </a>

                ${payload.rol === 'admin'
                ? `
                        <a href="admin.html"
                           class="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition">
                            Admin
                        </a>
                    `
                : ''
            }

                <button onclick="logout()"
                        class="text-sm text-red-500 hover:underline cursor-pointer">

                    Cerrar Sesión

                </button>

            </div>
        `;

    } catch (e) {

        console.error('Token corrupto:', e);

        localStorage.removeItem('token');

        renderizarBotonesLogin(authContainer);
    }
}

function renderizarBotonesLogin(container) {

    container.innerHTML = `
        <a href="registrarse.html"
           class="text-sm font-medium hover:text-[#D65D46] transition">

            Iniciar Sesión

        </a>

        <a href="catalogo.html"
           class="bg-gray-950 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition">

            Comprar

        </a>
    `;
}

function logout() {

    localStorage.removeItem('token');

    if (typeof toastr !== 'undefined') {
        toastr.info('Has cerrado sesión correctamente');
    }

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ===============================
// CATÁLOGO
// ===============================

async function cargarCatalogo() {

    const contenedor =
        document.getElementById('contenedor-productos');

    if (!contenedor) return;

    contenedor.innerHTML = `
        <p class="col-span-full text-center text-gray-500 font-serif py-20 italic">
            Cargando ejemplares disponibles...
        </p>
    `;

    try {

        const respuesta =
            await fetch('/api/productos');

        if (!respuesta.ok) {
            throw new Error(
                'Error en la respuesta del servidor'
            );
        }

        const productos =
            await respuesta.json();
        // Cache productos para búsqueda por id en el cliente
        window.productosCache = productos;

        if (!productos.length) {

            contenedor.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <p class="text-gray-500 text-lg">
                        No hay aves en inventario.
                    </p>
                </div>
            `;

            return;
        }

        contenedor.innerHTML =
            productos
                .map(ave => crearTarjetaProducto(ave))
                .join('');

    } catch (error) {

        console.error('Error:', error);

        contenedor.innerHTML = `
            <div class="col-span-full text-center py-20 border-2 border-dashed border-red-100 rounded-2xl bg-red-50">

                <p class="text-red-600 font-bold">
                    Error de conexión con la granja
                </p>

                <p class="text-gray-500 text-xs mt-2">
                    Asegúrate de que el servidor Node.js esté activo.
                </p>

            </div>
        `;
    }
}

function crearTarjetaProducto(ave) {

    const aveString =
        JSON.stringify(ave)
            .replace(/'/g, "&apos;");

    const sinStock =
        ave.stock <= 0;

    return `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">

            <div class="relative h-64 overflow-hidden">

                <img
                    src="${ave.imagen_url || 'https://via.placeholder.com/400x300'}"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                >

                <span class="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-bold backdrop-blur-sm">
                    Stock: ${ave.stock}
                </span>

                <span class="absolute top-4 right-4 bg-[#D65D46] text-white text-[9px] px-2 py-1 rounded-full font-bold uppercase">
                    ${ave.categoria}
                </span>

                ${sinStock
            ? `
                        <div class="absolute inset-0 bg-black/50 flex items-center justify-center">

                            <span class="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
                                AGOTADO
                            </span>

                        </div>
                    `
            : ''
        }

            </div>

            <div class="p-6 flex-grow flex flex-col">

                <h3 class="text-xl font-bold text-gray-950 mb-1">
                    ${ave.nombre}
                </h3>

                <p class="text-gray-600 text-sm mb-6 line-clamp-2">
                    ${ave.descripcion || ''}
                </p>

                <div class="mt-auto">

                    <div class="flex items-baseline gap-1 mb-4">

                        <span class="text-2xl font-bold text-[#D65D46]">
                            $${Number(ave.precio).toLocaleString()}
                        </span>

                        <span class="text-[10px] text-gray-400 uppercase">
                            MXN
                        </span>

                    </div>

                    <div class="flex gap-2">

                        <button
                            onclick="verDetalles(${ave.id})"
                            class="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer">

                            Detalles

                        </button>

                        <button
                            onclick="agregarAlCarritoById(${ave.id})"
                            ${sinStock ? 'disabled' : ''}
                            class="flex-[1.5] py-2 rounded-lg text-sm font-medium transition
                            ${sinStock
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#D65D46] text-white hover:bg-[#b84d39] cursor-pointer'}">

                            ${sinStock ? 'Sin Stock' : '+ Añadir'}

                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;
}

// ===============================
// CARRITO
// ===============================

const obtenerCarrito = () =>
    JSON.parse(localStorage.getItem('carrito')) || [];

const guardarCarrito = carrito =>
    localStorage.setItem(
        'carrito',
        JSON.stringify(carrito)
    );

function agregarAlCarrito(producto) {
    try {
        console.log('agregarAlCarrito llamado:', producto && producto.id ? producto.id : producto);
        // Validar si hay sesión iniciada
        const token = localStorage.getItem('token');
        if (!token) {
            if (typeof toastr !== 'undefined') {
                toastr.warning('Debes iniciar sesión para agregar productos');
            }
            setTimeout(() => {
                window.location.href = 'registrarse.html';
            }, 1500);
            return;
        }

        if (!producto || typeof producto !== 'object') {
            console.error('Producto inválido pasado a agregarAlCarrito:', producto);
            if (typeof toastr !== 'undefined') toastr.error('No se pudo agregar el producto. Intenta de nuevo.');
            return;
        }

        if (Number(producto.stock) <= 0) {
            if (typeof toastr !== 'undefined') {
                toastr.error('Este producto no tiene stock disponible');
            }
            return;
        }

        // Abrir modal de cantidad
        abrirModalCantidad(producto);
    } catch (e) {
        console.error('Error en agregarAlCarrito:', e);
        if (typeof toastr !== 'undefined') toastr.error('Error al agregar producto. Revisa la consola.');
    }
}

// Agrega producto por id (más robusto que pasar JSON inline)
async function agregarAlCarritoById(id) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            if (typeof toastr !== 'undefined') toastr.warning('Debes iniciar sesión para agregar productos');
            setTimeout(() => { window.location.href = 'registrarse.html'; }, 1500);
            return;
        }

        // Intentar obtener producto desde cache cargada
        const productos = window.productosCache || [];
        let producto = productos.find(p => p.id == id);

        // Si no está en cache, obtener lista del servidor
        if (!producto) {
            const resp = await fetch('/api/productos');
            if (resp.ok) {
                const list = await resp.json();
                window.productosCache = list;
                producto = list.find(p => p.id == id);
            }
        }

        if (!producto) {
            if (typeof toastr !== 'undefined') toastr.error('Producto no encontrado.');
            return;
        }

        abrirModalCantidad(producto);

    } catch (e) {
        console.error('Error en agregarAlCarritoById:', e);
        if (typeof toastr !== 'undefined') toastr.error('Error al agregar producto. Revisa la consola.');
    }
}

// ===============================
// MODAL DE CANTIDAD
// ===============================

let productoEnModal = null;

function abrirModalCantidad(producto) {
    productoEnModal = producto;

    // Actualizar UI del modal
    document.getElementById('modal-titulo').textContent =
        `¿Cuántas ${producto.nombre} quieres?`;

    document.getElementById('modal-subtitulo').innerHTML =
        `Stock disponible: <span id="modal-stock-disponible">${producto.stock}</span>`;

    document.getElementById('modal-cantidad-input').value = 1;
    document.getElementById('modal-cantidad-input').min = 1;
    document.getElementById('modal-cantidad-input').max = producto.stock;

    document.getElementById('modal-minimo').textContent = 1;
    document.getElementById('modal-maximo').textContent = producto.stock;

    // Mostrar modal
    document.getElementById('modal-cantidad').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarModalCantidad() {
    document.getElementById('modal-cantidad').classList.add('hidden');
    document.body.style.overflow = 'auto';
    productoEnModal = null;
}

function aumentarCantidad() {
    const input = document.getElementById('modal-cantidad-input');
    const max = parseInt(input.max);
    const actual = parseInt(input.value);

    if (actual < max) {
        input.value = actual + 1;
    } else {
        if (typeof toastr !== 'undefined') {
            toastr.info(`Máximo disponible: ${max}`);
        }
    }
}

function disminuirCantidad() {
    const input = document.getElementById('modal-cantidad-input');
    const min = parseInt(input.min);
    const actual = parseInt(input.value);

    if (actual > min) {
        input.value = actual - 1;
    } else {
        if (typeof toastr !== 'undefined') {
            toastr.info(`Mínimo: ${min}`);
        }
    }
}

function confirmarCantidad() {
    if (!productoEnModal) return;

    const cantidadInput = document.getElementById('modal-cantidad-input');
    const cantidad = parseInt(cantidadInput.value);
    const stock = productoEnModal.stock;

    // Validaciones
    if (cantidad < 1) {
        if (typeof toastr !== 'undefined') {
            toastr.error('La cantidad debe ser al menos 1');
        }
        return;
    }

    if (cantidad > stock) {
        if (typeof toastr !== 'undefined') {
            toastr.error(`Máximo disponible: ${stock}`);
        }
        return;
    }

    // Agregar al carrito con la cantidad especificada
    const carrito = obtenerCarrito();
    const index = carrito.findIndex(item => item.id === productoEnModal.id);

    if (index !== -1) {
        // Producto ya existe
        const nuevaCantidad = carrito[index].cantidad + cantidad;

        if (nuevaCantidad > stock) {
            if (typeof toastr !== 'undefined') {
                toastr.error(
                    `Stock insuficiente. Disponible: ${stock}, Ya tienes: ${carrito[index].cantidad}`
                );
            }
            return;
        }

        carrito[index].cantidad = nuevaCantidad;

        if (typeof toastr !== 'undefined') {
            toastr.success(
                `✓ ${productoEnModal.nombre}: ${cantidad} unidades añadidas (Total: ${nuevaCantidad})`
            );
        }
    } else {
        // Nuevo producto
        carrito.push({
            ...productoEnModal,
            cantidad: cantidad
        });

        if (typeof toastr !== 'undefined') {
            toastr.success(
                `✓ ${productoEnModal.nombre} (${cantidad} unidades) añadido al carrito`
            );
        }
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito();
    cerrarModalCantidad();
}

function actualizarContadorCarrito() {

    const contador =
        document.getElementById('carrito-count');

    if (!contador) return;

    const totalItems =
        obtenerCarrito()
            .reduce(
                (acc, item) => acc + item.cantidad,
                0
            );

    contador.textContent =
        totalItems;

    contador.classList.toggle(
        'hidden',
        totalItems <= 0
    );
}

function verDetalles(id) {
    window.location.href =
        `producto.html?id=${id}`;
}