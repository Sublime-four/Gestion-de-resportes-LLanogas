// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import {
  getStoredUser,
  saveUser,
  clearUser,
  isLoggedIn,
} from "../store/authStore";

/**
 * Hook de autenticación sencillo basado en localStorage.
 * - login(user)  -> guarda usuario y marca autenticado
 * - logout()     -> limpia sesión
 * - isAuthenticated, user
 */
export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isLoggedIn());
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    // por si en el futuro quieres leer token al cargar
    setIsAuthenticated(isLoggedIn());
    setUser(getStoredUser());
  }, []);

  const login = (userData) => {
    saveUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
}
