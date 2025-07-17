"use client"; // ¡IMPORTANTE: ESTA DEBE SER LA PRIMERA LÍNEA!

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

export default SearchBar; // Exporta el componente