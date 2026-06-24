import React from "react";

export default function ItinerarioPuntual({ lugares, categoria }) {
  if (!lugares || lugares.length === 0) {
    return (
      <p className="text-gray-500 text-sm p-4 text-center bg-gray-50 rounded-xl">
        No hay información disponible.
      </p>
    );
  }

  const lugar = lugares[0];

  // Determinar si es una categoría de itinerario
  const esItinerario = categoria === "paquetes" || categoria === "itinerario";

  // Función para determinar qué campos mostrar
  const shouldShowField = (fieldName, fieldValue) => {
    if (esItinerario) {
      // Para itinerarios, mantener la lógica original
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
    } else {
      // Para otras categorías, mostrar todos los campos excepto id
      // pero excluir coordenadas si hay dirección
      if (fieldName === 'coordenadas' && lugar.direccion) {
        return false; // No mostrar coordenadas si hay dirección
      }
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
    }
  };

  return (
    <div className="p-6 sm:p-5 bg-white rounded-2xl text-gray-800 w-full h-full overflow-y-auto">
      {/* Título principal */}
      <h3 className="text-lg sm:text-xl font-semibold text-[#8539A3] mb-4 text-center">
        Información del Lugar
      </h3>

      {/* Contenedor responsivo de datos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {/* Descripción */}
        {shouldShowField('descripcion', lugar.descripcion) && (
          <div className="sm:col-span-2">
            <h4 className="text-sm font-semibold text-gray-700">Descripción</h4>
            <p className="text-sm leading-relaxed">{lugar.descripcion}</p>
          </div>
        )}

        {/* Precio */}
        {shouldShowField('precio', lugar.precio) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700">Precio</h4>
            <p className="text-sm font-medium text-[#da627d]">
              ${lugar.precio.toLocaleString()}
            </p>
          </div>
        )}

        {/* Horario */}
        {shouldShowField('horario', lugar.horario) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700">Horario</h4>
            <p className="text-sm">{lugar.horario}</p>
          </div>
        )}

        {/* Coordenadas - Solo mostrar si NO es itinerario y NO hay dirección */}
        {shouldShowField('coordenadas', lugar.coordenadas) && (
          <div className="sm:col-span-2">
            <h4 className="text-sm font-semibold text-gray-700">Coordenadas</h4>
            <p className="text-sm break-words">
              Lat: {lugar.coordenadas.lat}, Lng: {lugar.coordenadas.lng}
            </p>
          </div>
        )}

        {/* Dirección */}
        {shouldShowField('direccion', lugar.direccion) && (
          <div className="sm:col-span-2">
            <h4 className="text-sm font-semibold text-gray-700">Dirección</h4>
            <p className="text-sm">{lugar.direccion}</p>
          </div>
        )}

        {/* Organizador */}
        {shouldShowField('organizador', lugar.organizador) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700">Organizador</h4>
            <p className="text-sm">{lugar.organizador}</p>
          </div>
        )}

        {/* Teléfono */}
        {shouldShowField('telefono', lugar.telefono) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700">Contacto</h4>
            <p className="text-sm">{lugar.telefono}</p>
          </div>
        )}

        {/* Información adicional */}
        {shouldShowField('extra', lugar.extra) && (
          <div className="sm:col-span-2">
            <h4 className="text-sm font-semibold text-gray-700">
              Información adicional
            </h4>
            <p className="text-sm">{lugar.extra}</p>
          </div>
        )}

        {/* Campos adicionales para categorías no itinerario */}
        {!esItinerario && (
          <>
            {/* Tipo */}
            {shouldShowField('tipo', lugar.tipo) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Tipo</h4>
                <p className="text-sm">{lugar.tipo}</p>
              </div>
            )}

            {/* Rating */}
            {shouldShowField('rating', lugar.rating) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Rating</h4>
                <p className="text-sm">{lugar.rating}</p>
              </div>
            )}

            {/* Capacidad */}
            {shouldShowField('capacidad', lugar.capacidad) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Capacidad</h4>
                <p className="text-sm">{lugar.capacidad}</p>
              </div>
            )}

            {/* Check-in */}
            {shouldShowField('check_in', lugar.check_in) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Check-in</h4>
                <p className="text-sm">{lugar.check_in}</p>
              </div>
            )}

            {/* Check-out */}
            {shouldShowField('check_out', lugar.check_out) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Check-out</h4>
                <p className="text-sm">{lugar.check_out}</p>
              </div>
            )}

            {/* Fecha de inicio */}
            {shouldShowField('fecha_inicio', lugar.fecha_inicio) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Fecha de inicio</h4>
                <p className="text-sm">{lugar.fecha_inicio}</p>
              </div>
            )}

            {/* Fecha de fin */}
            {shouldShowField('fecha_fin', lugar.fecha_fin) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Fecha de fin</h4>
                <p className="text-sm">{lugar.fecha_fin}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}