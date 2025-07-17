const BaseScraper = require('./baseScraper');
const Medicamento = require('../models/Medicamento');
const Farmacia = require('../models/Farmacia');
const PrecioMedicamento = require('../models/PrecioMedicamento');

class CruzVerdeScraper extends BaseScraper {
    constructor() {
        super();
        this.farmaciaNombre = "Cruz Verde";
        this.baseUrlBusqueda = "https://www.cruzverde.cl/search?query=";
        this.baseUrl = "https://www.cruzverde.cl/";
    }

    async scrapeMedicamentos(medicamentoBusqueda) {
        let farmaciaDb = await Farmacia.findOne({ nombre: this.farmaciaNombre });

        if (!farmaciaDb) {
            farmaciaDb = new Farmacia({
                nombre: this.farmaciaNombre,
                url: this.baseUrl,
                Ubicacion: "Región Metropolitana", // Puedes ajustar esto
            });
            await farmaciaDb.save();
            console.log(`Farmacia Cruz Verde creada en DB con Ubicacion: ${farmaciaDb.Ubicacion}.`);
        }

        await this.init();
        try {
            const urlCompleta = `${this.baseUrlBusqueda}${encodeURIComponent(medicamentoBusqueda)}`;
            await this.goto(urlCompleta);
            console.log(`Buscando "${medicamentoBusqueda}" en ${this.farmaciaNombre} en URL: ${urlCompleta}`);

            // Manejar el popup de ofertas/notificaciones (Si existe y es el primero)
            const closeOffersPopupSelector = 'text=No, gracias';
            try {
                await this.page.waitForSelector(closeOffersPopupSelector, { timeout: 10000 });
                await this.page.click(closeOffersPopupSelector);
                console.log('Popup de ofertas/notificaciones cerrado.');
                await this.page.waitForTimeout(1000);
            } catch (e) {
                console.log('No se encontró el popup de ofertas o ya fue cerrado.');
            }

            // Selector para el CONTENEDOR de cada producto en la lista de resultados
            const realProductCardSelector = 'div:has(ml-product-image-new):has(ml-price-tag-v2)';

            await this.page.waitForSelector(realProductCardSelector, { timeout: 30000 });

            const productos = await this.page.$$eval(realProductCardSelector, (items) => {
                return items.map((item) => {
                    const imagenElement = item.querySelector('ml-product-image-new img');
                    const nombre = imagenElement ? imagenElement.alt.trim() : null;

                    let precioStr = null;
                    const priceElement = item.querySelector('ml-price-tag-v2 p.text-green-turquoise');
                    if (priceElement) {
                        precioStr = priceElement.innerText.trim();
                    }

                    const urlElement = item.querySelector('ml-product-image-new a');
                    const url = urlElement ? urlElement.href : null;

                    const imagenProductUrl = imagenElement ? imagenElement.src : null;

                    let precio = null;
                    if (precioStr) {
                        precio = parseFloat(precioStr.replace(/[$.]/g, '').replace(',', '.').replace(/[^\d.]/g, ''));
                    }

                    return {
                        nombre,
                        precio,
                        url,
                        imagenUrl: imagenProductUrl,
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

module.exports = CruzVerdeScraper;
