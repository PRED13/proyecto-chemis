const sql = require('mssql');

const completarVenta = async (req, res) => {
    const { total, items } = req.body;
    const usuarioId = req.user.id; // Obtenido del token verificado - NORMALIZADO

    try {
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        try {
            // 1. Crear la cabecera de la venta
            const requestVenta = new sql.Request(transaction);
            const resultVenta = await requestVenta.query`
                INSERT INTO Ventas (usuario_id, total, fecha) 
                OUTPUT INSERTED.id
                VALUES (${usuarioId}, ${total}, GETDATE())`;

            const ventaId = resultVenta.recordset[0].id;

            // 2. Procesar cada item (Validar stock y restar)
            for (const item of items) {
                const requestStock = new sql.Request(transaction);

                // Verificar stock actual
                const prodCheck = await requestStock.query`
                    SELECT stock, nombre FROM Productos WHERE id = ${item.id}`;

                const producto = prodCheck.recordset[0];

                if (!producto || producto.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para: ${producto ? producto.nombre : 'ID ' + item.id}`);
                }

                // Restar stock y registrar detalle
                await requestStock.query`
                    UPDATE Productos SET stock = stock - ${item.cantidad} 
                    WHERE id = ${item.id};
                    
                    INSERT INTO Detalle_Ventas (venta_id, producto_id, cantidad, precio_unitario)
                    VALUES (${ventaId}, ${item.id}, ${item.cantidad}, ${item.precio})`;
            }

            await transaction.commit();
            res.json({ success: true, ventaId: ventaId });

        } catch (error) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: error.message });
        }
    } catch (err) {
        console.error('Error en servidor:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

const obtenerHistorial = async (req, res) => {
    const usuarioId = req.user.id; // NORMALIZADO

    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('usuarioId', sql.Int, usuarioId)
            .query(`
                SELECT 
                    v.id AS ventaId, 
                    v.fecha, 
                    v.total,
                    dv.cantidad,
                    dv.precio_unitario,
                    p.nombre AS productoNombre
                FROM Ventas v
                INNER JOIN Detalle_Ventas dv ON v.id = dv.venta_id
                INNER JOIN Productos p ON dv.producto_id = p.id
                WHERE v.usuario_id = @usuarioId
                ORDER BY v.fecha DESC
            `);

        // Agrupar los resultados por ventaId para facilitar el renderizado
        const historial = result.recordset.reduce((acc, row) => {
            const { ventaId, fecha, total, ...detalle } = row;
            if (!acc[ventaId]) {
                acc[ventaId] = { ventaId, fecha, total, items: [] };
            }
            acc[ventaId].items.push(detalle);
            return acc;
        }, {});

        res.json({ success: true, data: Object.values(historial) });
    } catch (err) {
        console.error('Error al obtener historial:', err);
        res.status(500).json({ success: false, message: 'Error al obtener el historial de compras' });
    }
};

// No olvides exportarla al final del archivo
module.exports = { completarVenta, obtenerHistorial };