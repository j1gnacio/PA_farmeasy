const mongoose = require('mongoose');

const busquedaSchema = new mongoose.Schema({
    termino: {
        type: String,
        required: true,
        trim: true
    },
    // Estas referencias pueden ser opcionales dependiendo del tipo de búsqueda (por medicamento, por farmacia, por ubicación)
    ubicacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ubicacion',
        required: false // La búsqueda puede ser general sin ubicación específica
    },
    farmacia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmacia',
        required: false // La búsqueda puede ser general sin farmacia específica
    },
    fecha: {
        type: Date,
        default: Date.now // Fecha de la búsqueda
    }
}, {
    timestamps: false // O true si prefieres createdAt/updatedAt automáticos
});

busquedaSchema.index({ termino: 1, fecha: -1 });
busquedaSchema.index({ ubicacion: 1, fecha: -1 });
busquedaSchema.index({ farmacia: 1, fecha: -1 });

module.exports = mongoose.model('Busqueda', busquedaSchema);