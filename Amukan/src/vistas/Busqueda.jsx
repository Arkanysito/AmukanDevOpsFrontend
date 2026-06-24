import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Header from "../componentes/Header";
import FiltrosBotones from "../componentes/FiltrosBotones";
import ResultadosBusqueda from "../componentes/ResultadosBusqueda";
import Mapa from "../componentes/Mapa";
import ItinerarioBusqueda from "../componentes/ItinerarioBusqueda";
import ItinerarioPuntual from "../componentes/ItinerarioPuntual";
import { ImCross } from "react-icons/im";
import Breadcrumb from "../componentes/Breadcrumb";
import { FaBed, FaUtensils, FaCar } from "react-icons/fa";
import { LuFerrisWheel } from "react-icons/lu";
import { MdOutlineFestival } from "react-icons/md";
import Swal from "sweetalert2";
import { useCart } from "../context/CartContext";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const iconos = {
  hospedaje: <FaBed />,
  comida: <FaUtensils />,
  actividades: <LuFerrisWheel />,
  transporte: <FaCar />,
  eventos: <MdOutlineFestival />,
};

const Busqueda = ({ datos }) => {
  const { addToCart } = useCart();
  const location = useLocation();

  const itinerarios = useMemo(
    () =>
      location.state?.itinerarios ||
      (location.state?.itinerario ? [location.state.itinerario] : []),
    [location.state]
  );

  const [categoriaActiva, setCategoriaActiva] = useState("paquetes");
  const [coordenadas, setCoordenadas] = useState([]);
  const [items, setItems] = useState([]);
  const [coordenadasSeleccionadas, setCoordenadasSeleccionadas] =
    useState(null);
  const [panelExpandido, setPanelExpandido] = useState(false);
  const [servicioActivo, setServicioActivo] = useState(null);
  const [servicios, setServicios] = useState({});
  const [servicioActivoGlobal, setServicioActivoGlobal] = useState(null);
  const [paqueteServicioActivo, setPaqueteServicioActivo] = useState(null);
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
  const [coordenadasZoom, setCoordenadasZoom] = useState(null);
  const [panelIzquierdoVisible, setPanelIzquierdoVisible] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (datos?.servicios) {
      setServicios(datos.servicios);
    }
  }, [datos]);

  useEffect(() => {
    setCoordenadasSeleccionadas(null);
    setCoordenadasZoom(null);
    setPaqueteSeleccionado(null);
  }, [categoriaActiva]);

  const handleAgregarAlCarrito = () => {
    if (!paqueteSeleccionado) {
      Swal.fire({
        icon: "info",
        title: "Sin selección",
        text: "No has seleccionado ningún ítem para agregar al carrito.",
        confirmButtonColor: "#6E63CF",
      });
      return;
    }

    let cartItem;

    if (categoriaActiva === "paquetes") {
      cartItem = {
        id: `paquete_${paqueteSeleccionado.id}`,
        name: paqueteSeleccionado.titulo,
        price: paqueteSeleccionado.precio,
        quantity: 1,
        imageUrl: null,
        paqueteData: paqueteSeleccionado,
        itemType: "paquete",
      };
    } else {
      cartItem = {
        id: paqueteSeleccionado.id,
        name: paqueteSeleccionado.titulo,
        price: paqueteSeleccionado.precio,
        quantity: 1,
        imageUrl: paqueteSeleccionado.imagen || null,
        servicioData: paqueteSeleccionado,
        itemType: "servicio",
      };
    }

    addToCart(cartItem);

    Swal.fire({
      icon: "success",
      title: "¡Agregado al carrito!",
      text: `${cartItem.name} se ha agregado a tu carrito.`,
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    });
  };

  const handleItemsUpdate = useCallback(
    (itemsParaLista, coordsParaMapa) => {
      setItems(itemsParaLista);
      if (coordsParaMapa && coordsParaMapa.length > 0) {
        if (categoriaActiva === "paquetes") {
          const coordsConDia = coordsParaMapa.map((coord) =>
            Array.isArray(coord) && coord.length === 2 ? [...coord, 1] : coord
          );
          setCoordenadas(coordsConDia);
          setCoordenadasZoom(coordsConDia);
        } else {
          setCoordenadas(coordsParaMapa);
          setCoordenadasZoom(coordsParaMapa);
        }
      } else {
        const coords = itemsParaLista
          .map((i) => {
            if (i.lugar && Array.isArray(i.lugar)) {
              if (categoriaActiva === "paquetes" && i.lugar.length === 2) {
                return [...i.lugar, 1];
              }
              return i.lugar;
            }
            return null;
          })
          .filter((c) => c !== null);
        setCoordenadas(coords);
        setCoordenadasZoom(null);
      }
    },
    [categoriaActiva]
  );

  const handleSeleccionCard = useCallback(
    (itemId) => {
      if (itemId === null) {
        setCoordenadasSeleccionadas(null);
        setPaqueteSeleccionado(null);
        setCoordenadasZoom(null);
        return;
      }

      const itemSeleccionado = items.find((item) => item.id === itemId);
      if (!itemSeleccionado) return;

      setPaqueteSeleccionado(itemSeleccionado);

      if (
        categoriaActiva !== "paquetes" &&
        itemSeleccionado.lugar &&
        Array.isArray(itemSeleccionado.lugar) &&
        itemSeleccionado.lugar.length >= 2
      ) {
        const [lat, lon] = itemSeleccionado.lugar;
        if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
          const coords = [parseFloat(lon), parseFloat(lat)];
          setCoordenadasSeleccionadas(coords);
          setCoordenadasZoom([coords]);
        }
      }
    },
    [items, categoriaActiva]
  );

  const handleGuardarItinerario = () => {
    setGuardando(true);
    setTimeout(() => {
      Swal.fire({
        icon: "success",
        title: "Itinerario guardado",
        timer: 1500,
        showConfirmButton: false,
      });
      setGuardando(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb />

      {/* Vista de escritorio */}
      <div className="hidden md:flex flex-1 flex-row w-full h-full relative transition-all duration-500 ease-in-out">
  {/* Panel Izquierdo */}
  {panelIzquierdoVisible && (
    <div className="flex-1 px-3 py-6 space-y-6 overflow-y-auto h-full max-h-screen w-full md:w-[40%] lg:w-[35%] xl:w-[30%] transition-all duration-500 bg-white shadow-md relative z-20">
      <ResultadosBusqueda
        categoriaActiva={categoriaActiva}
        onItemsUpdate={handleItemsUpdate}
        onSeleccionCard={handleSeleccionCard}
        itinerarios={itinerarios}
        onServicioSeleccionado={(servicio, paquete) => {
          setServicioActivoGlobal(servicio);
          setPaqueteServicioActivo(paquete);
        }}
        items={items}
        paqueteSeleccionado={paqueteSeleccionado}
      />
    </div>
  )}

  {/* Botón para colapsar/mostrar panel - EN EL BORDE ENTRE PANEL Y MAPA */}
  <div 
    className={`absolute top-1/2 transform -translate-y-1/2 z-30 transition-all duration-300 ${panelIzquierdoVisible ? 'left-[calc(30%-20px)] xl:left-[calc(30%-20px)] lg:left-[calc(35%-20px)] md:left-[calc(40%-20px)]' : 'left-2'}`}
    onClick={() => setPanelIzquierdoVisible(!panelIzquierdoVisible)}
    title={panelIzquierdoVisible ? "Ocultar panel" : "Mostrar panel"}
  >
    <div className="bg-[#6E63CF] text-white p-2 rounded-full shadow-md hover:bg-[#5a50b5] transition cursor-pointer">
      {panelIzquierdoVisible ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
    </div>
  </div>

  {/* Mapa escritorio */}
  <div
    className={`relative transition-all duration-500 ease-in-out ${
      panelIzquierdoVisible
        ? "md:w-[60%] lg:w-[65%] xl:w-[70%]"
        : "w-full"
    }`}
  >
          <Mapa
            coordenadas={coordenadas}
            coordenadasSeleccionadas={coordenadasZoom || coordenadasSeleccionadas}
            categoriaActiva={categoriaActiva}
            itinerarioActivo={paqueteSeleccionado}
          />

          <div className="absolute top-4 left-4 right-4 z-30">
            <FiltrosBotones
              categoriaActiva={categoriaActiva}
              setCategoriaActiva={setCategoriaActiva}
              setServicioActivo={setServicioActivo}
              categoriasVisibles={[
                "paquetes",
                "hospedaje",
                "gastronomia",
                "transportes",
                "actividades",
                "eventos",
              ]}
            />
          </div>

          {/* Itinerario escritorio */}
          {paqueteSeleccionado && (
            <div className="absolute bottom-40 right-10 bg-white text-black z-50 shadow-lg rounded-lg max-h-[70%] w-[40%] overflow-hidden flex flex-col transition-all duration-300">
              <div className="flex justify-between items-center px-4 py-2 bg-purple-100 rounded-t-lg">
                <span className="font-semibold text-base md:text-lg truncate pr-2">
                  {paqueteSeleccionado.titulo}
                </span>
                <button
                  onClick={() => {
                    setPaqueteSeleccionado(null);
                    setCoordenadasSeleccionadas(null);
                    setCoordenadasZoom(null);
                    handleSeleccionCard(null);
                  }}
                  className="boton-servicio"
                >
                  <ImCross />
                </button>
              </div>

              <div className="flex-1 px-4 py-2 overflow-y-auto">
                {categoriaActiva === "paquetes" ? (
                  <ItinerarioBusqueda itinerarios={[paqueteSeleccionado]} />
                ) : (
                  <ItinerarioPuntual
                    lugares={[paqueteSeleccionado]}
                    categoria={categoriaActiva}
                  />
                )}
              </div>

              { (categoriaActiva === "paquetes" || categoriaActiva === "eventos") && (
                <div className="sticky bottom-0 z-50 bg-white px-4 py-3 shadow-md rounded-b-lg">
                  <button
                    type="button"
                    className="btn-login text-blanco w-full py-2 rounded-md hover:bg-purple-700 transition-colors"
                    onClick={handleAgregarAlCarrito}
                  >
                    Agregar al Carrito
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

        {/* Vista móvil - CAMBIOS APLICADOS AQUÍ */}
        <div className="md:hidden px-4 py-4 space-y-6">
          {/*<FiltrosBusqueda
            abierto={filtroExpandido}
            setAbierto={setFiltroExpandido}
            categoriaActiva={categoriaActiva}
            setCategoriaActiva={setCategoriaActiva}
          />*/}

       
      <div className="relative flex-1 w-full overflow-hidden z-0">     
          <div className="relative w-full h-[80vh] overflow-hidden z-0">
            <Mapa
              coordenadas={coordenadas}
              coordenadasSeleccionadas={coordenadasSeleccionadas}
              categoriaActiva={categoriaActiva}
            />

              {/* FiltrosBotones siempre visible */}
              <div className="absolute top-4 left-2 right-2 z-30">
                <FiltrosBotones
                  categoriaActiva={categoriaActiva}
                  setCategoriaActiva={setCategoriaActiva}
                  categoriasVisibles={[
                    "paquetes",
                    "hospedaje",
                    "gastronomia",
                    "transportes",
                    "actividades",
                    "eventos",
                  ]}
                />
              </div>

              {paqueteSeleccionado && (
                <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-purple-100 text-black">
                    <span className="font-semibold text-xl md:text-sm">
                      {paqueteSeleccionado.titulo}
                    </span>
                    <button
                      onClick={() => {
                        setPaqueteSeleccionado(null);
                        setCoordenadasSeleccionadas(null);
                        setCoordenadasZoom(null); // Limpiar zoom
                        handleSeleccionCard(null);
                      }}
                      className="btn-header text-[#6E63CF]"
                      aria-label="Cerrar itinerario"
                    >
                      <ImCross />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {categoriaActiva === "paquetes" ? (
                      <ItinerarioBusqueda itinerarios={[paqueteSeleccionado]} />
                    ) : (
                      <ItinerarioPuntual 
                        lugares={[paqueteSeleccionado]} 
                        categoria={categoriaActiva}
                      />
                    )}
                  </div>
                  {/* Botón actualizado */}
                  {(categoriaActiva === "paquetes" || categoriaActiva === "eventos") && (
                  <div className="sticky bottom-0 z-50 bg-white px-6 py-6 shadow-md">
                    <button
                      type="button"
                      className="btn-login text-blanco w-full py-2 rounded-md hover:bg-purple-700 transition-colors"
                      onClick={handleAgregarAlCarrito}
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                  )}
                </div>
              )}

              <div
                className={`absolute bottom-0 left-0 right-0 transition-all duration-300 z-30 overflow-hidden ${
                  panelExpandido ? "h-[340px] sm:h-[400px]" : "h-0"
                }`}
              >
                <div className="bg-white rounded-t-xl shadow-lg h-full flex flex-col">
                  {/* Línea interactiva */}
                  <div
                    className="flex justify-center items-center h-10 cursor-pointer"
                    onClick={() => setPanelExpandido(!panelExpandido)}
                  >
                    <div
                      className={`transition-all duration-300 rounded-full bg-gray-400 ${
                        panelExpandido ? "w-12 h-1.5" : "w-12 h-1.5"
                      }`}
                    />
                  </div>

                {/* Contenido del panel */}
                {panelExpandido && (
                  <div className="flex-1 overflow-y-auto px-4 py-2">
                    <ResultadosBusqueda
                      categoriaActiva={categoriaActiva}
                      onItemsUpdate={handleItemsUpdate}
                      onSeleccionCard={handleSeleccionCard}
                      itinerarios={itinerarios}
                      paqueteSeleccionado={paqueteSeleccionado}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {!panelExpandido && (
            <div
              className="mt-2 flex justify-center items-center h-10 cursor-pointer"
              onClick={() => setPanelExpandido(true)}
            >
              <div className="transition-all duration-300 rounded-full bg-gray-400 w-12 h-1.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Busqueda;
