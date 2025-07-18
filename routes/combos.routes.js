const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const combosController = require('../controllers/combos.controller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/combos');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/subir', upload.single('imagen'), combosController.subirCombo);
router.get('/', combosController.obtenerCombos);
router.delete('/:filename', combosController.eliminarCombo);

module.exports = router;
