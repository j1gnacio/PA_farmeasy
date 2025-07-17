'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ListaMedicamentos, { Medicamento } from '../components/ListaMedicamentos';
import jwtDecode from 'jwt-decode';

interface JwtPayload {
    exp: number;
}

export default function HomePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Medicamento[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string; nombre: string; email: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkTokenAndRedirect = () => {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                try {
                    const decoded = jwtDecode<JwtPayload>(token);
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        // Token expirado
                        localStorage.removeItem('jwtToken');
                        localStorage.removeItem('user');
                        setUser(null);
                    } else {
                        // Token válido, redirigir a dashboard
                        router.push('/profile/dashboard');
                    }
                } catch (error) {
                    // Token inválido
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
        };
        checkTokenAndRedirect();

        // Obtener usuario de localStorage para mostrar en la ventana principal
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const BACKEND_API_URL = 'http://localhost:5000/api/medicamentos/search';

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchTerm.trim()) {
            setSearchResults([]);
            setError("Por favor, ingresa un término de búsqueda.");
            return;
        }

        setLoading(true);
        setError(null);
        setSearchResults([]);

        try {
            const url = `${BACKEND_API_URL}?q=${encodeURIComponent(searchTerm)}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error del servidor: ${response.status} ${response.statusText}`);
            }

            const data: Medicamento[] = await response.json();
            setSearchResults(data);

            if (data.length === 0) {
                setError('No se encontraron resultados para su búsqueda.');
            }

        } catch (err: any) {
            console.error('Error al realizar la búsqueda:', err);
            setError(err.message || 'Error al conectar con el servidor de búsqueda. Asegúrate de que el backend esté funcionando y la URL de la API sea correcta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className="header">
                <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 20px', backgroundColor: '#f5f5f5' }}>
                    {user ? (
                        <>
                            <a href="/alertas" className="nav-link">Alertas</a>
                            <a href="/favoritos" className="nav-link">Favoritos</a>
                            <a href="/profile/configuracion" className="nav-link" title="Configuración">
                                <span role="img" aria-label="Configuración">⚙️</span>
                            </a>
                            <div className="profile-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="profile-name">{user.nombre}</span>
                                <button
                                    onClick={handleLogout}
                                    className="logout-button"
                                    style={{
                                        backgroundColor: '#e74c3c',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                    }}
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <a href="/login" className="login-link">Iniciar sesión</a>
                            <span>|</span>
                            <a href="/register" className="register-link">Registrarse</a>
                        </>
                    )}
                </div>
            </header>

            <div className="home-page-container">
                <section className="hero-section">
                    <h1 className="hero-title">¡Encuentre los mejores precios para usted con nosotros!</h1>
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Explore nuestro catálogo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            🔍
                        </button>
                    </form>
                </section>

                <section className="search-results-section">
                    <h2 className="section-title">Resultados de la Búsqueda</h2>
                    {loading && <p className="loading-message">Cargando resultados...</p>}
                    {error && <p className="error-message">Error: {error}</p>}

                    {!loading && !error && searchResults.length === 0 && searchTerm.trim() && (
                        <p className="no-results-message">No se encontraron medicamentos para "{searchTerm}".</p>
                    )}
                    {!loading && !error && searchResults.length > 0 && (
                        <ListaMedicamentos medicamentos={searchResults} />
                    )}
                    {!searchTerm.trim() && !loading && !error && (
                        <p className="initial-message">Ingrese un término para buscar medicamentos.</p>
                    )}
                </section>

                <section className="features-section">
                    <div className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3 className="feature-title">Ahorro inteligente</h3>
                        <p className="feature-description">Busque y elija su medicamento deseado a un precio que sea correcto para usted</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🏪</div>
                        <h3 className="feature-title">Variedad de farmacias</h3>
                        <p className="feature-description">Acceda a precios de varias farmacias en un solo lugar</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📱</div>
                        <h3>Fácil y rápido</h3>
                        <p className="feature-description">Interfaz simple e intuitiva, diseñada para búsquedas fáciles para usted</p>
                    </div>
                </section>
            </div>
        </>
    );
}
