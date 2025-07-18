const express = require('express');
const router = express.Router();
const conteosController = require('../controllers/conteos.controller');

router.post('/', conteosController.registrarConteo);
router.get('/', conteosController.obtenerHistorialConteos);
router.get('/:id', conteosController.obtenerDetalleConteo);

module.exports = router;
