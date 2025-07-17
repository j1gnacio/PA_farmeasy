// frontend/App.js
import React from 'react';
import MedicamentoList from './components/MedicamentoList'; // Importa tu nuevo componente
import './App.css'; // Si tienes un CSS global

function App() {
    return (
        <div className="App">
            <header className="App-header">
                {/* Puedes poner un encabezado de tu app aquí */}
            </header>
            <main>
                <MedicamentoList /> {/* Renderiza el componente de la lista de medicamentos */}
            </main>
        </div>
    );
}

export default App;