const express = require ('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Enrutamiento principal
app.use('/api/usuarios', require('./routes/usuarios.routes'));

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
});

//productos
const productosRoutes = require('./routes/productos.routes');
app.use('/api/productos', productosRoutes);

//movimientos
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api', require('./routes/movimientos.routes'));
app.use('/api/productos', productosRoutes);

//inventario
app.use('/api/inventario', require('./routes/inventario.routes'));
const conteosRoutes = require('./routes/conteos.routes');
app.use('/api/conteos', conteosRoutes);

// Para servir archivos estáticos
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta combos
app.use('/api/combos', require('./routes/combos.routes'));


