import React from "react";
import { FaSuitcase, FaBed, FaUtensils, FaCar} from "react-icons/fa";
import { LuFerrisWheel } from "react-icons/lu";
import { MdOutlineFestival } from "react-icons/md";

const categorias = [
  { id: "paquetes", label: "Paquetes", icon: <FaSuitcase /> },
  { id: "hospedaje", label: "Hospedaje", icon: <FaBed /> },
  { id: "gastronomia", label: "Gastronomía", icon: <FaUtensils /> },
  { id: "actividades", label: "Actividades", icon: <LuFerrisWheel  /> },
  { id: "eventos", label: "Eventos", icon: <MdOutlineFestival  /> },
];

export default function FiltrosBotones({ categoriaActiva, setCategoriaActiva, categoriasVisibles }) {
  const categoriasFiltradas = categorias.filter(cat => 
    !categoriasVisibles || categoriasVisibles.includes(cat.id)
  ); 

  return (
    <div
    id="filtroBotones"
    className="flex justify-start gap-x-4 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide scroll-px-4 xl:ml-50"

  >
    <div className="inline-flex gap-x-4 pb-2">
      {categoriasFiltradas.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategoriaActiva(cat.id)}
          className={`filtro-boton flex flex-row items-center gap-1 py-2
            ${categoriaActiva === cat.id ? "filtro-activo border-gray-500" : ""}
          `}
        >
          <div className="text-[14px] md:text-[13px] xl:text-[18px]">{cat.icon}</div>
          <span className="text-[10px] xl:text-[14px] font-medium">{cat.label}</span>
        </button>
      ))}
    </div>
  </div>
  );
}
