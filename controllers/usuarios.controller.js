// 🔹 Importamos la conexión a la base de datos
const db = require('../config/db');

// 🔹 Importamos bcryptjs
const bcrypt = require('bcryptjs');

// Registrar usuario
exports.registrarUsuario = (req, res) => {
  const { nombre, correo, password } = req.body;

  // Encriptar la contraseña con bcrypt
  const hashedPassword = bcrypt.hashSync(password, 8);

  // Guardamos en la base de datos
  db.query(
    'INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)',
    [nombre, correo, hashedPassword],
    (err, result) => {
      if (err) {
        return res.status(500).json({ mensaje: 'Error al registrar usuario', error: err });
      }
      res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
    }
  );
};

// Login de usuario
exports.loginUsuario = (req, res) => {
  const { correo, password } = req.body;

  // Buscar al usuario por su correo
  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: 'Error en el servidor', error: err });

    if (resultados.length === 0) {
      return res.status(401).json({ mensaje: 'Correo no registrado' });
    }

    const usuario = resultados[0];

    // Comparamos la contraseña digitada con la guardada en la base de datos
    const passwordValida = bcrypt.compareSync(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    
    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      nombre: usuario.nombre, 
      usuario: {
        id: usuario.id,
        correo: usuario.correo
      }
    });
  });
};
