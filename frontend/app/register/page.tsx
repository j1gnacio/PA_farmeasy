// @ts-ignore
// @ts-ignore
import { useState } from 'react';
import axiosInstance from "../utils/axiosInstance";
import { useRouter } from 'next/router';

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/auth/register', { email, password });
            // Si el registro es exitoso, podrías iniciar sesión automáticamente o redirigir al login
            localStorage.setItem('token', response.data.token); // Guarda el token
            router.push('/dashboard'); // Redirige a una página protegida
        } catch (err) {
            setError(err.response?.data?.msg || 'Error en el registro');
            console.error(err);
        }
    };

    return (
        <div>
            <h1>Registro de Usuario</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Registrarse</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}

export default RegisterPage;