document.addEventListener('DOMContentLoaded', () => {
    cargarHistorial();
});

async function cargarHistorial() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'registrarse.html';
        return;
    }

    try {
        const response = await fetch('/api/ventas/historial', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            renderizarHistorial(result.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderizarHistorial(compras) {
    const container = document.getElementById('historial-container');
    if (compras.length === 0) {
        container.innerHTML = '<p>Aún no has realizado compras.</p>';
        return;
    }

    container.innerHTML = compras.map(compra => `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex justify-between border-b pb-4 mb-4">
                <div>
                    <p class="text-sm text-gray-500">Pedido #${compra.ventaId}</p>
                    <p class="font-bold">${new Date(compra.fecha).toLocaleDateString()}</p>
                </div>
                <p class="text-xl font-bold text-[#D65D46]">$${compra.total.toLocaleString()}</p>
            </div>
            <div class="space-y-2">
                ${compra.items.map(item => `
                    <div class="flex justify-between text-sm">
                        <span>${item.productoNombre} (x${item.cantidad})</span>
                        <span class="text-gray-600">$${(item.precio_unitario * item.cantidad).toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}