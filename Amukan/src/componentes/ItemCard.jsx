import { FaHeart } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";
import BotonFavoritos from "./BotonFavoritos";
import defaultActividades from "../assets/defaultActividades.jpg";
import defaultEventos from "../assets/defaultEventos.jpg";
import defaultGastronomia from "../assets/defaultGastronomia.jpg";
import defaultHospedaje from "../assets/defaultHospedaje.jpg";

const targetTypeMap = {
  hospedaje: "place",
  gastronomia: "place", 
  actividades: "activity",
  eventos: "event",
};

export default function ItemCard({ 
  item, 
  seleccionado, 
  onSeleccionar, 
  categoriaActiva,
  isFavorite,
  sortBy
}) {
  const { titulo, precio, lugar, organizador, imagen, score} = item;
  
  const targetType = targetTypeMap[categoriaActiva];
  
  // Obtener el ID real del servicio del backend
  const getTargetId = () => {
    return item.service_id || 
           item.place_id || 
           item.event_id || 
           item.id; // Último recurso
  };

  let imagenAmukan = "";
  switch(categoriaActiva){
    case "gastronomia":
      imagenAmukan=defaultGastronomia;
        break;
          
    case "actividades":
      imagenAmukan=defaultActividades;
        break;
    case "eventos":
      imagenAmukan=defaultEventos;
        break;
    case "hospedaje":
      imagenAmukan=defaultHospedaje;
      break;

  }
  const targetId = getTargetId();
  
  return (
    <div
      onClick={onSeleccionar}
      className={`relative cursor-pointer p-4 w-full flex flex-row items-start gap-4 rounded border transition-all ${
        seleccionado ? "border-green-500 bg-green-50 shadow-lg" : "border-gray-300 bg-white"
      }`}
    >
      {/* Imagen a la izquierda */}
      <div className="w-32 h-32 bg-gray-300 rounded-md flex items-center justify-center shrink-0">
        {imagen ? (
          <img src={imagen} alt={titulo} className="w-full h-full object-cover rounded-md" />
        ) : (

          <img src={imagenAmukan} alt="Default" className="w-full h-full object-cover rounded-md" />
        )}
      </div>

      {/* Texto a la derecha */}
      <div className="flex-1 min-w-0 flex flex-col items-start text-left">
        <div className="w-full flex justify-between items-start">
          <h3 className="text-left text-sm sm:text-base md:text-lg font-semibold text-gray-800 leading-tight">
            {titulo}
          </h3>
          <div className="text-green-600 font-bold text-lg">
            {(precio >= 1 || categoriaActiva !== "gastronomia") && (
              <div className="text-left text-green-600 font-bold text-sm sm:text-base md:text-lg">
                {precio >= 1 ? `$${precio.toLocaleString()}` : "Gratis"}
              </div>
            )}
          </div>
        </div>

        {sortBy === 'default' && score > 0 && (
          <div className="mt-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-left text-xs sm:text-sm font-semibold">
            Relevancia: {(score * 100).toFixed(0)}%
          </div>
        )}

        {/* Organizador alineado a la izquierda */}
        <p className="text-left text-gray-700 text-xs sm:text-sm mt-1">
          {organizador}
        </p>

        {/* 
        <div className="mt-2 flex items-center gap-2 text-gray-600 text-sm">
          <span className="font-medium">Ubicación:</span> {lugar}
        </div>
        */}
        
        {/* USAR EL COMPONENTE BotonFavoritos en lugar del código duplicado */}
        <div className="my-3">
          <BotonFavoritos 
            targetType={targetType}
            targetId={targetId}
            isFavorite={isFavorite}
          />
        </div>
      </div>
    </div>
  );
}