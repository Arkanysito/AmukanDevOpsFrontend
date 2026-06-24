import React, { useState, useEffect } from "react";

export default function InputGroup({ onPresupuestoChange }) {
  const [presupuesto, setPresupuesto] = useState("");
  const [moneda, setMoneda] = useState("CLP");

  // Emitir el presupuesto cuando cambie
  useEffect(() => {
    if (onPresupuestoChange) {
      onPresupuestoChange(presupuesto);
    }
  }, [presupuesto, onPresupuestoChange]);

  const handlePresupuestoChange = (e) => {
    const valor = e.target.value;
    // Permitir solo números y punto decimal
    if (valor === '' || /^\d*\.?\d*$/.test(valor)) {
      setPresupuesto(valor);
    }
  };

  return (
    <div className="max-w-sm space-y-3 ml-1 md:ml-7">
      <div>
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute top-1/2 start-[60px] -translate-y-1/2 h-[100%] w-[1px] bg-black z-10" />
          
          {/* SELECT primero */}
          <div className="absolute inset-y-0 start-0 flex items-center text-gray-500 ps-2 z-20">
            <label htmlFor="hs-inline-leading-select-currency" className="sr-only">
              Currency
            </label>
            <select
              id="hs-inline-leading-select-currency"
              name="hs-inline-leading-select-currency"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              className="block border-transparent rounded-lg focus:ring-blue-600 focus:border-blue-600 text-gray-900 text-sm bg-transparent"
            >
              <option>CLP</option>
              <option>USD</option>
              <option>CAD</option>
              <option>EUR</option>
            </select>
          </div>

          {/* SÍMBOLO $ después del select */}
          <div className="absolute inset-y-0 start-16 flex items-center pointer-events-none z-20 ps-2">
            <span className="text-gray-500">$</span>
          </div>

          {/* INPUT al final */}
          <input
            type="text"
            id="hs-inline-leading-pricing-select-label"
            name="inline-add-on"
            value={presupuesto}
            onChange={handlePresupuestoChange}
            title="0 si no tienes"
            className="py-3 px-4 ps-24 pe-4 block w-full rounded-lg border border-black shadow-sm text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none text-gray-900 placeholder-gray-400 bg-transparent"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}