// backend/models/Farmacia.js
const mongoose = require('mongoose');

const farmaciaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
    url: {
        type: String,
        required: true,
    },
    // Asegúrate de que este campo exista y sea String
    Ubicacion: { // O 'direccion' si lo cambiaste
        type: String,
        required: false, // Puedes hacerlo opcional si no todas las farmacias tienen una ubicación precisa
    },
    // Otros campos...
}, {
    timestamps: true,
});

module.exports = mongoose.model('Farmacia', farmaciaSchema);