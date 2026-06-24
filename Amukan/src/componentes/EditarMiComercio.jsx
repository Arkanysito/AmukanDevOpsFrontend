// componentes/EditarMiComercio.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Header from "./Header";
import Breadcrumb from '../componentes/Breadcrumb';

// Importa los nuevos componentes de formulario
import EditarLugar from "./EditarLugar";
import EditarEvento from "./EditarEvento";
import EditarServicio from "./EditarServicio";

export default function EditarMiComercio() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Captura todos los IDs posibles
  const { serviceType, serviceId, eventId, placeId: placeIdFromUrl } = useParams();

  // Lógica para determinar el modo
  const [mode, setMode] = useState(null); // 'service', 'event', 'place'
  const [entityId, setEntityId] = useState(null);
  const [actualServiceType, setActualServiceType] = useState(serviceType);

  useEffect(() => {
    if (serviceId && serviceType) {
      setMode('service');
      setEntityId(serviceId);
      setActualServiceType(serviceType);
    } else if (eventId) {
      setMode('event');
      setEntityId(eventId);
      setActualServiceType('event');
    } else if (placeIdFromUrl) {
      setMode('place');
      setEntityId(placeIdFromUrl);
      setActualServiceType('place');
    } else {
      // Si no hay ID, no deberíamos estar aquí
      navigate("/mi-comercio");
    }
  }, [serviceType, serviceId, eventId, placeIdFromUrl, navigate]);

  const nombresTipo = {
    accommodation: "Hospedaje",
    activity: "Actividad",
    event: "Evento",
    place: "Lugar"
  };

  // Función para renderizar el formulario correcto
  const renderEditForm = () => {
    switch (mode) {
      case 'service':
        return <EditarServicio serviceType={actualServiceType} serviceId={entityId} />;
      case 'event':
        return <EditarEvento eventId={entityId} />;
      case 'place':
        return <EditarLugar placeId={entityId} />;
      default:
        // Muestra un loader mientras se determina el modo
        return (
          <div className="flex justify-center items-center flex-1 py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#368F8B]" />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col bg-white h-screen w-full overflow-hidden">
      <Header user={user} isAuthenticated={isAuthenticated}/>
      <Breadcrumb />
      
      <h1 className="text-2xl font-bold text-gray-800 px-6 pt-6">
        Editar {nombresTipo[actualServiceType] || "publicación"}
      </h1>

      {/* Contenedor con scroll para el formulario hijo */}
      <div className="flex flex-col flex-1 gap-6 px-6 py-6 overflow-y-auto">
        <div className="flex-1 rounded-xl p-0 md:p-6 md:shadow-sm mb-5">
          {renderEditForm()}
        </div>
      </div>
    </div>
  );
}