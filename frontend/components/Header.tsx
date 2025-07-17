'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = ({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) => {
    const [user, setUser] = useState<{ id: string; nombre: string; email: string } | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showConfigMenu, setShowConfigMenu] = useState(false);
    const router = useRouter();

    // Simulación de obtener usuario logueado (en producción, obtener de contexto o API)
    useEffect(() => {
        // Aquí se puede obtener el usuario real, por ejemplo desde localStorage o API
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        // Limpiar datos de usuario y token
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        setUser(null);
        // Redirigir a login o home
        router.push('/login');
    };

    return (
        <header className={`header ${theme}`}>
            <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
                <Link href="/">
                    <img
                        src="/farmeasy-logo.png"
                        alt="FarmEasy Logo"
                        style={{ height: '70px', width: 'auto', cursor: 'pointer' }}
                    />
                </Link>
            </div>
            <div className="header-right">
                <nav className="nav-links">
                    <Link href="/" className="nav-link">Inicio</Link>
                    <Link href="/about" className="nav-link">Sobre nosotros</Link>
                    <Link href="/medicamentos" className="nav-link">Medicamentos</Link>
                    <Link href="/blog" className="nav-link">Blog</Link>
                    <Link href="/contact" className="nav-link">Contacto</Link>
                </nav>
                {user ? (
                    <>
                        {typeof window !== 'undefined' && window.location.pathname !== '/profile/dashboard' && (
                            <>
                                <nav className="nav-links">
                                    <Link href="/alertas" className="nav-link">Alertas</Link>
                                    <Link href="/favoritos" className="nav-link">Favoritos</Link>
                                </nav>
                                <div className="config-icon-container">
                                    <button
                                        aria-label="Configuración"
                                        className="config-button"
                                        onClick={() => setShowConfigMenu(!showConfigMenu)}
                                    >
                                        ⚙️
                                    </button>
                                    {showConfigMenu && (
                                        <div className="config-menu">
                                            <button onClick={toggleTheme}>
                                                Cambiar a {theme === 'light' ? 'oscuro' : 'claro'}
                                            </button>
                                            {/* Aquí se pueden agregar más configuraciones */}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        <div className="profile-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="profile-name">{user.nombre}</span>
                        </div>
                    </>
                ) : null}
            </div>
            <style jsx>{`
                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 20px;
                    background-color: var(--header-bg);
                    color: var(--header-text);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }
                .header.light {
                    --header-bg: #ffffff;
                    --header-text: #333333;
                }
                .header.dark {
                    --header-bg: #222222;
                    --header-text: #f0f0f0;
                }
                .logo {
                    font-size: 1.5rem;
                    font-weight: bold;
                    cursor: pointer;
                }
                .nav-links {
                    display: flex;
                    gap: 15px;
                    margin-right: 20px;
                }
                .nav-link {
                    text-decoration: none;
                    color: inherit;
                    font-weight: 500;
                }
                .nav-link:hover {
                    text-decoration: underline;
                }
                .config-icon-container {
                    position: relative;
                    margin-right: 20px;
                }
                .config-button {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: inherit;
                }
                .config-menu {
                    position: absolute;
                    right: 0;
                    top: 30px;
                    background: var(--header-bg);
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    padding: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    z-index: 1001;
                }
                .profile-container {
                    position: relative;
                }
                .profile-button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    color: inherit;
                }
                .profile-menu {
                    position: absolute;
                    right: 0;
                    top: 30px;
                    background: var(--header-bg);
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    padding: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    z-index: 1001;
                    min-width: 150px;
                }
                .profile-menu p {
                    margin: 5px 0;
                }
                .profile-menu button {
                    width: 100%;
                    padding: 5px 10px;
                    background-color: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .profile-menu button:hover {
                    background-color: #c0392b;
                }
                .login-link {
                    font-weight: 600;
                    color: inherit;
                    text-decoration: none;
                }
                .login-link:hover {
                    text-decoration: underline;
                }
                .register-link {
                    font-weight: 600;
                    color: inherit;
                    margin-left: 10px;
                    text-decoration: none;
                }
                .register-link:hover {
                    text-decoration: underline;
                }
            `}</style>
        </header>
    );
};

export default Header;
