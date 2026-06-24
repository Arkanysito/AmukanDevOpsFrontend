import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import maplibregl from "maplibre-gl";
import polyline from "@mapbox/polyline";
import "maplibre-gl/dist/maplibre-gl.css";
import { FaCarAlt } from "react-icons/fa";
import { FaWalking } from "react-icons/fa";
import ReactDOM from "react-dom/client";
import { BASE_URL } from "../config";

function Mapa({ coordenadas, coordenadasSeleccionadas, categoriaActiva, itinerarioActivo }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);
  const [rutaActiva, setRutaActiva] = useState("auto"); 
  const [diasCoords, setDiasCoords] = useState([]); 
  const [diaSeleccionado, setDiaSeleccionado] = useState(-1); 
  
  
 
  const colores = ["#368F8B", "#5C70C2", "#4A7DB4", "#3E869F", "#368F8B"];

  useEffect(() => {
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-71.5519, -33.0245],
      zoom: 13,
      maxBounds: [
        [-71.5993, -33.0587],
        [-71.4170, -32.9139],
      ],
    });

    const nav = new maplibregl.NavigationControl({
      showZoom: true,
    });

    mapRef.current.addControl(nav, "bottom-right");

    return () => {
      mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    // Clear routes
    eliminarRuta("auto");
    eliminarRuta("walk");

    // If no coordinates, reset to default view
    if (!Array.isArray(coordenadas) || coordenadas.length === 0) {
      
      mapRef.current.flyTo({
        center: [-71.5519, -33.0245],
        zoom: 15,
        duration: 1000,
      });
      return;
    }

    if (categoriaActiva === "paquetes") {
      
      
      const ordenadas = ordenarCoords(coordenadas);
     
      setDiasCoords(ordenadas);
      
      if (ordenadas.length > 0) {
        if (diaSeleccionado === -1) {
          
          const todas = ordenadas.flat();
          todas.forEach((coords) => {
            const [lat, lon, dia] = coords;
            let colorIndex = (dia - 1) % colores.length;
            agregarMarcador(lat, lon, colores[colorIndex]);
          });
        } else if (ordenadas[diaSeleccionado]) {
         
          // Show specific day
          mostrarDia(ordenadas[diaSeleccionado]);
        }
      } else {
        // Fallback: if ordenarCoords returns empty, show all coordinates as markers
       
        coordenadas.forEach((coords) => {
          if (!coords) return;
          const [lat, lon] = coords;
          agregarMarcador(lat, lon, "#6E63CF");
        });
      }

    } else {
      // Handle other categories
      
      setDiasCoords([]); // Reset diasCoords for other categories
      setDiaSeleccionado(-1); // Reset day selection

      coordenadas.forEach((coords) => {
        if (!coords) return;
        const [lat, lon] = coords;
        agregarMarcador(lat, lon, "#6E63CF");
      });
    }

    // Adjust view to show markers
    if (markersRef.current.length > 0) {
      
      const bounds = new maplibregl.LngLatBounds();
      markersRef.current.forEach((m) => bounds.extend(m.getLngLat()));
      mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    } else {
      
    }







  }, [coordenadas, categoriaActiva, diaSeleccionado]);

  // Reset day selection when switching away from paquetes
  useEffect(() => {
    if (categoriaActiva !== "paquetes") {
      
      setDiaSeleccionado(-1);
    }
  }, [categoriaActiva]);

  

  async function mostrarDia(coordsDia) {
    
    eliminarRuta("auto");
    eliminarRuta("walk");

    coordsDia.forEach((coords) => {
      const [lat, lon, dia] = coords;
      let colorIndex = (dia - 1) % colores.length;
      agregarMarcador(lat, lon, colores[colorIndex]);
    });

    await new Promise((resolve) => {
    if (mapRef.current.loaded()) return resolve();
    mapRef.current.once("idle", resolve); // 'idle' es más confiable que 'load'
  });

  obtenerRutas(coordsDia);
  }
