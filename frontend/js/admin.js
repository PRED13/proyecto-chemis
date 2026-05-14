document.addEventListener('DOMContentLoaded', () => {

    verificarAccesoAdmin();

    cargarInventario();
});

function obtenerPayload(token) {

    try {

        return JSON.parse(
            atob(token.split('.')[1])
        );

    } catch {

        return null;
    }
}

function verificarAccesoAdmin() {

    const token = localStorage.getItem('token');

    if (!token) {

        window.location.href = 'registrarse.html';

        return;
    }

    const payload = obtenerPayload(token);

    if (!payload || payload.rol !== 'admin') {

        toastr.error(
            'Acceso restringido a administradores'
        );

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

async function cargarInventario() {

    const tabla = document.getElementById('tabla-inventario');

    try {

        const response = await fetch('/api/productos');

        const productos = await response.json();

        tabla.innerHTML = productos.map(producto => `
            <tr class="border-b">

                <td class="py-3">
                    ${producto.nombre}
                </td>

                <td class="py-3">
                    ${producto.stock}
                </td>

                <td class="py-3">

                    <button
                        onclick="cambiarStock(${producto.id}, ${producto.stock})"
                        class="bg-[#D65D46] text-white px-4 py-2 rounded-lg hover:bg-[#b84d39] transition">

                        Editar Stock
                    </button>

                </td>

            </tr>
        `).join('');

    } catch (error) {

        console.error(error);

        toastr.error(
            'No se pudo cargar el inventario'
        );
    }
}

async function cambiarStock(id, cantidadActual) {

    const nuevoStock = prompt(
        'Introduce el nuevo stock:',
        cantidadActual
    );

    if (
        nuevoStock === null ||
        nuevoStock === '' ||
        isNaN(nuevoStock)
    ) {
        return;
    }

    const token = localStorage.getItem('token');

    try {

        const response = await fetch('/api/admin/stock', {

            method: 'PUT',

            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },

            body: JSON.stringify({
                id,
                nuevoStock: parseInt(nuevoStock)
            })
        });

        const res = await response.json();

        if (!res.success) {

            toastr.error(
                'No se pudo actualizar: ' + res.message
            );

            return;
        }

        toastr.success(
            'Inventario actualizado correctamente'
        );

        cargarInventario();

    } catch (error) {

        console.error(error);

        toastr.error(
            'Error crítico en el servidor'
        );
    }
}