// frontend/app/layout.tsx
import './globals.css';
import Header from '../components/Header';

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    // No pasar funciones directamente a componentes cliente para evitar error
    // En lugar de pasar toggleTheme, se puede manejar dentro del componente Header o usar contexto

    return (
        <html lang="es">
        <body>
        <div className="layout-body">
            <Header theme="light" toggleTheme={undefined} />
            <main className="layout-main">
                {children} {/* Aquí se renderizará el contenido de cada página */}
            </main>
            <footer className="layout-footer">
                © 2025 FarmEasy. Todos los derechos reservados.
            </footer>
        </div>
        </body>
        </html>
    );
}
