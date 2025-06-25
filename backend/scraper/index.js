const SalcobrandScraper = require('./salcobrandScraper');
// const CruzVerdeScraper = require('./cruzverdeScraper'); // Para cuando lo implementes

async function runAllScrapers() {
    console.log('Iniciando todos los scrapers...');
    const medicamentosPopulares = [
        "Paracetamol", "Ibuprofeno", "Losartan", "Omeprazol", "Aspirina"
        // Añade una lista de medicamentos comunes para iniciar el scraping
        // O puedes obtener una lista de Medicamentos ya existentes en tu DB y scrapear por ellos
    ];

    for (const medicamento of medicamentosPopulares) {
        console.log(`Scrapeando para: ${medicamento}`);
        const salcobrand = new SalcobrandScraper();
        await salcobrand.scrapeMedicamentos(medicamento);
        // const cruzVerde = new CruzVerdeScraper();
        // await cruzVerde.scrapeMedicamentos(medicamento);
        // Pausar para evitar bloqueos
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
    }
    console.log('Scraping completado para todos los medicamentos y farmacias.');
}

module.exports = runAllScrapers;