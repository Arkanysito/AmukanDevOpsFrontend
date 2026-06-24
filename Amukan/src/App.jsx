import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './vistas/Home';
import Login from './vistas/Login';
import Busqueda from './vistas/Busqueda';
import EditarPerfil from './vistas/EditarPerfil';
import Register from "./vistas/Register";
import PantallaCarga from './componentes/PantallaCarga';
import useTokenRefresh from "./hooks/useTokenRefresh";
import Dashboard from './vistas/Dashboard';
import MiComercio from './vistas/MiComercio';
import EditarMiComercio from './componentes/EditarMiComercio';
import CrearServicio from './componentes/CrearServicio';
import MisItinerarios from "./vistas/Itinerarios";
import Perfil from './vistas/Perfil';
import CercaMio from './vistas/CercaMio';
import ItinerarioGenerado from './componentes/ItinerarioGenerado';
import Favoritos from './vistas/Favoritos';
import Soporte from './vistas/Soporte'
import { AuthProvider } from './context/AuthContext';

import CrearEvento from './componentes/CrearEvento';
import CrearLugar from './componentes/CrearLugar';
import Carrito from './vistas/Carrito';
import Checkout from './vistas/Checkout';
import GestionReservas from './vistas/GestionReservas';


const BusquedaWrapper = () => {
  const [cargando, setCargando] = useState(true);
  const [datosCargados, setDatosCargados] = useState(null);

  return (
    <div className="relative">
      <Busqueda datos={datosCargados} />
      {cargando && (
        <div className="absolute inset-0 z-50">
          <PantallaCarga
            onComplete={(datos) => {
              setDatosCargados(datos);
              setCargando(false);
            }}
          />
        </div>
      )}
    </div>
  );
};


function App() {
  useTokenRefresh();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/busqueda" element={<BusquedaWrapper/>} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<AuthProvider><Dashboard /></AuthProvider>} />
        
        <Route path="/mi-comercio" element={<MiComercio />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/cerca-mio" element={<CercaMio />} />
        <Route path="/misitinerarios" element={<MisItinerarios />} />
        <Route path="/editar-comercio" element={<EditarMiComercio />} /> 
        <Route path="/itinerarioGenerar" element={<ItinerarioGenerado />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/favoritos" element={<Favoritos/>} />
        <Route path='/soporte' element={<Soporte/>}/>

        <Route path="/crear-servicio/:serviceType" element={<CrearServicio />} />
        <Route path="/crear-evento" element={<CrearEvento />} />
        <Route path="/crear-lugar" element={<CrearLugar />} />
        
        <Route path="/editar-servicio/:serviceType/:serviceId" element={<EditarMiComercio />} />
        <Route path="/editar-evento/:eventId" element={<EditarMiComercio />} />
        <Route path="/editar-lugar/:placeId" element={<EditarMiComercio />} />

        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/reservas" element={<GestionReservas />} />
      </Routes>
    </Router>
  );
}

export default App;