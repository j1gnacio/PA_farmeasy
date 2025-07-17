// backend/testScraper.js
// --- ¡IMPORTANTE: dotenv.config() DEBE IR EN LA PRIMERA LÍNEA EJECUTABLE! ---
require('dotenv').config();

// Ahora sí, puedes importar los demás módulos
const connectDB = require('./config/db');
const runAllScrapers = require('./scraper/index');

async function runTestScrapers() {
    console.log('Iniciando script de prueba de scrapers...');
    console.log('Valor de MONGO_URI en testScraper:', process.env.MONGO_URI);

    // 1. Conectar a la base de datos
    try {
        await connectDB();
        console.log('Conexión a la base de datos exitosa para la prueba.');
    } catch (error) {
        console.error('Error al conectar a la base de datos en testScraper:', error);
        process.exit(1);
    }

    // 2. Ejecutar la función principal de scraping
    try {
        await runAllScrapers();
        console.log('Todos los scrapers de prueba se han ejecutado con éxito.');
    } catch (error) {
        console.error('Error durante la ejecución de los scrapers de prueba:', error);
    } finally {
        process.exit(0); // Este exit(0) se ejecutará si todo lo anterior es exitoso.
    }
}

// --- CAMBIO AQUÍ: Maneja la promesa devuelta por runTestScrapers ---
runTestScrapers().catch(error => {
    console.error('Error no capturado en la ejecución principal:', error);
    process.exit(1); // Sale con código de error si hay un problema no manejado
});