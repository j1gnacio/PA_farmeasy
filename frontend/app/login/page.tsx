'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Puedes seguir importando el icono si lo usas, pero no es esencial para la lógica de la API
// import IngresarIcon from '../../../public/log-in.svg';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // ** Reemplaza esta URL con la URL real de tu endpoint de inicio de sesión del backend **
            const API_URL = 'http://localhost:5000/api/auth/login'; // <--- ¡IMPORTANTE: MODIFICA ESTA LÍNEA!

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) { // Si la respuesta HTTP es 2xx (éxito)
                // Suponiendo que tu API devuelve un token JWT o algún dato de usuario en 'data'
                // Aquí puedes guardar el token en localStorage o en un contexto global si es necesario
                console.log('Inicio de sesión exitoso:', data);
                // Ejemplo: localStorage.setItem('authToken', data.token);

                // Guardar token y usuario en localStorage
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                router.push('/profile/dashboard'); // Redirigir a dashboard de perfil en caso de éxito
            } else {
                // Si la respuesta HTTP no es 2xx (ej. 401 Unauthorized, 400 Bad Request)
                // Suponiendo que tu API devuelve un mensaje de error en 'data.message'
                setError(data.message || 'Credenciales incorrectas.');
            }
        } catch (err: any) {
            // Este bloque captura errores de red, problemas CORS, o cualquier otra excepción antes de obtener una respuesta HTTP
            setError('Error de conexión. Inténtalo de nuevo más tarde.');
            console.error('Error de inicio de sesión:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-wrapper">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-form-group">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {/* Puedes usar el icono si lo deseas */}
                        {/* <IngresarIcon /> */}
                        {loading ? 'Cargando...' : <><span>➡️</span> Ingresar</>}
                    </button>
                </form>
                {error && <p className="error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                <p className="login-signup-link">
                    ¿No tienes una cuenta? <Link href="/register">Cree una aquí</Link>
                </p>
            </div>
        </div>
    );
}
