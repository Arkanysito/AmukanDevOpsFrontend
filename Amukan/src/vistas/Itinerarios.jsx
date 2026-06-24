// MisItinerarios.jsx
import React, { useState, useEffect } from "react";
import Header from "../componentes/Header";
import Breadcrumb from "../componentes/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import Swal from "sweetalert2";
import api from '../utils/api';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTag } from "react-icons/fa";

export default function MisItinerarios() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerarios, setItinerarios] = useState([]);
  const [standaloneBookings, setStandaloneBookings] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (user) {
      cargarDatosCombinados();
    } else {
      setCargando(false);
    }
  }, [user]);

  const cargarDatosCombinados = async () => {
    if (!user) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);

      // 1. Hacemos ambas llamadas a la API en paralelo
      const [itinerariosResponse, bookingsResponse] = await Promise.all([
        api.get("/travel/my-itineraries/"), // Tus itinerarios guardados
        api.get("/bookings/")               // Tus reservas individuales
      ]);

      const itinerariosData = itinerariosResponse.data;
      const bookingsData = bookingsResponse.data;

      // 2. Creamos un Set con todos los IDs de reservas que ya están en un itinerario
      const itineraryBookingIds = new Set();
      itinerariosData.forEach(itinerario => {
        itinerario.items.forEach(item => {
          if (item.booking_id) {
            itineraryBookingIds.add(item.booking_id);
          }
        });
      });

      // 3. Filtramos las reservas para quedarnos solo con las "huérfanas"
      const standalone = bookingsData.filter(
        booking => !itineraryBookingIds.has(booking.booking_id)
      );

      // 4. Guardamos en el estado
      setItinerarios(itinerariosData);
      setStandaloneBookings(standalone);

    } catch (error) {
      console.error("Error cargando datos combinados:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar tus datos",
        text: "No se pudo obtener la información. Intenta nuevamente más tarde.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "Fecha no especificada";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const extraerDestinoDelNombre = (nombre) => {
    const match = nombre.match(/para\s+(.+)$/i);
    return match ? match[1] : 'Destino no especificado';
  };

  const handleVerDetalleItinerario = (itinerario) => {
    navigate("/itinerarioGenerar", { 
      state: { itinerario } 
    });
  };

  // --- Componente de Tarjeta para Itinerario (Tu código existente) ---
  const ItinerarioCard = ({ itinerario }) => (
    <div
      key={itinerario.itinerary_id}
      className="bg-white flex flex-col md:flex-row shadow-lg rounded-lg w-full max-w-6xl overflow-hidden"
    >
      <div className="hidden md:block w-full md:w-1/3">
        <div
          className="bg-cover h-full min-h-[200px] rounded-l-lg"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97')",
          }}
        ></div>
      </div>
      <div className="p-6 w-full md:w-2/3 text-left flex flex-col justify-center">
        <h2 className="text-2xl text-gray-800 font-bold text-center md:text-left">
          {itinerario.name}
        </h2>
        <p className="mt-4 text-gray-600 text-sm text-center md:text-left">
          {formatearFecha(itinerario.created_at)} | {extraerDestinoDelNombre(itinerario.name)}
        </p>
        <div className="mt-2 text-sm text-gray-500">
          <p>{itinerario.items?.length || 0} items en el plan • {itinerario.is_shared ? 'Compartido' : 'Privado'}</p>
        </div>
        <div className="flex justify-center md:justify-start">
          <button 
            onClick={() => handleVerDetalleItinerario(itinerario)}
            className="mt-4 py-2 px-5 md:py-3 md:px-6 btn-login md:text-lg rounded-lg shadow-md"
          >
            Ver Detalle del Plan
          </button>
        </div>
      </div>
    </div>
  );

  // --- Nuevo Componente de Tarjeta para Reservas Individuales ---
  const BookingCard = ({ booking }) => (
    <div
      key={booking.booking_id}
      className="bg-white flex flex-col md:flex-row shadow-lg rounded-lg w-full max-w-6xl overflow-hidden"
    >
      {/* Puedes poner un ícono genérico o imagen si la tuvieras */}
      <div className="hidden md:flex w-full md:w-1/3 bg-purple-100 items-center justify-center">
        <FaCalendarAlt className="text-purple-600 w-20 h-20" />
      </div>
      <div className="p-6 w-full md:w-2/3 text-left flex flex-col justify-center">
        <h2 className="text-2xl text-gray-800 font-bold text-center md:text-left">
          {booking.service_details?.name || 'Reserva Individual'}
        </h2>
        <p className="mt-4 text-gray-600 text-sm text-center md:text-left">
          Reservado para el: {formatearFecha(booking.fecha_inicio)}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700">
          <span className="flex items-center gap-2">
            <FaTag className="text-purple-600" />
            Estado: <span className="font-semibold">{booking.estado_display}</span>
          </span>
          <span className="flex items-center gap-2">
            <FaUsers className="text-purple-600" />
            {booking.cantidad_personas} personas
          </span>
          <span className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-purple-600" />
            Tipo: {booking.service_details?.type || 'Servicio'}
          </span>
        </div>
        {/* Podrías añadir un botón de "Ver detalles" si tienes una página para ello */}
      </div>
    </div>
  );

  // --- Lógica de Renderizado ---
  
  if (cargando) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <Breadcrumb />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando tus datos...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <Breadcrumb />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Debes iniciar sesión para ver tus datos</p>
            <button 
              onClick={() => navigate("/login")}
              className="py-2 px-6 btn-login rounded-lg shadow-md"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = itinerarios.length + standaloneBookings.length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb />

      <div className="w-full flex justify-center px-4 mt-5">
        <div className="flex flex-wrap justify-center gap-8 w-full max-w-6xl">
          {totalItems === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No tienes itinerarios ni reservas</p>
              <button 
                onClick={() => navigate("/busqueda")}
                className="mt-4 py-2 px-6 btn-login rounded-lg shadow-md"
              >
                ¡Vamos a explorar!
              </button>
            </div>
          ) : (
            <>
              {/* Sección de Itinerarios */}
              {itinerarios.length > 0 && (
                <h2 className="text-3xl font-bold text-gray-900 w-full text-left mb-4">
                  Mis Itinerarios Planificados
                </h2>
              )}
              {itinerarios.map((itinerario) => (
                <ItinerarioCard key={itinerario.itinerary_id} itinerario={itinerario} />
              ))}

              {/* Sección de Reservas Individuales */}
              {standaloneBookings.length > 0 && (
                <h2 className="text-3xl font-bold text-gray-900 w-full text-left mt-10 mb-4">
                  Mis Reservas Individuales
                </h2>
              )}
              {standaloneBookings.map((booking) => (
                <BookingCard key={booking.booking_id} booking={booking} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}