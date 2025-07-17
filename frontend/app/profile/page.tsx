// frontend/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

interface UserProfile {
    id: string;
    nombreUsuario: string;
    email: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                if (!token) {
                    router.push('/login'); // Redirigir si no hay token
                    return;
                }
                const response = await api.get('/auth/profile'); // Esta ruta está protegida en el backend
                setUser(response.data);
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('jwtToken'); // Token inválido o expirado
                    router.push('/login');
                }
                setError('No se pudo cargar el perfil del usuario.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    if (loading) return <p>Cargando perfil...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!user) return <p>No se encontró información del usuario.</p>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Mi Perfil</h1>
                <p><strong>Nombre de Usuario:</strong> {user.nombreUsuario}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <button
                    onClick={() => {
                        localStorage.removeItem('jwtToken');
                        router.push('/login');
                    }}
                    className="mt-6 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}