// Se deja por si el ethan cambia de opinión
  useEffect(() => {
    if(!itinerarioActivo) {setDiaSeleccionado(-1)}

  }, [itinerarioActivo])



  function agregarMarcador(lat, lon, color) {
   
    let marker = new maplibregl.Marker({
      color: color,
      draggable: false,
    })
      .setLngLat([lon, lat])
      .addTo(mapRef.current);

    markersRef.current.push(marker);
  }

  async function obtenerRutas(puntos) {
    if (!itinerarioActivo){
      setDiaSeleccionado(-1);
    return;}

    const stringCoords = puntos
      .map((coords) => `${coords[1]},${coords[0]}`)
      .join(";");

    try {
      if (rutaActiva === "auto") {
        const resAuto = await fetch(
          `${BASE_URL}:5000/route/v1/driving/${stringCoords}?steps=true&geometries=polyline`
        );
        const dataAuto = await resAuto.json();
        if (dataAuto.code === "Ok") {
          dibujarRuta("auto", dataAuto.routes[0], "#8539A3");
        }
        eliminarRuta("walk");
      } else {
        const resWalk = await fetch(
          `${BASE_URL}:5001/route/v1/walking/${stringCoords}?steps=true&geometries=polyline`
        );
        const dataWalk = await resWalk.json();
        if (dataWalk.code === "Ok") {
          dibujarRuta("walk", dataWalk.routes[0], "#368F8B");
        }
        eliminarRuta("auto");
      }
    } catch (err) {
      console.error("Error obteniendo rutas:", err);
    }
  }

  function dibujarRuta(tipo, route, color) {
    
    const decoded = polyline.decode(route.geometry);
    const geojson = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: decoded.map(([lat, lon]) => [lon, lat]),
      },
    };

    const sourceId = `${tipo}-route`;
    const layerId = `${tipo}-route-line`;

    if (mapRef.current.getSource(sourceId)) {
      mapRef.current.getSource(sourceId).setData(geojson);
    } else {
      mapRef.current.addSource(sourceId, { type: "geojson", data: geojson });
      mapRef.current.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": color,
          "line-width": 4,
        },
      });
    }

    const bounds = new maplibregl.LngLatBounds();
    geojson.geometry.coordinates.forEach((c) => bounds.extend(c));
    mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
  }

  function eliminarRuta(tipo) {
    const sourceId = `${tipo}-route`;
    const layerId = `${tipo}-route-line`;
    if (mapRef.current.getLayer(layerId)) {
      mapRef.current.removeLayer(layerId);
    }
    if (mapRef.current.getSource(sourceId)) {
      mapRef.current.removeSource(sourceId);
    }
  }

  function ordenarCoords(coordenadas) {
    
    // Find all unique days
    const diasUnicos = new Set();
    const coordsConDia = [];
    
    for (const c of coordenadas) {
      if (Array.isArray(c) && c.length >= 3) {
        const dia = c[2];
        // Check if dia is a number (could be string or number)
        const diaNum = typeof dia === 'string' ? parseInt(dia, 10) : dia;
        
        if (!isNaN(diaNum) && diaNum > 0) {
          diasUnicos.add(diaNum);
          coordsConDia.push(c);
        } else {
          console.warn("Coordenada con día inválido:", c);
        }
      } else {
        console.warn("Coordenada inválida:", c);
      }
    }
    
    if (diasUnicos.size === 0) {
      
      // Return the coordinates as a single day if no day information is found
      return coordenadas.length > 0 ? [coordenadas] : [];
    }
    
    const maxDia = Math.max(...diasUnicos);
    
    
    const final = Array.from({ length: maxDia }, () => []);
    
    for (const c of coordsConDia) {
      const dia = typeof c[2] === 'string' ? parseInt(c[2], 10) : c[2];
      const index = dia - 1;
      
      if (index >= 0 && index < final.length) {
        final[index].push(c);
      }
    }
    
    
    return final;
  }

  useEffect(() => {
    if (!mapRef.current) return;
  
    const container = document.createElement("div");
    container.className = "absolute bottom-4 left-4 z-10 flex flex-col gap-2";
  
    const autoBtn = document.createElement("button");
    autoBtn.className = "filtro-boton";
  
    // Renderiza el ícono dentro del botón
    ReactDOM.createRoot(autoBtn).render(<FaCarAlt className="text-2xl"/>);
  
    autoBtn.onclick = () => {
      setRutaActiva("auto");
      if (
        categoriaActiva === "paquetes" &&
        diaSeleccionado >= 0 &&
        diasCoords[diaSeleccionado]
      ) {
        obtenerRutas(diasCoords[diaSeleccionado]);
      }
    };

    const walkBtn = document.createElement("button");
    walkBtn.className = "filtro-boton";
    
    // Renderiza el ícono dentro del botón
    ReactDOM.createRoot(walkBtn).render(<FaWalking className="text-2xl" />);
    
    walkBtn.onclick = () => {
      setRutaActiva("walk");
      if (
        categoriaActiva === "paquetes" &&
        diaSeleccionado >= 0 &&
        diasCoords[diaSeleccionado]
      ) {
        obtenerRutas(diasCoords[diaSeleccionado]);
      }
    };

    container.appendChild(autoBtn);
    container.appendChild(walkBtn);

    mapRef.current.getContainer().appendChild(container);

    return () => {
      container.remove();
    };
  }, [categoriaActiva, diaSeleccionado, diasCoords, rutaActiva]);

  return (
    <div className="w-full h-full relative">
      {categoriaActiva === "paquetes" && diasCoords.length > 0 && (
        // CAMBIO: z-50 → z-10 en móvil para que no compita con el dropdown de Ordenar
        <div className="absolute top-20 xl:top-4 left-0 md:left-4 z-10 md:z-50 bg-white shadow p-1 scale-90 text-sm rounded text-black md:p-2 md:scale-100 md:text-base filtro-boton">
        <label className="mr-2 font-bold">Día:</label>
        <select
          value={diaSeleccionado}
          onChange={(e) => setDiaSeleccionado(Number(e.target.value))}
          className="border rounded px-1 py-0.5 text-sm md:px-2 md:py-1 md:text-base"
        >
          <option value={-1}>Todos los días</option>
          {diasCoords.map((_, i) => (
            <option key={i} value={i}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

Mapa.defaultProps = {
  categoriaActiva: "paquetes",
};

export default Mapa;