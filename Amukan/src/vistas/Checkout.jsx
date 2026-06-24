import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Header from '../componentes/Header';
import Breadcrumb from '../componentes/Breadcrumb';
import Swal from 'sweetalert2';

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    setBookingError(null);

    const bookingPromises = cartItems.map(item => {
      const data = item.servicioData || item.paqueteData;

      if (!data) {
        return Promise.reject(new Error(`Datos de reserva faltantes para ${item.name}`));
      }

      let payload;

      if (item.itemType === 'servicio') {
        const itemType = data.backend_type; 
        
        if (itemType === 'place' || !itemType) {
          console.log(`Omitiendo reserva para '${item.name}' (tipo '${itemType}').`);
          return Promise.resolve({ success: true, item, skipped: true });
        }

        let fechaInicio;
        let fechaFin;

        if (itemType === 'event' && data.fecha_inicio) {
          fechaInicio = new Date(data.fecha_inicio).toISOString();
          fechaFin = new Date(data.fecha_fin).toISOString();
        } else {
          console.log(`Simulando fechas para '${item.name}'.`);
          const now = new Date();
          fechaInicio = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
          fechaFin = new Date(now.getTime() + 25 * 3600 * 1000).toISOString();
        }

        payload = {
          item_type: itemType,
          item_id: data.id,
          cantidad_personas: item.quantity,
          start_date: fechaInicio,
          end_date: fechaFin,
        };
        
        console.log("Enviando payload a /bookings/:", payload);
        return api.post('/bookings/', payload)
          .then(response => ({ success: true, item, type: 'Booking' }))
          .catch(error => {
            const detail = error.response?.data?.detail || error.response?.data[0] || "Error desconocido";
            return Promise.reject(new Error(`"${item.name}": ${detail}`));
          });

      } else if (item.itemType === 'paquete') {
        console.log("Enviando payload a /travel/save-itinerary/:", item.name);
        
        const paqueteData = item.paqueteData.raw || item.paqueteData;

        return api.post("/travel/save-itinerary/", {
          name: item.name, 
          itinerario_data: paqueteData,
          cantidad_personas: item.quantity * (item.paqueteData?.cantidad_personas || 1),
          is_shared: false,
        })
        .then(response => ({ success: true, item, type: 'Itinerary' }))
        .catch(error => {
           const detail = error.response?.data?.error || "Error al guardar itinerario";
           return Promise.reject(new Error(`"${item.name}": ${detail}`));
        });
      }
      
      return Promise.reject(new Error(`Tipo de item desconocido: ${item.name}`));
    });

    const results = await Promise.allSettled(bookingPromises);

    const successfulItems = [];
    const failedItems = [];

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        successfulItems.push(result.value.item.name);
      } else if (result.status === 'rejected') {
        failedItems.push({ error: result.reason.message });
      }
    });

    setIsBooking(false);

    if (failedItems.length > 0) {
      const errorMsg = failedItems.map(f => f.error).join(', ');
      setBookingError(`Error al procesar: ${errorMsg}`);
      Swal.fire({
        icon: 'error',
        title: '¡Ups! Hubo un problema',
        text: `No pudimos procesar uno o más ítems. ${errorMsg}`,
        confirmButtonColor: '#6E63CF',
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: '¡Acción Completada!',
        text: 'Tus reservas e itinerarios se han guardado exitosamente.',
        confirmButtonColor: '#6E63CF',
      }).then(() => {
        clearCart();
        navigate('/misitinerarios');
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb />

      <div className="flex-1 py-10">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-6xl font-bold text-gray-900 mb-8">Confirmar Reserva e Itinerarios</h2>
          
          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-4">
              Resumen de tu pedido
            </h2>
            
            <div className="divide-y divide-gray-200 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center py-4">
                  <div>
                    <p className="text-sm md:text-xl font-semibold text-gray-800">{item.name}</p>
                      
                    {/* Sección corregida para mostrar cantidad */}
                    {item.itemType === 'paquete' ? (
                      <p className="flex text-sm text-gray-500 justify-start">
                        Cantidad: {item.quantity} (de {item.paqueteData?.cantidad_personas || 1} personas)
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800">
                    ${(item.price * item.quantity).toLocaleString('es-CL')}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 space-y-3">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${totalPrice.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>IVA (simulado)</span>
                <span>$0</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${totalPrice.toLocaleString('es-CL')}</span>
              </div>
            </div>

            {bookingError && (
              <div className="text-red-600 bg-red-100 p-3 rounded-md mt-4 text-center">
                {bookingError}
              </div>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={isBooking}
              className={`mt-6 w-full text-white py-3 rounded-md font-semibold transition-colors shadow-md ${
                isBooking 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isBooking ? 'Procesando...' : 'Confirmar y Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}