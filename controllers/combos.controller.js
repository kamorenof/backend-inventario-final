const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const pool = require('../config/db');
require('dotenv').config();

// 🔧 Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🟢 Subir imagen a Cloudinary y registrar en la base de datos
exports.subirCombo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: 'No se envió ninguna imagen' });
  }

  try {
    // 📤 Subir imagen a Cloudinary
    const resultado = await cloudinary.uploader.upload(req.file.path, {
      folder: 'inventario/combos'
    });

    // 🧹 Eliminar archivo local temporal
    fs.unlinkSync(req.file.path);

    // 🗃️ Guardar URL en la base de datos
    const fecha = new Date();
    const query = `INSERT INTO promociones (imagen_url, fecha) VALUES ($1, $2) RETURNING id`;
    const { rows } = await pool.query(query, [resultado.secure_url, fecha]);

    res.status(200).json({
      mensaje: '✅ Imagen subida y guardada correctamente',
      id: rows[0].id,
      url: resultado.secure_url
    });

  } catch (err) {
    console.error('❌ Error al subir combo:', err);
    res.status(500).json({ mensaje: 'Error al subir la imagen' });
  }
};

// 🟢 Obtener combos desde la base de datos
exports.obtenerCombos = async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, imagen_url FROM promociones ORDER BY fecha DESC`);
    const combos = result.rows.map(row => ({
      id: row.id,
      url: row.imagen_url
    }));

    res.json(combos);

  } catch (err) {
    console.error('❌ Error al obtener promociones:', err);
    res.status(500).json({ mensaje: 'Error al obtener promociones' });
  }
};

// 🟢 Eliminar combo desde la base de datos (no Cloudinary por ahora)
exports.eliminarCombo = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM promociones WHERE id = $1`, [id]);
    res.json({ mensaje: '✅ Combo eliminado de la base de datos' });

  } catch (err) {
    console.error('❌ Error al eliminar combo:', err);
    res.status(500).json({ mensaje: 'Error al eliminar el combo' });
  }
};
