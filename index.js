const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Enrutamiento principal
app.use('/api/usuarios', require('./routes/usuarios.routes'));

// Productos
const productosRoutes = require('./routes/productos.routes');
app.use('/api/productos', productosRoutes);

// Movimientos
app.use('/api', require('./routes/movimientos.routes'));

// Inventario
app.use('/api/inventario', require('./routes/inventario.routes'));

// Conteos físicos
const conteosRoutes = require('./routes/conteos.routes');
app.use('/api/conteos', conteosRoutes);

// Combos (promociones)
app.use('/api/combos', require('./routes/combos.routes'));

// Archivos estáticos (para imágenes)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta raíz para confirmar funcionamiento
app.get('/', (req, res) => {
  res.send('🎉 Backend Inventario en funcionamiento');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
});
