// src/services/serviceService.js
import api from '../utils/api';

export const serviceService = {
  createService: async (serviceData) => {
    try {
      const response = await api.post('/experiences/services/create/', serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await api.post('/experiences/events/create/', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createPlace: async (placeData) => {
    try {
      const response = await api.post('/location/create/', placeData);
      return response.data;
    } catch (error) {
      console.error("Error en serviceService.createPlace:", error.response?.data || error.message);
      throw error.response?.data || new Error("Error al crear el lugar");
    }
  },
  
  // Agregar más métodos aquí después (get, update, delete)
};