import axios from "axios";

const api = axios.create({
  // URL adaptada para GitHub Codespaces (Puerto 3000 del backend)
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Importante para enviar cookies/sesiones entre dominios
});

export default api;