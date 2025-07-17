// backend/scraper/index.js
const CruzVerdeScraper = require('./cruzVerdeScraper');
const SimiScraper = require('./simiScraper');
// Comenta o elimina las siguientes líneas para no instanciar Salcobrand y Ahumada
// const SalcobrandScraper = require('./salcobrandScraper');
// const AhumadaScraper = require('./ahumadaScraper');

async function runAllScrapers() {
    // Lista de medicamentos para scrapear
    const medicamentosParaScrapear = [
        "paracetamol",
        "ibuprofeno",
        "losartan",
        "omeprazol",
        "aspirina",
        "metformina",
        "amoxicilina",
        "loratadina",
        "diclofenaco",
        "sertralina"
    ];

    console.log(`Iniciando la ejecución de los scrapers para los medicamentos...`);

    // Array para almacenar todas las promesas de ejecución de scrapers
    const scraperPromises = [];

    // Itera sobre cada medicamento en la lista
    for (const medicamento of medicamentosParaScrapear) {
        console.log(`--- Iniciando scraping para el medicamento: "${medicamento}" ---`);

        // --- Instancia y ejecuta CruzVerdeScraper para el medicamento actual ---
        console.log(`--- Ejecutando CruzVerdeScraper para "${medicamento}" ---`);
        const cruzVerdeScraper = new CruzVerdeScraper();
        scraperPromises.push(
            cruzVerdeScraper.scrapeMedicamentos(medicamento)
                .catch(error => console.error(`Error al ejecutar CruzVerdeScraper para "${medicamento}":`, error))
        );

        // --- Instancia y ejecuta SimiScraper para el medicamento actual ---
        console.log(`--- Ejecutando SimiScraper para "${medicamento}" ---`);
        const simiScraper = new SimiScraper();
        scraperPromises.push(
            simiScraper.scrapeMedicamentos(medicamento)
                .catch(error => console.error(`Error al ejecutar SimiScraper para "${medicamento}":`, error))
        );

        // Si tuvieras otros scrapers activos, los incluirías aquí también dentro del bucle
        // por ejemplo, para Salcobrand o Ahumada si decides reactivarlos:
        /*
        console.log(`--- Ejecutando SalcobrandScraper para "${medicamento}" ---`);
        const salcobrandScraper = new SalcobrandScraper();
        scraperPromises.push(
            salcobrandScraper.scrapeMedicamentos(medicamento)
                .catch(error => console.error(`Error al ejecutar SalcobrandScraper para "${medicamento}":`, error))
        );

        console.log(`--- Ejecutando AhumadaScraper para "${medicamento}" ---`);
        const ahumadaScraperInstance = new AhumadaScraper();
        scraperPromises.push(
            ahumadaScraperInstance.scrapeMedicamentos(medicamento)
                .catch(error => console.error(`Error al ejecutar AhumadaScraper para "${medicamento}":`, error))
        );
        */
    }

    // Espera a que todas las promesas de los scrapers se resuelvan (o fallen)
    await Promise.all(scraperPromises);

    console.log("Finalizada la ejecución de todos los scrapers para la lista de medicamentos.");
}

module.exports = runAllScrapers;