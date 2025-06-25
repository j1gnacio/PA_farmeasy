const mongoose = require('mongoose');

const alertaPrecioSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    medicamento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicamento',
        required: true
    },
    precioObjetivo: {
        type: Number,
        required: true,
        min: 0
    },
    alertaActiva: {
        type: Boolean,
        default: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    ultimaNotificacion: { // Para registrar cuándo se envió la última notificación (opcional)
        type: Date,
        required: false
    }
}, {
    timestamps: false // O true
});

// Índice para búsquedas rápidas de alertas por usuario o medicamento
alertaPrecioSchema.index({ usuario: 1 });
alertaPrecioSchema.index({ medicamento: 1 });

module.exports = mongoose.model('AlertaPrecio', alertaPrecioSchema);