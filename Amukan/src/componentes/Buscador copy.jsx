import React, { useState } from "react";
import BusquedaFondo from "../assets/BusquedaFondo.png";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import Carousel from "./CardHome";
import Header from "./Header";
import PopupBusqueda from "./PopupBusqueda";

function Buscador() {
  const hoy = new Date().toISOString().split("T")[0];

  const handleDesdeChange = (e) => {
    const nuevaDesde = e.target.value;
    setDesde(nuevaDesde);

    // Si la fecha "Hasta" es menor que la nueva "Desde", la ajustamos
    if (hasta < nuevaDesde) {
      setHasta(nuevaDesde);
    }
  };

  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [personas, setPersonas] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const navigate = useNavigate();

  const handleBuscar = async () => {
    try {
      const body = {
        destino,
        desde: `${desde}`,
        hasta: `${hasta}`,
        presupuesto: parseFloat(presupuesto),
        cantidad_personas: parseInt(personas),
      };

      const res = await api.post("/travel/preview-itinerary/", body);

      // Navegar a la página Busqueda con los datos
      navigate("/busqueda", { state: { itinerario: res.data } });
    } catch (err) {
      console.error("Error al buscar itinerario", err);
    }
  };

  return (
    <section className="relative  w-full">
      {/* Fondo con imagen */}
      
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BusquedaFondo})` }}
      >
        <div className="absolute inset-0 elemento-personalizado"></div>
      </div >

      <div className="relative z-10 pb-14">
        <Header/>
      </div>
      
      <div className="relative z-10 max-w-screen-xl mx-auto px-4">
        
        <div className="text-left">

          <h className="text-3xl sm:text-4xl md:text-6xl mb-10 text-white pb-6">
            Encuentra tu itinerario ideal<br />
            con nosotros en <span className="text-white font-bold">Amukan</span>
          </h>

    
          {/* Botón de búsqueda */}
          <div className="mt-6">
            <PopupBusqueda/>
          </div>
        </div>

        <div className="flex justify-end mt-10">
          <div className="w-[300px]">
            <Carousel />
          </div>
        </div>

      </div>
    </section>
  );
}

export default Buscador;