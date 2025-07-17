// frontend/app/search/page.tsx
'use client'; // ¡Esencial si ListaMedicamentos usa hooks!

import ListaMedicamentos from '../../components/ListaMedicamentos'; // Ajusta la ruta si es necesario

export default function SearchPage() {
    return <ListaMedicamentos />;
}