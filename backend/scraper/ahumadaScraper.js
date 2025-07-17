// backend/scrapers/ahumadaScraper.js
const BaseScraper = require('./baseScraper');
const Medicamento = require('../models/Medicamento');
const Farmacia = require('../models/Farmacia');
const PrecioMedicamento = require('../models/PrecioMedicamento');

class ahumadaScraper extends BaseScraper { // <--- CAMBIO AQUÍ: Clase con 'a' minúscula
    constructor() {
        super();
        this.farmaciaNombre = "Farmacias Ahumada";
        this.baseUrlBusqueda = "https://www.farmaciasahumada.cl/search?q=";
        this.baseUrl = "https://www.farmaciasahumada.cl/";
    }

    async scrapeMedicamentos(medicamentoBusqueda) {
        let farmaciaDb = await Farmacia.findOne({ nombre: this.farmaciaNombre });

        if (!farmaciaDb) {
            farmaciaDb = new Farmacia({
                nombre: this.farmaciaNombre,
                url: this.baseUrl,
                Ubicacion: "Nivel Nacional", // Se asume nivel nacional
            });
            await farmaciaDb.save();
            console.log(`Farmacia ${this.farmaciaNombre} creada en DB con Ubicacion: ${farmaciaDb.Ubicacion}.`);
        }

        await this.init(); // Inicia el navegador de Playwright
        try {
            const urlCompleta = `${this.baseUrlBusqueda}${encodeURIComponent(medicamentoBusqueda)}`;
            await this.goto(urlCompleta);
            console.log(`Buscando "${medicamentoBusqueda}" en ${this.farmaciaNombre} en URL: ${urlCompleta}`);

            // **IMPORTANTE**: Esperar a que la red esté inactiva.
            // Esto es crucial para asegurar que el contenido dinámico (JavaScript) se haya cargado.
            await this.page.waitForLoadState('networkidle', { timeout: 30000 }); // Espera hasta 30 segundos
            await this.page.waitForTimeout(2000); // Una pequeña pausa adicional por precaución

            // --- INICIO: MANEJO DE POPUP DE ACEPTAR ---
            // Selector del botón "Aceptar" del popup (basado en image_38be3c.jpg)
            const acceptPopupButtonSelector = 'button#button-addon2';
            try {
                // Esperar a que el botón sea visible y luego hacer clic.
                await this.page.waitForSelector(acceptPopupButtonSelector, { state: 'visible', timeout: 10000 });
                await this.page.click(acceptPopupButtonSelector);
                console.log('Popup "Aceptar" de Farmacias Ahumada cerrado.');
                await this.page.waitForTimeout(1000); // Pequeña pausa para que el modal desaparezca
            } catch (e) {
                console.log('No se encontró el popup "Aceptar" de Farmacias Ahumada o ya fue cerrado.');
            }
            // --- FIN: MANEJO DE POPUP ---

            // **SELECTOR CLAVE Y ESPERA ROBUSTA:**
            // Basado en image_38640a.png: El contenedor principal es `div.product-tile`
            // Basado en image_3864e2.png: El nombre del producto está en `a.name-link` dentro del `h2`
            const productCardSelector = 'div.product-tile';
            const nameElementInProduct = 'h2 a.name-link';

            console.log(`Esperando que al menos un producto con el selector "${productCardSelector}" y con nombre interno "${nameElementInProduct}" sea visible en ${this.farmaciaNombre}.`);
            try {
                // Espera hasta que un contenedor de producto esté visible y contenga un nombre de producto
                await this.page.waitForSelector(`${productCardSelector}:has(${nameElementInProduct})`, { state: 'visible', timeout: 25000 });
                console.log(`Elementos de producto en ${this.farmaciaNombre} cargados y visibles.`);
            } catch (error) {
                console.warn(`No se encontraron productos en ${this.farmaciaNombre} dentro del tiempo de espera para el selector "${productCardSelector}:has(${nameElementInProduct})". Detalle del error: ${error.message}`);
                // **Comprobar si hay un mensaje de "no hay resultados"**
                // Necesitaríamos el selector específico para un mensaje de "no hay resultados" de Farmacias Ahumada.
                // Como no lo proporcionaste, se asume que la ausencia de productos significa que no se encontraron.
                console.log(`No hay productos para "${medicamentoBusqueda}" en ${this.farmaciaNombre}.`);
                return []; // Si no hay productos, retorna un array vacío.
            }

            // Desplazarse hacia abajo para cargar todos los productos (asumiendo lazy loading/scroll infinito)
            let previousHeight;
            let currentHeight = await this.page.evaluate('document.body.scrollHeight');
            let scrollAttempts = 0;
            const maxScrollAttempts = 7; // Ajustado a 7 intentos

            while (scrollAttempts < maxScrollAttempts) {
                previousHeight = currentHeight;
                await this.page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await this.page.waitForTimeout(2500); // Pausa para que el contenido se cargue

                currentHeight = await this.page.evaluate('document.body.scrollHeight');
                if (currentHeight === previousHeight) {
                    console.log(`No más scroll, se llegó al final de la página de ${this.farmaciaNombre}.`);
                    break;
                }
                scrollAttempts++;
                console.log(`Scroll ${this.farmaciaNombre}. Intento ${scrollAttempts}. Altura actual: ${currentHeight}`);
            }
            console.log(`Página de ${this.farmaciaNombre} desplazada completamente.`);

            // Extraer los datos de los productos
            const productosScrapeados = await this.page.$$eval(productCardSelector, (items, baseUrl) => {
                return items.map((item) => {
                    // Nombre del medicamento: a.name-link dentro de h2
                    const nameElement = item.querySelector('h2 a.name-link');
                    const nombre = nameElement ? nameElement.innerText.trim() : null;

                    // URL de la imagen del producto: img.tile-image
                    const imageElement = item.querySelector('img.tile-image');
                    const imageUrl = imageElement ? (imageElement.getAttribute('data-src') || imageElement.src) : null;

                    // Precio actual (oferta): span.sales span.value (dentro de .product-price)
                    const priceElement = item.querySelector('.product-price span.sales span.value');
                    const priceText = priceElement ? priceElement.innerText.trim() : null;
                    let currentPrice = null;
                    if (priceText) {
                        // Eliminar '$', puntos de miles y reemplazar coma por punto para decimales.
                        currentPrice = parseFloat(priceText.replace('$', '').replace(/\./g, '').replace(',', '.'));
                    }

                    // Precio normal (tachado): div.strike-through span.value (dentro de .product-price)
                    const normalPriceElement = item.querySelector('.product-price div.strike-through span.value');
                    const normalPriceText = normalPriceElement ? normalPriceElement.innerText.trim() : null;
                    let normalPrice = null;
                    if (normalPriceText) {
                        normalPrice = parseFloat(normalPriceText.replace('$', '').replace(/\./g, '').replace(',', '.'));
                    }

                    // URL de detalle del producto: el mismo a.name-link que contiene el nombre
                    const detailLinkElement = item.querySelector('h2 a.name-link');
                    const detailPath = detailLinkElement ? detailLinkElement.getAttribute('href') : null;
                    const detailLink = detailPath ? `${baseUrl}${detailPath.startsWith('/') ? detailPath.substring(1) : detailPath}` : null;

                    // Descripción, Laboratorio, Presentación: No visibles en las imágenes de las tarjetas.
                    // Se dejarán como 'N/A' o se podrían intentar encontrar si la estructura HTML lo permite.
                    const description = 'Sin descripción';
                    const laboratory = 'N/A';
                    const presentation = 'N/A';

                    if (nombre && currentPrice !== null) {
                        return {
                            nombre,
                            imagenUrl: imageUrl,
                            descripcion: description,
                            laboratorio: laboratory,
                            presentacion: presentation,
                            detailLink,
                            precio: currentPrice,
                            precioNormal: normalPrice, // Puede ser null si no hay precio normal
                        };
                    }
                    return null;
                }).filter(p => p !== null); // Filtrar productos que no tienen nombre o precio
            }, this.baseUrl); // Pasa this.baseUrl al contexto de $$eval

            console.log(`Encontrados ${productosScrapeados.length} productos en ${this.farmaciaNombre}.`);

            // Guardar o actualizar en la base de datos (lógica idéntica a los otros scrapers)
            for (const producto of productosScrapeados) {
                let medicamentoDb = await Medicamento.findOne({ nombre: producto.nombre });

                if (!medicamentoDb) {
                    // Si el medicamento no existe, crearlo
                    medicamentoDb = new Medicamento({
                        nombre: producto.nombre,
                        imagenUrl: producto.imagenUrl,
                        descripcion: producto.descripcion,
                        laboratorio: producto.laboratorio,
                        presentacion: producto.presentacion,
                    });
                    await medicamentoDb.save();
                    console.log(`Nuevo medicamento "${producto.nombre}" guardado.`);
                } else {
                    // Si el medicamento existe, opcionalmente actualizar sus campos si han cambiado
                    let changed = false;
                    if (medicamentoDb.imagenUrl !== producto.imagenUrl) { medicamentoDb.imagenUrl = producto.imagenUrl; changed = true; }
                    if (medicamentoDb.descripcion !== producto.descripcion) { medicamentoDb.descripcion = producto.descripcion; changed = true; }
                    if (medicamentoDb.laboratorio !== producto.laboratorio) { medicamentoDb.laboratorio = producto.laboratorio; changed = true; }
                    if (medicamentoDb.presentacion !== producto.presentacion) { medicamentoDb.presentation = producto.presentation; changed = true; }
                    if (changed) {
                        await medicamentoDb.save();
                        console.log(`Medicamento "${producto.nombre}" actualizado.`);
                    }
                }

                // Buscar un precio existente para este medicamento, farmacia y el día actual
                let precioExistente = await PrecioMedicamento.findOne({
                    medicamento: medicamentoDb._id,
                    farmacia: farmaciaDb._id,
                    fechaActualizacion: {
                        $gte: new Date().setHours(0, 0, 0, 0), // Inicio del día actual
                        $lt: new Date().setHours(24, 0, 0, 0) // Inicio del día siguiente
                    }
                });

                if (precioExistente) {
                    // Si ya existe un precio para hoy, actualizarlo si es diferente
                    if (precioExistente.precio !== producto.precio || precioExistente.precioNormal !== producto.precioNormal) {
                        console.log(`Actualizando precio para "${producto.nombre}" en ${this.farmaciaNombre}: ${precioExistente.precio} -> ${producto.precio}`);
                        precioExistente.precio = producto.precio;
                        precioExistente.precioNormal = producto.precioNormal;
                        precioExistente.fechaActualizacion = new Date(); // Actualizar la fecha
                        await precioExistente.save();
                    } else {
                        console.log(`Precio para "${producto.nombre}" en ${this.farmaciaNombre} no ha cambiado.`);
                    }
                } else {
                    // Si no existe un precio para hoy, crea uno nuevo
                    const nuevoPrecio = new PrecioMedicamento({
                        medicamento: medicamentoDb._id,
                        farmacia: farmaciaDb._id,
                        precio: producto.precio,
                        precioNormal: producto.precioNormal,
                        fechaActualizacion: new Date(), // Asignar la fecha actual
                    });
                    await nuevoPrecio.save();
                    console.log(`Nuevo precio guardado para "${producto.nombre}" en ${this.farmaciaNombre}: ${producto.precio}`);
                }
            }
            return productosScrapeados;

        } catch (error) {
            console.error(`Error durante el scraping de ${this.farmaciaNombre} para "${medicamentoBusqueda}":`, error);
            return [];
        } finally {
            await this.close();
        }
    }
}

module.exports = ahumadaScraper; // <--- CAMBIO AQUÍ: Exportar la clase con 'a' minúscula