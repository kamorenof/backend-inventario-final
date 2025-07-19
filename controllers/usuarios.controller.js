// 🔹 Importamos la conexión a PostgreSQL
const pool = require('../config/db');

// 🔹 Importamos bcryptjs para encriptar contraseñas
const bcrypt = require('bcryptjs');

// 🟢 Registrar usuario
exports.registrarUsuario = async (req, res) => {
  const { nombre, correo, password } = req.body;

  try {
    // Encriptar la contraseña
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Insertar en la base de datos
    await pool.query(
      'INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3)',
      [nombre, correo, hashedPassword]
    );

    res.status(201).json({ mensaje: '✅ Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: '❌ Error al registrar usuario', error: err });
  }
};

// 🟢 Login de usuario
exports.loginUsuario = async (req, res) => {
  const { correo, password } = req.body;

  try {
    // Buscar usuario por correo
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: '❌ Correo no registrado' });
    }

    const usuario = rows[0];

    // Validar contraseña
    const passwordValida = bcrypt.compareSync(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: '❌ Contraseña incorrecta' });
    }

    // Todo OK
    res.status(200).json({
      mensaje: '✅ Inicio de sesión exitoso',
      nombre: usuario.nombre,
      usuario: {
        id: usuario.id,
        correo: usuario.correo
      }
    });
  } catch (err) {
    res.status(500).json({ mensaje: '❌ Error en el servidor', error: err });
  }
};
