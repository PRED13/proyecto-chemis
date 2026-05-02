async function cambiarStock(id, cantidadActual) {
    const nuevoStock = prompt("Introduce el nuevo stock:", cantidadActual);
    if (nuevoStock === null) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3000/api/admin/stock', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ id, nuevoStock: parseInt(nuevoStock) })
        });

        const res = await response.json();
        if (res.success) {
            alert("Inventario actualizado");
            location.reload();
        } else {
            alert("Error: " + res.message);
        }
    } catch (error) {
        console.error(error);
    }
}