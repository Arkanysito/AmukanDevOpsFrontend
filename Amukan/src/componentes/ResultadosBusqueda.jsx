import React, { useState, useEffect } from "react";
import PaqueteCard from "./PaqueteCard";
import ItemCard from "./ItemCard";
import Paquetes from "../data/Paquetes.json";
import Gastronomia from "../data/Gastronomia.json";
import Actividades from "../data/Actividades.json";
import Hospedajes from "../data/Hospedajes.json";
import api from "../utils/api";

const endpointMap = {
  hospedaje: `/destination/accommodations/`,
  actividades: `/destination/activities/`, 
  gastronomia: `/destination/places/?type=restaurant`,
  eventos: `/destination/events`,
};

const recoTypeMap = {
  hospedaje: "accommodation",
  actividades: "place",
  gastronomia: "restaurant",
  eventos: "event",
};

const favoriteTypeMap = {
  hospedaje: "place",
  actividades: "place",
  gastronomia: "place",
  eventos: "event",
};

const apiBookingTypeMap = {
  'accommodationservice': 'accommodation',
  'activityservice': 'activity',
  'event': 'event',
  'place': 'place',
};

const localDataMap = {
  paquetes: Paquetes,
  hospedaje: Hospedajes,
  gastronomia: Gastronomia,
  actividades: Actividades,
};

