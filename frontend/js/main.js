/**
 * Main logic for Granja Premium Catalog
 * Focus: Async data fetching, state management with LocalStorage, and dynamic UI rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    console.log("Inicializando aplicación de catálogo...");
    await cargarCatalogo();
    actualizarContadorCarrito();
}

/**
 * Obtiene los productos desde la API y los renderiza.
 * Se asume entorno Node.js/Express en puerto 3000 según la arquitectura definida.
 */
async function cargarCatalogo() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    // Mostrar un loader simple o mensaje de carga
    contenedor.innerHTML = '<p class="col-span-full text-center text-gray-500 font-serif py-20">Cargando ejemplares disponibles...</p>';

    try {
        // Enlace al backend local (configurar CORS en el servidor)
        const respuesta = await fetch('http://localhost:3000/api/productos');
        
        if (!respuesta.ok) throw new Error('Error en la respuesta del servidor');
        
        const productos = await respuesta.json();

        if (productos.length === 0) {
            contenedor.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <p class="text-gray-500 font-serif text-lg">No hay aves en inventario actualmente.</p>
                </div>`;
            return;
        }

        // Limpiar contenedor
        contenedor.innerHTML = '';

        // Renderizado dinámico
        productos.forEach(ave => {
            contenedor.innerHTML += crearTarjetaProducto(ave);
        });

    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        contenedor.innerHTML = `
            <div class="col-span-full text-center py-20 border-2 border-dashed border-red-100 rounded-2xl bg-red-50">
                <p class="text-red-600 font-bold">Error de conexión con la granja</p>
                <p class="text-gray-500 text-xs mt-2">Verifica que tu API en Node.js/SQL Server esté activa en el puerto 3000.</p>
            </div>
        `;
    }
}

/**
 * Genera el HTML de la tarjeta manteniendo el diseño premium (dark/orange) solicitado.
 */
function crearTarjetaProducto(ave) {
    return `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
            <div class="relative h-64 overflow-hidden">
                <img src="${ave.imagen_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen'}" 
                     alt="${ave.nombre}" 
                     class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <span class="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-bold backdrop-blur-sm">
                    Stock: ${ave.stock}
                </span>
                <span class="absolute top-4 right-4 bg-[#D65D46] text-white text-[9px] px-2 py-1 rounded-full font-bold uppercase">
                    ${ave.categoria}
                </span>
            </div>
            <div class="p-6 flex-grow flex flex-col">
                <h3 class="text-xl font-bold text-gray-950 mb-1">${ave.nombre}</h3>
                <p class="text-[10px] uppercase tracking-widest text-gray-400 mb-4">${ave.subtitulo || 'Ejemplar de Calidad'}</p>
                <p class="text-gray-600 text-sm mb-6 line-clamp-2">${ave.descripcion}</p>
                
                <div class="mt-auto">
                    <div class="flex items-baseline gap-1 mb-4">
                        <span class="text-2xl font-bold text-[#D65D46]">$${Number(ave.precio).toLocaleString()}</span>
                        <span class="text-[10px] text-gray-400 uppercase">MXN</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="verDetalles(${ave.id})" class="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                            Detalles
                        </button>
                        <button onclick='agregarAlCarrito(${JSON.stringify(ave)})' 
                                class="flex-[1.5] bg-[#D65D46] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#b84d39] transition">
                            + Añadir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Gestión de persistencia en LocalStorage.
 */
function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const index = carrito.findIndex(item => item.id === producto.id);
    
    if (index !== -1) {
        // Validación de stock local (opcional, el backend debe validar esto)
        if (carrito[index].cantidad < producto.stock) {
            carrito[index].cantidad += 1;
        } else {
            alert("No hay más stock disponible");
            return;
        }
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    
    // Animación simple o notificación
    console.log(`Producto ${producto.nombre} añadido.`);
}

/**
 * Sincroniza la burbuja del header con el estado real del carrito.
 */
function actualizarContadorCarrito() {
    const contador = document.querySelector('header .relative.group span');
    if (!contador) return;
    
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    contador.textContent = totalItems;
    
    // Efecto visual si el carrito no está vacío
    if (totalItems > 0) {
        contador.classList.remove('hidden');
    } else {
        contador.classList.add('hidden');
    }
}

// Función placeholder para futura implementación de vista detallada
function verDetalles(id) {
    window.location.href = `producto.html?id=${id}`;
}