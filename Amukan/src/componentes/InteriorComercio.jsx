import { useState, useEffect } from "react";
import { CgMenuGridO, CgMenu } from "react-icons/cg";
import { useAuth } from "../hooks/useAuth";
import HeaderDropdown from "./HeaderDropdown";
import { FaEllipsisV, FaPen, FaTrash, FaBed, FaUtensils, FaCoffee, FaGlassMartiniAlt, FaBeer, FaBullseye, FaTicketAlt, FaClipboardList } from "react-icons/fa";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../utils/api";
import BotonCrearServicioDropdown from "./BotonCrearServicio";

export function InteriorComercio() {
  const { user, isAuthenticated } = useAuth();
  
  // Obtenemos la lista de permisos directamente del hook useAuth
  const creationOptions = user?.creation_permissions || [];
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [vista, setVista] = useState("grid");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  
  // --- ESTADOS UNIFICADOS ---
  const [items, setItems] = useState([]); // Un solo estado para todo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los datos al montar
  useEffect(() => {
    if (isAuthenticated) {
      loadData(); // Carga todo
    }
    setOpenMenuIndex(null);
  }, [isAuthenticated]);

  // --- FUNCIÓN DE CARGA ÚNICA ---
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar ambos endpoints en paralelo
      const [servicesRes, eventsRes, placesRes] = await Promise.all([
        api.get("/experiences/services/"),
        api.get("/experiences/events/"),
        api.get("/location/list/"),
      ]);

      // Normalizar servicios
      const normalizedServices = (servicesRes.data.services || []).map(s => ({
        ...s,
        id: s.service_id,     // ID común
        itemType: 'service', // Tipo para lógica interna
      }));

      // Normalizar eventos
      const normalizedEvents = (eventsRes.data.events || []).map(e => ({
        ...e,
        id: e.event_id,       // ID común
        type: 'event',        // 'type' para mostrar (icono/etiqueta)
        itemType: 'event',  // Tipo para lógica interna
      }));

      const normalizedPlaces = (placesRes.data.places || []).map(p => ({
        ...p,
        id: p.place_id,         // ID común
        itemType: 'place',    // Tipo para lógica interna
        price: p.average_price, // Mapear average_price a price para la UI
        rating: p.rating,
      }));

      // Combinar ambas listas
      const allItems = [
        ...normalizedServices, 
        ...normalizedEvents,
        ...normalizedPlaces
      ];

      allItems.sort((a, b) => a.name.localeCompare(b.name));

      setItems(allItems);
    } catch (err) {
      console.error("Error cargando datos:", err);
      const errorMessage =
        err.response?.data?.detail || "Error al cargar publicaciones";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async (item) => {
  // Usamos los campos normalizados
  const id = item.id;
  const isEvent = item.itemType === 'event';
  const isPlace = item.itemType === 'place';

  let confirmMessage = ""; 
  if (isEvent) {
    confirmMessage = "¿Estás seguro de que quieres eliminar este evento?";
  } else if (isPlace) {
    confirmMessage = "¿Estás seguro de que quieres eliminar este lugar?"; 
  } else {
    confirmMessage = "¿Estás seguro de que quieres eliminar este servicio?";
  }

  const confirmResult = await Swal.fire({
    title: "Confirmar eliminación",
    text: confirmMessage,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirmResult.isConfirmed) {
    return;
  }

  try {
    if (isEvent) {
      await api.delete(`/experiences/events/${id}/delete/`);
    } else if (isPlace) {
      await api.delete(`/location/${id}/delete/`);
    } else {
      await api.delete(`/experiences/services/${item.type}/${id}/delete/`);
    }
    await loadData();

    Swal.fire({
      title: "Eliminado",
      text: "El elemento fue eliminado correctamente.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      title: "Error",
      text: err.response?.data?.detail || "Error al eliminar",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    console.error("Error deleting:", err);
  }
};


  const handleMenuToggle = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const formatPrice = (price, currency) => {
    if (price === null || price === undefined) return "Precio no especificado";
    
    const formatter = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency || 'CLP',
    });
    
    return formatter.format(price);
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      accommodation: "Alojamiento",
      //transport: "Transporte",
      activity: "Actividad",
      event: "Evento",
      // Places (Gastronomía)
      RESTAURANT: "Restaurante",
      CAFE: "Cafetería",
      BAR: "Bar",
      PUB: "Pub",
    };
    return labels[type] || type;
  };

  const getServiceIcon = (type, size = 24) => {
    const icons = {
      accommodation: <FaBed size={size} />,
      activity: <FaBullseye size={size} />,
      event: <FaTicketAlt size={size} />,
      RESTAURANT: <FaUtensils size={size} />,
      CAFE: <FaCoffee size={size} />,
      BAR: <FaGlassMartiniAlt size={size} />,
      PUB: <FaBeer size={size} />,
      default: <FaClipboardList size={size} />,
    };
    return icons[type] || icons.default;
  };

  if (loading) {
    return (
      <div className="flex flex-col bg-white rounded-[30px] pt-8 px-4 sm:px-6 h-screen w-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6E63CF]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-[30px] pt-20 sm:pt-8 px-4 sm:px-6 h-screen w-full max-w-[1700px] mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between w-full relative mb-4 gap-2">

        {/* Título centrado */}
        <p className="text-[#6E63CF] text-xl sm:text-2xl font-bold text-center flex-1 order-2 sm:order-none">
          Mi Comercio
        </p>

        {/* Usuario */}
        <div className="relative flex items-center order-3 sm:order-none">
          <div className="hidden sm:block">
            <HeaderDropdown user={user} isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-300 mb-2 text-sm font-semibold">
        <span
          className="pb-1 cursor-default text-black border-b-2 border-black"
        >
          Publicaciones
        </span>
      </div>

      {/* Botón de cambio de vista y contador */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600 text-sm">
          {items.length} publicaci{items.length !== 1 ? 'ones' : 'ón'} encontrada{items.length !== 1 ? 's' : ''}
        </p>
        <span
          onClick={() => setVista(vista === "grid" ? "list" : "grid")}
          className="flex items-center space-x-1 text-black font-semibold cursor-pointer hover:text-[#6E63CF] transition-colors"
        >
          <span>Vista {vista === "grid" ? "grid" : "lista"}</span>
          {vista === "grid" ? (
            <CgMenuGridO size={18} />
          ) : (
            <CgMenu size={18} />
          )}
        </span>
      </div>

      {/* Botón Agregar Servicio */}
      {/* le pasamos la lista de opciones desde el backend */}
      <BotonCrearServicioDropdown options={creationOptions} />

      {/* Contenido según vista */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
            <button
              onClick={loadData}
              className="ml-2 text-red-800 underline bg-transparent! hover:text-red-900"
            >
              Reintentar
            </button>
          </div>
        )}
        
        {/* --- MENSAJE DE VACÍO UNIFICADO --- */}
        {items.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <div className="text-6xl text-gray-400">
              <FaClipboardList />
            </div>
            <p className="text-lg text-center">No hay publicaciones creadas</p>
            <p className="text-sm text-center text-gray-400">
              Comienza agregando tu primer servicio o evento
            </p>
          </div>
        ) : vista === "grid" ? (
          // Vista GRID
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item, i) => {
              const isEvent = item.itemType === 'event';
              const isPlace = item.itemType === 'place';
              
              let editLink = '';
              if (isEvent) {
                editLink = `/editar-evento/${item.id}`;
              } else if (isPlace) {
                editLink = `/editar-lugar/${item.id}`;
              } else {
                editLink = `/editar-servicio/${item.type}/${item.id}`;
              }

              return (
                <div
                  key={item.id}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200  text-left"
                >
                  {(() => {
                    const coverUrl = item.cover_image_url || null;
                    return (
                      <div className="h-40 w-full overflow-hidden bg-gray-100">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Sin imagen
                          </div>
                        )}
                      </div>
                    );
                  })()}                      
                  <div className="absolute top-2 left-2">
                    <span className="bg-white text-[#6E63CF] text-xs px-2 py-1 rounded-full font-medium">
                      {getServiceTypeLabel(item.type)}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 ">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuToggle(i);
                      }}
                      className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors boton-crear"
                    >
                      <FaEllipsisV className="text-white" />
                    </button>
                    {openMenuIndex === i && (
                      <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg z-50 w-32 border border-gray-200">
                        <Link
                          to={editLink}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                        >
                          <FaPen size={12} />
                          <span>Editar</span>
                        </Link>
                        <button
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer w-full text-left btn-home"
                          onClick={() => handleDelete(item)}
                        >
                          <FaTrash size={12} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-3">                
                    <h3 className="font-semibold text-gray-800 truncate mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {item.description || "Sin descripción"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[#368f8b] font-semibold">
                        {formatPrice(item.price, item.price_currency)}
                      </span>
                      {item.rating && (
                        <span className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                          ⭐ {item.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Vista LISTA
          <div className="space-y-3">
            {items.map((item, i) => {
              const isEvent = item.itemType === 'event';
              const isPlace = item.itemType === 'place';
                
              let editLink = '';
              if (isEvent) {
                editLink = `/editar-evento/${item.id}`;
              } else if (isPlace) {
                editLink = `/editar-lugar/${item.id}`;
              } else {
                editLink = `/editar-servicio/${item.type}/${item.id}`;
              }
                
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-4 flex items-start gap-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 text-left"
                >
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-[#6E63CF] to-[#368f8b] rounded-lg flex items-center justify-center">
                    <span className="text-3xl text-white">{getServiceIcon(item.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mb-2">
                          {getServiceTypeLabel(item.type)}
                        </span>
                        <h3 className="font-semibold text-gray-800 truncate">
                          {item.name}
                        </h3>
                      </div>
                      {item.rating && (
                        <span className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                          ⭐ {item.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {item.description || "Sin descripción"}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuToggle(i);
                      }}
                      className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors boton-crear"
                    >
                      <FaEllipsisV />
                    </button>
                    {openMenuIndex === i && (
                      <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg z-50 w-32 border border-gray-200">
                        <Link
                          to={editLink}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                        >
                          <FaPen size={12} />
                          <span>Editar</span>
                        </Link>
                        <button
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer w-full text-left btn-home"
                          onClick={() => handleDelete(item)}
                        >
                          <FaTrash size={12} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}