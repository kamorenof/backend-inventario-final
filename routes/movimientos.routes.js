const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientos.controller');

router.post('/movimientos', movimientosController.registrarMovimiento);
router.get('/movimientos', movimientosController.obtenerMovimientos);
router.get('/movimientos/:id', movimientosController.obtenerMovimientoPorId);


module.exports = router;
