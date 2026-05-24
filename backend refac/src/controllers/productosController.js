const { poolPromise, sql } = require('../config/db');

// 1. Funciones existentes
const obtenerTodos = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Productos');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const crear = async (req, res) => {
    const { nombre, descripcion, precio, imagen_url, stock } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('descripcion', sql.VarChar, descripcion)
            .input('precio', sql.Decimal(10, 2), precio)
            .input('imagen_url', sql.VarChar, imagen_url)
            .input('stock', sql.Int, stock)
            .query('INSERT INTO Productos (nombre, descripcion, precio, imagen_url, stock) VALUES (@nombre, @descripcion, @precio, @imagen_url, @stock)');
        res.status(201).json({ success: true, message: 'Creado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const editar = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, imagen_url, stock } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.VarChar, nombre)
            .input('descripcion', sql.VarChar, descripcion)
            .input('precio', sql.Decimal(10, 2), precio)
            .input('imagen_url', sql.VarChar, imagen_url)
            .input('stock', sql.Int, stock)
            .query('UPDATE Productos SET nombre = @nombre, descripcion = @descripcion, precio = @precio, imagen_url = @imagen_url, stock = @stock WHERE id = @id');
        res.json({ success: true, message: 'Editado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const eliminar = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Productos WHERE id = @id');
        res.json({ success: true, message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. LA FUNCIÓN QUE FALTABA (actualizarStock)
const actualizarStock = async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('stock', sql.Int, stock)
            .query('UPDATE Productos SET stock = @stock WHERE id = @id');
        res.json({ success: true, message: 'Stock actualizado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. EXPORTACIÓN ÚNICA (Ahora todas las funciones existen)
module.exports = {
    obtenerTodos,
    crear,
    editar,
    eliminar,
    actualizarStock
};