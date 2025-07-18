const db = require('../config/db');

// Guardar un nuevo conteo físico
exports.registrarConteo = (req, res) => {
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ mensaje: 'No hay productos para guardar el conteo.' });
  }

  const hayDiferencias = productos.some(p => 
    p.cantidad_fisica !== '' &&
    Number(p.cantidad_fisica) !== Number(p.cantidad_actual)
  );


  const queryConteo = `INSERT INTO conteos_fisicos (observaciones, diferencias) VALUES (?, ?)`;

  const observacionesGlobales = productos
    .map(p => p.observacion)
    .filter(Boolean)
    .join(' | ') || null;

  db.query(queryConteo, [observacionesGlobales, hayDiferencias ? 1 : 0], (err, result) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al guardar el conteo físico', error: err });
    }

    const id_conteo = result.insertId;

    const detalles = productos.map(p => [
      id_conteo,
      p.id_producto,
      p.cantidad_actual,
      p.cantidad_fisica,
      p.observacion || null
    ]);

    const queryDetalle = `
      INSERT INTO detalle_conteo (id_conteo, id_producto, cantidad_actual, cantidad_fisica, observacion)
      VALUES ?
    `;

    db.query(queryDetalle, [detalles], (err2) => {
      if (err2) {
        return res.status(500).json({ mensaje: 'Error al guardar los detalles del conteo', error: err2 });
      }

      res.status(201).json({ mensaje: '✅ Conteo físico guardado correctamente' });
    });
  });
};

// Obtener historial de conteos
exports.obtenerHistorialConteos = (req, res) => {
  const sql = `SELECT * FROM conteos_fisicos ORDER BY fecha DESC`;
  db.query(sql, (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener historial', error: err });
    res.json(resultados);
  });
};

// Obtener detalle por ID de conteo
exports.obtenerDetalleConteo = (req, res) => {
  const { id } = req.params;

  const sqlConteo = `SELECT * FROM conteos_fisicos WHERE id = ?`;
  const sqlDetalle = `
    SELECT dc.*, p.codigo, p.descripcion, p.categoria 
    FROM detalle_conteo dc 
    JOIN productos p ON dc.id_producto = p.id
    WHERE id_conteo = ?
  `;

  db.query(sqlConteo, [id], (err, conteo) => {
    if (err || conteo.length === 0) {
      return res.status(404).json({ mensaje: 'Conteo no encontrado', error: err });
    }

    db.query(sqlDetalle, [id], (err2, detalles) => {
      if (err2) return res.status(500).json({ mensaje: 'Error al obtener detalle', error: err2 });

      res.json({
        conteo: conteo[0],
        detalles
      });
    });
  });
};
