// Fechaspopup.jsx
import { MdOutlineDateRange } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { useState, useEffect } from "react";

export default function Fechaspopup({ onFechasChange, fechaDesdeActual, fechaHastaActual }) {
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentLocalDate = () => {
    const now = new Date();
    const año = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const dia = String(now.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  const hoy = getCurrentLocalDate();
  
  const calcularFechaMaxima = (fechaBase) => {
    const fecha = new Date(fechaBase);
    fecha.setDate(fecha.getDate() + 7);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  const [desde, setDesde] = useState(fechaDesdeActual || hoy);
  const [hasta, setHasta] = useState(fechaHastaActual || calcularFechaMaxima(hoy));
  const [fechaMaxima, setFechaMaxima] = useState(calcularFechaMaxima(hoy));
  const [fechasValidas, setFechasValidas] = useState(true);

  // Update maximum date and adjust "hasta" when "desde" changes
  useEffect(() => {
    const nuevaFechaMaxima = calcularFechaMaxima(desde);
    setFechaMaxima(nuevaFechaMaxima);
    
    // Always set "hasta" to exactly 2 weeks from "desde"
    setHasta(nuevaFechaMaxima);
  }, [desde]);

  // Verificar si las fechas son válidas
  useEffect(() => {
    const sonValidas = desde && hasta && desde <= hasta;
    setFechasValidas(sonValidas);
    
    if (onFechasChange) {
      onFechasChange(desde, hasta, sonValidas);
    }
  }, [desde, hasta, onFechasChange]);

  const handleDesdeChange = (e) => {
    const nuevaDesde = e.target.value;
    setDesde(nuevaDesde);
  };

  const handleHastaChange = (e) => {
    const nuevaHasta = e.target.value;
    
    // Allow user to select any date within the 2-week range
    if (nuevaHasta >= desde && nuevaHasta <= fechaMaxima) {
      setHasta(nuevaHasta);
    }
  };

  // Resetear fechas (simula el botón "borrar")
  const resetFechas = () => {
    setDesde("");
    setHasta("");
    setFechasValidas(false);
  };

  return (
<div className="w-full max-w-sm ml-1 md:ml-7">
  {/* Vista móvil */}
  <div className=" rounded-lg border border-black pt-1 px-4 font-sans bg-transparent">
    {/* DESDE */}
    <div className="mb-4">
      <label className="text-xs font-bold text-gray-800 uppercase mb-1 block">DESDE</label>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => document.getElementById("fecha-desde")?.showPicker()}
      >
        <MdOutlineDateRange className="w-5 h-5 text-gray-600" />
        <input
          type="date"
          id="fecha-desde"
          value={desde}
          onChange={handleDesdeChange}
          min={hoy}
          className="appearance-none w-full max-w-[120px] px-2 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
        />
        <IoIosArrowDown className="w-4 h-4 text-gray-600" />
      </div>
    </div>
    
 {/* Línea horizontal */}
 <hr className="my-4 border-gray-300 " />

    {/* HASTA */}
    <div>
      <label className="text-xs font-bold text-gray-800 uppercase mb-1 block">HASTA</label>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => document.getElementById("fecha-hasta")?.showPicker()}
      >
        <MdOutlineDateRange className="w-5 h-5 text-gray-600" />
        <input
          type="date"
          id="fecha-hasta"
          value={hasta}
          onChange={handleHastaChange}
          min={desde || hoy}
          max={fechaMaxima}
          className="appearance-none w-full max-w-[120px] px-2 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
        />
        <IoIosArrowDown className="w-4 h-4 text-gray-600" />
      </div>
    </div>
        {/* Mensaje de error */}
        {!fechasValidas && (
          <p className="text-red-500 text-xs mt-2">Selecciona una fecha válida</p>
        )}
      </div>
  
    </div>
  );
}