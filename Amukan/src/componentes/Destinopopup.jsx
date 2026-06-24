import React, { useState, useEffect } from "react";
import { LuMapPinHouse, LuMapPin  } from "react-icons/lu";

export default function SelectorOrigenDestino({ onDestinoChange }) {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("Viña del Mar");

  const intercambiar = () => {
    setOrigen(destino);
    setDestino(origen);
  };

  // Emitir el destino cuando cambie
  useEffect(() => {
    if (onDestinoChange) {
      onDestinoChange(destino);
    }
  }, [destino, onDestinoChange]);

  return (
    <div className="w-full max-w-sm ml-1 md:ml-7">
      {/* Vista móvil */}
      <div className="block md:hidden rounded-lg border border-black pt-1 px-4 font-sans bg-transparent">
        {/* ORIGEN */}
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-800 uppercase mb-1 block">ORIGEN</label>
          <div className="flex items-center gap-2">
            <LuMapPinHouse className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              placeholder="Ingresa desde dónde viajas"
              className="w-full px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
            />
          </div>
        </div>
  
        {/* Línea horizontal */}
        <hr className="my-4 border-gray-300" />
  
        {/* DESTINO fijo */}
        <div title="Único destino por ahora">
          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">DESTINO</label>
          <div className="flex items-center gap-2">
            <LuMapPin className="w-5 h-5 text-gray-400" />
            <div className="px-2 py-2 text-sm text-gray-400 w-full">
              Viña del Mar
            </div>
          </div>
        </div>
      </div>
  
      {/* Vista escritorio */}
      <div className="hidden md:block rounded-lg border border-black pt-1 pl-2 w-[400px] h-[60px] max-w-3xl mx-auto font-sans bg-transparent">
        <div className="relative flex items-start">
          {/* Línea vertical */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] h-[105%] w-[1px] bg-black z-0" />
  
          {/* ORIGEN */}
          <div className="flex-1 z-10 pr-6">
            <label className="text-xs font-bold text-gray-800 uppercase mb-1 block">ORIGEN</label>
            <div className="flex items-center gap-2">
              <LuMapPinHouse className="w-5 h-5 text-gray-600" />
              <input
                type="text"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                placeholder="Ingresa desde dónde viajas"
                className="w-full px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
              />
            </div>
          </div>
  
          {/* Botón intercambio (deshabilitado) */}
          <div className="z-20 flex-shrink-0">
            <button
              disabled
              className="boton-intercambio mt-3 cursor-not-allowed"
              style={{ lineHeight: 1 }}
            >
              <span className="text-xl text-gray-400 leading-none">⇄</span>
            </button>
          </div>
  
          {/* DESTINO */}
          <div className="flex-1 z-10 pl-6" title="Único destino por ahora">
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">DESTINO</label>
            <div className="flex items-center gap-2">
              <LuMapPin className="w-5 h-5 text-gray-400" />
              <div className="px-2 py-2 text-sm text-gray-400 w-full">
                Viña del Mar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}