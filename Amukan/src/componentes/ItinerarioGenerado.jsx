import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaTicketAlt, FaCalendarTimes, FaClock } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../utils/api';
import { ImCross } from "react-icons/im";

// Componente Mapa seguro con fallback
const MapaSeguro = ({ coordenadas, altura = "400px" }) => {
  const [MapaComponent, setMapaComponent] = useState(null);
  const [errorMapa, setErrorMapa] = useState(false);

  useEffect(() => {
    const cargarMapa = async () => {
      try {
        console.log('🗺️ Cargando componente Mapa MapLibre...');
        // Importar el componente Mapa existente
        const modulo = await import('./Mapa');
        setMapaComponent(() => modulo.default);
        console.log('✅ Componente Mapa MapLibre cargado exitosamente');
      } catch (error) {
        console.error('❌ Error cargando el mapa MapLibre:', error);
        setErrorMapa(true);
      }
    };

    cargarMapa();
  }, []);

  if (errorMapa) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-100 rounded-lg">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="font-semibold">Mapa no disponible</p>
        <p className="text-sm mt-1">Error al cargar el componente del mapa</p>
      </div>
    );
  }

  if (!MapaComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-lg mb-2">Cargando mapa...</div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6E63CF] mx-auto"></div>
        </div>
      </div>
    );
  }

  console.log('🎯 Renderizando Mapa MapLibre con coordenadas:', coordenadas);
  
  // Pasar las coordenadas en el formato que espera tu Mapa
  return (
    <div style={{ height: altura }}>
      <MapaComponent 
        coordenadas={coordenadas}
        coordenadasSeleccionadas={null}
        categoriaActiva="paquetes"
      />
    </div>
  );
};

