import React, { useState, useEffect } from 'react';
import AmukanLogo from '../assets/logohorizontal.png';
import { API_BASE_URL } from "../config";

const PantallaCarga = ({ onComplete }) => {
  const [progreso, setProgreso] = useState(0);
  const [datosListos, setDatosListos] = useState({ perfil: false, categorias: false });
  const [datosCargados, setDatosCargados] = useState({});

  // Simular carga del perfil
  useEffect(() => {
    const cargarPerfil = setTimeout(() => {
      const perfil = { nombre: "Usuario" };
      setDatosCargados(prev => ({ ...prev, perfil }));
      setDatosListos(prev => ({ ...prev, perfil: true }));
    }, 2000);
    return () => clearTimeout(cargarPerfil);
  }, []);

  // Cargar categorías de la API
  useEffect(() => {
    const verificarCategorias = async () => {
      const endpoints = [
        `${API_BASE_URL}/destination/accommodations/`,
        `${API_BASE_URL}/destination/activities/`,
        `${API_BASE_URL}/destination/places/?type=restaurant`,
        `${API_BASE_URL}/destination/places/?type=accommodation`
      ];

      let categorias = [];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          const data = await response.json();
          if (data.status === 'ok' && data.data && data.data.length > 0) {
            categorias = categorias.concat(data.data);
          }
        } catch (error) {
          console.log(`Error verificando ${endpoint}:`, error);
        }
      }

      setDatosCargados(prev => ({ ...prev, categorias }));
      setDatosListos(prev => ({ ...prev, categorias: true }));
    };

    if (datosListos.perfil) verificarCategorias();
  }, [datosListos.perfil]);

  // Actualizar barra de progreso
  useEffect(() => {
    if (!datosListos.perfil) setProgreso(25);
    else if (datosListos.perfil && !datosListos.categorias) setProgreso(60);
    else if (datosListos.perfil && datosListos.categorias) setProgreso(100);
  }, [datosListos]);

  // Llamar onComplete cuando todo esté listo
  useEffect(() => {
    if (datosListos.perfil && datosListos.categorias && progreso === 100) {
      const timeout = setTimeout(() => {
        if (onComplete) onComplete(datosCargados);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [datosListos, progreso, datosCargados, onComplete]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="mb-16 text-center">
        <img src={AmukanLogo} alt="Logo Amukan" className="w-64 mt-4 mx-auto" />
      </div>
      <div className="w-80 max-w-sm">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#6E63CF] h-2 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PantallaCarga;
