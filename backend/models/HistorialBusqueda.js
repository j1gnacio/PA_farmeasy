const mongoose = require('mongoose');

const historialBusquedaSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    busqueda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Busqueda',
        required: true
    },
    fecha: { // Fecha en que se añadió esta búsqueda al historial del usuario
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // O true
});

historialBusquedaSchema.index({ usuario: 1, fecha: -1 }); // Para obtener el historial de un usuario, ordenado por fecha

module.exports = mongoose.model('HistorialBusqueda', historialBusquedaSchema);