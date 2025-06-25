const mongoose = require('mongoose');

const medicamentoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
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
    timestamps: true // createdAt, updatedAt
});

medicamentoSchema.index({ nombre: 1 });

module.exports = mongoose.model('Medicamento', medicamentoSchema);