export default function ResultadosBusqueda({
  categoriaActiva,
  onItemsUpdate,
  onSeleccionCard,
  itinerarios = [],
  onServicioSeleccionado,
  items: itemsFromParent,
  paqueteSeleccionado
}) {
  const [items, setItems] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  const [dataCache, setDataCache] = useState({});
  const [sortBy, setSortBy] = useState("default");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState(new Set()); 

  useEffect(() => {
    if (itemsFromParent && itemsFromParent.length > 0) {
      setItems(itemsFromParent);
    }
  }, [itemsFromParent]);

  useEffect(() => {
    if (paqueteSeleccionado) {
      setSeleccionado(paqueteSeleccionado.id);
    } else {
      setSeleccionado(null);
    }
  }, [paqueteSeleccionado]);


  const parseCoordinates = (wkt) => {
    const match = wkt?.match(/POINT\s*\(\s*(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)\s*\)/i);
    if (!match) return null;
    const lon = parseFloat(match[1]);
    const lat = parseFloat(match[3]);
    if (isNaN(lat) || isNaN(lon)) return null;
    return [lat, lon];
  };
  const firstCoordFromServicios = (servicios) => {
    if (!servicios) return null;
    const order = ["eventos", "actividades", "comida", "hospedaje", "transporte"];
    for (const key of order) {
      const arr = servicios[key] || servicios[key === "transporte" ? "transporte" : key];
      if (Array.isArray(arr)) {
        for (const it of arr) {
          const coord = parseCoordinates(it?.coordenadas);
          if (coord) return coord;
        }
      }
    }
    return null;
  };
  const adaptItinerariosToPaquetes = (arr) => {
    return arr.map((it, idx) => {
      const lugar = firstCoordFromServicios(it.servicios);
      return {
        id: idx + 1,
        titulo: it.titulo || "Itinerario",
        precio: Number(it.presupuesto) || 0,
        duracion: it.duracion || "",
        lugar: lugar,
        cantidad_personas: it.cantidad_personas,
        servicios: it.servicios,
        raw: it,
        backend_type: 'paquete',
      };
    });
  };
  const coordenadasItinerarios = (itinerarios) => {
    const coordenadas = [];
    const itinerariosArray = Array.isArray(itinerarios) ? itinerarios : [itinerarios];
    for (let itinerario of itinerariosArray) {
      if (!itinerario || !itinerario.servicios) continue;
      const servicios = itinerario.servicios;
      for (let categoria in servicios) {
        const lista = servicios[categoria] || [];
        for (let item of lista) {
          if (item && item.coordenadas) {
            const coord = parseCoordinates(item.coordenadas);
            if (coord) {
              coord.push(item.dia !== undefined ? item.dia : 1);
              coordenadas.push(coord);
            }
          }
        }
      }
    }
    return coordenadas;
  };
  const coordenadasItinerarioIndividual = (paquete) => {
    const coords = [];
    if (!paquete || !paquete.servicios) return coords;
    const servicios = paquete.servicios;
    for (let categoria in servicios) {
      const lista = servicios[categoria] || [];
      for (let item of lista) {
        if (item && item.coordenadas) {
          const coord = parseCoordinates(item.coordenadas);
          if (coord) {
            coord.push(item.dia !== undefined ? item.dia : 1);
            coords.push(coord);
          }
        }
      }
    }
    return coords;
  };

  useEffect(() => {
    setSeleccionado(null);
    setItems([]); 
    setSortBy("default");
    
    if (categoriaActiva === "paquetes" && Array.isArray(itinerarios) && itinerarios.length > 0) {
      const adaptados = adaptItinerariosToPaquetes(itinerarios[0]);
      const coordsItinerario = coordenadasItinerarios(adaptados);
      setItems(adaptados);
      const coordsConDia = coordsItinerario.map(coord => (Array.isArray(coord) && coord.length === 2) ? [...coord, 1] : coord);
      onItemsUpdate && onItemsUpdate(adaptados, coordsConDia);
      return;
    }
  }, [categoriaActiva, itinerarios, onItemsUpdate]); 


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await api.get("/user/me/");
        setIsAuthenticated(true);
        const favoriteType = favoriteTypeMap[categoriaActiva];
        if (favoriteType) {
          const response = await api.get(`/user/favorites/?target_type=${favoriteType}`);
          const favoriteIds = response.data.map(fav => fav.target_id); 
          setFavoriteItems(new Set(favoriteIds));
        } else {
          setFavoriteItems(new Set());
        }
      } catch (error) {
        setIsAuthenticated(false);
        setFavoriteItems(new Set());
      }
    };
    fetchUserData();
  }, [categoriaActiva]);


  useEffect(() => {
    if (categoriaActiva === "paquetes") return;

    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
          day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      } catch (error) {
        return dateString;
      }
    };

    const fetchData = async () => {
      const currentCategoryCache = dataCache[categoriaActiva] || {};

      if (currentCategoryCache[sortBy]) {
        console.log("Usando caché para:", categoriaActiva, sortBy);
        setItems(currentCategoryCache[sortBy]);
        onItemsUpdate && onItemsUpdate(currentCategoryCache[sortBy]);
        return;
      }

      console.log("Cache miss. Buscando en API para:", categoriaActiva, sortBy);
      
      let endpoint = "";
      let isRecommendation = false;
      const recoType = recoTypeMap[categoriaActiva];

      if (sortBy === "default" && isAuthenticated && recoType) {
        endpoint = `/recommendations/services/?type=${recoType}`;
        isRecommendation = true;
      } else {
        endpoint = endpointMap[categoriaActiva];
        if (endpoint) {
          if (sortBy === "price_asc") endpoint += (endpoint.includes("?") ? "&" : "?") + "ordering=price_asc";
          else if (sortBy === "price_desc") endpoint += (endpoint.includes("?") ? "&" : "?") + "ordering=price_desc";
        } else {
          const datosLocales = localDataMap[categoriaActiva] || [];
          setItems(datosLocales);
          onItemsUpdate && onItemsUpdate(datosLocales);
          return;
        }
      }
      
      try {
        const response = await api.get(endpoint);
        let resultData = [];

        if (isRecommendation) {
          resultData = response.data;
        } else {
          if (response.data.status === "ok") resultData = response.data.data;
          else resultData = [];
        }

        const adaptados = resultData.map((item, index) => {
          const coordenadas = parseCoordinates(item.place_coordinates || item.coordinates);
          
          let serviceId;
          if (item.service_id) serviceId = item.service_id;
          else if (item.place_id) serviceId = item.place_id;
          else if (item.event_id) serviceId = item.event_id;
          else serviceId = item.id || String(index + 1);

          let itemApiType;
          if (item.event_id) {
            itemApiType = 'event';
          } else {
            itemApiType = 'place'; 
          }

          const finalBackendType = apiBookingTypeMap[itemApiType] || null;

          
          return {
            id: serviceId,
            service_id: item.service_id,
            place_id: item.place_id,
            event_id: item.event_id,
            titulo: item.name,
            precio: parseFloat(item.price || item.average_price) || 0,
            lugar: coordenadas,
            organizador: item.organization_name || "Organizador no especificado",
            imagen: item.cover_image_url || null,
            descripcion: item.description || "",
            horario: item.horario || item.opening_hours || "",
            direccion: item.address || item.location || "",
            telefono: item.phone || item.contact_number || "",
            extra: item.extra_info || item.additional_info || "",
            tipo: item.type || "",
            rating: item.rating || 0,
            score: item.score || 0, 
            check_in: item.check_in_time || "",
            check_out: item.check_out_time || "",
            
            backend_type: finalBackendType,
            
            fecha_inicio: item.start_date || null,
            fecha_fin: item.end_date || null,
            
            fecha_inicio_formateada: formatDate(item.start_date) || "",
            fecha_fin_formateada: formatDate(item.end_date) || "",
          };
        }).filter(item => item.lugar !== null);

        setDataCache(prevCache => ({
          ...prevCache,
          [categoriaActiva]: {
            ...(prevCache[categoriaActiva] || {}),
            [sortBy]: adaptados, 
          }
        }));
        setItems(adaptados);
        onItemsUpdate && onItemsUpdate(adaptados);
        
      } catch (error) {
        console.error("Error al obtener resultados: ", error);
        setItems([]);
        onItemsUpdate && onItemsUpdate([]);
      }
    };

    fetchData();
  }, [categoriaActiva, sortBy, isAuthenticated, dataCache, onItemsUpdate]); 


  const renderItem = (item, index) => {
    const isSelected = seleccionado === item.id;

    const toggleSeleccion = () => {
      const nuevoSeleccionado = isSelected ? null : item.id;
      setSeleccionado(nuevoSeleccionado);
      if (nuevoSeleccionado === null) {
        if (categoriaActiva === "paquetes") {
            const coordsItinerario = coordenadasItinerarios(items);
            onItemsUpdate(items, coordsItinerario);
        } else {
            onItemsUpdate(items); 
        }
        onSeleccionCard?.(null);
      } else {
        if (categoriaActiva === "paquetes") {
          const coords = coordenadasItinerarioIndividual(item);
          onItemsUpdate(items, coords);
        } else {
          const coords = item.lugar ? [[...item.lugar, 1]] : [];
          onItemsUpdate(items, coords);
        }
        onSeleccionCard?.(item.id);
      }
    };

    const itemEsFavorito = favoriteItems.has(item.id);

    if (categoriaActiva === "paquetes") {
      return (
        <PaqueteCard
          key={`paquete-${item.id}-${index}`}
          paquete={item}
          seleccionado={isSelected}
          onSeleccionar={toggleSeleccion}
          onServicioSeleccionado={(servicio) => {
            onServicioSeleccionado?.(servicio, item);
          }}
          isFavorite={itemEsFavorito} 
        />
      );
    }
  
    return (
      <ItemCard
        key={`item-${item.id}-${index}`}
        item={item}
        seleccionado={isSelected}
        onSeleccionar={toggleSeleccion}
        categoriaActiva={categoriaActiva}
        isFavorite={itemEsFavorito}
        sortBy={sortBy}
      />
    );
  };

  return (
    <div className="-p-7">
      {/* Dropdown siempre visible en desktop, solo en el panel expandido en móvil */}
      <div className="my-4 sticky top-0 bg-white z-50 py-2">
        <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 mr-2">
          Ordenar por:
        </label>
        <select 
          id="sort-select"
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="text-gray-700 bg-white border-gray-300 rounded-md shadow-sm p-1 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          disabled={categoriaActiva === 'paquetes'} 
        >
          <option value="default">
            {isAuthenticated ? "Recomendado para ti" : "Mejor valorados"}
          </option>
          <option value="price_asc">Precio (más bajo primero)</option>
          <option value="price_desc">Precio (más alto primero)</option>
        </select>
      </div>

      <div className="grid gap-4">
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </div>
  );
}