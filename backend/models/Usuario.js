const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Por favor, ingrese un email válido']
    },
    contrasenia: {
        type: String,
        required: true
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('contrasenia')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.contrasenia = await bcrypt.hash(this.contrasenia, salt);
    next();
});

usuarioSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.contrasenia);
};

usuarioSchema.index({ email: 1 });

module.exports = mongoose.model('Usuario', usuarioSchema);