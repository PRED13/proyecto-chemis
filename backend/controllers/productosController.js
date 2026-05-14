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

    const {
        nombre,
        descripcion,
        precio,
        stock,
        categoria_id,
        imagen_url
    } = req.body;

    try {

        if (!nombre || !precio || !categoria_id) {

            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios.'
            });
        }

        if (stock > CAPACIDAD_MAXIMA) {

            return res.status(400).json({
                success: false,
                message:
                    `❌ Stock no permitido. Máximo ${CAPACIDAD_MAXIMA} unidades.`
            });
        }

        if (stock < 0) {

            return res.status(400).json({
                success: false,
                message:
                    '❌ El stock no puede ser negativo.'
            });
        }

        const pool = await poolPromise;

        // Verificar categoría existente
        const categoriaExiste = await pool.request()
            .input('categoria_id', sql.Int, categoria_id)
            .query(`
                SELECT id
                FROM Categorias
                WHERE id = @categoria_id
            `);

        if (!categoriaExiste.recordset.length) {

            return res.status(400).json({
                success: false,
                message: 'La categoría no existe.'
            });
        }

        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('descripcion', sql.NVarChar, descripcion)
            .input('precio', sql.Decimal(10, 2), precio)
            .input('stock', sql.Int, stock)
            .input('categoria_id', sql.Int, categoria_id)
            .input('imagen_url', sql.NVarChar, imagen_url)
            .query(`
                INSERT INTO Productos (
                    nombre,
                    descripcion,
                    precio,
                    categoria_id,
                    imagen_url,
                    stock
                )
                VALUES (
                    @nombre,
                    @descripcion,
                    @precio,
                    @categoria_id,
                    @imagen_url,
                    @stock
                )
            `);

        console.log(
            `✅ Producto creado: ${nombre}`
        );

        res.json({
            success: true,
            message: 'Producto creado correctamente.'
        });

    } catch (err) {

        console.error(
            '❌ Error al crear producto:',
            err
        );

        res.status(500).json({
            success: false,
            message: 'Error al crear producto.'
        });
    }
};

module.exports = { actualizarStock, crearProducto };