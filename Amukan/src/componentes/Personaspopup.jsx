import React, { useState, useEffect } from "react";
import { FaUser, FaChild } from "react-icons/fa";

export default function PersonasPopup({
  habitaciones,
  setHabitaciones,
  setExpandido,
  onPersonasChange
}) {
  const actualizarHabitacion = (index, campo, valor) => {
    const nuevas = [...habitaciones];
    nuevas[index][campo] = parseInt(valor);
    setHabitaciones(nuevas);
  };

  const agregarHabitacion = () => {
    setHabitaciones([...habitaciones, { adultos: 1, niños: 0 }]);
    setExpandido(true);
  };

  const eliminarHabitacion = (index) => {
    const nuevas = habitaciones.filter((_, i) => i !== index);
    setHabitaciones(nuevas);
  };

  // Calcular total de personas y emitir al padre
  useEffect(() => {
    const totalPersonas = habitaciones.reduce((total, habitacion) => {
      return total + (habitacion.adultos || 0) + (habitacion.niños || 0);
    }, 0);

    if (onPersonasChange) {
      onPersonasChange(totalPersonas);
    }
  }, [habitaciones, onPersonasChange]);

  return (
    <div className="max-w-sm space-y-3 ml-1 md:ml-7">
      {habitaciones.map((habitacion, index) => (
        <div key={index}>
          {/* Línea divisoria entre habitaciones */}
          {index > 0 && (
            <div className="border-t border-gray-300 my-4 w-full" />
          )}

          <div className="rounded-lg ">
            <div className="flex justify-between items-center mb-2">
{/*  
              <span className="text-sm font-normal">
                Habitación {index + 1}
              </span>
*/}
              {index > 0 && (
                <button
                  onClick={() => eliminarHabitacion(index)}
                  className="boton-popupback"
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="flex gap-4">
              {/* Adultos */}
              <div className="border rounded-lg h-15 w-40 flex flex-col text-sm px-1 py-2 pl-2">
                <label className="text-xs font-bold text-gray-800 uppercase mb-1 block">ADULTOS</label>
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-500 text-sm" />
                  <select
                    value={habitacion.adultos}
                    onChange={(e) =>
                      actualizarHabitacion(index, "adultos", e.target.value)
                    }
                    className="px-2 py-1 text-sm w-full"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Niños */}
              <div className="border rounded-lg h-15 w-40 flex flex-col text-sm px-2 py-2 pl-2 mx-5 ">
                <label className="text-xs font-bold text-gray-800 uppercase mb-1 block">NIÑOS</label>
                <div className="flex items-center gap-2">
                  <FaChild className="text-gray-500 text-sm" />
                  <select
                    value={habitacion.niños}
                    onChange={(e) =>
                      actualizarHabitacion(index, "niños", e.target.value)
                    }
                    className="px-2 py-1 text-sm w-full"
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
{/* 
      <span
        className="text-sm text-blue-600 hover:underline cursor-pointer"
        onClick={agregarHabitacion}
      >
        Añadir habitación...
      </span>
*/}
      {/* Mostrar total de personas (opcional) */}
      <div className="mt-2 text-sm text-gray-600">
        Total personas: {habitaciones.reduce((total, hab) => total + (hab.adultos || 0) + (hab.niños || 0), 0)}
      </div>
    </div>
  );
}