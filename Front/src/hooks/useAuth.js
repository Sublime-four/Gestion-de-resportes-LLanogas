// src/hooks/useAuth.js
import { useState, useEffect } from "react";

/**
 * Hook de autenticación muy básico.
 * Ahora mismo siempre marca al usuario como autenticado.
 * Luego puedes reemplazarlo por lógica real (token, API, etc).
 */
export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Aquí podrías leer localStorage, llamar una API, etc.
  useEffect(() => {
    // Ejemplo futuro:
    // const token = localStorage.getItem("token");
    // setIsAuthenticated(!!token);
    setIsAuthenticated(true);
  }, []);

  return {
    isAuthenticated,
  };
}
