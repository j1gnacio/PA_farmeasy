// backend/models/PrecioMedicamento.js
const mongoose = require('mongoose');

const precioMedicamentoSchema = new mongoose.Schema({
    medicamento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicamento',
        required: true
    },
    farmacia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmacia',
        required: true
    },
    // *** CAMBIO AQUÍ ***
    precio: { // <-- Cambia 'precioNormal' a 'precio'
        type: Number,
        required: true,
        min: 0
    },
    // *** FIN CAMBIO ***
    precioOferta: {
        type: Number,
        min: 0,
        required: false
    },
    stock: {
        type: Number,
        min: 0,
        required: false
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

precioMedicamentoSchema.index({ medicamento: 1 });
precioMedicamentoSchema.index({ farmacia: 1 });
precioMedicamentoSchema.index({ medicamento: 1, farmacia: 1, fechaActualizacion: -1 });

module.exports = mongoose.model('PrecioMedicamento', precioMedicamentoSchema);