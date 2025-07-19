const pool = require('../config/db');

// 🟢 Guardar un nuevo conteo físico
exports.registrarConteo = async (req, res) => {
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ mensaje: 'No hay productos para guardar el conteo.' });
  }

  const hayDiferencias = productos.some(p =>
    p.cantidad_fisica !== '' &&
    Number(p.cantidad_fisica) !== Number(p.cantidad_actual)
  );

  const observacionesGlobales = productos
    .map(p => p.observacion)
    .filter(Boolean)
    .join(' | ') || null;

  try {
    // Insertar conteo
    const insertConteo = `
      INSERT INTO conteos_fisicos (observaciones, diferencias)
      VALUES ($1, $2)
      RETURNING id
    `;
    const { rows } = await pool.query(insertConteo, [observacionesGlobales, hayDiferencias ? 1 : 0]);
    const id_conteo = rows[0].id;

    // Insertar detalles
    const insertDetalle = `
      INSERT INTO detalle_conteo (id_conteo, id_producto, cantidad_actual, cantidad_fisica, observacion)
      VALUES ($1, $2, $3, $4, $5)
    `;

    for (const p of productos) {
      await pool.query(insertDetalle, [
        id_conteo,
        p.id_producto,
        p.cantidad_actual,
        p.cantidad_fisica,
        p.observacion || null
      ]);
    }

    res.status(201).json({ mensaje: '✅ Conteo físico guardado correctamente' });

  } catch (err) {
    console.error('❌ Error al guardar conteo físico:', err);
    res.status(500).json({ mensaje: 'Error al guardar el conteo físico', error: err });
  }
};

// 🟢 Obtener historial de conteos
exports.obtenerHistorialConteos = async (req, res) => {
  const sql = `SELECT * FROM conteos_fisicos ORDER BY fecha DESC`;
  try {
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener historial', error: err });
  }
};

// 🟢 Obtener detalle de un conteo por ID
exports.obtenerDetalleConteo = async (req, res) => {
  const { id } = req.params;

  const sqlConteo = `SELECT * FROM conteos_fisicos WHERE id = $1`;
  const sqlDetalle = `
    SELECT dc.*, p.codigo, p.descripcion, p.categoria 
    FROM detalle_conteo dc 
    JOIN productos p ON dc.id_producto = p.id
    WHERE id_conteo = $1
  `;

  try {
    const resultConteo = await pool.query(sqlConteo, [id]);
    if (resultConteo.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Conteo no encontrado' });
    }

    const resultDetalle = await pool.query(sqlDetalle, [id]);

    res.json({
      conteo: resultConteo.rows[0],
      detalles: resultDetalle.rows
    });

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener detalle', error: err });
  }
};
