import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaPlus, 
  FaHotel, 
  FaCar, 
  FaRunning, 
  FaCalendarAlt,
  FaLandmark
} from "react-icons/fa";

const ICONS = {
  "🎉": <FaCalendarAlt size={16} />,
  "🏨": <FaHotel size={16} />,
  "🎯": <FaRunning size={16} />,
  "📍": <FaLandmark size={16} />,
  "🚗": <FaCar size={16} />,
};

export default function BotonCrearServicioDropdown({ options }) {
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();

  const handleSeleccion = (link) => {
    navigate(link);
    setAbierto(false);
  };

  // Si el backend no envió opciones (o es una lista vacía), no renderizar nada.
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
      {/* Dropdown (renderiza las opciones recibidas) */}
      {abierto && (
        <div className="absolute bottom-16 right-0 w-56 bg-white shadow-lg rounded-md border border-gray-200 z-[1000]">
          <ul>
            {options.map((op) => (
              <li
                key={op.key}
                className="flex items-center gap-3 px-4 py-3 hover:bg-purple-100 cursor-pointer text-gray-800"
                onClick={() => handleSeleccion(op.link)}
              >
                {/* 2. Usar el mapeador de iconos */}
                {ICONS[op.icon] || <FaPlus size={16} />} 
                <p>{op.label}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-14 h-14 boton-crear rounded-full bg-[#368f8b] text-white shadow-lg hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#368f8b]/30 flex items-center justify-center transition-all duration-200"
        aria-label="Crear servicio"
        title="Crear servicio"
      >
        <FaPlus size={22} />
      </button>
    </div>
  );
}