// frontend/app/medicamento/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Para obtener el ID de la URL
import api from '../../../lib/api';
import Link from 'next/link';

interface MedicamentoDetalle {
    _id: string;
    nombre: string;
    descripcion?: string;
    laboratorio: string;
    presentacion?: string;
    imagenUrl?: string;
}

interface PrecioMedicamentoDetalle {
    _id: string;
    farmacia: {
        _id: string;
        nombre: string;
        direccion?: string;
        telefono?: string;
        sitioWeb?: string;
    };
    precio: number;
    fechaActualizacion: string;
}

export default function MedicamentoDetailPage() {
    const params = useParams();
    const medicamentoId = params.id as string; // Obtiene el ID del medicamento de la URL

    const [medicamento, setMedicamento] = useState<MedicamentoDetalle | null>(null);
    const [precios, setPrecios] = useState<PrecioMedicamentoDetalle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!medicamentoId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Obtener la información del medicamento
                const medicamentoRes = await api.get(`/medicamentos/${medicamentoId}`);
                setMedicamento(medicamentoRes.data);

                // Obtener todos los precios para este medicamento
                const preciosRes = await api.get(`/precios/medicamento/${medicamentoId}`);
                setPrecios(preciosRes.data);

            } catch (err: any) {
                console.error('Error al cargar detalles del medicamento:', err);
                setError(err.response?.data?.message || 'No se pudo cargar la información del medicamento.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [medicamentoId]);

    if (loading) return <p className="text-center mt-8">Cargando detalles del medicamento...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;
    if (!medicamento) return <p className="text-center mt-8">Medicamento no encontrado.</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
                    &larr; Volver a la búsqueda
                </Link>
                <h1 className="text-3xl font-bold text-blue-700 mb-4">{medicamento.nombre}</h1>
                {medicamento.imagenUrl && (
                    <img
                        src={medicamento.imagenUrl}
                        alt={medicamento.nombre}
                        className="w-48 h-auto object-cover rounded-lg mb-4 mx-auto"
                    />
                )}
                <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Laboratorio:</span> {medicamento.laboratorio}
                </p>
                {medicamento.presentacion && (
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Presentación:</span> {medicamento.presentacion}
                    </p>
                )}
                {medicamento.descripcion && (
                    <p className="text-gray-700 mb-4">
                        <span className="font-semibold">Descripción:</span> {medicamento.descripcion}
                    </p>
                )}

                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-t pt-4 mt-6">
                    Precios Disponibles
                </h2>
                {precios.length === 0 ? (
                    <p className="text-gray-600">No hay precios registrados para este medicamento.</p>
                ) : (
                    <ul className="space-y-4">
                        {precios.map((precio) => (
                            <li key={precio._id} className="bg-blue-50 p-4 rounded-md shadow-sm border border-blue-200">
                                <p className="text-xl font-bold text-green-700">
                                    Precio: ${precio.precio.toLocaleString('es-CL')}
                                </p>
                                <p className="text-blue-800">
                                    <span className="font-semibold">Farmacia:</span> {precio.farmacia.nombre}
                                </p>
                                {precio.farmacia.direccion && (
                                    <p className="text-gray-600 text-sm">Dirección: {precio.farmacia.direccion}</p>
                                )}
                                {precio.farmacia.telefono && (
                                    <p className="text-gray-600 text-sm">Teléfono: {precio.farmacia.telefono}</p>
                                )}
                                {precio.farmacia.sitioWeb && (
                                    <p className="text-gray-600 text-sm">Web: <a href={precio.farmacia.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{precio.farmacia.sitioWeb}</a></p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                    Última actualización: {new Date(precio.fechaActualizacion).toLocaleString('es-CL')}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Espacio para el gráfico de historial de precios (Fase 4) */}
                {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-t pt-4 mt-6">
          Historial de Precios
        </h2>
        <div>
          {/* Aquí iría tu componente de gráfico */}
                {/* </div> */}
            </div>
        </div>
    );
}