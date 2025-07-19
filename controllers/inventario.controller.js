const pool = require('../config/db');

// Obtener inventario actual (stock por producto)
exports.obtenerInventarioActual = async (req, res) => {
  const sql = `
    SELECT 
      p.id, p.codigo, p.descripcion, p.categoria, p.valor_unitario,
      COALESCE(SUM(CASE WHEN m.tipo = 'entrada' THEN dm.cantidad ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN m.tipo = 'salida' THEN dm.cantidad ELSE 0 END), 0) AS stock
    FROM productos p
    LEFT JOIN detalle_movimiento dm ON p.id = dm.id_producto
    LEFT JOIN movimientos m ON dm.id_movimiento = m.id
    GROUP BY p.id
    HAVING 
      COALESCE(SUM(CASE WHEN m.tipo = 'entrada' THEN dm.cantidad ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN m.tipo = 'salida' THEN dm.cantidad ELSE 0 END), 0) > 0
    ORDER BY p.descripcion ASC
  `;

  try {
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener inventario', error: err });
  }
};
