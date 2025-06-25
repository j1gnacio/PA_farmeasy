const mongoose = require('mongoose');

const ubicacionSchema = new mongoose.Schema({
    direccion: {
        type: String,
        required: true,
        trim: true
    },
    ciudad: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

ubicacionSchema.index({ direccion: 1, ciudad: 1 }, { unique: true });

module.exports = mongoose.model('Ubicacion', ubicacionSchema);