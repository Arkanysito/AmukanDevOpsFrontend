import React, { useState, useEffect, use } from "react";
import { useLocation } from "react-router-dom";
import Header from "../componentes/Header";
import FiltrosBusqueda from "../componentes/FiltrosBusqueda";
import FiltrosBotones from "../componentes/FiltrosBotones";
import ResultadosBusqueda from "../componentes/ResultadosBusqueda";
import Mapa from "../componentes/Mapa";
import ItinerarioBusqueda from "../componentes/ItinerarioBusqueda";
import PaqueteCard from "../componentes/PaqueteCard";
import { ImCross } from "react-icons/im";
import Breadcrumb from '../componentes/Breadcrumb';
import { FaBed, FaUtensils, FaCar } from "react-icons/fa";
import { LuFerrisWheel } from "react-icons/lu";
import { MdOutlineFestival } from "react-icons/md";
import ItemCard from "../componentes/ItemCard";
import PuntosCercanos from "../componentes/PuntosCercanos";
import api from "../utils/api";

const iconos = {
  hospedaje: <FaBed />,
  comida: <FaUtensils />,
  actividades: <LuFerrisWheel />,
  transporte: <FaCar />,
  eventos: <MdOutlineFestival />,
};

// Define qué tipo de recomendación pedir a la API
const recoTypeMap = {
  actividades: "place",
  gastronomia: "restaurant",
  eventos: "event",
};

const CercaMio = ({ datos }) => {
  const location = useLocation();
  

  const [filtroExpandido, setFiltroExpandido] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("gastronomia");
  const [coordenadas, setCoordenadas] = useState([]);
  const [items, setItems] = useState([]);
  const [coordenadasSeleccionadas, setCoordenadasSeleccionadas] = useState(null);
  const [panelExpandido, setPanelExpandido] = useState(false);
  
  // Necesario para saber si pedir recomendaciones
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  
  // Endpoints estándar (si no hay autenticación)
  const endpointMap = {
    actividades: `/destination/activities/`,
    gastronomia: `/destination/places/?type=restaurant`,
    eventos: `/destination/events`,
  };

  // Se ejecuta una vez al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/user/me/");
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);


  let nombreLugares;
  const fetchData = async () => {
        // Si hay endpoint, usar datos del backend
        if (categoriaActiva) {

          let endpoint = "";
          let isRecommendation = false;
          const recoType = recoTypeMap[categoriaActiva];

          // Usar recomendaciones si el usuario está autenticado
          if (isAuthenticated && recoType) {
              endpoint = `/recommendations/services/?type=${recoType}`;
              isRecommendation = true;
          } else {
              // Fallback a la lógica original si no está autenticado
              endpoint = endpointMap[categoriaActiva];
          }
          // --- Fin Lógica de Recomendaciones ---

          try {
            const response = await api.get(endpoint);
            
            // --- Parseo Condicional de Respuesta ---
            let resultData = [];
            if (isRecommendation) {
              // Recomendaciones devuelven un array directo
              resultData = response.data;
            } else {
              // Endpoints estándar devuelven {status: "ok", data: [...]}
              if (response.data.status === "ok") {
                resultData = response.data.data;
              }
            }
          
            const adaptados = resultData.map((item, index) => {
                const coordenadas = parseCoordinates(item.place_coordinates || item.coordinates);
                console.log(item.cover_image_url)
                return {
                  id: index + 1,
                  titulo: item.name,
                  precio: parseFloat(item.price) || 0,
                  lugar: coordenadas, // Puede ser null si no hay coordenadas válidas
                  organizador: item.organization_name || "Organizador no especificado",
                  imagen: item.cover_image_url,
                };
              }).filter(item => item.lugar !== null); // Filtrar items sin coordenadas válidas
  
              setItems(adaptados);
              
              
              //onItemsUpdate && onItemsUpdate(adaptados);
            
          } catch (error) {
            console.error("Error al obtener resultados: ", error);
            setItems([]);
            //onItemsUpdate && onItemsUpdate([]);
          }
          return;
        }
      };
  

  const parseCoordinates = (wkt) => {
        // POINT (lon lat)
    const match = wkt?.match(/POINT\s*\(\s*(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)\s*\)/i);
    if (!match) return null;
    const lon = parseFloat(match[1]);
    const lat = parseFloat(match[3]);
    
    // Validar que las coordenadas sean números válidos
    if (isNaN(lat) || isNaN(lon)) {
      console.log("Coordenadas inválidas:", lat, lon);
      return null;
    }
    
    return [lat, lon];
  };

  useEffect(()=>{
    fetchData()
  },[categoriaActiva, isAuthenticated]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb />
      <div className="flex flex-1 flex-col w-full h-full md:flex-row">

        <div className="hidden md:block md:w-[100%] lg:w-[100%] xl:w-[100%] relative">
          {/* Mapa */}
          <PuntosCercanos
            coordenadas={items}
            categoriaActiva={categoriaActiva}
            
          />
          <div className="absolute top-4 left-4 right-4 z-30">
                      <FiltrosBotones
                        categoriaActiva={categoriaActiva}
                        categoriasVisibles={["gastronomia", "actividades", "eventos"]}
                        setCategoriaActiva={setCategoriaActiva}
                      />
                    </div>
        </div>

        {/* Vista móvil */}
        <div className="md:hidden px-4 py-4 space-y-6">

          <div className="relative flex-1 w-full overflow-hidden z-10">
            <div className="relative w-full h-[70vh] overflow-hidden z-10">
              <PuntosCercanos
                coordenadas={items}
                categoriaActiva={categoriaActiva}
              />

              <div
                className={`absolute bottom-0 left-0 right-0 transition-all duration-300 overflow-hidden ${
                  panelExpandido ? "h-[340px] sm:h-[400px]" : "h-0"
                }`}
              >
                <div className="bg-white rounded-t-xl shadow-lg h-full flex flex-col">
                  {/* Línea interactiva */}
                  <div
                    className="flex justify-center items-center h-10 cursor-pointer"
                    onClick={() => setPanelExpandido(!panelExpandido)}
                  >
                    <div
                      className={`transition-all duration-300 rounded-full bg-gray-400 ${
                        panelExpandido ? "w-12 h-1.5" : "w-12 h-1.5"
                      }`}
                    />
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CercaMio;
