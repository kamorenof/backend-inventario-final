const pool = require('../config/db');

// Guardar un nuevo conteo físico
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
    // Insertar en conteos_fisicos
    const insertConteo = `
      INSERT INTO conteos_fisicos (observaciones, diferencias)
      VALUES ($1, $2) RETURNING id
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
    console.error('❌ Error al registrar conteo:', err);
    res.status(500).json({ mensaje: 'Error al guardar el conteo físico', error: err });
  }
};
