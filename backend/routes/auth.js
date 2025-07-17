const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Importa el controlador
const passport = require('passport'); // Para proteger la ruta de perfil

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post('/login', authController.loginUser);

// @route   GET /api/auth/me (o /api/auth/profile)
// @desc    Obtener perfil del usuario actual (protegida por JWT)
// @access  Private
// passport.authenticate('jwt', { session: false }) es el middleware que verifica el token JWT
router.get('/me', passport.authenticate('jwt', { session: false }), authController.getMe);

module.exports = router;