const fs = require('fs');
const path = require('path');
const pool = require('../config/db'); // Adaptado para PostgreSQL

// 🟢 Subir imagen y registrar en la base de datos
exports.subirCombo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: 'No se envió ninguna imagen' });
  }

  const imagenUrl = `/uploads/combos/${req.file.filename}`;
  const fecha = new Date();

  try {
    const query = `INSERT INTO promociones (imagen_url, fecha) VALUES ($1, $2)`;
    await pool.query(query, [imagenUrl, fecha]);

    res.status(200).json({
      mensaje: '✅ Imagen subida y guardada correctamente',
      filename: req.file.filename,
      url: imagenUrl
    });
  } catch (err) {
    console.error('❌ Error al insertar en BD:', err);
    res.status(500).json({ mensaje: 'Error al guardar imagen en la base de datos' });
  }
};

// 🟢 Obtener combos desde la base de datos
exports.obtenerCombos = async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, imagen_url FROM promociones ORDER BY fecha DESC`);
    const combos = result.rows.map(row => ({
      id: row.id,
      filename: path.basename(row.imagen_url),
      url: `https://backend-inventario-final.onrender.com${row.imagen_url}` // Usa tu backend en producción
    }));
    res.json(combos);
  } catch (err) {
    console.error('❌ Error al consultar promociones:', err);
    res.status(500).json({ mensaje: 'Error al obtener promociones' });
  }
};

// 🟢 Eliminar combo: archivo + base de datos
exports.eliminarCombo = async (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../uploads/combos', filename);
  const imagenUrl = `/uploads/combos/${filename}`;

  try {
    // Eliminar archivo del servidor
    fs.unlink(filepath, async (err) => {
      if (err) {
        console.error('❌ Error al eliminar imagen del disco:', err);
        return res.status(500).json({ mensaje: 'Error al eliminar imagen del servidor' });
      }

      try {
        // Eliminar de la base de datos
        await pool.query(`DELETE FROM promociones WHERE imagen_url = $1`, [imagenUrl]);
        res.json({ mensaje: '✅ Imagen eliminada correctamente' });
      } catch (dbErr) {
        console.error('❌ Error al eliminar de la base de datos:', dbErr);
        res.status(500).json({ mensaje: 'Error al eliminar imagen de la base de datos' });
      }
    });

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al procesar la solicitud de eliminación', error: err });
  }
};
