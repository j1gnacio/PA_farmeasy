'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import ListaMedicamentos, { Medicamento } from '../../../components/ListaMedicamentos';

interface UserProfile {
    id: string;
    nombreUsuario: string;
    email: string;
}

export default function ProfileDashboard() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Medicamento[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                if (!token) {
                    router.push('/login'); // Redirigir si no hay token
                    return;
                }
                const response = await api.get('/auth/me'); // Ruta protegida en backend
                setUser(response.data);
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('jwtToken'); // Token inválido o expirado
                    router.push('/login');
                }
                // Mostrar mensaje de error con detalles para debug
                const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
                setError(`No se pudo cargar el perfil del usuario. Detalle: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchTerm.trim()) {
            setSearchResults([]);
            setSearchError("Por favor, ingresa un término de búsqueda.");
            return;
        }

        setSearchLoading(true);
        setSearchError(null);
        setSearchResults([]);

        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                setSearchError('Debe iniciar sesión para buscar medicamentos.');
                setSearchLoading(false);
                return;
            }
            const response = await fetch(`http://localhost:5000/api/medicamentos/search?q=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error del servidor: ${response.status} ${response.statusText}`);
            }

            const data: Medicamento[] = await response.json();
            setSearchResults(data);

            if (data.length === 0) {
                setSearchError('No se encontraron resultados para su búsqueda.');
            }

        } catch (err: any) {
            console.error('Error al realizar la búsqueda:', err);
            setSearchError(err.message || 'Error al conectar con el servidor de búsqueda.');
        } finally {
            setSearchLoading(false);
        }
    };

    if (loading) return <p>Cargando perfil...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!user) return <p>No se encontró información del usuario.</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-100 to-purple-200 p-12 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-10">
                <aside className="col-span-3 bg-white rounded-r-3xl shadow-lg p-8 sticky top-20 h-fit flex flex-col items-center">
                    {/* Imagen eliminada según solicitud */}
                    <h2 className="text-3xl font-bold mb-8 border-b border-gray-300 pb-3 text-purple-700 w-full text-center">Opciones</h2>
                    <ul className="space-y-6 text-lg font-medium w-full text-center">
                        <li>
                            <a href="/favoritos" className="block hover:text-purple-900 transition-colors duration-300">Favoritos</a>
                        </li>
                        <li>
                            <a href="/alertas" className="block hover:text-purple-900 transition-colors duration-300">Alertas</a>
                        </li>
                        <li>
                            <a href="/profile/configuracion" className="block hover:text-purple-900 transition-colors duration-300">Configuración de la cuenta</a>
                        </li>
                    </ul>
                </aside>
                <main className="col-span-9 space-y-12">
                    <section className="bg-white rounded-3xl shadow-lg p-10 text-center">
                        <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-purple-900">Bienvenido, {user.nombreUsuario}</h1>
                        <p className="text-xl text-gray-700"><strong>Email:</strong> {user.email}</p>
                    </section>
                    <section className="bg-white rounded-3xl shadow-lg p-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-semibold mb-8 text-purple-800">Buscar Medicamentos</h2>
                        <form onSubmit={handleSearch} className="flex justify-center space-x-6 mb-8">
                            <input
                                type="text"
                                placeholder="Ingrese el nombre del medicamento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rounded-2xl border border-purple-300 px-8 py-4 text-2xl focus:outline-none focus:ring-4 focus:ring-purple-500 transition-shadow duration-300 w-full max-w-xl"
                            />
                            <button
                                type="submit"
                                className="bg-purple-700 text-white px-10 py-4 rounded-2xl hover:bg-purple-800 transition-colors duration-300 shadow-lg"
                            >
                                🔍
                            </button>
                        </form>
                        {searchLoading && <p className="text-gray-600 text-center text-lg">Cargando resultados...</p>}
                        {searchError && <p className="text-red-600 text-center text-lg">{searchError}</p>}
                        {!searchLoading && !searchError && searchResults.length > 0 && (
                            <ListaMedicamentos medicamentos={searchResults} />
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
