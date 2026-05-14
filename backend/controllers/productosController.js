// Cambia esto para usar tu configuración centralizada
const { poolPromise, sql } = require('../config/db');

// Capacidad máxima de la granja: 100 unidades por ejemplar
const CAPACIDAD_MAXIMA = 100;

const actualizarStock = async (req, res) => {

    const { id, nuevoStock } = req.body;

    try {

        if (nuevoStock > CAPACIDAD_MAXIMA) {

            return res.status(400).json({
                success: false,
                message:
                    `❌ Stock no permitido. Máximo ${CAPACIDAD_MAXIMA} unidades.`
            });
        }

        if (nuevoStock < 0) {

            return res.status(400).json({
                success: false,
                message:
                    '❌ El stock no puede ser negativo.'
            });
        }

        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('stock', sql.Int, nuevoStock)
            .query(`
                UPDATE Productos
                SET stock = @stock
                WHERE id = @id
            `);

        console.log(
            `✅ Stock actualizado: Producto ${id} → ${nuevoStock}`
        );

        res.json({
            success: true,
            message: 'Stock actualizado correctamente.'
        });

    } catch (err) {

        console.error(
            '❌ Error al actualizar stock:',
            err
        );

        res.status(500).json({
            success: false,
            message: 'Error al actualizar stock.'
        });
    }
};

const crearProducto = async (req, res) => {
    const { nombre, precio, stock, categoria, imagen_url } = req.body;
    
    try {
        // VALIDACIÓN: Verificar que el stock inicial no exceda la capacidad máxima
        if (stock > CAPACIDAD_MAXIMA) {
            return res.status(400).json({ 
                success: false, 
                message: `❌ Stock no permitido. La capacidad máxima de la granja es ${CAPACIDAD_MAXIMA} unidades por ejemplar. Intento: ${stock}` 
            });
        }

        if (stock < 0) {
            return res.status(400).json({ 
                success: false, 
                message: '❌ El stock inicial no puede ser negativo.' 
            });
        }

        const request = new sql.Request();
        await request
            .input('nombre', sql.NVarChar, nombre)
            .input('precio', sql.Decimal(10, 2), precio)
            .input('stock', sql.Int, stock)
            .input('categoria', sql.NVarChar, categoria)
            .input('imagen_url', sql.NVarChar, imagen_url)
            .query(`
                INSERT INTO Productos (nombre, precio, stock, categoria, imagen_url)
                VALUES (@nombre, @precio, @stock, @categoria, @imagen_url)
            `);

        console.log(`✅ Producto creado: "${nombre}" - Stock inicial: ${stock} unidades`);
        res.json({ success: true, message: 'Producto creado con éxito.' });
    } catch (err) {
        console.error('❌ Error al crear producto:', err);
        res.status(500).json({ success: false, message: 'Error al crear producto.' });
    }
};

module.exports = { actualizarStock, crearProducto };