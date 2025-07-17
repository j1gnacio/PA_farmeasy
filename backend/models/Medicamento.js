const mongoose = require('mongoose');

const medicamentoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true // Se mantiene la definición de índice único aquí
    },
    dosis: {
        type: String,
        required: false,
        trim: true
    },
    laboratorio: {
        type: String,
        required: false,
        trim: true
    },
    descripcion: {
        type: String,
        required: false,
        trim: true
    }
}, {
    timestamps: true // Esto añade 'createdAt' y 'updatedAt' automáticamente
});

// *** LÍNEA ELIMINADA: medicamentoSchema.index({ nombre: 1 }); ***
// La opción `unique: true` en la definición del campo `nombre`
// ya crea el índice necesario. No se necesita una definición `index()` separada.

module.exports = mongoose.model('Medicamento', medicamentoSchema);