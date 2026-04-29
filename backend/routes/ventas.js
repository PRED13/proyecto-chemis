const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db'); 
const auth = require('../middleware/authMiddleware');

// Solo usuarios logueados pueden comprar (Uso del middleware auth)
router.post('/completar', auth, async (req, res) => {
    const { total, items } = req.body;
    const usuarioId = req.user.id; // Obtenido del token JWT a través del middleware
    
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Insertar la Venta incluyendo el usuario_id
        const requestVenta = new sql.Request(transaction);
        const resultVenta = await requestVenta
            .input('total', sql.Decimal(10, 2), total)
            .input('usuario_id', sql.Int, usuarioId) // Referencia al usuario
            .query('INSERT INTO Ventas (total, usuario_id) OUTPUT INSERTED.id VALUES (@total, @usuario_id)');
        
        const ventaId = resultVenta.recordset[0].id;

        // 2. Insertar detalles y actualizar stock
        for (const item of items) {
            const requestDetalle = new sql.Request(transaction);
            
            await requestDetalle
                .input('venta_id', sql.Int, ventaId)
                .input('producto_id', sql.Int, item.id)
                .input('cantidad', sql.Int, item.cantidad)
                .input('precio', sql.Decimal(10, 2), item.precio)
                .query(`
                    INSERT INTO DetalleVentas (venta_id, producto_id, cantidad, precio_unitario)
                    VALUES (@venta_id, @producto_id, @cantidad, @precio)
                `);

            await requestDetalle
                .input('id_prod', sql.Int, item.id)
                .input('cant_restar', sql.Int, item.cantidad)
                .query('UPDATE Productos SET stock = stock - @cant_restar WHERE id = @id_prod');
        }

        await transaction.commit();
        res.json({ success: true, message: 'Venta registrada con éxito', ventaId });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("Error en transacción:", err);
        res.status(500).json({ success: false, message: 'Error al procesar la venta' });
    }
});

module.exports = router;