// frontend/components/ListaMedicamentos.tsx
// Este componente recibirá una lista de medicamentos como props y los renderizará.
// No contiene lógica de búsqueda, ni geolocalización, ni clases de Tailwind CSS.
'use client';

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface Medicamento {
    id: string;
    nombre: string;
    imagenUrl?: string;
    laboratorio?: string;
    presentacion?: string;
    descripcion?: string;
    preciosPorFarmacia: PrecioInfo[];
}

export interface FarmaciaInfo {
    nombre: string;
    ubicacionFarmacia?: string;
}

export interface PrecioInfo {
    farmacia: string;
    ubicacionFarmacia?: string;
    precio: number;
    precioNormal?: number;
    fechaActualizacion: string;
}

interface ListaMedicamentosProps {
    medicamentos: Medicamento[];
}

const ListaMedicamentos: React.FC<ListaMedicamentosProps> = ({ medicamentos }) => {
    const [favoritos, setFavoritos] = useState<string[]>([]);
    const [alertas, setAlertas] = useState<{ [key: string]: number }>({});
    const [alertaPrecio, setAlertaPrecio] = useState<{ [key: string]: number }>({});
    const [loadingFavorito, setLoadingFavorito] = useState<string | null>(null);
    const [loadingAlerta, setLoadingAlerta] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;

    const agregarFavorito = async (medicamentoId: string) => {
        if (!token) {
            setError('Debe iniciar sesión para agregar favoritos.');
            return;
        }
        setLoadingFavorito(medicamentoId);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/favoritos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ medicamentoId }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al agregar favorito');
            }
            setFavoritos((prev) => [...prev, medicamentoId]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingFavorito(null);
        }
    };

    const crearAlerta = async (medicamentoId: string, precioObjetivo: number) => {
        if (!token) {
            setError('Debe iniciar sesión para crear alertas.');
            return;
        }
        setLoadingAlerta(medicamentoId);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/alertas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ medicamentoId, precioObjetivo }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al crear alerta');
            }
            setAlertas((prev) => ({ ...prev, [medicamentoId]: precioObjetivo }));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingAlerta(null);
        }
    };

    return (
        <div className="search-results-grid">
            {error && <p className="error-message">{error}</p>}
            {medicamentos.map((medicamento) => (
                <div key={medicamento.id} className="medicament-card">
                    <h3 className="card-title">{medicamento.nombre}</h3>
                    {medicamento.imagenUrl && (
                        <img src={medicamento.imagenUrl} alt={medicamento.nombre} className="card-image" />
                    )}
                    <p className="card-description">{medicamento.descripcion || 'Sin descripción'}</p>
                    <p className="card-laboratory">Laboratorio: {medicamento.laboratorio || 'N/A'}</p>
                    <p className="card-presentation">Presentación: {medicamento.presentacion || 'N/A'}</p>

                    <div className="prices-section">
                        <h4 className="prices-title">Precios en farmacias:</h4>
                        {medicamento.preciosPorFarmacia && medicamento.preciosPorFarmacia.length > 0 ? (
                            <ul className="price-list">
                                {medicamento.preciosPorFarmacia.map((p, index) => (
                                    <li key={index} className="price-item">
                                        <span className="pharmacy-name">{p.farmacia}</span>
                                        <span className="current-price">${p.precio ? p.precio.toLocaleString('es-CL') : 'N/A'}</span>
                                        {p.precioNormal && p.precioNormal > p.precio && (
                                            <span className="normal-price">Precio Normal: ${p.precioNormal.toLocaleString('es-CL')}</span>
                                        )}
                                        <small className="price-update-date">
                                            Actualizado: {new Date(p.fechaActualizacion).toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                        </small>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-prices-available">No hay precios disponibles para este medicamento.</p>
                        )}
                    </div>
                    <button
                        onClick={() => agregarFavorito(medicamento.id)}
                        disabled={loadingFavorito === medicamento.id}
                        className="favorite-button"
                    >
                        {loadingFavorito === medicamento.id ? 'Agregando...' : 'Agregar a Favoritos'}
                    </button>
                    <div className="alert-section">
                        <input
                            type="number"
                            placeholder="Precio objetivo"
                            value={alertaPrecio[medicamento.id] || ''}
                            onChange={(e) =>
                                setAlertaPrecio((prev) => ({
                                    ...prev,
                                    [medicamento.id]: Number(e.target.value),
                                }))
                            }
                            className="alert-input"
                        />
                        <button
                            onClick={() => crearAlerta(medicamento.id, alertaPrecio[medicamento.id] || 0)}
                            disabled={loadingAlerta === medicamento.id}
                            className="alert-button"
                        >
                            {loadingAlerta === medicamento.id ? 'Creando alerta...' : 'Crear Alerta'}
                        </button>
                    </div>
                    <Link href={`/medicamentos/${medicamento.id}`} className="detail-link">
                        Ver Detalles
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default ListaMedicamentos;
