import { FaBed, FaUtensils, FaMapMarkedAlt, FaCar } from "react-icons/fa";
import { TbWorldPin } from "react-icons/tb";
import { LuFerrisWheel } from "react-icons/lu";
import { MdOutlineFestival } from "react-icons/md";
import BotonFavoritos from "./BotonFavoritos";
import { useEffect, useState } from "react";
import ItinerarioBusqueda from "./ItinerarioBusqueda";

const iconos = {
  hospedaje: <FaBed />,
  comida: <FaUtensils />,
  actividades: <LuFerrisWheel />,
  eventos: <MdOutlineFestival />,
};


function TarjetaServicio({ 
    titulo, 
    descripcion, 
    rating, 
    icono, 
    servicioTipo, 
    servicioId 
  }) {
  return (
    <div className="flex flex-col items-start bg-white rounded-lg shadow-md p-4 w-full max-w-sm">
      <div className="text-3xl text-gray-600 mb-2">{icono}</div>
      <h4 className="text-lg font-semibold text-gray-800 mb-1">{titulo}</h4>
      <p className="text-gray-600 text-sm mb-2">{descripcion}</p>
      <div className="text-yellow-500 font-medium text-sm">
        ⭐ {Number(rating || 0).toFixed(1)}
      </div>
      <div className="my-3">
        <BotonFavoritos 
          targetType={servicioTipo}
          targetId={servicioId}
        />
      </div>
    </div>
  );
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default function PaqueteCard({ paquete, seleccionado, onSeleccionar, onServicioSeleccionado }) {
  const { titulo, duracion, salida, llegada, precio, servicios } = paquete;
  const [servicioActivo, setServicioActivo] = useState(null);

  const serviciosVisuales = ["hospedaje", "comida", "actividades", "eventos"];

  // Mapeo de tipos de servicio a los que espera el backend
  const tipoServicioMap = {
    hospedaje: "place",
    comida: "place",
    actividades: "activity", 
    eventos: "event"
  };
  return (
    <div
      className={`border p-4 rounded cursor-pointer ${seleccionado ? "border-purple-600 bg-purple-50" : "border-gray-300"}`}
      onClick={onSeleccionar}
    >
      {/* Título y duración */}
      <div className=" row mt-2 flex items-start gap-2">
        <TbWorldPin className="h-6 w-6 text-gray-600 mt-1" />
        <div className="col-6">
          <h3 className="mt-2 text-base text-xs sm:text-sm md:text-lg font-semibold text-gray-800 leading-tight">{titulo}</h3>
          <p className="text-gray-500 text-sm mb-4">{duracion}</p>
        </div>
        <div className="col-6 text-right">
          <div className="text-xs sm:text-sm md:text-lg text-green-600 font-bold">
            ${precio.toLocaleString()}
          </div>
        </div>
      </div>
  
      {/* Salida y llegada */}
      <div className="flex justify-between text-gray-700 mb-2 text-xs sm:text-sm">
        <div>{salida}</div>
        <div>{llegada}</div>
      </div>
  
      {/* Servicios en horizontal */}
      <div className="mt-4 grid grid-cols-4 gap-3 text-gray-700 mr-7">
        {serviciosVisuales.map((servicio, idx) => {
          const estaVacio = !servicios?.[servicio] || servicios[servicio].length === 0;

          return (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (!estaVacio) {
                  setServicioActivo(servicioActivo === servicio ? null : servicio);
                }
              }}
              disabled={estaVacio}
              className={`boton-servicio ${servicioActivo === servicio ? "activo" : ""} ${
                estaVacio ? "opacity-40 cursor-not-allowed" : ""
              }`}
              title={estaVacio ? "Sin resultados disponibles" : ""}
            >
              {iconos[servicio]}
            </button>
          );
        })}
      </div>
  
      {/* Detalles expandidos si está seleccionado */}
      {servicioActivo && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {servicios?.[servicioActivo]?.map((item, idx) => (
            <TarjetaServicio
              key={`${servicioActivo}-${idx}`}
              titulo={item.nombre}
              descripcion={item.descripcion}
              rating={item.rating}
              icono={iconos[servicioActivo]}
              servicioTipo={tipoServicioMap[servicioActivo]}
              servicioId={item.id || item.service_id || item.place_id || item.event_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}