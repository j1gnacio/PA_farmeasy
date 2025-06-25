const mongoose = require('mongoose');

const farmaciaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    ubicacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ubicacion',
        required: true
    },
    urlBaseScraper: { // Para el scraper
        type: String,
        required: false,
        trim: true
    }
}, {
    timestamps: true
});

farmaciaSchema.index({ nombre: 1 });

module.exports = mongoose.model('Farmacia', farmaciaSchema);