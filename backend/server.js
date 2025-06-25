// backend/server.js
require('dotenv').config(); // Carga las variables de entorno al principio
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// backend/server.js
// ... (imports)
const cron = require('node-cron');
const runAllScrapers = require('./scraper'); // Asegúrate de que scraper/index.js exporte la función

// ... (conexión a DB y middleware)

const app = express();
const PORT = process.env.PORT || 5000;
// ... (parte superior de server.js)
const medicamentosRouter = require('./routes/medicamentos');
const farmaciasRouter = require('./routes/farmacias');
const preciosRouter = require('./routes/precios');

const passport = require('passport');
const authRouter = require('./routes/auth');



// Middleware
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Habilita el parsing de JSON en el body de las peticiones

// ... (después de app.use(express.json()))

app.use('/api/medicamentos', medicamentosRouter);
app.use('/api/farmacias', farmaciasRouter);
app.use('/api/precios', preciosRouter);

// Configura Passport
require('./config/passport')(passport); // Pasa la instancia de passport
app.use(passport.initialize()); // Inicializa Passport

app.use('/api/auth', authRouter); // Usa las rutas de autenticación

// ... (resto de server.js)
// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Programar el scraping
// Se ejecutará todos los días a la 3:00 AM (0 3 * * *)
// Puedes ajustar la frecuencia: https://crontab.guru/
cron.schedule('0 3 * * *', () => {
    console.log('Ejecutando tarea de scraping programada...');
    runAllScrapers();
}, {
    scheduled: true,
    timezone: "America/Santiago" // Ajusta a la zona horaria de Chile
});

// ... (rutas y app.listen)

// Rutas (las definiremos en el siguiente paso)
app.get('/', (req, res) => {
    res.send('API de Medicamentos funcionando!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});