import React, { useRef, useEffect, useState } from "react";
import api from "../utils/api";

export default function Carousel() {
  const scrollRef = useRef(null);
  const cardWidth = 250 + 16; // base para md:w-[250px] + gap
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await api.get("/recommendations/");
        setRecommendations(response.data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("No se pudieron cargar las recomendaciones");
        setRecommendations([
          {
            id: "1",
            name: "Lugar recomendado 1",
            type: "attraction",
            description: "Descripción del lugar 1",
            rating: 4.5,
            score: 0.9,
          },
          {
            id: "2",
            name: "Lugar recomendado 2",
            type: "restaurant",
            description: "Descripción del lugar 2",
            rating: 4.2,
            score: 0.8,
          },
          {
            id: "3",
            name: "Lugar recomendado 3",
            type: "activity",
            description: "Descripción del lugar 3",
            rating: 4.7,
            score: 0.85,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (recommendations.length === 0) return;

    let index = 0;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        index = (index + 1) % recommendations.length;
        scrollRef.current.scrollTo({
          left: index * cardWidth,
          behavior: "smooth",
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [recommendations.length, cardWidth]);

  // Función para obtener la imagen del lugar
  const getPlaceImage = (place) => {
    // Primero intenta usar la imagen real del lugar si está disponible
    if (place.cover_image_url) {
      return place.cover_image_url;
    }
    
    // Si no hay imagen real, usa placeholders según el tipo
    const placeholderImages = {
      restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      attraction: "https://images.unsplash.com/photo-1502657877623-f66bf489d236",
      activity: "https://images.unsplash.com/photo-1532614338840-ab30cf10ed36",
      accommodation: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
      default: "https://images.unsplash.com/photo-1527549993586-dff825b37782",
    };
    
    return placeholderImages[place.type] || placeholderImages.default;
  };

  const formatDescription = (place) => {
    if (place.description && place.description.length > 60) {
      return place.description.substring(0, 60) + "...";
    }
    return place.description || `Lugar ${place.type} recomendado`;
  };

  if (loading) {
    return (
      <div className="relative w-full">
        <div className="w-full overflow-x-auto py-4 px-4 flex gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex-shrink-0 
                        w-full sm:w-full md:w-full xl:w-full 2xl:w-full
                        h-full sm:h-full md:h-full xl:h-full 2xl:h-full
                         bg-white/20 border border-white rounded-lg animate-pulse"
            >
              <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px] xl:w-[160px] xl:h-[160px] m-2 bg-gray-300 rounded-md float-left"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && recommendations.length === 0) {
    return <div className="text-white text-center">{error}</div>;
  }

  return (
    <div className="hidden md:block relative w-full">
      <div className="relative">
        <div className="absolute top-0 right-130 text-white text-sm font-semibold z-10 hidden xl:block">
          01
        </div>
        <div className="absolute top-0 left-130 2xl:left-120 text-white text-sm font-semibold z-10 hidden xl:block">
          {String(recommendations.length).padStart(2, "0")}
        </div>

        <div
          ref={scrollRef}
          className="
            w-[100%] sm:w-[75%] md:w-[80%] lg:w-[80%] xl:w-[100%] 2xl:w-[90%]
            overflow-x-auto
            py-4
            px-2 sm:px-1 md:px-4
            scroll-smooth
            snap-x snap-mandatory
            flex justify-center md:justify-start
            gap-2 sm:gap-3 md:gap-4
            rotate-180
          "
        >
          {recommendations.map((place) => (
            <div
              key={place.id}
              className="flex flex-row items-center flex-shrink-0 
                w-[235px] sm:w-full md:w-[390px] xl:w-full 
                h-full sm:h-full md:full xl:h-full 
                bg-white/20 border border-white rounded-lg 
                snap-center rotate-180 hover:scale-[1.02] 
                transition-transform duration-200 cursor-pointer
                "
              onClick={() => {
                console.log("Lugar seleccionado:", place);
              }}
            >
              <img
                src={getPlaceImage(place)}
                alt={place.name}
                className="w-[50px] h-[50px] sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px] xl:w-[140px] xl:h-[140px] m-2 object-cover rounded-md"
                onError={(e) => {
                  // Si la imagen falla al cargar, usa un placeholder
                  const placeholderImages = {
                    restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
                    attraction: "https://images.unsplash.com/photo-1502657877623-f66bf489d236",
                    activity: "https://images.unsplash.com/photo-1532614338840-ab30cf10ed36",
                    accommodation: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
                    default: "https://images.unsplash.com/photo-1527549993586-dff825b37782",
                  };
                  e.target.src = placeholderImages[place.type] || placeholderImages.default;
                }}
              />
              <div className="p-1 flex flex-col justify-center w-full">
                <h3 className="text-base font-semibold text-white mb-1 
                              truncate overflow-hidden whitespace-nowrap
                              max-w-[180px] sm:max-w-[200px] md:max-w-[220px]">
                  {place.name}
                </h3>
                <span className="text-sm text-white mb-1">
                  {formatDescription(place)}
                </span>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs text-yellow-300">
                    ⭐ {place.rating || "N/A"}
                  </span>
                  <span className="text-xs text-green-300">
                    {Math.round(place.score * 100)}% match
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}