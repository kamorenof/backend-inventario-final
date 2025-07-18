const express = require('express');
const router = express.Router();
const inventarioCtrl = require('../controllers/inventario.controller');

router.get('/', inventarioCtrl.obtenerInventarioActual);

module.exports = router;
