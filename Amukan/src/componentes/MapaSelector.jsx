// src/components/MapaSelector.jsx
import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapaSelector({ onLocationSelect }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-71.5519, -33.0245], // Centro inicial (Viña)
      zoom: 13,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    // Escuchar clics en el mapa
    mapRef.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      // Mover el marcador
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        // Crear el marcador si no existe
        markerRef.current = new maplibregl.Marker({ color: "#6E63CF" })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      }

      // Devolver las coordenadas al formulario padre
      onLocationSelect({ lat: lat, lng: lng });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-64 rounded-lg" 
      style={{ minHeight: '250px' }}
    />
  );
}