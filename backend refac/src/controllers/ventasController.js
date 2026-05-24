const { poolPromise, sql } = require('../config/db');
const { enviarNotaRemision } = require('../services/emailService');

exports.completarVenta = async (req, res) => {
    const { items } = req.body; 
    const usuarioId = req.usuario.id;
    const usuarioCorreo = req.usuario.correo;

    // 1. Cálculo de montos en el BACKEND
    const subtotal = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const iva = subtotal * 0.16; // IVA al 16%
    const totalFinal = subtotal + iva;

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 2. Insertar venta usando el totalFinal calculado
        const ventaRequest = new sql.Request(transaction);
        const ventaResult = await ventaRequest
            .input('usuario_id', sql.Int, usuarioId)
            .input('total', sql.Decimal(10, 2), totalFinal)
            .query('INSERT INTO Ventas (usuario_id, total, fecha) OUTPUT INSERTED.id VALUES (@usuario_id, @total, GETDATE())');
        
        const ventaId = ventaResult.recordset[0].id;

        // 3. Procesar cada artículo e interactuar con el stock
        for (const item of items) {
            const stockRequest = new sql.Request(transaction);
            
            const productData = await stockRequest
                .input('id', sql.Int, item.id)
                .query('SELECT stock, nombre FROM Productos WHERE id = @id');
                
            if (productData.recordset.length === 0) {
                throw new Error(`El producto con ID ${item.id} no existe.`);
            }

            const currentStock = productData.recordset[0].stock;
            const nombreProducto = productData.recordset[0].nombre;

            if (currentStock < item.cantidad) {
                throw new Error(`Stock insuficiente para "${nombreProducto}". Disponibles: ${currentStock}.`);
            }

            // Restar stock
            const updateRequest = new sql.Request(transaction);
            await updateRequest
                .input('id', sql.Int, item.id)
                .input('cantidad', sql.Int, item.cantidad)
                .query('UPDATE Productos SET stock = stock - @cantidad WHERE id = @id');

            // Registrar detalle de venta - CORREGIDO A: Detalle_Ventas
            const detalleRequest = new sql.Request(transaction);
            await detalleRequest
                .input('venta_id', sql.Int, ventaId)
                .input('producto_id', sql.Int, item.id)
                .input('cantidad', sql.Int, item.cantidad)
                .input('precio_unitario', sql.Decimal(10, 2), item.precio)
                .query('INSERT INTO Detalle_Ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES (@venta_id, @producto_id, @cantidad, @precio_unitario)');
            
            item.nombre = nombreProducto;
        }

        // Consolidar transacción
        await transaction.commit();

        // 4. Enviar Nota de Remisión con el desglose de montos
        try {
            await enviarNotaRemision(usuarioCorreo, ventaId, items, { subtotal, iva, totalFinal });
        } catch (mailErr) {
            console.error("Alerta: Venta guardada pero falló el envío de correo:", mailErr.message);
        }

        res.json({ success: true, message: 'Transacción completada.', ventaId, total: totalFinal });

    } catch (error) {
        if (transaction._begun) await transaction.rollback();
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.obtenerHistorial = async (req, res) => {
    const usuarioId = req.usuario.id;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('usuario_id', sql.Int, usuarioId)
            .query(`
                SELECT v.id AS ventaId, v.total, v.fecha, 
                       dv.cantidad, dv.precio_unitario, p.nombre AS productoNombre
                FROM Ventas v
                JOIN Detalle_Ventas dv ON v.id = dv.venta_id
                JOIN Productos p ON dv.producto_id = p.id
                WHERE v.usuario_id = @usuario_id
                ORDER BY v.fecha DESC
            `);

        const historialAgrupado = [];
        result.recordset.forEach(row => {
            let venta = historialAgrupado.find(v => v.ventaId === row.ventaId);
            if (!venta) {
                venta = { ventaId: row.ventaId, total: row.total, fecha: row.fecha, items: [] };
                historialAgrupado.push(venta);
            }
            venta.items.push({ productoNombre: row.productoNombre, cantidad: row.cantidad, precio_unitario: row.precio_unitario });
        });

        res.json({ success: true, data: historialAgrupado });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};