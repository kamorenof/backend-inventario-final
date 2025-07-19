const pool = require('../config/db');

// 🟢 Registrar un nuevo movimiento y sus detalles
exports.registrarMovimiento = async (req, res) => {
  const { tipo, factura, motivo, responsable, productos } = req.body;

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ mensaje: 'Productos inválidos o vacíos.' });
  }

  const total = productos.reduce((acc, p) => acc + (p.cantidad * p.valor_unitario), 0);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertMovimientoQuery = `
      INSERT INTO movimientos (tipo, factura, motivo, responsable, total) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const { rows } = await client.query(insertMovimientoQuery, [
      tipo,
      factura || null,
      motivo || null,
      responsable,
      total
    ]);

    const id_movimiento = rows[0].id;
    console.log('✅ Movimiento registrado con ID:', id_movimiento);

    const insertDetalleQuery = `
      INSERT INTO detalle_movimiento (id_movimiento, id_producto, cantidad, valor_unitario, total)
      VALUES ($1, $2, $3, $4, $5)
    `;

    for (const p of productos) {
      await client.query(insertDetalleQuery, [
        id_movimiento,
        p.id_producto,
        p.cantidad,
        p.valor_unitario,
        p.cantidad * p.valor_unitario
      ]);
    }

    await client.query('COMMIT');
    res.status(201).json({ mensaje: '✅ Movimiento registrado con éxito' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error al registrar movimiento:', err);
    res.status(500).json({ mensaje: 'Error al guardar el movimiento', error: err });
  } finally {
    client.release();
  }
};

// 🟢 Obtener todos los movimientos
exports.obtenerMovimientos = async (req, res) => {
  const sql = `
    SELECT id, tipo, responsable, total, fecha 
    FROM movimientos 
    ORDER BY fecha DESC
  `;

  try {
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener movimientos', error: err });
  }
};

// 🟢 Obtener un movimiento por ID con detalles
exports.obtenerMovimientoPorId = async (req, res) => {
  const { id } = req.params;

  const sqlMovimiento = `
    SELECT id, tipo, responsable, total, fecha, factura, motivo 
    FROM movimientos 
    WHERE id = $1
  `;

  const sqlDetalles = `
    SELECT dm.id_producto, p.codigo, p.descripcion, p.categoria, dm.cantidad, dm.valor_unitario, dm.total 
    FROM detalle_movimiento dm 
    JOIN productos p ON dm.id_producto = p.id 
    WHERE dm.id_movimiento = $1
  `;

  try {
    const resultMov = await pool.query(sqlMovimiento, [id]);
    if (resultMov.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Movimiento no encontrado' });
    }

    const resultDet = await pool.query(sqlDetalles, [id]);

    res.json({
      ...resultMov.rows[0],
      detalles: resultDet.rows
    });

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener movimiento', error: err });
  }
};
