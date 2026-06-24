export default function ItinerarioBusqueda({ itinerarios = [] }) {
  console.log('Itinerarios recibidos:', itinerarios); // Para debug

  // Si itinerarios es un array de arrays, tomamos el primero
  const itinerariosData = Array.isArray(itinerarios) && itinerarios.length > 0 
    ? (Array.isArray(itinerarios[0]) ? itinerarios[0] : itinerarios)
    : [];

  // Función para formatear fechas
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Función para agrupar servicios por día
  const groupServicesByDay = (servicios) => {
    if (!servicios) return {};
    
    const grouped = {};
    
    // Procesar cada categoría de servicios
    Object.keys(servicios).forEach(categoria => {
      if (Array.isArray(servicios[categoria])) {
        servicios[categoria].forEach(servicio => {
          if (!servicio) return;
          
          const dia = servicio.dia || 1;
          if (!grouped[dia]) {
            grouped[dia] = {
              hospedaje: [],
              comida: [],
              actividades: [],
              eventos: [],
              transporte: []
            };
          }
          
          // Asignar a la categoría correspondiente
          if (categoria === 'comida') {
            grouped[dia].comida.push(servicio);
          } else if (categoria === 'actividades') {
            grouped[dia].actividades.push(servicio);
          } else if (categoria === 'eventos') {
            grouped[dia].eventos.push(servicio);
          } else if (categoria === 'hospedaje') {
            grouped[dia].hospedaje.push(servicio);
          } else if (categoria === 'transporte') {
            grouped[dia].transporte.push(servicio);
          }
        });
      }
    });
    
    return grouped;
  };

  // Función para obtener el ícono según el tipo de servicio
  const getServiceIcon = (tipo) => {
    const icons = {
      hospedaje: '🏨',
      comida: '🍽️',
      actividades: '🎯',
      eventos: '🎪',
      transporte: '🚗'
    };
    return icons[tipo] || '📍';
  };

  // Función para obtener el color según el tipo de servicio
  const getServiceColor = (tipo) => {
    const colors = {
      hospedaje: 'text-blue-600',
      comida: 'text-green-600',
      actividades: 'text-purple-600',
      eventos: 'text-orange-600',
      transporte: 'text-gray-600'
    };
    return colors[tipo] || 'text-gray-600';
  };

  // Función para renderizar un servicio individual
  const renderService = (servicio, tipo) => {
    if (!servicio) return null;

    const getTipoComidaText = (tipoComida) => {
      const tipos = {
        breakfast: 'Desayuno',
        lunch: 'Almuerzo',
        dinner: 'Cena'
      };
      return tipos[tipoComida] || tipoComida;
    };

    return (
      <div key={`${servicio.id}-${servicio.fecha}`} className="flex gap-x-3 relative group rounded-lg hover:bg-gray-50">
        <div className="relative last:after:hidden after:absolute after:top-0 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200">
          <div className="relative z-10 size-7 flex justify-center items-center">
            <div className="size-2 rounded-full bg-white border-2 border-gray-300 group-hover:border-gray-600" />
          </div>
        </div>
        <div className="grow p-2 pb-4">
          <div className="flex items-center gap-x-2">
            <span className={`text-sm ${getServiceColor(tipo)}`}>
              {getServiceIcon(tipo)}
            </span>
            <h3 className="flex gap-x-1.5 font-semibold text-gray-800">
              {servicio.nombre || 'Servicio sin nombre'}
            </h3>
            {servicio.costo > 0 && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                ${servicio.costo}
              </span>
            )}
          </div>
          
          {servicio.descripcion && (
            <p className="mt-1 text-sm text-gray-600">
              {servicio.descripcion}
            </p>
          )}
          
          {/* Información adicional específica por tipo */}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            {servicio.rating > 0 && (
              <span className="flex items-center">
                ⭐ {servicio.rating}
              </span>
            )}
            
            {servicio.duracion && (
              <span className="flex items-center">
                ⏱️ {servicio.duracion}h
              </span>
            )}
            
            {servicio.tipo_comida && (
              <span className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                {getTipoComidaText(servicio.tipo_comida)}
              </span>
            )}
            
            {servicio.fecha && (
              <span className="flex items-center">
                🕒 {new Date(servicio.fecha).toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Función para renderizar un día completo
  const renderDay = (dia, servicios, fechaInicio) => {
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + (dia - 1));
    
    const serviciosDelDia = servicios[dia] || {};
    const hasServices = Object.values(serviciosDelDia).some(arr => arr.length > 0);

    if (!hasServices) return null;

    return (
      <div key={`dia-${dia}`} className="mb-6">
        <div className="ps-2 my-4 first:mt-0">
          <h3 className="text-sm font-medium uppercase text-gray-500 bg-gray-100 px-3 py-1 rounded-lg inline-block">
            Día {dia} • {formatDate(fecha.toISOString())}
          </h3>
        </div>
        
        {/* Hospedaje */}
        {serviciosDelDia.hospedaje?.map(servicio => 
          renderService(servicio, 'hospedaje')
        )}
        
        {/* Comida */}
        {serviciosDelDia.comida?.map(servicio => 
          renderService(servicio, 'comida')
        )}
        
        {/* Actividades */}
        {serviciosDelDia.actividades?.map(servicio => 
          renderService(servicio, 'actividades')
        )}
        
        {/* Eventos */}
        {serviciosDelDia.eventos?.map(servicio => 
          renderService(servicio, 'eventos')
        )}
        
        {/* Transporte */}
        {serviciosDelDia.transporte?.map(servicio => 
          renderService(servicio, 'transporte')
        )}
      </div>
    );
  };

  // Función para renderizar un itinerario completo
  const renderItinerario = (itinerario, index) => {
    if (!itinerario || !itinerario.servicios) return null;

    const serviciosPorDia = groupServicesByDay(itinerario.servicios);
    const dias = Object.keys(serviciosPorDia).map(Number).sort((a, b) => a - b);
    
    // Encontrar una fecha de inicio (usar la primera fecha disponible)
    const fechaInicio = itinerario.servicios.hospedaje?.[0]?.fecha || 
                       itinerario.servicios.comida?.[0]?.fecha || 
                       '2025-10-06';

    return (
      <div key={itinerario.id || index} className="p-2 border border-gray-200 rounded-lg bg-white">
        {/* Header del itinerario */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-600 mt-1">
               {/*
              {itinerario.duracion || 'Duración no especificada'} • 
              {itinerario.cantidad_personas || 1} persona{itinerario.cantidad_personas !== 1 ? 's' : ''}
              */}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-600">
              ${(itinerario.precio || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              Presupuesto total
            </div>
          </div>
        </div>

        {/* Días del itinerario */}
        <div className="space-y-2">
          {dias.map(dia => renderDay(dia, serviciosPorDia, fechaInicio))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white w-full h-full text-black overflow-y-auto p-4 rounded-lg shadow-lg">
      {itinerariosData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay itinerarios disponibles</p>
          <p className="text-sm mt-2">Selecciona "Paquetes" en la búsqueda para ver los itinerarios generados</p>
        </div>
      ) : (
        itinerariosData.map(renderItinerario)
      )}
    </div>
  );
}