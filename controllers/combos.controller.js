const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// 🟢 Subir imagen y registrar en la base de datos
exports.subirCombo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: 'No se envió ninguna imagen' });
  }

  const imagenUrl = `/uploads/combos/${req.file.filename}`;
  const fecha = new Date();

  db.query(
    'INSERT INTO promociones (imagen_url, fecha) VALUES (?, ?)',
    [imagenUrl, fecha],
    (err, result) => {
      if (err) {
        console.error('❌ Error al insertar en BD:', err);
        return res.status(500).json({ mensaje: 'Error al guardar imagen en la base de datos' });
      }

      res.status(200).json({
        mensaje: '✅ Imagen subida y guardada correctamente',
        filename: req.file.filename,
        url: imagenUrl
      });
    }
  );
};

// 🟢 Obtener combos desde la base de datos
exports.obtenerCombos = (req, res) => {
  db.query('SELECT id, imagen_url FROM promociones ORDER BY fecha DESC', (err, rows) => {
    if (err) {
      console.error('❌ Error al consultar promociones:', err);
      return res.status(500).json({ mensaje: 'Error al obtener promociones' });
    }

    const combos = rows.map(row => ({
      id: row.id,
      filename: path.basename(row.imagen_url),
      url: `http://localhost:4000${row.imagen_url}`
    }));

    res.json(combos);
  });
};

// 🟢 Eliminar combo: archivo + base de datos
exports.eliminarCombo = (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../uploads/combos', filename);
  const imagenUrl = `/uploads/combos/${filename}`;

  fs.unlink(filepath, (err) => {
    if (err) {
      console.error('❌ Error al eliminar imagen del disco:', err);
      return res.status(500).json({ mensaje: 'Error al eliminar imagen del servidor' });
    }

    db.query('DELETE FROM promociones WHERE imagen_url = ?', [imagenUrl], (err) => {
      if (err) {
        console.error('❌ Error al eliminar de la base de datos:', err);
        return res.status(500).json({ mensaje: 'Error al eliminar imagen de la base de datos' });
      }

      res.json({ mensaje: '✅ Imagen eliminada correctamente' });
    });
  });
};
