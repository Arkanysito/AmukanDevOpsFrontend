import React, { useEffect, useRef, useState } from "react";
import maplibregl, { Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import defaultActividades from "../assets/defaultActividades.jpg";
import defaultEventos from "../assets/defaultEventos.jpg";
import defaultGastronomia from "../assets/defaultGastronomia.jpg";

function PuntosCercanos({coordenadas, categoriaActiva}) {
  let coords = coordenadas;
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [centro, setCentro] = useState([]);
  const markersRef = useRef([]);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-71.5519, -33.0245],
      zoom: 13,
      maxBounds: [
        [-71.5993, -33.0587],
        [-71.4170, -32.9139],
      ],
    });

    mapRef.current = map;

    const nav = new maplibregl.NavigationControl({ showZoom: true });
    const geo = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showAccuracyCircle: false,
      fitBoundsOptions: { maxZoom: 16 },
    });

    map.addControl(nav, "bottom-right");
    map.addControl(geo);

    geo.on("trackuserlocationstart", () => {
      console.log("Seguimiento iniciado");
    });

    geo.on("trackuserlocationupdate", (e) => {
      const { longitude, latitude } = e.coords;
      setCentro([longitude, latitude]);
    });

    geo.on("geolocate", (e) => {
      const { longitude, latitude } = e.coords;
      setCentro([longitude, latitude]);
    });


    return () => {
      map.remove();
    };
  }, []);

  
  useEffect(() => {
    const map = mapRef.current;
    if (!map || centro.length === 0) return;

    
    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        dibujarCirculo(map, centro);
      });
    } else {
      dibujarCirculo(map, centro);
    }
  }, [centro]);

  const dibujarCirculo = (map, centro) => {
    const circle = turf.circle(centro, 0.5, { units: "kilometers" });

    if (map.getSource("location-radius")) {
      map.getSource("location-radius").setData(circle);
    } else {
      map.addSource("location-radius", {
        type: "geojson",
        data: circle,
      });

      map.addLayer({
        id: "location-radius",
        type: "fill",
        source: "location-radius",
        paint: {
          "fill-color": "#6E63CF",
          "fill-opacity": 0.3,
        },
      });
    }
  };
  
  

  
  useEffect(()=>{
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if(coords[0]!=null){
    agregarMarcadorEspecial(coords[0].lugar[0],coords[0].lugar[1], coords[0].titulo, coords[0].precio, coords[0].organizador, coords[0].imagen)
    }
    coords.forEach(lugar => {
    
    const flag = estaEnRadio(lugar.lugar[0],lugar.lugar[1],centro[1],centro[0],0.5)
    
      if(flag && lugar.id != 1){
        agregarMarcador(lugar.lugar[0],lugar.lugar[1],"#6E63CF",lugar.titulo, lugar.precio, lugar.organizador, lugar.imagen)
      }
    });
  }, [centro, categoriaActiva, coordenadas])
  

  function agregarMarcador(lat, lon, color, nombreLugar, precio, organizador, imagen, categoria) {
     
    const lugar = new maplibregl.Popup({
      closeOnClick: true,
      closeButton: false,
      className: "popup-lugar",
      maxWidth: "500px"
    })
  
  
  
  let imagenHTML = '';
  if (imagen && imagen !== null && imagen !== 'null') {
    imagenHTML = `<img src="${imagen}" alt="${nombreLugar}" style="width: 100%; height: 170px; object-fit: cover; border-radius: 8px; border: 2px display: block;
        border-radius: 14px 14px 0 0; solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">`;
  } else {
    switch(categoriaActiva){
      case "gastronomia":
        imagenHTML = `<img src="${defaultGastronomia}" alt="Imagen" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">`;
        break;
      case "actividades":
        imagenHTML = `<img src="${defaultActividades}" alt="Imagen" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">`;
        break;
      case "eventos":
        imagenHTML = `<img src="${defaultEventos}" alt="Imagen" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">`;
        break;
      }
    
  }
  console.log(categoriaActiva)
  
  const contenidoHTML = `
  <div style="
    max-width: auto;
    background: #F8F7F4;
    color: #333;
    border-radius: 14px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
    font-family: 'Segoe UI', 'Poppins', sans-serif;
    overflow: hidden;
    display: flex;
    gap: 12px;
    padding: 12px;
    align-items: flex-start;
  ">
    <!-- Imagen cuadrada -->
    <div style="
      width: 80px;
      height: 80px;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    ">
      ${imagenHTML}
    </div>

    <!-- Contenido a la derecha -->
    <div style="flex: 1;">
      <!-- Título -->
      <div style="
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 6px;
        color: #111;
        text-align: left;
        line-height: 1.3;
      ">
        ${nombreLugar}
      </div>

      <!-- Línea horizontal -->
      <hr style="
        border: none;
        border-top: 1px solid #ccc;
        margin: 6px 0 10px 0;
      " />


      <!-- Precio -->
      <div style="
        font-size: 14px;
        color: #368F8B;
        margin-bottom: 4px;
        text-align: left;
      ">
      ${categoriaActiva !== "gastronomia" ? (precio === 0 ? "Gratis" : `$${precio}`):`$${precio}`}
      </div>

      <!-- Organizador -->
      <div style="
        font-size: 13px;
        color: #555;
        text-align: left;
        line-height: 1.4;
      ">
        Organizado por ${organizador}
      </div>
    </div>
  </div>
`;


  
  lugar.setHTML(contenidoHTML);
  
      let marker = new maplibregl.Marker({
        color: color,
        draggable: false,
      })
        .setLngLat([lon, lat])
        .setPopup(lugar)
        .addTo(mapRef.current);
        
      

      markersRef.current.push(marker);
    }

  const estaEnRadio = (lat1, lon1, lat2, lon2, radius) =>
  6371 * 2 * Math.asin(
    Math.sqrt(
      Math.sin(((lat2 - lat1) * Math.PI / 180) / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(((lon2 - lon1) * Math.PI / 180) / 2) ** 2
    )
  ) <= radius;

  function agregarMarcadorEspecial(lat, lon, nombreLugar, precio, organizador, imagen) {
    const lugar = new maplibregl.Popup({
      closeOnClick: true,
      closeButton: false,
      className: "popup-lugar",
      maxWidth: "500px"
    });

    let imagenHTML = '';
    if (imagen && imagen !== null && imagen !== 'null') {
      imagenHTML = `<img src="${imagen}" alt="${nombreLugar}" style="width: 100%; height: 170px; object-fit: cover; border-radius: 8px; border: 2px display: block;
          border-radius: 14px 14px 0 0; solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">`;
    } else {
      switch(categoriaActiva){
        case "gastronomia":
          imagenHTML = `<img src="${defaultGastronomia}" alt="Imagen" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">`;
          break;
        case "actividades":
          imagenHTML = `<img src="${defaultActividades}" alt="Imagen" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">`;
          break;
        case "eventos":
          imagenHTML = `<img src="${defaultEventos}" alt="Imagen" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">`;
          break;
      }
    }

    
    

    const contenidoHTML = `
    <div style="
      max-width: auto;
      background: #F8F7F4;
      color: #333;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
      font-family: 'Segoe UI', 'Poppins', sans-serif;
      overflow: hidden;
      display: flex;
      gap: 12px;
      padding: 12px;
      align-items: flex-start;
      position: relative;
    ">
      <!-- Badge especial para primer lugar -->
      <div style="
        position: absolute;
        top: 8px;
        left: 8px;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #000;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ★ PARA TI
      </div>

      <!-- Imagen cuadrada -->
      <div style="
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        overflow: hidden;
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      ">
        ${imagenHTML}
      </div>

      <!-- Contenido a la derecha -->
      <div style="flex: 1;">
        <!-- Título -->
        <div style="
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 6px;
          color: #111;
          text-align: left;
          line-height: 1.3;
        ">
          ${nombreLugar}
        </div>

        <!-- Línea horizontal -->
        <hr style="
          border: none;
          border-top: 1px solid #ccc;
          margin: 6px 0 10px 0;
        " />

       
        <!-- Precio -->
        <div style="
          font-size: 14px;
          color: #368F8B;
          margin-bottom: 4px;
          text-align: left;
        ">
        ${categoriaActiva !== "gastronomia" ? (precio === 0 ? "Gratis" : `$${precio}`) : `$${precio}`}
        </div>

        <!-- Organizador -->
        <div style="
          font-size: 13px;
          color: #555;
          text-align: left;
          line-height: 1.4;
        ">
          Organizado por ${organizador}
        </div>
      </div>
    </div>
  `;

    lugar.setHTML(contenidoHTML);

    // Marcador dorado especial
    let marker = new maplibregl.Marker({
      color: "#FFD700", // Color dorado
      draggable: false,
    })
      .setLngLat([lon, lat])
      .setPopup(lugar)
      .addTo(mapRef.current);

    markersRef.current.push(marker);
  }





  return (
    
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-[100%]" />

    </div>
    
  );
}

export default PuntosCercanos;
