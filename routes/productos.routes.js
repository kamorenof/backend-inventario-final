const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productos.controller');
const db = require('../config/db'); // ✅ NECESARIO para usar db en la búsqueda

// Rutas CRUD principales
router.get('/', productoController.obtenerProductos);
router.post('/', productoController.crearProducto);
router.put('/:codigo', productoController.actualizarProducto);
router.delete('/:codigo', productoController.eliminarProducto);

// 🔍 Ruta de búsqueda para autocompletar
router.get('/buscar', (req, res) => {
  const termino = req.query.q;

  if (!termino) {
    return res.status(400).json({ mensaje: 'Término de búsqueda requerido' });
  }

  const sql = `
    SELECT id, codigo, descripcion, categoria, valor_unitario 
    FROM productos 
    WHERE codigo LIKE ? OR descripcion LIKE ?
    LIMIT 10
  `;

  const valorBusqueda = `%${termino}%`;

  db.query(sql, [valorBusqueda, valorBusqueda], (err, resultados) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al buscar productos', error: err });
    }
    res.json(resultados);
  });
});

module.exports = router;
