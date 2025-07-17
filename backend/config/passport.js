const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy; // Importa la estrategia JWT
const ExtractJwt = require('passport-jwt').ExtractJwt; // Importa el extractor de JWT
const User = require('../models/Usuario'); // Asegúrate de que la ruta a tu modelo Usuario es correcta
require('dotenv').config(); // Asegúrate de cargar las variables de entorno para JWT_SECRET

module.exports = function(passport) {
    // --- Estrategia Local (para login tradicional con email/password) ---
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, { message: 'E-mail no registrado' });
                }
                // Aquí deberías usar user.contrasenia para comparar si tu modelo tiene 'contrasenia'
                const isMatch = await user.matchPassword(password); // Asumiendo que matchPassword usa 'contrasenia'
                if (!isMatch) {
                    return done(null, false, { message: 'Contraseña incorrecta' });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        })
    );

    // --- Estrategia JWT (para autenticación sin estado con tokens) ---
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // Extrae el token del header Authorization: Bearer <token>
    opts.secretOrKey = process.env.JWT_SECRET; // Usa tu secreto JWT del archivo .env

    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            // jwt_payload contiene el payload descifrado del token
            // En tu caso, el payload del token tiene { usuario: { id: usuario.id } }
            User.findById(jwt_payload.usuario.id) // Busca el usuario por el ID que está en el payload
                .then(user => {
                    if (user) {
                        return done(null, user); // Usuario encontrado, autenticación exitosa
                    }
                    return done(null, false); // Usuario no encontrado
                })
                .catch(err => done(err, false)); // Error durante la búsqueda
        })
    );

    // Si utilizas sesiones de Passport, podrías necesitar serializar/deserializar,
    // pero para JWT sin estado con { session: false }, no son estrictamente necesarios.
    // passport.serializeUser((user, done) => {
    //     done(null, user.id);
    // });

    // passport.deserializeUser((id, done) => {
    //     User.findById(id, (err, user) => {
    //         done(err, user);
    //     });
    // });
};