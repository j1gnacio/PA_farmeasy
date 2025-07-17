const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Registrar un nuevo usuario
// POST /api/auth/register
// Acceso público
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let usuario = await Usuario.findOne({ email });
        if (usuario) {
            return res.status(400).json({ message: 'El usuario ya existe con este e-mail' });
        }
        usuario = new Usuario({
            username,
            email,
            password
        });
        await usuario.save();

        const payload = {
            usuario: {
                id: usuario.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Autenticar usuario y obtener token
// POST /api/auth/login
// Acceso público
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        const isMatch = await usuario.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const payload = {
            usuario: {
                id: usuario.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener perfil del usuario actual
// GET /api/auth/me (o /api/auth/profile)
// Acceso privado (requiere token JWT)
exports.getMe = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id).select('-contrasenia');

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};
