
import { useState, useEffect } from 'react';import { useAuth } from './useAuth';
import api from '../utils/api';

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/user/favorites/");
      console.log("Favoritos recibidos:", response.data); // Para debug
      setFavorites(response.data);
    } catch (err) {
      console.error("Error al obtener favoritos:", err);
      setError("No se pudieron cargar los favoritos");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (userFavId) => {
    try {
      await api.delete("/user/favorites/remove/", {
        data: { user_fav_id: userFavId }
      });
      setFavorites(prev => prev.filter(fav => fav.user_fav_id !== userFavId));
    } catch (err) {
      console.error("Error al eliminar favorito:", err);
      setError("Error al eliminar favorito");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  return {
    favorites,
    loading,
    error,
    refetchFavorites: fetchFavorites,
    removeFavorite
  };
};