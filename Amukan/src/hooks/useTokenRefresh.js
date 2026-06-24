import { useEffect } from "react";
import api from "../utils/api";

export default function useTokenRefresh() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const res = await api.post("/user/token/refresh/", { refresh: refreshToken });
          localStorage.setItem("access_token", res.data.access);
          api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
        } catch (err) {
          console.error("Error al refrescar token", err);
        }
      }
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}