import { useEffect, useState } from "react";
import api from "../utils/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    try {
      const res = await api.get("/user/me/");
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Error al obtener el usuario:", err);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, isAuthenticated, logout };
};