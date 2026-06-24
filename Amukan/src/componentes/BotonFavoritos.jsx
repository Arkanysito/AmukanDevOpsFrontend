import { FaHeart } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";

export default function BotonFavoritos({ targetType, targetId, isFavorite }) {
  const { isAuthenticated, user } = useAuth();
  
  // El estado 'liked' ahora se inicializa con la prop 'isFavorite'
  const [liked, setLiked] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  // Este hook ahora solo sincroniza el estado 'liked' si la prop 'isFavorite'
  // o el 'targetId' cambian. NO LLAMA A LA API.
  useEffect(() => {
    setLiked(isFavorite);
  }, [isFavorite, targetId]); 

  // const checkIfFavorite = async () => { ... } // (ELIMINADA)

  const toggleFavorite = async (e) => {
    // Detener la propagación para no seleccionar el ItemCard
    e.stopPropagation(); 
    
    if (!isAuthenticated || !targetType || !targetId) {
      console.log("Missing requirements:", { isAuthenticated, targetType, targetId });
      return;
    }
    
    setLoading(true);
    try {
      console.log("Toggling favorite:", { targetType, targetId });
      await api.post("/user/favorites/toggle/", {
        target_type: targetType,
        target_id: targetId
      });
      
      setLiked(prev => !prev);
    } catch (error) {
      console.error("Error al alternar favorito:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      onClick={toggleFavorite}
      disabled={loading}
      className={`cursor-pointer transition-colors duration-200 ${
        liked ? "text-purple-600" : "text-gray-400 hover:text-purple-200"
      } ${loading ? "opacity-50" : ""}`}
    >
      <FaHeart size={20} />
    </div>
  );
}