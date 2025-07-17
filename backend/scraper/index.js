// backend/scraper/index.js
const CruzVerdeScraper = require('./cruzVerdeScraper');
const SimiScraper = require('./simiScraper');
async function runAllScrapers() {
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

    const scraperPromises = [];

    for (const medicamento of medicamentosParaScrapear) {
        console.log(`--- Iniciando scraping para el medicamento: "${medicamento}" ---`);

        console.log(`--- Ejecutando CruzVerdeScraper para "${medicamento}" ---`);
        const cruzVerdeScraper = new CruzVerdeScraper();
        scraperPromises.push(
            cruzVerdeScraper.scrapeMedicamentos(medicamento)
                .catch(error => console.error(`Error al ejecutar CruzVerdeScraper para "${medicamento}":`, error))
        );

        console.log(`--- Ejecutando SimiScraper para "${medicamento}" ---`);
        const simiScraper = new SimiScraper();
        scraperPromises.push(
            simiScraper.scrapeMedicamentos(medicamento)
                .catch(error => console.error(`Error al ejecutar SimiScraper para "${medicamento}":`, error))
        );
    }

    await Promise.all(scraperPromises);

    console.log("Finalizada la ejecución de todos los scrapers para la lista de medicamentos.");
}

module.exports = runAllScrapers;
