// frontend/components/HomePage.js
'use client'; // Necesario si usas hooks de React o useRouter

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importa useRouter para App Router

// Puedes importar ListaMedicamentos si decides mostrar resultados en la misma página
// import ListaMedicamentos from './ListaMedicamentos'; // Asegúrate de la ruta correcta

function HomePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter(); // Inicializa el router

    const handleHeroSearch = () => {
        if (searchTerm.trim()) {
            // Redirigir a la página de búsqueda con el parámetro 'q'
            // Asumiendo que crearás una página 'search-results/page.tsx' o similar
            router.push(`/search?q=${encodeURIComponent(searchTerm)}`); // Usamos /search ya que tienes esa carpeta
        }
    };

    return (
        <div className="home-page-container">
            {/* Navbar */}
            <header className="navbar" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 30px',
                backgroundColor: '#6A5ACD',
                color: 'white',
                borderBottom: '1px solid #7B68EE'
            }}>
                <div className="logo" style={{ fontSize: '1.8em', fontWeight: 'bold' }}>
                    {/* Asegúrate de tener un logo en /public/farmeasy-logo.png */}
                    <img src="/farmeasy-logo.png" alt="Farmeasy Logo" style={{ height: '30px', marginRight: '10px' }} />
                    Farmeasy
                </div>
                <nav>
                    <a href="/login" style={{ color: 'white', textDecoration: 'none', marginLeft: '20px', fontSize: '1.1em' }}>Login</a>
                    <a href="/register" style={{ color: 'white', textDecoration: 'none', marginLeft: '20px', fontSize: '1.1em', border: '1px solid white', padding: '8px 15px', borderRadius: '5px' }}>Registrarse</a>
                </nav>
            </header>

            {/* Sección principal de búsqueda */}
            <section className="hero-section" style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: '#E0E6F8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '30px'
            }}>
                <div style={{
                    width: '70%',
                    maxWidth: '800px',
                    display: 'flex',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                    <input
                        type="text"
                        placeholder="Explore nuestro catálogo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleHeroSearch();
                            }
                        }}
                        style={{ flexGrow: 1, padding: '15px', border: 'none', borderRadius: '5px 0 0 5px', fontSize: '1.1em' }}
                    />
                    <button
                        onClick={handleHeroSearch}
                        style={{
                            padding: '15px 20px',
                            backgroundColor: '#6A5ACD',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0 5px 5px 0',
                            cursor: 'pointer',
                            fontSize: '1.1em'
                        }}>
                        🔍
                    </button>
                </div>
                <h1 style={{ color: '#333', fontSize: '2.5em', fontWeight: 'bold', margin: '0' }}>
                    ¡Encuentre los mejores precios para usted con nosotros!
                </h1>
            </section>

            {/* Sección de "Nuestras Ventajas" */}
            <section className="features-section" style={{
                display: 'flex',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                padding: '50px 20px',
                gap: '30px',
                backgroundColor: '#F8F9FA'
            }}>
                <div className="feature-card" style={{
                    backgroundColor: '#9370DB',
                    color: 'white',
                    padding: '30px',
                    borderRadius: '10px',
                    width: 'calc(33% - 40px)',
                    minWidth: '280px',
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '250px'
                }}>
                    <div style={{ fontSize: '3em', marginBottom: '15px' }}>💲</div>
                    <h3 style={{ fontSize: '1.5em', marginBottom: '10px' }}>Ahorro inteligente</h3>
                    <p>Busque y elija su medicamento deseado a un precio que sea correcto para usted</p>
                </div>
                <div className="feature-card" style={{
                    backgroundColor: '#9370DB',
                    color: 'white',
                    padding: '30px',
                    borderRadius: '10px',
                    width: 'calc(33% - 40px)',
                    minWidth: '280px',
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '250px'
                }}>
                    <div style={{ fontSize: '3em', marginBottom: '15px' }}>🏪</div>
                    <h3 style={{ fontSize: '1.5em', marginBottom: '10px' }}>Variedad de farmacias</h3>
                    <p>Acceda a precios de varias farmacias en un solo lugar</p>
                </div>
                <div className="feature-card" style={{
                    backgroundColor: '#9370DB',
                    color: 'white',
                    padding: '30px',
                    borderRadius: '10px',
                    width: 'calc(33% - 40px)',
                    minWidth: '280px',
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '250px'
                }}>
                    <div style={{ fontSize: '3em', marginBottom: '15px' }}>🚀</div>
                    <h3 style={{ fontSize: '1.5em', marginBottom: '10px' }}>Fácil y rápido</h3>
                    <p>Interfaz simple e intuitiva, diseñada para búsquedas fáciles para usted</p>
                </div>
            </section>

            {/* Sección de "Remedios populares" */}
            <section className="popular-remedies-section" style={{
                padding: '50px 20px',
                textAlign: 'center',
                backgroundColor: '#E0E6F8'
            }}>
                <h2 style={{ fontSize: '2em', marginBottom: '40px', color: '#333' }}>Remedios populares</h2>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px' }}>
                    {/* Ejemplo de una tarjeta de producto, deberías traer esto de la API */}
                    <div className="product-card" style={{
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '20px',
                        width: '280px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                        textAlign: 'left'
                    }}>
                        <img src="/kitadol.png" alt="Kitadol" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '15px' }} /> {/* Imagen de ejemplo */}
                        <p style={{ fontSize: '0.9em', color: '#777', marginBottom: '5px' }}>Farmacia ahumada</p>
                        <h4 style={{ fontSize: '1.2em', marginBottom: '10px' }}>Kitadol 500 mg x 24 Comprimidos</h4>
                        <p style={{ textDecoration: 'line-through', color: '#999', marginBottom: '5px' }}>Precio normal: $4.249</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.4em', color: '#28a745' }}>Precio ahumada: $3.799</p>
                    </div>
                    {/* Puedes repetir este bloque para más remedios populares o hacer un map si los traes de la API */}
                    <div className="product-card" style={{
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '20px',
                        width: '280px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <p style={{ color: '#888' }}>Producto popular 2</p>
                    </div>
                    <div className="product-card" style={{
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '20px',
                        width: '280px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <p style={{ color: '#888' }}>Producto popular 3</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#6A5ACD',
                color: 'white',
                marginTop: '50px'
            }}>
                <p>© 2025 Farmeasy. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}

export default HomePage;