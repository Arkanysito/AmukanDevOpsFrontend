import React, { useState } from "react";
import Mapa from "./Mapa";
import ItineraryPopup from "./ItinerarioPopup";

const itinerary = {
    Actividades: [
      { time: "08:15", activity: "Caminata autoguiada por el casco histórico" },
      { time: "09:30", activity: "Tour del reloj de flores" },
    ],
    Gastronomía: [
      { time: "13:00", activity: "Almuerzo en restaurante local" },
      { time: "19:00", activity: "Cena temática cultural" },
    ],
  };
  
  export default function MapView() {
    const [selectedSection, setSelectedSection] = useState(null);
  
    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* Contenedor con posición relativa */}
        <div className="relative h-[500px]">
          <Mapa />
  
          {/* Popup sobre el mapa */}
          <ItineraryPopup
            section={selectedSection}
            data={itinerary[selectedSection]}
            onClose={() => setSelectedSection(null)}
          />
        </div>
  
        {/* Botones de selección */}
        <div className="flex gap-4 justify-center mt-6">
          {Object.keys(itinerary).map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {section}
            </button>
          ))}
        </div>
      </div>
    );
  }
  