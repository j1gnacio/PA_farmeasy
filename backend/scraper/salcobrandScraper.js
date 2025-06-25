const BaseScraper = require('./baseScraper');
const Medicamento = require('../models/Medicamento');
const Farmacia = require('../models/Farmacia');
const PrecioMedicamento = require('../models/PrecioMedicamento');

class SalcobrandScraper extends BaseScraper {
    constructor() {
        super();
        this.farmaciaNombre = "Salcobrand";
        this.baseUrl = "https://www.salcobrand.cl"; // Asegúrate de que esta sea la URL real de búsqueda
    }

    async scrapeMedicamentos(medicamentoBusqueda) {
        let farmaciaDb = await Farmacia.findOne({ nombre: this.farmaciaNombre });
        if (!farmaciaDb) {
            farmaciaDb = new Farmacia({ nombre: this.farmaciaNombre, url: this.baseUrl, direccion: "N/A" }); // Añadir dirección real
            await farmaciaDb.save();
        }

        await this.init();
        try {
            // Navega a la página de búsqueda
            // Esto es solo un ejemplo, la URL real y los selectores dependerán de Salcobrand
            await this.goto(`<span class="math-inline">\{this\.baseUrl\}/search?q\=</span>{encodeURIComponent(medicamentoBusqueda)}`);

            // Esperar a que los resultados de búsqueda carguen
            await this.page.waitForSelector('.product-list-item', { timeout: 30000 });

            const productos = await this.page.$$eval('.product-list-item', (items) => {
                return items.map((item) => {
                    const nombre = item.querySelector('.product-name')?.innerText.trim();
                    const precioStr = item.querySelector('.price-actual')?.innerText.trim();
                    const precio = precioStr ? parseFloat(precioStr.replace(/[^0-9,-]+/g, "").replace(",", ".")) : null; // Limpiar y parsear precio
                    const url = item.querySelector('a')?.href;
                    // Puedes extraer más info como laboratorio, presentacion, imagen
                    return { nombre, precio, url };
                }).filter(p => p.nombre && p.precio); // Filtra los que no tienen nombre o precio
            });

            console.log(`Encontrados ${productos.length} productos en ${this.farmaciaNombre}`);
            for (const producto of productos) {
                let medicamentoDb = await Medicamento.findOne({ nombre: producto.nombre });
                if (!medicamentoDb) {
                    medicamentoDb = new Medicamento({ nombre: producto.nombre, /* otros datos */ });
                    await medicamentoDb.save();
                }

                // Busca si ya existe un precio para este medicamento en esta farmacia hoy
                let precioExistente = await PrecioMedicamento.findOne({
                    medicamento: medicamentoDb._id,
                    farmacia: farmaciaDb._id,
                    fechaActualizacion: {
                        $gte: new Date().setHours(0, 0, 0, 0),
                        $lt: new Date().setHours(24, 0, 0, 0)
                    }
                });

                if (precioExistente) {
                    // Si el precio ha cambiado, actualízalo
                    if (precioExistente.precio !== producto.precio) {
                        console.log(`Actualizando precio para ${producto.nombre} en ${this.farmaciaNombre}: ${precioExistente.precio} -> ${producto.precio}`);
                        precioExistente.precio = producto.precio;
                        precioExistente.fechaActualizacion = new Date();
                        await precioExistente.save();
                    } else {
                        console.log(`Precio para ${producto.nombre} en ${this.farmaciaNombre} no ha cambiado.`);
                    }
                } else {
                    // Si no existe un precio para hoy, crea uno nuevo
                    const nuevoPrecio = new PrecioMedicamento({
                        medicamento: medicamentoDb._id,
                        farmacia: farmaciaDb._id,
                        precio: producto.precio
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

module.exports = SalcobrandScraper;