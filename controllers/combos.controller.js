const cloudinary = require('../config/cloudinary');
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// 🟢 Subir imagen a Cloudinary y guardar en DB
exports.subirCombo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: 'No se envió ninguna imagen' });
  }

  const tempPath = req.file.path;

  try {
    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(tempPath, {
      folder: 'combos_inventario', // Puedes cambiar el nombre de carpeta en Cloudinary
    });

    // Guardar en PostgreSQL
    await pool.query(
      'INSERT INTO promociones (imagen_url, fecha) VALUES ($1, NOW())',
      [result.secure_url]
    );

    // Eliminar archivo temporal
    fs.unlinkSync(tempPath);

    res.status(200).json({
      mensaje: '✅ Imagen subida y guardada correctamente',
      url: result.secure_url,
    });
  } catch (err) {
    console.error('❌ Error al subir a Cloudinary o guardar en BD:', err);
    res.status(500).json({ mensaje: 'Error al subir imagen', error: err });
  }
};

// 🟢 Obtener combos desde la base de datos
exports.obtenerCombos = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, imagen_url FROM promociones ORDER BY fecha DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al consultar promociones:', err);
    res.status(500).json({ mensaje: 'Error al obtener promociones' });
  }
};

// 🟡 Eliminar combo de la base de datos (no elimina de Cloudinary)
exports.eliminarCombo = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener la imagen_url para referencia (opcional)
    const result = await pool.query('SELECT imagen_url FROM promociones WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Imagen no encontrada' });
    }

    // Eliminar solo de la base de datos
    await pool.query('DELETE FROM promociones WHERE id = $1', [id]);

    res.json({ mensaje: '✅ Imagen eliminada de la base de datos' });
  } catch (err) {
    console.error('❌ Error al eliminar promoción:', err);
    res.status(500).json({ mensaje: 'Error al eliminar imagen' });
  }
};
