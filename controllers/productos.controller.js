const pool = require('../config/db');

// 🟢 Obtener productos
exports.obtenerProductos = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// 🟢 Crear producto
exports.crearProducto = async (req, res) => {
  const { codigo, descripcion, categoria, valor_unitario } = req.body;

  try {
    await pool.query(
      'INSERT INTO productos (codigo, descripcion, categoria, valor_unitario) VALUES ($1, $2, $3, $4)',
      [codigo, descripcion, categoria, valor_unitario]
    );
    res.status(201).json({ mensaje: '✅ Producto creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// 🟢 Actualizar producto
exports.actualizarProducto = async (req, res) => {
  const { codigo } = req.params;
  const { descripcion, categoria, valor_unitario } = req.body;

  try {
    await pool.query(
      'UPDATE productos SET descripcion = $1, categoria = $2, valor_unitario = $3 WHERE codigo = $4',
      [descripcion, categoria, valor_unitario, codigo]
    );
    res.json({ mensaje: '✅ Producto actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// 🟢 Eliminar producto
exports.eliminarProducto = async (req, res) => {
  const { codigo } = req.params;

  try {
    await pool.query('DELETE FROM productos WHERE codigo = $1', [codigo]);
    res.json({ mensaje: '✅ Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
