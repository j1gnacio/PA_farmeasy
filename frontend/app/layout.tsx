// @ts-ignore
import React, { useState } from 'react';

// SearchBar.tsx (Componente de la barra de búsqueda)
const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSearch(searchTerm);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto mb-8">
            <div className="flex items-center border border-gray-300 rounded-full shadow-sm overflow-hidden p-1 bg-white">
                <input
                    type="text"
                    placeholder="Buscar medicamentos..."
                    className="flex-grow py-2 px-4 outline-none focus:ring-2 focus:ring-blue-500 rounded-l-full text-gray-700"
                    value={searchTerm}
                    onChange={handleChange}
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out flex items-center justify-center ml-2"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    Buscar
                </button>
            </div>
        </form>
    );
};

// HomePage.tsx (Página de Inicio)
const HomePage = () => {
    const popularMedicines = [
        { name: "Ibuprofeno", description: "Alivio del dolor y la inflamación." },
        { name: "Paracetamol", description: "Analgésico y antipirético." },
        { name: "Amoxicilina", description: "Antibiótico para infecciones bacterianas." },
        { name: "Omeprazol", description: "Reduce la producción de ácido estomacal." },
        { name: "Loratadina", description: "Antihistamínico para alergias." },
    ];

    const handleSearch = (term) => {
        console.log("Buscando:", term);
        // Aquí integrarías la lógica real de búsqueda,
        // por ejemplo, haciendo una llamada a una API.
        alert(`Búsqueda simulada para: "${term}". En una aplicación real, se mostrarían resultados aquí.`);
    };

    return (
        <div className="flex flex-col items-center justify-center px-4">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Encuentra tus medicamentos fácilmente</h2>
            <SearchBar onSearch={handleSearch} />

            <section className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-700 mb-5 border-b-2 pb-2 border-blue-400">Medicamentos Populares</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {popularMedicines.map((medicine, index) => (
                        <div key={index} className="bg-blue-50 p-5 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out">
                            <h4 className="text-lg font-semibold text-blue-800 mb-2">{medicine.name}</h4>
                            <p className="text-gray-600 text-sm">{medicine.description}</p>
                            <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 text-sm">Ver Detalles</button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

// App.js (Simulando el layout global y la integración de la página)
const App = () => {
    return (
        // Load Tailwind CSS CDN
        <>
            <script src="https://cdn.tailwindcss.com"></script>
            <div className="flex flex-col min-h-screen bg-gray-100 font-sans antialiased text-gray-800">
                {/* Header (simulando layout.tsx) */}
                <header className="bg-blue-700 text-white p-4 shadow-xl rounded-b-xl">
                    <nav className="container mx-auto flex justify-between items-center py-2">
                        <h1 className="text-3xl font-extrabold tracking-wide">MiFarmacia</h1>
                        <ul className="flex space-x-6">
                            <li><a href="#" className="hover:text-blue-200 transition duration-200 text-lg">Inicio</a></li>
                            <li><a href="#" className="hover:text-blue-200 transition duration-200 text-lg">Medicamentos</a></li>
                            <li><a href="#" className="hover:text-blue-200 transition duration-200 text-lg">Acerca de</a></li>
                            <li><a href="#" className="hover:text-blue-200 transition duration-200 text-lg">Contacto</a></li>
                        </ul>
                    </nav>
                </header>

                {/* Main Content Area */}
                <main className="flex-grow container mx-auto p-4 py-10">
                    <HomePage /> {/* Render the home page content */}
                </main>

                {/* Footer (simulando layout.tsx) */}
                <footer className="bg-gray-900 text-white p-6 text-center rounded-t-xl shadow-inner">
                    <p className="text-sm">&copy; 2024 MiFarmacia. Todos los derechos reservados.</p>
                    <p className="text-xs mt-2">Hecho con ❤️ y Tailwind CSS</p>
                </footer>
            </div>
        </>
    );
};

export default App;