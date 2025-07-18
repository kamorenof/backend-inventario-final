const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// Ruta para registrar usuario
router.post('/registro', usuariosController.registrarUsuario);

// Ruta para login
router.post('/login', usuariosController.loginUsuario);

module.exports = router;
