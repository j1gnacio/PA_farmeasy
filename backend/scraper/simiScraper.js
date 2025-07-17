// backend/scraper/simiScraper.js
const BaseScraper = require('./baseScraper');
const Medicamento = require('../models/Medicamento');
const Farmacia = require('../models/Farmacia');
const PrecioMedicamento = require('../models/PrecioMedicamento');

class SimiScraper extends BaseScraper {
    constructor() {
        super();
        this.farmaciaNombre = "Farmacias Dr. Simi";
        this.baseUrlBusqueda = "https://www.drsimi.cl/search?_q=";
        this.baseUrl = "https://www.drsimi.cl/";
    }

    async scrapeMedicamentos(medicamentoBusqueda) {
        let farmaciaDb = await Farmacia.findOne({ nombre: this.farmaciaNombre });

        if (!farmaciaDb) {
            farmaciaDb = new Farmacia({
                nombre: this.farmaciaNombre,
                url: this.baseUrl,
                Ubicacion: "Región Metropolitana", // Asigna una ubicación por defecto
            });
            await farmaciaDb.save();
            console.log(`Farmacia ${this.farmaciaNombre} creada en DB con Ubicacion: ${farmaciaDb.Ubicacion}.`);
        }

        await this.init(); // Inicializa el navegador
        try {
            const urlCompleta = `https://www.drsimi.cl/${encodeURIComponent(medicamentoBusqueda)}?_q=${encodeURIComponent(medicamentoBusqueda)}&map=ft`;

            console.log(`Navegando a la URL de búsqueda en ${this.farmaciaNombre}: ${urlCompleta}`);
            await this.goto(urlCompleta);

            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(3000);

            const productCardSelector = '.vtex-product-summary-2-x-element';

            console.log(`Esperando que los productos sean visibles con el selector: ${productCardSelector}`);
            await this.page.waitForSelector(productCardSelector, { state: 'visible', timeout: 90000 });
            console.log('Productos de Dr. Simi cargados y visibles.');

            let previousHeight;
            let currentHeight = await this.page.evaluate('document.body.scrollHeight');
            let scrollAttempts = 0;
            const maxScrollAttempts = 5;

            while (scrollAttempts < maxScrollAttempts) {
                previousHeight = currentHeight;
                await this.page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await this.page.waitForTimeout(2000);

                currentHeight = await this.page.evaluate('document.body.scrollHeight');
                if (currentHeight === previousHeight) {
                    console.log('No más scroll, se llegó al final de la página de Dr. Simi.');
                    break;
                }
                scrollAttempts++;
                console.log(`Scroll Dr. Simi. Intento ${scrollAttempts}. Altura actual: ${currentHeight}`);
            }
            console.log('Página de Dr. Simi desplazada completamente.');

            const productos = await this.page.$$eval(productCardSelector, (items) => {
                return items.map((item) => {
                    const nameElement = item.querySelector('.vtex-product-summary-2-x-productBrand') ||
                        item.querySelector('.vtex-product-summary-2-x-productName');
                    const nombre = nameElement ? nameElement.innerText.trim() : null;

                    let precioStr = null;
                    const priceElement = item.querySelector('.vtex-product-price-1-x-sellingPrice .vtex-product-price-1-x-currencyContainer') ||
                        item.querySelector('.vtex-product-price-1-x-spotPrice');
                    if (priceElement) {
                        precioStr = priceElement.innerText.trim();
                    }

                    const urlElement = item.querySelector('.vtex-product-summary-2-x-clearLink') ||
                        item.querySelector('a[data-track-unit="link"]');
                    const url = urlElement ? urlElement.href : null;

                    const imageElement = item.querySelector('.vtex-product-summary-2-x-imageNormal') ||
                        item.querySelector('.vtex-product-summary-2-x-image');
                    const imagenUrl = imageElement ? imageElement.src : null;

                    let precio = null;
                    if (precioStr) {
                        precio = parseFloat(precioStr.replace(/[$.]/g, '').replace(',', '.').replace(/[^\d.]/g, ''));
                    }

                    return {
                        nombre,
                        precio,
                        url,
                        imagenUrl,
                    };
                }).filter(p => p.nombre && p.precio);
            });

            console.log(`Encontrados ${productos.length} productos en ${this.farmaciaNombre}`);

            for (const producto of productos) {
                let medicamentoDb = await Medicamento.findOne({ nombre: producto.nombre });
                if (!medicamentoDb) {
                    medicamentoDb = new Medicamento({
                        nombre: producto.nombre,
                        imagenUrl: producto.imagenUrl,
                    });
                    await medicamentoDb.save();
                    console.log(`Nuevo medicamento ${producto.nombre} guardado.`);
                }

                let precioExistente = await PrecioMedicamento.findOne({
                    medicamento: medicamentoDb._id,
                    farmacia: farmaciaDb._id,
                    fechaActualizacion: {
                        $gte: new Date().setHours(0, 0, 0, 0),
                        $lt: new Date().setHours(24, 0, 0, 0)
                    }
                });

                if (precioExistente) {
                    if (precioExistente.precio !== producto.precio) {
                        console.log(`Actualizando precio para ${producto.nombre} en ${this.farmaciaNombre}: ${precioExistente.precio} -> ${producto.precio}`);
                        precioExistente.precio = producto.precio;
                        precioExistente.fechaActualizacion = new Date();
                        await precioExistente.save();
                    } else {
                        console.log(`Precio para ${producto.nombre} en ${this.farmaciaNombre} no ha cambiado.`);
                    }
                } else {
                    const nuevoPrecio = new PrecioMedicamento({
                        medicamento: medicamentoDb._id,
                        farmacia: farmaciaDb._id,
                        precio: producto.precio,
                    });
                    await nuevoPrecio.save();
                    console.log(`Nuevo precio guardado para ${producto.nombre} en ${this.farmaciaNombre}: ${producto.precio}`);
                }
            }

        } catch (error) {
            console.error(`Error durante el scraping de ${this.farmaciaNombre}:`, error);
        } finally {
            await this.close();
        }
    }
}

module.exports = SimiScraper;