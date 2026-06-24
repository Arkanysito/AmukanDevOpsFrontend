import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import HeaderDropdown from "./HeaderDropdown";
import api from "../utils/api";
import Swal from "sweetalert2";
import { FaCalendarAlt, FaUser, FaClock, FaCheck, FaTimes, FaUsers, FaEllipsisV, FaSpinner } from "react-icons/fa";

// Componente para una sola tarjeta de reserva
function BookingCard({ booking, onUpdateStatus }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "N/A";
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleUpdate = async (newState) => {
    setMenuAbierto(false);
    setActualizando(true);
    try {
      // Usamos PATCH para actualizar solo el estado
      await api.patch(`/bookings/${booking.booking_id}/`, {
        state: newState 
      });
      // Le decimos al componente padre que recargue los datos
      onUpdateStatus(booking.booking_id, newState); 
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar la reserva", "error");
    } finally {
      setActualizando(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-700';
      case 'cancelada': return 'bg-red-100 text-red-700';
      case 'rechazada': return 'bg-red-100 text-red-700';
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 flex items-start gap-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 text-left">
      <div className="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
        <FaCalendarAlt className="text-purple-600 w-8 h-8" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 truncate">
          {booking.service_details?.name || 'Reserva sin nombre'}
        </h3>
        
        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
          <FaUser size={12} /> {booking.usuario_username || 'Usuario desconocido'}
        </p>

        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
          <FaClock size={12} /> {formatearFecha(booking.start_date)}
        </p>

        <div className="flex items-center gap-4 mt-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusClass(booking.state)}`}>
            {booking.estado_display}
          </span>
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <FaUsers size={14} /> {booking.cantidad_personas}
          </span>
        </div>
      </div>
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuAbierto(!menuAbierto); }}
          className="p-2 rounded-full bg-transparent! text-[#6E63CF] hover:bg-gray-100"
          disabled={actualizando}
        >
          {actualizando ? <FaSpinner className="animate-spin" /> : <FaEllipsisV />}
        </button>
        {menuAbierto && (
          <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg z-50 w-40 border border-gray-200">
            {booking.state !== 'confirmada' && (
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-gray-50 w-full"
                onClick={() => handleUpdate('confirmada')}
              >
                <FaCheck size={12} />
                <span>Confirmar</span>
              </button>
            )}
            {booking.state !== 'rechazada' && (
              <button
                className="flex items-center bg-transparent! text-[#6E63CF] gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50 w-full"
                onClick={() => handleUpdate('rechazada')}
              >
                <FaTimes size={12} />
                <span>Rechazar</span>
              </button>
            )}
            {/* Puedes añadir más acciones, como 'Ver Detalle' */}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal del contenido
export function InteriorReservas() {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Asumimos que /bookings/ devuelve las reservas de la organización del admin
      const response = await api.get("/bookings/"); 
      setBookings(response.data);

    } catch (err) {
      console.error("Error cargando reservas:", err);
      setError("No se pudieron cargar las reservas. El endpoint /api/bookings/ debe estar configurado para devolver las reservas de tu organización.");
    } finally {
      setLoading(false);
    }
  };

  // Esta función permite actualizar el estado en el frontend sin recargar todo
  const handleBookingUpdate = (bookingId, newState) => {
    setBookings(prevBookings => 
      prevBookings.map(b => 
        b.booking_id === bookingId ? { ...b, state: newState, estado_display: newState.charAt(0).toUpperCase() + newState.slice(1) } : b
      )
    );
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
          Reservas
        </p>

        {/* Usuario */}
        <div className="relative flex items-center order-3 sm:order-none">
          <div className="hidden sm:block">
            <HeaderDropdown user={user} isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-300 mb-4 text-sm font-semibold">
        <span
          className="pb-1 cursor-default text-black border-b-2 border-black"
        >
          Todas las Reservas
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        {bookings.length} reserva{bookings.length !== 1 ? 's' : ''} encontrada{bookings.length !== 1 ? 's' : ''}
      </p>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
            <button
              onClick={loadBookings}
              className="ml-2 text-red-800 underline bg-transparent! hover:text-red-900"
            >
              Reintentar
            </button>
          </div>
        )}
        
        {bookings.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <div className="text-6xl text-gray-400">
              <FaCalendarAlt />
            </div>
            <p className="text-lg text-center">No hay reservas</p>
            <p className="text-sm text-center text-gray-400">
              Cuando los clientes reserven tus servicios, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard 
                key={booking.booking_id} 
                booking={booking} 
                onUpdateStatus={handleBookingUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}