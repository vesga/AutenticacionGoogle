import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

// CORS — permite cookies entre frontend y backend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// Sesión
app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    sameSite: "lax"
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// ===== AUTH RUTAS =====
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

app.get("/auth/user", (req, res) => {
  res.send(req.user || null);
});

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL);
  });
});

// ===== RUTA DE PRUEBA =====
app.get("/api/mensaje", (req, res) => {
  res.json({ texto: "Hola desde el backend " });
});

// ===== JUEGO: ADIVINA EL NÚMERO =====
let numeroSecreto = Math.floor(Math.random() * 100) + 1;

app.get("/api/start", (req, res) => {
  numeroSecreto = Math.floor(Math.random() * 100) + 1;
  res.json({ mensaje: "Nuevo juego iniciado. Adivina un número entre 1 y 100." });
});

app.post("/api/guess", (req, res) => {
  const intento = req.body.numero;
  if (!intento && intento !== 0) {
    return res.status(400).json({ mensaje: "Debes enviar un número." });
  }
  if (intento < numeroSecreto) {
    res.json({ mensaje: "El número secreto es mayor 🔼" });
  } else if (intento > numeroSecreto) {
    res.json({ mensaje: "El número secreto es menor 🔽" });
  } else {
    res.json({ mensaje: "🎉 ¡Correcto! Adivinaste el número." });
  }
});

// ===== JUEGO: ADIVINA EL POKÉMON =====
app.get("/api/pokemon/start", async (req, res) => {
  try {
    const id = Math.floor(Math.random() * 151) + 1;
    const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const pokeData = await pokeRes.json();
    const speciesRes = await fetch(pokeData.species.url);
    const speciesData = await speciesRes.json();
    res.json({
      id: pokeData.id,
      types: pokeData.types.map(t => t.type.name),
      height: pokeData.height,
      weight: pokeData.weight,
      color: speciesData.color.name,
      moves: pokeData.moves.slice(0, 4).map(m => m.move.name),
      name: pokeData.name,
      image: pokeData.sprites.other.dream_world.front_default || pokeData.sprites.front_default
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el Pokémon" });
  }
});

app.post("/api/pokemon/guess", (req, res) => {
  res.json({ ok: true });
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});