const { poolPromise, sql } = require('../config/db');
const { enviarNotaRemision: enviarCorreoRemision } = require('../services/emailService');

// Tasa de IVA (16%)
const TASA_IVA = 0.16;

/**
 * Genera una nota de remisión en formato texto plano
 * @param {Object} ventaData - Datos de la venta con detalles
 * @param {number} usuarioData - Información del usuario
 * @returns {string} Nota de remisión formateada
 */
const generarNotaRemision = (ventaData, usuarioData) => {
    const fecha = new Date(ventaData.fecha).toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const subtotal = ventaData.subtotal;
    const iva = ventaData.iva;
    const total = ventaData.totalConIva;

    let nota = `
╔════════════════════════════════════════════════════════════════╗
║                      NOTA DE REMISIÓN                          ║
║                    GRANJA PREMIUM                              ║
╚════════════════════════════════════════════════════════════════╝

NÚMERO DE VENTA: ${ventaData.ventaId}
FECHA Y HORA: ${fecha}
USUARIO ID: ${usuarioData.usuarioId}

─────────────────────────────────────────────────────────────────
DETALLE DE PRODUCTOS:
─────────────────────────────────────────────────────────────────
`;

    ventaData.items.forEach((item, index) => {
        const lineItem = item.cantidad * item.precioUnitario;
        nota += `${index + 1}. ${item.nombreProducto}
   Cantidad: ${item.cantidad}
   Precio Unitario: $${item.precioUnitario.toFixed(2)}
   Subtotal: $${lineItem.toFixed(2)}

`;
    });

    nota += `─────────────────────────────────────────────────────────────────
RESUMEN DE TOTALES:
─────────────────────────────────────────────────────────────────
Subtotal: $${subtotal.toFixed(2)}
IVA (16%): $${iva.toFixed(2)}
─────────────────────────────────────────────────────────────────
TOTAL A PAGAR: $${total.toFixed(2)}
─────────────────────────────────────────────────────────────────

Gracias por su compra en Granja Premium.

`;

    return nota;
};

/**
 * Envía la nota de remisión por correo electrónico real
 * Usa el servicio de correo para enviar con nodemailer
 * @param {string} nota - Contenido de la nota en texto plano
 * @param {number} ventaId - ID de la venta para el asunto
 * @param {string} usuarioEmail - Email del destinatario
 * @returns {Promise<void>}
 */
const enviarNotaRemision = async (nota, ventaId, usuarioEmail) => {
    try {
        const asunto = `Nota de Remisión - Granja Premium - Venta #${ventaId}`;
        
        const resultado = await enviarCorreoRemision(usuarioEmail, asunto, nota);
        
        if (resultado.success) {
            console.log(`📧 ${resultado.message}`);
        } else {
            // Error no crítico: registrar pero continuar sin interrumpir la venta
            console.warn(`⚠️  ${resultado.message}: ${resultado.error}`);
        }
    } catch (error) {
        // Capturar errores inesperados para que no rompan la venta
        console.error('⚠️  Error inesperado al enviar correo:', error.message);
    }
};

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
            // Obtener información del usuario para la nota
            // Obtener información del usuario para la nota
            const requestUsuario = new sql.Request(transaction);
            const resultUsuario = await requestUsuario
                .input('usuarioId', sql.Int, usuarioId)
                // ✅ CORRECCIÓN: Usamos 'correo AS email' para coincidir con tu DB
                .query(`SELECT correo AS email, nombre FROM Usuarios WHERE id = @usuarioId`);
            
            const usuarioInfo = resultUsuario.recordset[0];

            // Validar que el usuario exista antes de seguir
            if (!usuarioInfo) {
                throw new Error("Usuario no encontrado en la base de datos.");
            }
            // Calcular subtotal, IVA y total
            const subtotal = total;
            const iva = subtotal * TASA_IVA;
            const totalConIva = subtotal + iva;

            // 1. Crear la cabecera de la venta con el total final (subtotal + IVA)
            const requestVenta = new sql.Request(transaction);
            const resultVenta = await requestVenta
                .input('usuarioId', sql.Int, usuarioId)
                .input('total', sql.Decimal(10, 2), totalConIva)
                .query(`
                    INSERT INTO Ventas (usuario_id, total, fecha)
                    OUTPUT INSERTED.id
                    VALUES (@usuarioId, @total, GETDATE())
                `);

            const ventaId = resultVenta.recordset[0].id;
            console.log('Venta creada con ID:', ventaId);
            console.log(`💰 Subtotal: $${subtotal.toFixed(2)} | IVA 16%: $${iva.toFixed(2)} | Total: $${totalConIva.toFixed(2)}`);

            // 2. Procesar cada item (Validar stock MÍNIMO y restar)
            const itemsDetalle = [];

            for (const item of items) {
                console.log('Procesando item:', item);
                const requestStock = new sql.Request(transaction);

                // Verificar stock actual
                const prodCheck = await requestStock
                    .input('productoId', sql.Int, item.id)
                    .query(`
                        SELECT stock, nombre, precio FROM Productos WHERE id = @productoId
                    `);

                const producto = prodCheck.recordset[0];
                console.log('Producto encontrado:', producto);

                // VALIDACIÓN DE STOCK MÍNIMO: Rechazar si stock solicitado > stock disponible
                if (!producto) {
                    throw new Error(`Producto no encontrado: ID ${item.id}`);
                }

                if (producto.stock < item.cantidad) {
                    throw new Error(
                        `❌ Stock insuficiente para "${producto.nombre}". ` +
                        `Solicitado: ${item.cantidad}, Disponible: ${producto.stock}`
                    );
                }

                // Guardar detalles para la nota
                itemsDetalle.push({
                    nombreProducto: producto.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio
                });

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
                console.log(`✅ Stock actualizado: ${producto.nombre} (-${item.cantidad})`);
            }

            await transaction.commit();
            console.log('Transacción completada exitosamente');

            // Generar y enviar nota de remisión en bloque try/catch independiente
            // para que si falla el correo NO interrumpa la venta registrada
            try {
                const ventaData = {
                    ventaId,
                    fecha: new Date(),
                    subtotal,
                    iva,
                    totalConIva,
                    items: itemsDetalle
                };

                const nota = generarNotaRemision(ventaData, { usuarioId });
                
                // Enviar correo de forma asincrónica sin bloquear la respuesta
                await enviarNotaRemision(nota, ventaId, usuarioInfo?.email || 'usuario@ejemplo.com');
            } catch (emailError) {
                // Errores de correo no son críticos - solo registrar en consola
                console.warn('⚠️  No se pudo enviar el correo, pero la venta se registró exitosamente:', emailError.message);
            }

            res.json({ 
                success: true, 
                ventaId: ventaId,
                subtotal: subtotal.toFixed(2),
                iva: iva.toFixed(2),
                totalConIva: totalConIva.toFixed(2)
            });

        } catch (error) {
            await transaction.rollback();
            console.error('❌ Error en transacción:', error.message);
            res.status(400).json({ success: false, message: error.message });
        }
    } catch (err) {
        console.error('❌ Error en servidor:', err);
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