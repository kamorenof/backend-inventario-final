const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const combosController = require('../controllers/combos.controller');

// 👉 Usamos almacenamiento temporal (no guardamos en disco porque se sube a Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp'); // Ruta temporal, puedes usar './temp' o 'uploads/temp'
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/subir', upload.single('imagen'), combosController.subirCombo);
router.get('/', combosController.obtenerCombos);
router.delete('/:id', combosController.eliminarCombo); // 🔄 Antes era por filename, ahora por ID

module.exports = router;
