import React, { useState, useEffect } from "react";
import { FaRegCircle, FaCheckCircle } from "react-icons/fa";

export default function ExperienciaPopup({ expandido, setExpandido, onExperienciasChange }) {
  const [experienciasSeleccionadas, setExperienciasSeleccionadas] = useState([]);

  const experienciasDisponibles = [
    "Aventura", "Relax", "Cultural", "Gastronómica", "Naturaleza", "Urbana"
  ];

  const toggleExperiencia = (experiencia) => {
    setExperienciasSeleccionadas(prev => {
      if (prev.includes(experiencia)) {
        return prev.filter(e => e !== experiencia);
      } else {
        return [...prev, experiencia];
      }
    });
  };

  // Emitir las experiencias seleccionadas cuando cambien
  useEffect(() => {
    if (onExperienciasChange) {
      onExperienciasChange(experienciasSeleccionadas);
    }
  }, [experienciasSeleccionadas, onExperienciasChange]);

  return (
    <div className="max-w-sm space-y-3 ml-1 md:ml-7">
      <div className="flex flex-wrap gap-2">
        {experienciasDisponibles.map((experiencia) => {
          const isSelected = experienciasSeleccionadas.includes(experiencia);
          return (
            <button
            key={experiencia}
            onClick={() => toggleExperiencia(experiencia)}
            className={`boton-categoria ${isSelected ? "activo" : ""}`}
          >
            {isSelected ? (
              <FaCheckCircle className="text-black" />
            ) : (
              <FaRegCircle className="text-gray-500" />
            )}
            {experiencia}
          </button>
          );
        })}
      </div>
      
      {experienciasSeleccionadas.length > 0 && (
        <div className="text-sm text-gray-600">
          Seleccionadas: {experienciasSeleccionadas.join(", ")}
        </div>
      )}
    </div>
  );
}