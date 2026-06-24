import { useState } from "react";
import { IoFilterSharp } from "react-icons/io5";

const FiltroItinerarios = ({ onFiltrar }) => {
  const [abierto, setAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState("Todos");

  const opciones = ["Activos", "Cancelados", "Pasados"];

  const manejarSeleccion = (opcion) => {
    setSeleccionado(opcion);
    setAbierto(false);
    onFiltrar(opcion.toLowerCase()); // comunica al padre
  };

  return (
    <div className="bg-white rounded-lg shadow-md w-full max-w-sm">
      {/* Encabezado */}
      <div
        className="flex justify-between items-center px-4 py-3 cursor-pointer border-b"
        onClick={() => setAbierto(!abierto)}
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-base font-semibold text-gray-800">Filtros</h2>
          <span className="text-gray-500 text-xl">
            <IoFilterSharp />
          </span>
        </div>
        <span className="text-sm text-gray-600">{seleccionado}</span>
      </div>

      {/* Dropdown */}
      {abierto && (
        <div className="px-4 py-2 space-y-1">
          {opciones.map((opcion) => (
            <button
              key={opcion}
              onClick={() => manejarSeleccion(opcion)}
              className={`w-full text-left px-2 py-1 boton-servicio ${
                seleccionado === opcion ? "bg-blue-50 font-semibold" : ""
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FiltroItinerarios;