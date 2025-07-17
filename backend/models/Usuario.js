// backend/models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    username: { // <-- DEBE ESTAR ASÍ
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Por favor, ingrese un email válido']
    },
    password: { // <-- DEBE ESTAR ASÍ
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Hook para hashear la contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // <-- DEBE USAR 'password'
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt); // <-- DEBE USAR 'password'
        next();
    } catch (err) {
        next(err);
    }
});

// Método para comparar contraseñas
usuarioSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // <-- DEBE USAR 'password'
};

module.exports = mongoose.model('Usuario', usuarioSchema);