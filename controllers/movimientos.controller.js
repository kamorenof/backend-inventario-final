const db = require('../config/db');

// Registrar un nuevo movimiento con sus detalles
exports.registrarMovimiento = (req, res) => {
  const { tipo, factura, motivo, responsable, productos } = req.body;

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ mensaje: 'Productos inválidos o vacíos.' });
  }

  const total = productos.reduce((acc, p) => acc + (p.cantidad * p.valor_unitario), 0);

  const queryMovimiento = `
    INSERT INTO movimientos (tipo, factura, motivo, responsable, total) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(queryMovimiento, [tipo, factura || null, motivo || null, responsable, total], (err, result) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al guardar el movimiento', error: err });
    }

    const id_movimiento = result.insertId;
    console.log('✅ Movimiento registrado con ID:', id_movimiento);

    const detalles = productos.map(p => [
      id_movimiento,
      p.id_producto,
      p.cantidad,
      p.valor_unitario,
      p.cantidad * p.valor_unitario
    ]);

    console.log('📦 Detalles que se van a insertar:', detalles);

    const queryDetalle = `
      INSERT INTO detalle_movimiento (id_movimiento, id_producto, cantidad, valor_unitario, total) 
      VALUES ?
    `;

    db.query(queryDetalle, [detalles], (err2) => {
      if (err2) {
        return res.status(500).json({ mensaje: 'Error al guardar los detalles', error: err2 });
      }

      res.status(201).json({ mensaje: '✅ Movimiento registrado con éxito' });
    });
  });
};

// Obtener todos los movimientos (para historial general)
exports.obtenerMovimientos = (req, res) => {
  const sql = `
    SELECT id, tipo, responsable, total, fecha 
    FROM movimientos 
    ORDER BY fecha DESC
  `;
  db.query(sql, (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener movimientos', error: err });
    res.json(resultados);
  });
};

// Obtener un movimiento con todos sus detalles (para vista detallada)
exports.obtenerMovimientoPorId = (req, res) => {
  const { id } = req.params;

  const sqlMovimiento = `
    SELECT id, tipo, responsable, total, fecha, factura, motivo 
    FROM movimientos 
    WHERE id = ?
  `;

  const sqlDetalles = `
    SELECT dm.id_producto, p.codigo, p.descripcion, p.categoria, dm.cantidad, dm.valor_unitario, dm.total 
    FROM detalle_movimiento dm 
    JOIN productos p ON dm.id_producto = p.id 
    WHERE dm.id_movimiento = ?
  `;

  db.query(sqlMovimiento, [id], (err, movimiento) => {
    if (err || movimiento.length === 0) {
      return res.status(404).json({ mensaje: 'Movimiento no encontrado', error: err });
    }

    db.query(sqlDetalles, [id], (err2, detalles) => {
      if (err2) {
        return res.status(500).json({ mensaje: 'Error al obtener detalles', error: err2 });
      }

      res.json({
        ...movimiento[0],
        detalles
      });
    });
  });
};
