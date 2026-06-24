import React, { useState } from "react";
import BotonEncuesta from '../componentes/BotonEncuesta';
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "../componentes/Popup.css";

export default function PopupEncuesta() {
  const navigate = useNavigate();

  const [popupEncuesta, setpopupEncuesta] = useState(false);

  const togglepopupEncuesta = () => {
    setpopupEncuesta(!popupEncuesta);
  };

  if (popupEncuesta) {
    document.body.classList.add('active-popupEncuesta');
  } else {
    document.body.classList.remove('active-popupEncuesta');
  }

  return (
    <>
       <button  
          onClick={togglepopupEncuesta}
          className="z-10 text-white px-4 py-2 rounded transition-colors duration-300 flex items-center min-w-[160px] mt-5 mx-auto relative">
                  <FaMagnifyingGlass className="text-xl mr-2" />
                  Buscar
        </button>

      {popupEncuesta && (
        <div className="popupEncuesta">
          <div onClick={togglepopupEncuesta} className="z-10 overlay"></div>
          <div className="absolute z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 popupEncuesta-content">
            <div className="bg-white p-6 rounded-lg shadow-md popupEncuesta-content">
              <h2 className="text-2xl font-bold text-center mb-4">¿Qué te gusta?</h2>
              <p className="text-center text-gray-500 mb-6 popupEncuesta-content">
                Cuéntanos qué te interesa para mostrarte mejores opciones
              </p>
              <BotonEncuesta />
              <button
                className="close-popupEncuesta"
                onClick={() => {
                  togglepopupEncuesta();
                  navigate("/busqueda");
                }}
              >
                Guardar
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}