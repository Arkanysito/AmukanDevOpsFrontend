import React, { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import PasoDos from "./PopupDos.jsx"; 


export default function BusquedaPopup() {
  const [modal, setModal] = useState(false);
  const [paso, setPaso] = useState(1);

  const toggleModal = () => {
    setModal(!modal);
    setPaso(1);
  };

  useEffect(() => {
    if (modal) {
      document.body.classList.add("active-modal");
    } else {
      document.body.classList.remove("active-modal");
    }
  }, [modal]);

  return (
    <>
      {/* Botón de búsqueda */}
      <div className="mt-6">
        <button
          onClick={toggleModal}
          className="px-6 py-3 boton-personalizado flex items-center gap-2"
        >
          Explorar aquí
          <FaPaperPlane />
        </button>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            {paso === 1 && (
              <>
                <h3 className="text-lg mb-4 text-gray-800 text-left">
                  Diseñamos tu experiencia ideal
                </h3>

                <hr className="my-4 border-gray-300 w-full" />

                {/* Selector de tipo de exploración */}
                <div className="mt-6">
                  <PasoDos onClose={toggleModal} />     
                </div>

              </>
            )}

            {/* Botón cerrar */}
            <button
              className="close-modal boton-servicio mt-2"
              onClick={toggleModal}
            >
              <ImCross />
            </button>
          </div>
        </div>
      )}
    </>
  );
}