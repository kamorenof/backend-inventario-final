const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const combosController = require('../controllers/combos.controller');

// Subir a carpeta temporal
const upload = multer({ dest: 'temp/' });

router.post('/subir', upload.single('imagen'), combosController.subirCombo);
router.get('/', combosController.obtenerCombos);
router.delete('/:id', combosController.eliminarCombo); // ← usamos el ID, no filename

module.exports = router;
