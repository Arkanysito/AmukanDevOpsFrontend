import React, { useState } from "react";
import { IoFilterSharp } from "react-icons/io5";

export default function FiltroBusqueda({ abierto, setAbierto, onFiltroChange }) {
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(1000);
  const [servicios, setServicios] = useState(["hospedaje", "comida", "actividades", "transporte"]);
  const [valoresServicios, setValoresServicios] = useState({}); // ← NUEVO estado

  const toggleServicio = (nombre) => {
    setServicios((prev) =>
      prev.includes(nombre)
        ? prev.filter((s) => s !== nombre)
        : [...prev, nombre]
    );
  };

  const aplicarFiltros = () => {
    onFiltroChange({ precioMin, precioMax, servicios, valoresServicios });
    setAbierto(false); // ← Esto cierra el panel al aplicar
  };

  const [categoriaActiva, setCategoriaActiva] = useState("paquetes");

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Encabezado */}
      <div
        className="flex justify-between items-center px-4 py-3 cursor-pointer border-b"
        onClick={() => setAbierto(!abierto)}
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-base font-semibold text-gray-800">Filtros</h2>
          <span className="text-gray-500 text-xl"><IoFilterSharp /></span>
        </div>
      </div>

      {/* Contenido */}
      {abierto && (
        <div className="px-4 py-3 space-y-4">
          {/* Precio Máximo */}
          <div className="space-y-2">
            <label className="block text-left text-gray-600">Precio</label>
            <input
              type="range"
              min={0}
              max={100000}
              step={100}
              value={precioMin}
              onChange={(e) => setPrecioMin(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
            <div className="text-right text-sm text-gray-800 font-semibold">
              ${precioMin}
            </div>
          </div>

          {/* Servicios incluidos con campo numérico al estar seleccionados */}
          <div className="space-y-4">
  <label className="block text-left text-black font-medium">
    Servicios incluidos
  </label>

  {["hospedaje", "comida", "actividades", "transporte"].map((nombre) => {
    const isChecked = servicios.includes(nombre);
    const valor = valoresServicios[nombre] || "";

    return (
      <div key={nombre} className="space-y-2">
        {/* Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => toggleServicio(nombre)}
            className="accent-purple-600"
          />
          <span className="text-black capitalize">{nombre}</span>
        </div>

        {/* Campo numérico si está seleccionado */}
        {isChecked && (
          <div className="pl-6">
            <label className="block text-sm text-black mb-1">
              Valor para {nombre}
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) =>
                setValoresServicios((prev) => ({
                  ...prev,
                  [nombre]: Number(e.target.value),
                }))
              }
              className="w-full border rounded px-3 py-2 text-sm text-black"
              placeholder="Ej: 5000"
            />
          </div>
        )}
      </div>
    );
  })}
</div>

          {/* Botón aplicar */}
          <button
            onClick={() => {
              aplicarFiltros();     // Aplica los filtros
              setAbierto(false);    // Cierra el panel
            }}
            className="btn-login text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}