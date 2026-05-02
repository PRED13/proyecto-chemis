async function cambiarStock(id, cantidadActual) {
    const nuevoStock = prompt("Introduce el nuevo stock:", cantidadActual);
    if (nuevoStock === null || nuevoStock === "") return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/admin/stock', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id, nuevoStock: parseInt(nuevoStock) })
        });

        const res = await response.json();
        if (res.success) {
            toastr.info('Inventario actualizado correctamente');
            // Recargar la tabla sin refrescar toda la página sería lo ideal
            setTimeout(() => location.reload(), 1500);
        } else {
            toastr.error('No se pudo actualizar: ' + res.message);
        }
    } catch (error) {
        toastr.error('Error crítico en el servidor');
    }
}