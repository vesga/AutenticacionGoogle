const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
 
const app = express();
 
// Configuración de CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // URL de tu frontend (React)
    credentials: true, // Permite el intercambio de cookies/credenciales
  })
);
 
// Configuración de sesión
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,   // En localhost debe ser false (sin HTTPS)
      sameSite: "lax", // Permite cookies en solicitudes del mismo sitio
    },
  })
);
 
// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());
 
// Serialización (guardar usuario en sesión)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
 
// Estrategia de Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL, // URL a donde Google devuelve la respuesta
    },
    (accessToken, refreshToken, profile, done) => {
      // Aquí obtienes el perfil del usuario tras el login exitoso de Google
      return done(null, profile);
    }
  )
);
 
// ──────────────────────────────────────────
// RUTAS
// ──────────────────────────────────────────
 
// Ruta de prueba
app.get("/", (req, res) => res.send("Servidor funcionando correctamente"));
 
// Iniciar autenticación con Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
 
// Callback de Google
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Redirige al dashboard del frontend después del login exitoso
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);
 
// Obtener usuario autenticado
app.get("/auth/user", (req, res) => {
  // Envía el objeto de usuario si existe una sesión, sino envía null
  res.send(req.user || null);
});
 
// Inicio del Servidor
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`)
);