// --- helper para el badge de estado ---
const StatusBadge = ({ status }) => {
  // 'status' viene de la API (ej. "Confirmada", "No Reservado", "No Aplicable")
  if (!status || status === 'No Aplicable') {
    return null; // No mostrar nada si no es reservable (ej. un 'Place')
  }

  let icon, text, color;
  
  switch (status.toLowerCase()) {
    case 'confirmada':
      icon = <FaTicketAlt />;
      text = 'Reservado';
      color = 'bg-green-100 text-green-700';
      break;
    case 'pendiente':
      icon = <FaClock />;
      text = 'Reserva Pendiente';
      color = 'bg-yellow-100 text-yellow-700';
      break;
    case 'cancelada':
    case 'rechazada':
      icon = <FaCalendarTimes />;
      text = 'Reserva Cancelada';
      color = 'bg-red-100 text-red-700';
      break;
    case 'no reservado':
      icon = <FaCalendarTimes />;
      text = 'No Reservado';
      color = 'bg-gray-100 text-gray-600';
      break;
    default:
      return null;
  }

  return (
    <div className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 mt-2 w-fit ${color}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};


export default function ItinerarioGenerado() {
  const location = useLocation();
  const navigate = useNavigate();
  const [itinerario, setItinerario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Obtener itinerario de la navegación o cargar por ID
  useEffect(() => {
    const cargarItinerario = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const itinerarioFromState = location.state?.itinerario;
        console.log('📦 Itinerario recibido del state:', itinerarioFromState);
        
        if (itinerarioFromState) {
          setItinerario(itinerarioFromState);
        } else {
          // Intentar cargar por ID de la URL si no viene en el state
          const urlParams = new URLSearchParams(location.search);
          const itineraryId = urlParams.get('id');
          
          if (itineraryId) {
            console.log('🔄 Cargando itinerario por ID:', itineraryId);
            const response = await api.get(`/travel/itinerary/${itineraryId}/`);
            setItinerario(response.data);
          } else {
            setError('No se proporcionó un itinerario para mostrar');
          }
        }
      } catch (err) {
        console.error('❌ Error cargando itinerario:', err);
        setError('Error al cargar el itinerario: ' + (err.message || 'Error desconocido'));
      } finally {
        setCargando(false);
      }
    };

    cargarItinerario();
  }, [location]);

  const organizarItinerarioPorDias = (items) => {
    if (!items || !Array.isArray(items)) {
      console.warn('⚠️ Items no válidos para organizar:', items);
      return [];
    }
    
    console.log('📦 Organizando items:', items);
    
    // Agrupar items por día
    const itemsPorDia = {};
    
    items.forEach((item, index) => {
      try {
        let fecha;
        
        // Manejar diferentes formatos de fecha
        if (item.scheduled_date) {
          fecha = new Date(item.scheduled_date);
        } else if (item.fecha) {
          fecha = new Date(item.fecha);
        } else {
          console.warn(`⚠️ Item ${index} sin fecha:`, item);
          return; // Saltar items sin fecha
        }
        
        // Validar que la fecha es válida
        if (isNaN(fecha.getTime())) {
          console.warn(`⚠️ Fecha inválida en item ${index}:`, item.scheduled_date || item.fecha);
          return;
        }
        
        const diaKey = fecha.toDateString();
        
        if (!itemsPorDia[diaKey]) {
          itemsPorDia[diaKey] = [];
        }
        
        itemsPorDia[diaKey].push({
          ...item,
          hora: fecha.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          fechaOriginal: fecha
        });
        
      } catch (err) {
        console.error(`❌ Error procesando item ${index}:`, err, item);
      }
    });
    
    // Convertir a array y formatear
    const diasOrganizados = Object.entries(itemsPorDia).map(([diaKey, actividades], index) => {
      const fecha = new Date(diaKey);
      
      // Ordenar actividades por hora
      const actividadesOrdenadas = actividades.sort((a, b) => 
        a.fechaOriginal - b.fechaOriginal
      );
      
      return {
        fecha: fecha.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'long',
          year: 'numeric'
        }),
        fechaCompleta: fecha,
        bloques: {
          mañana: actividadesOrdenadas.filter(act => {
            const hora = act.fechaOriginal.getHours();
            return hora >= 6 && hora < 12;
          }),
          tarde: actividadesOrdenadas.filter(act => {
            const hora = act.fechaOriginal.getHours();
            return hora >= 12 && hora < 18;
          }),
          noche: actividadesOrdenadas.filter(act => {
            const hora = act.fechaOriginal.getHours();
            return hora >= 18 || hora < 6;
          })
        }
      };
    }).sort((a, b) => a.fechaCompleta - b.fechaCompleta);
    
    console.log('📅 Días organizados:', diasOrganizados);
    return diasOrganizados;
  };

  // En ItinerarioGenerado.jsx - mejorar obtenerDireccion
  const obtenerDireccion = (item) => {
    // Si el serializer ya proporciona una dirección, usarla
    if (item.direccion && item.direccion !== 'Ubicación no disponible') {
        return item.direccion;
    }
    
    // Si tenemos coordenadas, mostrar coordenadas
    if (item.coordenadas) {
        const lat = item.coordenadas.lat?.toFixed(6) || 'N/A';
        const lng = item.coordenadas.lng?.toFixed(6) || 'N/A';
        return `Coordenadas: ${lat}, ${lng}`;
    }
    
    // Para servicios temporales
    if (item.service_name && item.service_name.includes('Temporal')) {
        return 'Ubicación por confirmar';
    }
    
    // Fallback
    return item.service_name ? 
        `${item.service_name} - Ubicación no disponible` : 
        'Ubicación no disponible';
  };

  // Función para obtener coordenadas de los items (para el mapa)
    const obtenerCoordenadasParaMapa = () => {
    if (!itinerario?.items || !Array.isArray(itinerario.items)) {
      console.log('❌ No hay items para procesar');
      return [];
    }
    
    console.log('📍 Procesando items para mapa MapLibre:', itinerario.items);
    
    const coordenadasAdaptadas = itinerario.items
      .map((item, index) => {
            // Validar que el item tenga coordenadas
        const coordenadas = item.coordenadas;
        const esValido = coordenadas && 
                         typeof coordenadas.lat === 'number' && 
                         typeof coordenadas.lng === 'number' &&
                         !isNaN(coordenadas.lat) && 
                         !isNaN(coordenadas.lng);
        
        if (!esValido) {
          console.log(`❌ Item ${index} sin coordenadas válidas:`, item.service_name);
          return null;
        }
        
            // Calcular el día basado en la fecha programada
        let dia = 1;
        if (item.scheduled_date) {
          const fecha = new Date(item.scheduled_date);
          // Si tenemos múltiples días, calcular el día relativo
          if (dias && dias.length > 0 && dias[0].fechaCompleta) {
            const primerDia = dias[0].fechaCompleta;
            const diffTiempo = fecha.setHours(0,0,0,0) - primerDia.setHours(0,0,0,0);
            const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));
            dia = diffDias + 1;
          }
        }
        
        console.log(`✅ Item ${index} adaptado:`, {
          nombre: item.service_name,
          lat: coordenadas.lat,
          lng: coordenadas.lng,
          dia: dia
        });
        
        return [
          parseFloat(coordenadas.lat),
          parseFloat(coordenadas.lng),
          dia
        ];
      })
      .filter(item => item !== null);
    
    console.log('📍 Coordenadas adaptadas para MapLibre:', coordenadasAdaptadas);
    return coordenadasAdaptadas;
  };

  // Calcular costo total
  const calcularCostoTotal = () => {
    if (!itinerario?.items || !Array.isArray(itinerario.items)) return 0;
    
    return itinerario.items.reduce((sum, item) => {
      const costo = parseFloat(item.estimated_cost) || 0;
      return sum + costo;
    }, 0);
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-2">Cargando itinerario...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6E63CF] mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error}</div>
            <button 
              onClick={() => navigate("/misitinerarios")}
              className="py-2 px-6 btn-login rounded-lg"
            >
              Volver a Mis Itinerarios
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerario) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-4">Itinerario no encontrado</div>
            <button 
              onClick={() => navigate("/misitinerarios")}
              className="py-2 px-6 btn-login rounded-lg"
            >
              Volver a Mis Itinerarios
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Lógica de renderizado ---
  // Organizamos los días ANTES de calcular las coordenadas del mapa
  const dias = organizarItinerarioPorDias(itinerario.items);
  const coordenadasMapa = obtenerCoordenadasParaMapa(dias); // Pasamos 'dias' como argumento
  const costoTotal = calcularCostoTotal();

  console.log('🎯 Itinerario renderizado:', itinerario);
  console.log('📅 Días a mostrar:', dias);
  console.log('📍 Coordenadas mapa:', coordenadasMapa);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Línea morada al borde izquierdo */}

      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl relative my-6">
          {/* Botón de cierre en esquina superior derecha */}
          <button
            onClick={() => navigate("/misitinerarios")}
            className="absolute top-4 right-4 boton-servicio mt-2 "
          >
            <ImCross />
          </button>

          {/* Título */}
          <h2 className="text-2xl md:text-4xl  font-bold text-[#6E63CF] text-left mb-2 mr-4">
            {itinerario.name || 'Itinerario sin nombre'}
          </h2>
          <p className="text-left mb-2 text-gray-600">
            {dias.length > 0 ? `${dias.length} días` : 'Duración no especificada'}
          </p>

          <div className="h-px bg-gray-300 w-full my-4" />

          {/* Información del itinerario */}
          <div className="border border-gray-200 rounded-lg bg-gray-50 p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2 text-left">
                <div>
                  <span className="font-semibold text-[#6E63CF]">Itinerario ID:</span> {itinerario.itinerary_id}
                </div>
                <div>
                  <span className="font-semibold text-[#6E63CF]">Creado:</span> {itinerario.created_at ? 
                    new Date(itinerario.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                </div>
                <div>
                  <span className="font-semibold text-[#6E63CF]">Estado:</span> 
                  <span className={`ml-1 ${itinerario.is_shared ? 'text-green-600' : 'text-blue-600'}`}>
                    {itinerario.is_shared ? 'Compartido' : 'Privado'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <div>
                  <span className="font-semibold text-[#6E63CF]">Actividades:</span> {itinerario.items?.length || 0}
                </div>
                <div>
                  <span className="font-semibold text-[#6E63CF]">Colaboradores:</span> {itinerario.collaborators?.length || 1}
                </div>
              </div>
            </div>
          </div>

          {/* Actividades por día */}
          {dias.length > 0 ? (
            dias.map((dia, index) => (
              <div key={index} className="mb-8 grid grid-cols-12 gap-4 items-start">
                {/* Columna izquierda: DÍA */}
                <div className="col-span-12 sm:col-span-3 flex justify-start">
                  <div className="px-4 py-2 text-[#6E63CF] font-bold text-lg">
                    <h3 className="text-2xl md:text-4xl">DÍA {index + 1}</h3>
                  </div>
                  <div className="hidden sm:block col-span-12 sm:col-span-0 flex justify-center">
                    <div className="w-px h-auto bg-gray-300 min-h-[200px]" />
                  </div>
                </div>

                {/* Columna derecha: contenido del día */}
                <div className="col-span-12 sm:col-span-9">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 text-left">
                    {dia.fecha}
                  </h2>

                  {Object.entries(dia.bloques).map(([bloque, actividades]) => (
                    actividades.length > 0 && (
                      <div key={bloque} className="mb-4">
                        <h3 className="text-md font-semibold text-[#6E63CF] capitalize mb-2 text-left">
                          {bloque}
                        </h3>
                        <ul className="space-y-3">
                          {actividades.map((item, i) => (
                            <li key={i} className="text-left text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex gap-2 items-start">
                                <span className="font-medium w-[60px] text-sm bg-[#6E63CF] text-white py-1 px-2 rounded text-center">
                                  {item.hora}
                                </span>
                                <div className="flex-1">
                                  <span className="font-semibold">{item.service_name || 'Actividad sin nombre'}</span>
                                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                    <FaMapMarkerAlt className="text-[#6E63CF] flex-shrink-0" />
                                    <span>{obtenerDireccion(item)}</span>
                                  </div>
                                  
                                  {/* Muestra el estado de la reserva del item */}
                                  <StatusBadge status={item.booking_status} />

                                  {item.estimated_cost > 0 && (
                                    <div className="text-xs text-green-600 mt-2">
                                      Costo estimado: ${parseFloat(item.estimated_cost).toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  ))}
                </div>
                {index < dias.length - 1 && (
                  <div className="col-span-12 h-px bg-gray-300 my-4" />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay actividades programadas en este itinerario</p>
            </div>
          )}

          {/* Mapa con leyenda flotante */}
          <div className="relative mt-10 w-full h-[400px] bg-gray-200 rounded-lg overflow-hidden">
            

            {/* Mapa seguro con fallback */}
            <MapaSeguro 
              coordenadas={coordenadasMapa}
              altura="400px"
            />
          </div>

          {/* Resumen del itinerario */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-[#6E63CF] mb-3">Resumen del Itinerario</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-700">Total Actividades</div>
                <div className="text-2xl font-bold text-[#6E63CF]">{itinerario.items?.length || 0}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-700">Días</div>
                <div className="text-2xl font-bold text-[#6E63CF]">{dias.length}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-700">Costo Estimado</div>
                <div className="text-2xl font-bold text-[#6E63CF]">
                  ${costoTotal.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-700">Estado</div>
                <div className={`text-lg font-bold ${itinerario.is_shared ? 'text-green-600' : 'text-blue-600'}`}>
                  {itinerario.is_shared ? 'Compartido' : 'Privado'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}