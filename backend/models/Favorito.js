const mongoose = require('mongoose');

const favoritoSchema = new mongoose.Schema({
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
    fechaFavorito: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // O true
});

// Asegura que un usuario solo pueda tener un medicamento como favorito una vez
favoritoSchema.index({ usuario: 1, medicamento: 1 }, { unique: true });

module.exports = mongoose.model('Favorito', favoritoSchema);