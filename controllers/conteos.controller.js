const pool = require('../config/db'); // Importa el pool de PostgreSQL

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
    const client = await pool.connect();

    try {
      // Inicia una transacción
      await client.query('BEGIN');

      // Inserta el conteo físico y obtiene el ID generado
      const insertConteo = `
        INSERT INTO conteos_fisicos (observaciones, diferencias)
        VALUES ($1, $2)
        RETURNING id
      `;
      const result = await client.query(insertConteo, [observacionesGlobales, hayDiferencias ? 1 : 0]);
      const id_conteo = result.rows[0].id;

      // Inserta los detalles
      const insertDetalle = `
        INSERT INTO detalle_conteo (id_conteo, id_producto, cantidad_actual, cantidad_fisica, observacion)
        VALUES ($1, $2, $3, $4, $5)
      `;

      for (const p of productos) {
        await client.query(insertDetalle, [
          id_conteo,
          p.id_producto,
          p.cantidad_actual,
          p.cantidad_fisica,
          p.observacion || null
        ]);
      }

      // Finaliza la transacción
      await client.query('COMMIT');
      res.status(201).json({ mensaje: '✅ Conteo físico guardado correctamente' });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en transacción:', error);
      res.status(500).json({ mensaje: 'Error al guardar el conteo físico', error });
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('Error de conexión:', err);
    res.status(500).json({ mensaje: 'Error al conectar con la base de datos', error: err });
  }
};

// Obtener historial de conteos
exports.obtenerHistorialConteos = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM conteos_fisicos ORDER BY fecha DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener historial', error: err });
  }
};

// Obtener detalle por ID de conteo
exports.obtenerDetalleConteo = async (req, res) => {
  const { id } = req.params;

  try {
    const conteoResult = await pool.query(
      `SELECT * FROM conteos_fisicos WHERE id = $1`,
      [id]
    );

    if (conteoResult.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Conteo no encontrado' });
    }

    const detalleResult = await pool.query(`
      SELECT dc.*, p.codigo, p.descripcion, p.categoria 
      FROM detalle_conteo dc
      JOIN productos p ON dc.id_producto = p.id
      WHERE id_conteo = $1
    `, [id]);

    res.json({
      conteo: conteoResult.rows[0],
      detalles: detalleResult.rows
    });

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener detalle', error: err });
  }
};
