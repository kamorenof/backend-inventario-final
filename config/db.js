const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,       // Ej: localhost
  user: process.env.DB_USER,       // Ej: root
  password: process.env.DB_PASSWORD, // Ej: '' si no tiene
  database: process.env.DB_NAME    // Ej: bd_aplicacioninve
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err);
    throw err;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

module.exports = connection;

