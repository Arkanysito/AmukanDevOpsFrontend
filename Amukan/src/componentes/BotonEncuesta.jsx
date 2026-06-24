import React, { useState } from 'react';
import { intereses } from '../assets/intereses';

function BotonEncuesta() {
  const [seleccionados, setSeleccionados] = useState([]);

  const toggleSeleccion = (label) => {
    setSeleccionados(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <section className="py-6 px-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {intereses.map(({ label, icono: Icon }) => {
          const activo = seleccionados.includes(label);
          return (
            <button
              key={label}
              onClick={() => toggleSeleccion(label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-colors duration-200
                ${activo 
                  ? '!bg-[#6E63CF] !text-white !border-[#6E63CF]' 
                  : '!bg-white !text-black !border-gray-300 hover:!bg-gray-100'}`}
            >
              <span className="text-xl"><Icon /></span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default BotonEncuesta;
