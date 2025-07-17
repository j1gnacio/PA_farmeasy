// backend/scrapers/salcobrandScraper.js
const BaseScraper = require('./baseScraper');
const Medicamento = require('../models/Medicamento');
const Farmacia = require('../models/Farmacia');
const PrecioMedicamento = require('../models/PrecioMedicamento');

class SalcobrandScraper extends BaseScraper {
    constructor() {
        super();
        this.farmaciaNombre = "Salcobrand";
        this.baseUrlBusqueda = "https://salcobrand.cl/search_result?query=";
        this.baseUrl = "https://salcobrand.cl/";
    }

    async scrapeMedicamentos(medicamentoBusqueda) {
        let farmaciaDb = await Farmacia.findOne({ nombre: this.farmaciaNombre });

        if (!farmaciaDb) {
            farmaciaDb = new Farmacia({
                nombre: this.farmaciaNombre,
                url: this.baseUrl,
                Ubicacion: "Nivel Nacional", // Salcobrand no pide ubicación específica en la búsqueda principal
            });
            await farmaciaDb.save();
            console.log(`Farmacia ${this.farmaciaNombre} creada en DB con Ubicacion: ${farmaciaDb.Ubicacion}.`);
        }

        await this.init(); // Inicia el navegador de Playwright
        try {
            const urlCompleta = `${this.baseUrlBusqueda}${encodeURIComponent(medicamentoBusqueda)}`;
            await this.goto(urlCompleta);
            console.log(`Buscando "${medicamentoBusqueda}" en ${this.farmaciaNombre} en URL: ${urlCompleta}`);

            // **IMPORTANTE**: Esperar a que la red esté inactiva después de la navegación inicial.
            // Esto es crucial para asegurar que el contenido dinámico (JavaScript) se haya cargado.
            await this.page.waitForLoadState('networkidle', { timeout: 30000 }); // Espera hasta 30 segundos
            await this.page.waitForTimeout(2000); // Una pequeña pausa adicional por precaución

            // --- INICIO: MANEJO DE VENTANAS EMERGENTES (POPUPS) en Salcobrand ---
            // Si Salcobrand tiene un banner de cookies o un modal de publicidad al cargar la página,
            // descomenta y ajusta el siguiente bloque.
            // const closePopupSelector = 'button.tu-clase-del-boton-cerrar-popup'; // Reemplaza con el selector real
            // try {
            //     await this.page.click(closePopupSelector, { timeout: 5000 }); // Intentar click, si no aparece, no hay error
            //     console.log('Popup/modal de Salcobrand cerrado.');
            //     await this.page.waitForTimeout(1000);
            // } catch (e) {
            //     console.log('No se encontró el popup/modal o ya fue cerrado en Salcobrand.');
            // }
            // --- FIN: MANEJO DE VENTANAS EMERGENTES ---


            // **SELECTOR CLAVE Y ESPERA ROBUSTA:**
            // Basado en la inspección de la URL de Salcobrand para "paracetamol" (https://salcobrand.cl/search_result?query=paracetamol),
            // el selector '.product' es el contenedor principal de cada producto.
            // Se espera que este contenedor contenga un elemento clave como el nombre del producto,
            // para asegurar que el contenido relevante ya se ha renderizado.
            const productCardSelector = '.product';
            const nameElementInProduct = '.product-info .product-name'; // Un elemento esperado dentro de cada producto

            console.log(`Esperando que al menos un producto con el selector "${productCardSelector}" y con nombre interno "${nameElementInProduct}" sea visible en ${this.farmaciaNombre}.`);
            try {
                // Espera hasta que al menos un elemento que coincida con `productCardSelector` Y que contenga `nameElementInProduct`
                // esté visible en el DOM. Esto es más robusto que solo esperar por el contenedor.
                await this.page.waitForSelector(`${productCardSelector}:has(${nameElementInProduct})`, { state: 'visible', timeout: 25000 }); // Aumentado a 25 segundos
                console.log(`Elementos de producto en ${this.farmaciaNombre} cargados y visibles.`);
            } catch (error) {
                console.warn(`No se encontraron productos en ${this.farmaciaNombre} dentro del tiempo de espera para el selector "${productCardSelector}:has(${nameElementInProduct})". Detalle del error: ${error.message}`);

                // **Comprobar si hay un mensaje de "no hay resultados"**
                // Este selector DEBE ser verificado manualmente en la página de Salcobrand si no hay resultados.
                // Ve a Salcobrand.cl, busca algo que NO exista (ej. "asdfg") y usa F12 para encontrar el selector del mensaje.
                const noResultsMessageSelector = 'div.search-result__not-found'; // Selector encontrado en la página de Salcobrand
                const noResultsElement = await this.page.$(noResultsMessageSelector);

                if (noResultsElement) {
                    const messageText = await noResultsElement.innerText();
                    console.log(`La página de ${this.farmaciaNombre} indica: "${messageText}". No hay productos para "${medicamentoBusqueda}".`);
                } else {
                    console.log(`No se encontraron productos para "${medicamentoBusqueda}" y tampoco un mensaje de "no resultados" esperado en ${this.farmaciaNombre}.`);
                }
                return []; // Si no hay productos visibles o se produce un timeout, retorna un array vacío.
            }

            // Desplazarse hacia abajo para cargar todos los productos (si Salcobrand tiene lazy loading/scroll infinito)
            let previousHeight;
            let currentHeight = await this.page.evaluate('document.body.scrollHeight');
            let scrollAttempts = 0;
            const maxScrollAttempts = 7; // Ajustado a 7 intentos para mayor profundidad en el scroll

            while (scrollAttempts < maxScrollAttempts) {
                previousHeight = currentHeight;
                await this.page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await this.page.waitForTimeout(2500); // Pausa para que el contenido se cargue después del scroll

                currentHeight = await this.page.evaluate('document.body.scrollHeight');
                if (currentHeight === previousHeight) {
                    console.log(`No más scroll, se llegó al final de la página de ${this.farmaciaNombre}.`);
                    break; // Detener si no se puede scrollear más
                }
                scrollAttempts++;
                console.log(`Scroll ${this.farmaciaNombre}. Intento ${scrollAttempts}. Altura actual: ${currentHeight}`);
            }
            console.log(`Página de ${this.farmaciaNombre} desplazada completamente.`);


            // Extraer los datos de los productos utilizando $$eval
            const productosScrapeados = await this.page.$$eval(productCardSelector, (items, baseUrl) => {
                return items.map((item) => {
                    // Nombre del medicamento: span con clase 'product-name' dentro de '.product-info'
                    const nameElement = item.querySelector('.product-info .product-name');
                    const nombre = nameElement ? nameElement.innerText.trim() : null;

                    // URL de la imagen del producto: img dentro de '.product-image'
                    const imageElement = item.querySelector('.product-image img');
                    // Usar 'data-src' (para lazy loading) o 'src'
                    const imageUrl = imageElement ? (imageElement.getAttribute('data-src') || imageElement.src) : null;

                    // Precio actual: span dentro de '.sale-price.secondary-price'
                    const priceElement = item.querySelector('.sale-price.secondary-price span');
                    const priceText = priceElement ? priceElement.innerText.trim() : null;
                    let currentPrice = null;
                    if (priceText) {
                        // Eliminar '$', puntos de miles y reemplazar coma por punto para decimales.
                        currentPrice = parseFloat(priceText.replace('$', '').replace(/\./g, '').replace(',', '.'));
                    }

                    // Precio normal (si existe): div con clase 'original-price'
                    const normalPriceElement = item.querySelector('.original-price');
                    const normalPriceText = normalPriceElement ? normalPriceElement.innerText.trim() : null;
                    let normalPrice = null;
                    if (normalPriceText) {
                        normalPrice = parseFloat(normalPriceText.replace('$', '').replace(/\./g, '').replace(',', '.'));
                    }

                    // Descripción o presentación: Se encuentra en '.product-info.truncate'.
                    const descriptionElement = item.querySelector('.product-info.truncate');
                    const description = descriptionElement ? descriptionElement.innerText.trim() : 'Sin descripción';

                    // Laboratorio y Presentación: (REQUIERE VERIFICACIÓN EN VIVO)
                    // Estos selectores son conjeturas. Deberías inspeccionar un producto real en Salcobrand
                    // para encontrar el selector exacto que contenga esta información.
                    // Si no son críticos o no se encuentran fácilmente, puedes dejarlos como 'N/A'.
                    const laboratory = 'N/A'; // O: item.querySelector('.some-lab-selector')?.innerText.trim() || 'N/A';
                    const presentation = 'N/A'; // O: item.querySelector('.some-presentation-selector')?.innerText.trim() || 'N/A';

                    // URL de detalle del producto: el enlace (<a>) que envuelve la tarjeta o el nombre.
                    // Se busca un enlace cuyo href contenga "/products/" para ser más específico.
                    const detailLinkElement = item.querySelector('a[href*="/products/"]');
                    const detailPath = detailLinkElement ? detailLinkElement.getAttribute('href') : null;
                    // Construir la URL completa, asegurándose de manejar rutas relativas que comienzan con '/'
                    const detailLink = detailPath ? `${baseUrl}${detailPath.startsWith('/') ? detailPath.substring(1) : detailPath}` : null;


                    // Solo retornar productos si tienen un nombre y un precio válido
                    if (nombre && currentPrice !== null) {
                        return {
                            nombre,
                            imagenUrl: imageUrl,
                            descripcion: description,
                            laboratorio: laboratory,
                            presentacion: presentation,
                            detailLink,
                            precio: currentPrice,
                            precioNormal: normalPrice,
                        };
                    }
                    return null; // Si falta información crucial, se filtra más tarde
                }).filter(p => p !== null); // Filtra cualquier entrada nula (productos incompletos)
            }, this.baseUrl); // Pasa this.baseUrl como segundo argumento a $$eval para usarlo dentro del contexto del navegador

            console.log(`Encontrados ${productosScrapeados.length} productos en ${this.farmaciaNombre}.`);

            // Guardar o actualizar los medicamentos y sus precios en la base de datos
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
                    if (medicamentoDb.presentacion !== producto.presentacion) { medicamentoDb.presentacion = producto.presentacion; changed = true; }
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
            return productosScrapeados; // Retorna los datos scrapeados para que puedan ser usados por el llamador

        } catch (error) {
            console.error(`Error grave durante el scraping de ${this.farmaciaNombre} para "${medicamentoBusqueda}":`, error);
            // Puedes añadir lógica para manejar diferentes tipos de errores aquí (ej. si es un error de red, de selector, etc.)
            return []; // Retorna un array vacío en caso de cualquier error crítico para evitar romper el proceso.
        } finally {
            await this.close(); // Siempre cierra el navegador al finalizar, sea exitoso o haya error.
        }
    }
}

module.exports = SalcobrandScraper;