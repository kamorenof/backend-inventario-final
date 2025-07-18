const db = require('../config/db');

// Obtener productos
exports.obtenerProductos = (req, res) => {
  db.query('SELECT * FROM productos', (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos' });
    res.json(resultados);
  });
};

// Crear producto
exports.crearProducto = (req, res) => {
  const { codigo, descripcion, categoria, valor_unitario } = req.body;
  db.query('INSERT INTO productos (codigo, descripcion, categoria, valor_unitario) VALUES (?, ?, ?, ?)',
    [codigo, descripcion, categoria, valor_unitario],
    (err, resultado) => {
      if (err) return res.status(500).json({ error: 'Error al crear producto' });
      res.status(201).json({ mensaje: 'Producto creado correctamente' });
    });
};

// Actualizar producto
exports.actualizarProducto = (req, res) => {
  const { codigo } = req.params;
  const { descripcion, categoria, valor_unitario } = req.body;

  db.query('UPDATE productos SET descripcion = ?, categoria = ?, valor_unitario = ? WHERE codigo = ?',
    [descripcion, categoria, valor_unitario, codigo],
    (err, resultado) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar producto' });
      res.json({ mensaje: 'Producto actualizado correctamente' });
    });
};

// Eliminar producto
exports.eliminarProducto = (req, res) => {
  const { codigo } = req.params;

  db.query('DELETE FROM productos WHERE codigo = ?', [codigo], (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar producto' });
    res.json({ mensaje: 'Producto eliminado correctamente' });
  });
};
