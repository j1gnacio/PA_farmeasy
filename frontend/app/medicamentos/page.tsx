'use client';

import React, { useState } from 'react';
import ListaMedicamentos, { Medicamento } from '../../components/ListaMedicamentos';

export default function MedicamentosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Medicamento[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        <div className="medicamentos-page-container">
            <section className="hero-section">
                <h1 className="hero-title">Buscar Medicamentos</h1>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Ingrese el nombre del medicamento..."
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
        </div>
    );
}
