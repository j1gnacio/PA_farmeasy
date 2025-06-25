const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/Usuario');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, { message: 'E-mail no registrado' });
                }
                const isMatch = await user.matchPassword(password);
                if (!isMatch) {
                    return done(null, false, { message: 'Contraseña incorrecta' });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        })
    );

    // JWT (opcional, para manejo de sesiones sin estado)
    // Puedes agregar una estrategia JWT si quieres usar tokens en lugar de sesiones tradicionales de Passport.
};