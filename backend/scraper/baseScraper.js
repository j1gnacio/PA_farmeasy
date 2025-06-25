// backend/scraper/baseScraper.js
const { chromium } = require('playwright'); // Puedes usar firefox o webkit también

class BaseScraper {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        this.browser = await chromium.launch({ headless: true }); // true para sin interfaz
        this.page = await this.browser.newPage();
        console.log('Navegador Playwright iniciado.');
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('Navegador Playwright cerrado.');
        }
    }

    async goto(url) {
        try {
            await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            console.log(`Navegando a: ${url}`);
        } catch (error) {
            console.error(`Error al navegar a ${url}:`, error);
            throw error;
        }
    }

    // Método genérico para extraer texto
    async getText(selector) {
        try {
            const element = await this.page.$(selector);
            return element ? await element.innerText() : null;
        } catch (error) {
            console.error(`Error al obtener texto del selector ${selector}:`, error);
            return null;
        }
    }

    // Método genérico para extraer atributos
    async getAttribute(selector, attribute) {
        try {
            const element = await this.page.$(selector);
            return element ? await element.getAttribute(attribute) : null;
        } catch (error) {
            console.error(`Error al obtener atributo ${attribute} del selector ${selector}:`, error);
            return null;
        }
    }

    // Método para hacer clic y esperar navegación
    async clickAndWaitForNavigation(selector) {
        try {
            await Promise.all([
                this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                this.page.click(selector)
            ]);
            console.log(`Clic en ${selector} y espera de navegación exitosa.`);
        } catch (error) {
            console.error(`Error al hacer clic y esperar navegación en ${selector}:`, error);
            throw error;
        }
    }
}

module.exports = BaseScraper;