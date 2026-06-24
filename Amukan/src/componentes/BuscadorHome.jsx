import React, { useState } from "react";
import BusquedaFondo from "../assets/BusquedaFondo.png";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import Carousel from "./CardHome";
import Header from "./Header";
import PopupBusqueda from "./PopupBusqueda";
import { useAuth } from "../context/AuthContext";

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
  const { isAuthenticated, loading } = useAuth();
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
    <section className="relative w-full min-h-[400px] pb-5">
      {/* Fondo con imagen */}
      
      <div
        className="absolute inset-0 bg-cover bg-purple-400/20 bg-center bg-no-repeat h-full"
        style={{ backgroundImage: `url(${BusquedaFondo})` }}
      >
        <div className="absolute inset-0 elemento-personalizado"></div>
      </div>

      <div className="relative z-[9999] pb-14  mb-10">
        <div className="fixed top-0 left-0 w-full z-[999] bg-[#6E63CF]/30 backdrop-blur-sm">
          <Header />
        </div>
      </div>
      
      <div className="relative z-10 justify-center sm:justify-end ml-10 md:ml-30 md:mr-30">
        
        <div className="text-left">

        <h className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-10 text-white pb-9">
          Encuentra tu itinerario ideal<br />
          con nosotros en <span className="text-white font-bold">Amukan</span>
        </h>
    
          {/* Botón de búsqueda */}
          <div className="mt-10">
            <PopupBusqueda/>
          </div>
        </div>

        {!loading && isAuthenticated && (
          <div className="flex justify-center sm:justify-end mt-30 ">
            <div className="
              w-[350px] 
              sm:w-[430px] 
              md:w-[500px] 
              lg:w-[500px] 
              xl:w-[500px]
            ">
              <Carousel />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default Buscador;