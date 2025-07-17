const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    // *** CAMBIO AQUÍ: Desestructuramos 'username' en lugar de 'nombre' ***
    const { username, email, password } = req.body;
    try {
        let usuario = await Usuario.findOne({ email });
        if (usuario) {
            return res.status(400).json({ message: 'El usuario ya existe con este e-mail' });
        }
        usuario = new Usuario({
            username,
            email,
            password // *** CAMBIO AQUÍ: Pasamos 'password' al constructor del modelo ***
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

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    // *** CAMBIO AQUÍ: Desestructuramos 'password' en lugar de 'contrasenia' ***
    const { email, password } = req.body;
    try {
        let usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        // *** CAMBIO AQUÍ: Pasamos 'password' al método matchPassword ***
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

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/me (o /api/auth/profile)
// @access  Private (requiere token JWT)
exports.getMe = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id).select('-contrasenia'); // *** CAMBIO AQUÍ: Excluir 'contrasenia' ***

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};