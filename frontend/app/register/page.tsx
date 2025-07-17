// frontend/app/register/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Puedes usar un icono similar al de login o uno de registro
// Por ejemplo, si tienes un SVG en tu carpeta 'public':
// import RegisterIcon from '../../../public/user-plus.svg'; // Asumiendo que tienes un SVG para registrar

export default function RegisterPage() {
    const [username, setUsername] = useState('');
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
            // ** Reemplaza esta URL con la URL real de tu endpoint de registro del backend **
            const API_URL = 'http://localhost:5000/api/auth/register'; // <--- ¡IMPORTANTE: MODIFICA ESTA LÍNEA!

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }), // Envía username, email y password
            });

            const data = await response.json();

            if (response.ok) { // Si la respuesta HTTP es 2xx (éxito)
                console.log('Registro exitoso:', data.message || 'Usuario registrado con éxito.');
                alert('Registro exitoso. ¡Ahora puedes iniciar sesión!'); // Mensaje de éxito al usuario
                router.push('/login'); // Redirigir a la página de login después del registro
            } else {
                // Si la respuesta HTTP no es 2xx (ej. 400 Bad Request, 409 Conflict si el usuario ya existe)
                // Suponiendo que tu API devuelve un mensaje de error en 'data.message'
                setError(data.message || 'Error al registrar el usuario.');
            }
        } catch (err: any) {
            // Este bloque captura errores de red, problemas CORS, o cualquier otra excepción
            setError('Error de conexión. Inténtalo de nuevo más tarde.');
            console.error('Error de registro:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-form-wrapper">
                <h2>Crear cuenta</h2>
                <form onSubmit={handleSubmit}>
                    <div className="register-form-group">
                        <label htmlFor="register-username">Nombre de usuario:</label>
                        <input
                            type="text"
                            id="register-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="register-email">Email:</label>
                        <input
                            type="email" // Usar type="email" para validación básica de email
                            id="register-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="register-password">Contraseña:</label>
                        <input
                            type="password"
                            id="register-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="register-button" disabled={loading}>
                        {/* Puedes usar un componente SVG para el icono si lo tienes */}
                        {/* <RegisterIcon /> */}
                        {loading ? 'Cargando...' : <><span>📝</span> Registrarse</>}
                    </button>
                </form>
                {error && <p className="error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                <p className="register-login-link">
                    ¿Ya tienes cuenta? <Link href="/login">Inicia sesión aquí</Link>
                </p>
            </div>
        </div>
    );
}