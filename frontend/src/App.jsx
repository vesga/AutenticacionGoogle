import { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

function Login() {
  const handleLogin = () => {
    window.location.href = `${BACKEND}/auth/google`;
  };

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      height: "100vh", width: "100vw",
      background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
    }}>
      <div style={{
        backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)",
        padding: "50px 40px", borderRadius: "18px", textAlign: "center",
        color: "#fff", maxWidth: "400px", width: "100%"
      }}>
        <h1 style={{ marginBottom: "10px" }}>🎮 Bienvenido</h1>
        <p style={{ color: "#ddd", marginBottom: "30px" }}>
          Inicia sesión para jugar
        </p>
        <button onClick={handleLogin} style={{
          width: "100%", padding: "14px", backgroundColor: "#4285F4",
          color: "#fff", border: "none", borderRadius: "8px",
          fontSize: "16px", fontWeight: "600", cursor: "pointer"
        }}>
          🌐 Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
}

function Juegos({ user, onLogout }) {
  const [mensaje, setMensaje] = useState("");
  const [mensajeJuego, setMensajeJuego] = useState("Haz clic en Reiniciar para comenzar");
  const [numero, setNumero] = useState("");
  const [pokemon, setPokemon] = useState(null);
  const [nombrePokemon, setNombrePokemon] = useState("");
  const [resultadoPokemon, setResultadoPokemon] = useState("");
  const [imagenPokemon, setImagenPokemon] = useState("");
  const [nombreReal, setNombreReal] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/api/mensaje`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setMensaje(data.texto));
  }, []);

  const reiniciarJuego = async () => {
    const res = await fetch(`${BACKEND}/api/start`, { credentials: "include" });
    const data = await res.json();
    setMensajeJuego(data.mensaje);
    setNumero("");
  };

  const enviarIntento = async () => {
    if (!numero) return;
    const res = await fetch(`${BACKEND}/api/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ numero: Number(numero) })
    });
    const data = await res.json();
    setMensajeJuego(data.mensaje);
  };

  const nuevoPokemon = async () => {
    setResultadoPokemon("");
    setImagenPokemon("");
    setNombrePokemon("");
    const res = await fetch(`${BACKEND}/api/pokemon/start`, { credentials: "include" });
    const data = await res.json();
    setPokemon(data);
    setNombreReal(data.name);
  };

  const adivinarPokemon = () => {
    if (!nombrePokemon) return;
    if (nombrePokemon.toLowerCase() === nombreReal.toLowerCase()) {
      setResultadoPokemon(`¡Correcto! Es ${nombreReal} 🎉`);
    } else {
      setResultadoPokemon(`Incorrecto, el Pokémon era ${nombreReal} 😢`);
    }
    setImagenPokemon(pokemon.image);
  };

  const estiloBtnVerde = {
    padding: "10px 20px", fontSize: "1rem", borderRadius: "8px",
    border: "none", backgroundColor: "#00b894", color: "#fff",
    cursor: "pointer", margin: "5px", transition: "background-color 0.3s"
  };
  const estiloBtnAzul = {
    padding: "10px 20px", fontSize: "1rem", borderRadius: "8px",
    border: "none", backgroundColor: "#0984e3", color: "#fff",
    cursor: "pointer", margin: "5px", transition: "background-color 0.3s"
  };
  const estiloInput = {
    padding: "10px 15px", fontSize: "1rem", borderRadius: "8px",
    border: "2px solid #0984e3", width: "150px",
    textAlign: "center", marginBottom: "15px"
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", textAlign: "center" }}>

      {/* Header con usuario */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        backgroundColor: "#2d3436", color: "#fff", padding: "10px 20px",
        borderRadius: "10px", marginBottom: "20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={user.photos?.[0]?.value} alt="foto"
            style={{ width: "35px", height: "35px", borderRadius: "50%" }} />
          <span>Hola, <b>{user.displayName}</b></span>
        </div>
        <button onClick={onLogout} style={{
          padding: "6px 14px", backgroundColor: "#d63031", color: "#fff",
          border: "none", borderRadius: "6px", cursor: "pointer"
        }}>Cerrar sesión</button>
      </div>

      {/* Conexión backend */}
      <h1 style={{ color: "#2d3436" }}>Frontend conectado</h1>
      <p style={{ color: "#0984e3" }}>{mensaje}</p>
      <hr style={{ margin: "20px 0" }} />

      {/* Juego: Adivina el Número */}
      <h1>🎲 Juego: Adivina el Número</h1>
      <p style={{ fontSize: "1.2rem", color: "#d63031" }}>{mensajeJuego}</p>
      <input type="number" value={numero}
        onChange={(e) => setNumero(e.target.value)}
        placeholder="Escribe un número" style={estiloInput} />
      <br />
      <button style={estiloBtnVerde}
        onMouseOver={e => e.target.style.backgroundColor = "#019875"}
        onMouseOut={e => e.target.style.backgroundColor = "#00b894"}
        onClick={enviarIntento}>Intentar</button>
      <button style={estiloBtnAzul}
        onMouseOver={e => e.target.style.backgroundColor = "#0652dd"}
        onMouseOut={e => e.target.style.backgroundColor = "#0984e3"}
        onClick={reiniciarJuego}>Reiniciar Juego</button>

      <hr style={{ margin: "30px 0" }} />

      {/* Juego: Adivina el Pokémon */}
      <h1>🎮 Juego: Adivina el Pokémon</h1>
      <button style={estiloBtnAzul} onClick={nuevoPokemon}>Nuevo Pokémon</button>

      {pokemon && (
        <div style={{ marginTop: "20px" }}>
          <p><b>ID:</b> {pokemon.id}</p>
          <p><b>Tipo(s):</b> {pokemon.types.join(", ")}</p>
          <p><b>Color:</b> {pokemon.color}</p>
          <p><b>Altura:</b> {pokemon.height} | <b>Peso:</b> {pokemon.weight}</p>
          <p><b>Ataques:</b> {pokemon.moves.join(", ")}</p>
          <input type="text" value={nombrePokemon}
            onChange={(e) => setNombrePokemon(e.target.value)}
            placeholder="Nombre del Pokémon"
            style={{ ...estiloInput, width: "200px" }} />
          <br />
          <button style={estiloBtnVerde} onClick={adivinarPokemon}>Adivinar</button>
          {resultadoPokemon && <p style={{ fontSize: "1.2rem", color: "#6c5ce7" }}>{resultadoPokemon}</p>}
          {imagenPokemon && <img src={imagenPokemon} alt="pokemon"
            style={{ width: "150px", marginTop: "10px" }} />}
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch(`${BACKEND}/auth/user`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    window.location.href = `${BACKEND}/auth/logout`;
  };

  if (user === undefined) return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando...</p>;
  if (!user) return <Login />;
  return <Juegos user={user} onLogout={handleLogout} />;
}

export default App;