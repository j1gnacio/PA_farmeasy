// frontend/src/components/ListaMedicamentos.js
'use client'; // ¡Esencial para usar hooks de React y APIs del navegador!

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation'; // Importa useSearchParams y useRouter
import Link from 'next/link'; // Para navegar a las páginas de detalle

// Interfaces para tipar los datos recibidos del backend
// Idealmente, estas interfaces deberían estar en un archivo compartido como 'types/index.ts'
interface FarmaciaInfo {
    nombre: string;
    ubicacionFarmacia?: string; // Asegúrate de que este campo exista en la respuesta de tu backend
}

interface PrecioInfo {
    farmacia: string;
    ubicacionFarmacia?: string;
    precio: number;
    precioNormal?: number; // Opcional, si tu scraper lo captura
    fechaActualizacion: string;
}

interface MedicamentoResult {
    id: string; // _id del medicamento
    nombre: string;
    imagenUrl?: string;
    laboratorio?: string;
    presentacion?: string;
    descripcion?: string;
    preciosPorFarmacia: PrecioInfo[];
}

function ListaMedicamentos() {
    const searchParams = useSearchParams(); // Hook para leer query params de la URL
    const router = useRouter(); // Hook para navegar programáticamente (si se necesita, aunque Link es preferido)

    // Inicializa los estados con los valores de la URL si existen
    const initialSearchTerm = searchParams.get('q') || '';
    const initialLocation = searchParams.get('ubicacion') || '';

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [ubicacionFilter, setUbicacionFilter] = useState(initialLocation); // Estado para el filtro de ubicación
    const [searchResults, setSearchResults] = useState<MedicamentoResult[]>([]); // Estado para los resultados
    const [loading, setLoading] = useState(false); // Estado de carga
    const [error, setError] = useState<string | null>(null); // Estado para errores

    // Función para detectar la ubicación del usuario usando la Geolocation API
    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            setError(null);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const long = position.coords.longitude;
                    console.log('Ubicación detectada (Lat,Long):', lat, long);

                    try {
                        // Geocodificación inversa con Nominatim (gratuito, pero con límites de uso)
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&zoom=10&addressdetails=1`);
                        const data = await response.json();
                        // Intenta obtener la comuna/ciudad/suburbio, o un nombre de lugar general
                        const detectedAddress = data.address.suburb || data.address.city || data.address.town || data.address.village || data.display_name;
                        setUbicacionFilter(detectedAddress || ''); // Deja vacío si no encuentra un nombre legible
                        alert(`Ubicación detectada automáticamente: ${detectedAddress || 'Coordenadas. Por favor, revisa el campo de ubicación.'}`);
                    } catch (geoError) {
                        console.error('Error al geocodificar inversamente:', geoError);
                        setError('No se pudo obtener el nombre de la ubicación. Por favor, ingrésala manualmente.');
                        setUbicacionFilter(`${lat},${long}`); // Si falla, puedes usar coordenadas o dejarlo vacío
                        alert(`Ubicación detectada como coordenadas (${lat},${long}), pero no se pudo obtener el nombre. Ingresa manualmente si lo deseas.`);
                    } finally {
                        setLoading(false);
                    }
                },
                (err) => {
                    console.error('Error al obtener la ubicación:', err.message);
                    setError('No se pudo obtener tu ubicación automáticamente. Por favor, ingrésala manualmente.');
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Opciones de geolocalización
            );
        } else {
            setError('Geolocalización no soportada por tu navegador. Por favor, ingresa una ubicación manualmente.');
            alert('Geolocalización no soportada por tu navegador. Por favor, ingresa una ubicación manualmente.');
        }
    };

    // Función principal para realizar la búsqueda
    const handleSearch = async () => {
        if (!searchTerm.trim()) { // No buscar si el término de búsqueda está vacío
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError(null); // Limpiar errores anteriores
        setSearchResults([]); // Limpiar resultados anteriores

        try {
            // Construye la URL de la API con los parámetros de búsqueda 'q' y 'ubicacion'
            let url = `http://localhost:5000/api/medicamentos/search?q=${encodeURIComponent(searchTerm)}`;
            if (ubicacionFilter) {
                url += `&ubicacion=${encodeURIComponent(ubicacionFilter)}`;
            }

            const response = await axios.get<MedicamentoResult[]>(url); // Tipado para la respuesta
            setSearchResults(response.data);

            // Opcional: Actualizar la URL del navegador para reflejar la búsqueda
            // router.push(`/search?q=${encodeURIComponent(searchTerm)}&ubicacion=${encodeURIComponent(ubicacionFilter)}`, undefined, { shallow: true });

        } catch (err: any) {
            console.error('Error al obtener medicamentos:', err);
            // Mostrar el mensaje de error del backend si está disponible
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Error al cargar los medicamentos. Inténtalo de nuevo más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    // useEffect para una carga inicial o cuando se cambie la búsqueda por URL
    // Se ejecuta una vez al montar el componente, y luego si initialSearchTerm o initialLocation cambian (por URL)
    useEffect(() => {
        if (initialSearchTerm) { // Solo busca si hay un término inicial en la URL
            handleSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSearchTerm, initialLocation]); // Dependencias para re-ejecutar si la URL cambia

    // Manejador para el envío del formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Evita la recarga de la página
        handleSearch();
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Buscador de Medicamentos</h1>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar medicamento (ej. paracetamol)..."
                    className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                <input
                    type="text"
                    value={ubicacionFilter}
                    onChange={(e) => setUbicacionFilter(e.target.value)}
                    placeholder="Ubicación (ej. Las Condes)..."
                    className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                <button
                    type="button" // Importante: 'button' para que no envíe el formulario
                    onClick={handleDetectLocation}
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out text-base whitespace-nowrap"
                >
                    Detectar Ubicación
                </button>
                <button
                    type="submit" // Este botón sí envía el formulario
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out text-base whitespace-nowrap"
                >
                    {loading ? 'Buscando...' : 'Buscar Medicamentos'}
                </button>
            </form>

            {loading && <p className="text-center text-gray-600 text-lg mt-4">Cargando medicamentos...</p>}
            {error && <p className="text-center text-red-500 text-lg mt-4">Error: {error}</p>}

            {/* Mostrar mensaje si no hay resultados y la búsqueda ya se realizó */}
            {!loading && !error && searchResults.length === 0 && (searchTerm || ubicacionFilter) && (
                <p className="text-center text-gray-600 text-lg mt-4">
                    No se encontraron resultados para "{searchTerm}" {ubicacionFilter && `en "${ubicacionFilter}"`}.
                </p>
            )}
            {!loading && !error && searchResults.length === 0 && !searchTerm && !ubicacionFilter && (
                <p className="text-center text-gray-600 text-lg mt-4">Ingresa un medicamento y/o ubicación para iniciar la búsqueda.</p>
            )}

            {searchResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                    {searchResults.map((medicamento) => (
                        <div key={medicamento.id} className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 leading-tight">{medicamento.nombre}</h2>
                                {medicamento.imagenUrl && (
                                    <img
                                        src={medicamento.imagenUrl}
                                        alt={medicamento.nombre}
                                        className="w-full h-40 object-contain mb-4 rounded-md bg-gray-50 p-2"
                                    />
                                )}
                                <p className="text-gray-700 text-sm mb-1"><strong className="font-semibold">Laboratorio:</strong> {medicamento.laboratorio || 'N/A'}</p>
                                {medicamento.presentacion && (
                                    <p className="text-gray-700 text-sm mb-1"><strong className="font-semibold">Presentación:</strong> {medicamento.presentacion}</p>
                                )}
                                {medicamento.descripcion && (
                                    <p className="text-gray-600 text-sm mt-2">{medicamento.descripcion}</p>
                                )}
                            </div>

                            <div className="mt-5 pt-4 border-t border-gray-200">
                                <h3 className="text-xl font-bold text-gray-700 mb-3">Precios en farmacias:</h3>
                                {medicamento.preciosPorFarmacia && medicamento.preciosPorFarmacia.length > 0 ? (
                                    <ul className="space-y-3">
                                        {medicamento.preciosPorFarmacia.map((p, index) => (
                                            <li key={index} className="flex flex-col border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-800">{p.farmacia} ({p.ubicacionFarmacia || 'N/A'})</span>
                                                    <span className="font-bold text-green-600 text-xl">
                                                        ${p.precio ? p.precio.toLocaleString('es-CL') : 'N/A'}
                                                    </span>
                                                </div>
                                                {p.precioNormal && p.precioNormal > p.precio && (
                                                    <span className="text-gray-500 line-through text-sm mt-0.5 ml-0">
                                                        Precio Normal: ${p.precioNormal.toLocaleString('es-CL')}
                                                    </span>
                                                )}
                                                <small className="text-gray-500 text-xs mt-1">Actualizado: {new Date(p.fechaActualizacion).toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' })}</small>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">No hay precios disponibles en esta ubicación.</p>
                                )}
                            </div>

                            <Link href={`/medicamento/${medicamento.id}`} className="mt-8 text-center bg-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out text-lg font-semibold block">
                                Ver Detalles
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ListaMedicamentos;