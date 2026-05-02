const { poolPromise, sql } = require('../config/db');

const completarVenta = async (req, res) => {
    const { total, items } = req.body;
    const usuarioId = req.user.id; // Obtenido del token verificado

    console.log('Iniciando completarVenta:', { total, items, usuarioId });

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        await transaction.begin();
        console.log('Transacción iniciada');

        try {
            // 1. Crear la cabecera de la venta
            const requestVenta = new sql.Request(transaction);
            const resultVenta = await requestVenta
                .input('usuarioId', sql.Int, usuarioId)
                .input('total', sql.Decimal(10, 2), total)
                .query(`
                    INSERT INTO Ventas (usuario_id, total, fecha)
                    OUTPUT INSERTED.id
                    VALUES (@usuarioId, @total, GETDATE())
                `);

            const ventaId = resultVenta.recordset[0].id;
            console.log('Venta creada con ID:', ventaId);

            // 2. Procesar cada item (Validar stock y restar)
            for (const item of items) {
                console.log('Procesando item:', item);
                const requestStock = new sql.Request(transaction);

                // Verificar stock actual
                const prodCheck = await requestStock
                    .input('productoId', sql.Int, item.id)
                    .query(`
                        SELECT stock, nombre FROM Productos WHERE id = @productoId
                    `);

                const producto = prodCheck.recordset[0];
                console.log('Producto encontrado:', producto);

                if (!producto || producto.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para: ${producto ? producto.nombre : 'ID ' + item.id}`);
                }

                // Restar stock y registrar detalle
                await requestStock
                    .input('productoId2', sql.Int, item.id)
                    .input('cantidad', sql.Int, item.cantidad)
                    .input('ventaId', sql.Int, ventaId)
                    .input('precio', sql.Decimal(10, 2), item.precio)
                    .query(`
                        UPDATE Productos SET stock = stock - @cantidad
                        WHERE id = @productoId2;

                        INSERT INTO Detalle_Ventas (venta_id, producto_id, cantidad, precio_unitario)
                        VALUES (@ventaId, @productoId2, @cantidad, @precio)
                    `);
                console.log('Item procesado correctamente');
            }

            await transaction.commit();
            console.log('Transacción completada exitosamente');
            res.json({ success: true, ventaId: ventaId });

        } catch (error) {
            await transaction.rollback();
            console.error('Error en transacción:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    } catch (err) {
        console.error('Error en servidor:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

const obtenerHistorial = async (req, res) => {
    const usuarioId = req.user.id;

    try {
        const pool = await poolPromise;
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

module.exports = { completarVenta, obtenerHistorial };