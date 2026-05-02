const sql = require('mssql');

const actualizarStock = async (req, res) => {
    const { id, nuevoStock } = req.body;

    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('stock', sql.Int, nuevoStock)
            .query('UPDATE Productos SET stock = @stock WHERE id = @id');

        res.json({ success: true, message: 'Stock actualizado correctamente.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al actualizar stock.' });
    }
};

const crearProducto = async (req, res) => {
    const { nombre, precio, stock, categoria, imagen_url } = req.body;

    try {
        const pool = await sql.connect();
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('precio', sql.Decimal(10, 2), precio)
            .input('stock', sql.Int, stock)
            .input('categoria', sql.NVarChar, categoria)
            .input('imagen_url', sql.NVarChar, imagen_url)
            .query(`
                INSERT INTO Productos (nombre, precio, stock, categoria, imagen_url)
                VALUES (@nombre, @precio, @stock, @categoria, @imagen_url)
            `);

        res.json({ success: true, message: 'Producto creado con éxito.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al crear producto.' });
    }
};

module.exports = { actualizarStock, crearProducto };