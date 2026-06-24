import { FaBed, FaUtensils, FaCoffee, FaPizzaSlice, FaIceCream, FaHotel, FaHome, FaUmbrellaBeach, FaGlassCheers } from "react-icons/fa";
import BotonFavoritos from "./BotonFavoritos"; // Importamos el mismo componente
import defaultActividades from "../assets/defaultActividades.jpg";
import defaultEventos from "../assets/defaultEventos.jpg";
import defaultGastronomia from "../assets/defaultGastronomia.jpg";
import defaultHospedaje from "../assets/defaultHospedaje.jpg";

// Mapeo de tipos a iconos y etiquetas
const MAPEO_TIPOS = {
  // Comida y Bebidas
  'restaurant': { icono: FaUtensils, label: 'Restaurante' },
  'cafe': { icono: FaCoffee, label: 'Café' },
  'bar': { icono: FaGlassCheers, label: 'Bar' },
  'fast_food': { icono: FaPizzaSlice, label: 'Comida Rápida' },
  'bakery': { icono: FaUtensils, label: 'Panadería' },
  'pub': { icono: FaGlassCheers, label: 'Pub' },
  'ice_cream': { icono: FaIceCream, label: 'Heladería' },
  
  // Alojamiento
  'hotel': { icono: FaHotel, label: 'Hotel' },
  'motel': { icono: FaBed, label: 'Motel' },
  'guest_house': { icono: FaHome, label: 'Casa de Huéspedes' },
  'hostel': { icono: FaBed, label: 'Hostal' },
  'apartment': { icono: FaHome, label: 'Apartamento' },
  'resort': { icono: FaUmbrellaBeach, label: 'Resort' },
  'bed_and_breakfast': { icono: FaBed, label: 'Bed & Breakfast' },
  'campsite': { icono: FaUmbrellaBeach, label: 'Campaing' },
};

const determinarTipoReal = (favorito) => {
  const { target_type, target_details } = favorito;
  
  // Si es un place, usar el place_type
  if (target_type === 'location.place') {
    const placeType = target_details?.place_type;
    return MAPEO_TIPOS[placeType] || { icono: FaUtensils, label: 'Lugar' };
  }
  
  // Si es un accommodation service
  if (target_type === 'experiences.accommodationservice') {
    const accType = target_details?.accommodation_type;
    return MAPEO_TIPOS[accType] || { icono: FaBed, label: 'Alojamiento' };
  }
  
  return { icono: FaUtensils, label: 'Lugar' };
};

// Función para obtener el targetType correcto para el BotonFavoritos
const obtenerTargetType = (favorito) => {
  const { target_type, target_details } = favorito;
  
  if (target_type === 'location.place') {
    return 'place';
  }
  if (target_type === 'experiences.accommodationservice') {
    return 'accommodation';
  }
  if (target_type === 'experiences.activityservice') {
    return 'activity';
  }
  if (target_type === 'experiences.event') {
    return 'event';
  }
  
  return 'place';
};

export default function CardFavorito({ favorito, onEliminar, isFavorite = true }) {
  const { user_fav_id, target_display_label, target_id } = favorito;
  
  const tipoInfo = determinarTipoReal(favorito);
  const { icono: Icono, label } = tipoInfo;
  const targetType = obtenerTargetType(favorito);
  const imagen = favorito.target_details?.cover_image_url || null;

  let imagenFallback = defaultGastronomia; // valor por defecto general

  const tipo = favorito.target_type;
  const placeType = favorito.target_details?.place_type;
  const accType = favorito.target_details?.accommodation_type;

  if (tipo === "experiences.activityservice") {
    imagenFallback = defaultActividades;
  } else if (tipo === "experiences.event") {
    imagenFallback = defaultEventos;
  } else if (tipo === "location.place") {
    if (["restaurant", "cafe", "bar", "fast_food", "bakery", "pub", "ice_cream"].includes(placeType)) {
      imagenFallback = defaultGastronomia;
    } else if (["hotel", "motel", "guest_house", "hostel", "apartment", "resort", "bed_and_breakfast", "campsite"].includes(placeType)) {
      imagenFallback = defaultHospedaje;
    } else {
      imagenFallback = defaultActividades;
    }
  } else if (tipo === "experiences.accommodationservice") {
    imagenFallback = defaultHospedaje;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="w-full h-40 bg-gray-200 rounded-t-2xl overflow-hidden">
          <img
            src={imagen || imagenFallback}
            alt={target_display_label}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header de la card */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-purple-600 bg-purple-50 p-3 rounded-xl">
            <Icono size={24} />
          </div>

          <div className="my-3">
            <BotonFavoritos 
              targetType={targetType}
              targetId={target_id}
              isFavorite={isFavorite}
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">
            {target_display_label}
          </h3>
          <p className="text-gray-500 text-sm">{label}</p>
        </div>
      </div>
      
      {/* Footer con botón de acción 
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button 
          onClick={() => {/* agregar navegación al detalle /}}
          className="w-full py-2 text-center text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors"
        >
          Ver detalles
        </button>
      </div>
      */}
    </div>
  );
}