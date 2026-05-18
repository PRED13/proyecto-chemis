document.addEventListener('DOMContentLoaded', () => {
    actualizarInterfazUsuario();
    cargarHistorial();
});

async function cargarHistorial() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('historial-container');

    if (!token) {
        container.innerHTML = '<p class="text-red-500">Debes iniciar sesión para ver tus compras.</p>';
        setTimeout(() => {
            window.location.href = 'registrarse.html';
        }, 2000);
        return;
    }

    // Mostrar estado de carga
    container.innerHTML = '<p class="text-center text-gray-500">Cargando tu historial de compras...</p>';

    try {
        console.log('Intentando obtener historial con token:', token.substring(0, 20) + '...');

        const response = await fetch('/api/ventas/historial', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response status:', response.status);

        // Verificar si la respuesta es OK
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);

            if (response.status === 401) {
                container.innerHTML = '<p class="text-red-500">Tu sesión ha expirado. Inicia sesión nuevamente.</p>';
                localStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = 'registrarse.html';
                }, 2000);
                return;
            }

            container.innerHTML = `<p class="text-red-500">Error: ${errorData.message || 'No se pudo cargar el historial'}</p>`;
            return;
        }

        const result = await response.json();
        console.log('Historial recibido:', result);

        if (result.success) {
            renderizarHistorial(result.data);
        } else {
            container.innerHTML = `<p class="text-red-500">Error: ${result.message || 'No se pudo cargar el historial'}</p>`;
        }
    } catch (error) {
        console.error('Error en la conexión:', error);
        container.innerHTML = `<p class="text-red-500">Error de conexión: ${error.message}</p>`;
    }
}

function renderizarHistorial(compras) {
    const container = document.getElementById('historial-container');

    if (!compras || compras.length === 0) {
        container.innerHTML = `
            <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <p class="text-gray-500 text-lg mb-4">Aún no has realizado compras.</p>
                <a href="catalogo.html" class="text-[#D65D46] font-bold hover:underline">
                    Ir al catálogo →
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = compras.map(compra => `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div class="flex justify-between items-start border-b pb-4 mb-4">
                <div>
                    <p class="text-sm text-gray-500">Pedido #${compra.ventaId}</p>
                    <p class="font-bold text-lg">${new Date(compra.fecha).toLocaleDateString('es-MX')}</p>
                    <p class="text-xs text-gray-400">${new Date(compra.fecha).toLocaleTimeString('es-MX')}</p>
                </div>
                <div class="text-right">
                    <p class="text-2xl font-bold text-[#D65D46]">$${Number(compra.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Completado</span>
                </div>
            </div>
            
            <div class="space-y-3 mb-4">
                <p class="text-sm font-semibold text-gray-700">Productos:</p>
                ${compra.items.map(item => `
                    <div class="flex justify-between text-sm bg-gray-50 p-3 rounded-lg">
                        <span class="text-gray-900 font-medium">${item.productoNombre}</span>
                        <div class="text-right">
                            <span class="text-gray-600">× ${item.cantidad}</span>
                            <p class="font-bold text-[#D65D46]">$${Number(item.precio_unitario * item.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="pt-3 border-t text-xs text-gray-500">
                Fecha de pedido: ${new Date(compra.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>
    `).join('');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('carrito');
    window.location.href = 'index.html';
}