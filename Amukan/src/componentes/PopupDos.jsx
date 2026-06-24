import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Destino from "./Destinopopup";
import Fecha from "./Fechaspopup";
import Presupuesto from "./Presupuestopopup";
import Experiencia from "./Experienciapopup";
import Personas from "./Personaspopup";
import Swal from "sweetalert2";
import api from "../utils/api";

const getSteps = (tipo) => {
  const base = ["TipoUsuario"];

  if (tipo === "residente") {
    return [...base,""];
  }

  if (tipo === "turista") {
    return [...base, "Destino", "Personas", "Presupuesto", "Experiencias"];
  }

  if (tipo === "turita2") {
    return [...base, "Destino", "Fechas", "Personas", "Presupuesto", "Experiencias"];
  }

  return [...base, "Destino", "Fechas", "Personas"];
};

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

export default function CustomStepper() {
  const [modal, setModal] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [expandido, setExpandido] = useState(false);
  const [expandidoPersonas, setExpandidoPersonas] = useState(false);
  const [habitaciones, setHabitaciones] = useState([{ adultos: 1, niños: 0 }]);

  const [destino, setDestino] = useState("Viña del Mar");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [fechasValidas, setFechasValidas] = useState(false);
  const [totalPersonas, setTotalPersonas] = useState(1);
  const [presupuesto, setPresupuesto] = useState("");
  const [experiencias, setExperiencias] = useState([]);

  const navigate = useNavigate();
  const steps = getSteps(tipoUsuario);

  //para que funcione la seleccion residente-------------------------------------------------------------------


  useEffect(() => {
    document.body.classList.toggle("active-modal", modal);
  }, [modal]);

  useEffect(() => {
    if (tipoUsuario === "turista") {
      const today = new Date();
      const formattedToday = formatDate(today);
      setFechaDesde(formattedToday);
      setFechaHasta(formattedToday);
      setFechasValidas(true);
    }
  }, [tipoUsuario]);

  const toggleModal = () => {
    setModal(!modal);
    setActiveStep(0);
    setTipoUsuario(null);
  };

  const isCurrentStepValid = () => {
    const currentStep = steps[activeStep];

    switch (currentStep) {
      case "TipoUsuario":
        return tipoUsuario !== null;

      case "Destino":
        return destino && destino.trim() !== "";

      case "Fechas":
        return fechasValidas;

      case "Personas":
        return totalPersonas > 0;

      case "Presupuesto":
        return presupuesto && parseFloat(presupuesto) > 0;

      case "Experiencias":
        return experiencias.length >= 1 && experiencias.length <=3;
        return experiencias.length >= 1 && experiencias.length <=3;
      
      default:
        return true;
    }
  };

  const buscarItinerarios = async () => {
    try {
      if (tipoUsuario !== "turista" && !fechasValidas) {
        Swal.fire({
          icon: "warning",
          title: "Fechas no válidas",
          text: "Por favor selecciona fechas válidas antes de continuar.",
          confirmButtonColor: "#6E63CF",
        });
        return;
      }

      const body = {
        destino,
        desde: fechaDesde || formatDate(new Date()),
        hasta: fechaHasta || formatDate(new Date()),
        presupuesto: parseFloat(presupuesto) || 0,
        cantidad_personas: parseInt(totalPersonas) || 1,
        experiencias,
      };

      const res = await api.post("/travel/preview-itinerary/", body);

      navigate("/busqueda", {
        state: {
          itinerario: res.data,
          parametrosBusqueda: body,
        },
      });

      toggleModal();

    } catch (err) {
      console.error("Error al buscar itinerario", err);
      Swal.fire({
        icon: "error",
        title: "Error al buscar itinerarios",
        text: "Por favor, intenta nuevamente.",
        confirmButtonColor: "#6E63CF",
      });
    }
  };

  const handleNext = () => {
    if (!isCurrentStepValid()) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos requeridos antes de continuar.",
        confirmButtonColor: "#6E63CF",
      });
      return;
    }

    if (tipoUsuario === "residente") {
      navigate("/cerca-mio");
      return;
    }

    if (activeStep === steps.length - 1) {
      buscarItinerarios();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFechasChange = (desde, hasta, validas) => {
    setFechaDesde(desde);
    setFechaHasta(hasta);
    setFechasValidas(validas);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="flex flex-col items-center">
        {/* Stepper (oculto en TipoUsuario) */}
        {steps[activeStep] !== "TipoUsuario" && (
          <div className="flex justify-between items-center mb-8 w-full">
            {steps.map((label, index) => {
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;
  
              return (
                <div key={label} className="flex-1 flex flex-col items-center ">
                  <div
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                      isCompleted
                        ? "text-white bg-[#368F8B]"
                        : isActive
                        ? "text-black bg-[#A5D9D6]"
                        : "text-gray-700 bg-[#D1D5DB]"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-[7px] md:text-[10px] text-gray-500 mt-1 uppercase tracking-wide ">
                    PASO {index + 1}
                  </span>
                  <span className="hidden md:inline md:text-[10px] mt-1 text-center text-gray-800 ">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
  
        {/* Contenido por paso */}
        <div
        className="rounded-lg p-6 relative bg-[#f1f1f1] shadow w-[90vw] sm:w-[500px] transition-all duration-300"
                style={{
                  height:
                    steps[activeStep] === "TipoUsuario"
                      ? "460px" // altura extendida solo para TipoUsuario
                      : `${(expandido || expandidoPersonas ? 250 : 260) + habitaciones.length * 100}px`,
                }}
              >
          <div className="mb-20">
            {steps[activeStep] === "TipoUsuario" && (
              <div className="w-full max-w-md mx-auto mb-5">
                <h2 className="ml-1 md:ml-3 md:ml-7 text-lg font-semibold mb-4 text-gray-800 text-left">
                  ¿Cómo deseas explorar?
                  <br />
                  <span className="text-sm font-normal">
                    Escoge como quieres comenzar
                  </span>
                </h2>
                <div className="flex flex-col items-center gap-3">
                  {[
                    { id: "residente", label: "Quiero explorar lo que tengo cerca" },
                    { id: "turista", label: "Me gustaría tener un panorama para hoy" },
                    { id: "turita2", label: "Quiero planear una experiencia extendida" },
                  ].map((opcion) => {
                    const isSelected = tipoUsuario === opcion.id;
                    return (
                      <div
                        key={opcion.id}
                        onClick={() => setTipoUsuario(opcion.id)}
                        className={`selector-opcion w-full max-w-[390px] px-4 py-3 rounded-md border cursor-pointer ${
                          isSelected ? "border-[#368F8B] bg-[#E6F4F3]" : "border-gray-300 bg-white"
                        } hover:border-[#368F8B] transition`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="selector-circulo">
                            {isSelected && "✓"}
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {opcion.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
  

            {steps[activeStep] === "Destino" && (
              <div>
                <h2 className="ml-1 md:ml-7 text-lg font-semibold mb-4 text-gray-800 text-left">
                  Elige tu zona de exploración en Viña del Mar
                  <br />
                  <span className="text-sm font-normal">
                    Escoge tu destino ideal
                  </span>
                </h2>
                <Destino
                  onDestinoChange={setDestino}
                  destinoActual={destino}
                />
              </div>
            )}

            {steps[activeStep] === "Fechas" && (
              <div>
                <h2 className="ml-1 md:ml-7 text-lg font-semibold mb-4 text-gray-800 text-left">
                  ¿Cuándo te gustaría viajar?
                  <br />
                  <span className="text-sm font-normal">
                    Escoge tu fecha de ida y vuelta
                  </span>
                </h2>
                <Fecha
                  onFechasChange={handleFechasChange}
                  fechaDesdeActual={fechaDesde}
                  fechaHastaActual={fechaHasta}
                  // Pasar prop para deshabilitar selección si es turista
                  deshabilitado={tipoUsuario === "turista"}
                />
              </div>
            )}

            {steps[activeStep] === "Personas" && (
              <div>
                <h2 className="ml-1 md:ml-7 text-lg font-semibold mb-4 text-gray-800 text-left">
                  ¿Con quién viajas?
                  <br />
                </h2>
                <Personas
                  habitaciones={habitaciones}
                  setHabitaciones={setHabitaciones}
                  expandido={expandidoPersonas}
                  setExpandido={setExpandidoPersonas}
                  onPersonasChange={setTotalPersonas}
                  personasActual={totalPersonas}
                />
              </div>
            )}

            {steps[activeStep] === "Presupuesto" && (
              <div>
                <h2 className="ml-1 md:ml-7 text-lg font-semibold mb-4 text-gray-800 text-left">
                  ¿Cuál es tu presupuesto?
                  <br />
                  <span className="text-sm font-normal">
                    Introduce la cantidad aproximada de tu presupuesto
                  </span>
                </h2>
                <Presupuesto
                  onPresupuestoChange={setPresupuesto}
                  presupuestoActual={presupuesto}
                />
              </div>
            )}

            {steps[activeStep] === "Experiencias" && (
              <div>
                <h2 className="ml-1 md:ml-7 text-lg font-semibold mb-4 text-gray-800 text-left">
                  ¿Qué te gustaría vivir?
                  <br />
                  <span className="text-sm font-normal">
                    Selecciona el tipo de experiencia que deseas experimentar (Hasta 3)
                  </span>
                </h2>
                <Experiencia
                  expandido={expandido}
                  setExpandido={setExpandido}
                  onExperienciasChange={setExperiencias}
                  experienciasActuales={experiencias}
                />
              </div>
            )}
          </div>

          {/* Footer de botones */}
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
            {steps[activeStep] === "TipoUsuario" ? (
              <span className="text-sm text-gray-400 select-none ml-5">Atrás</span>
            ) : (
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className={`boton-popupback ${
                  activeStep === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                Atrás
              </button>
            )}

            <button 
              onClick={handleNext} 
              className={`boton-popup ${!isCurrentStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isCurrentStepValid()}
            >
              {activeStep === steps.length - 1 ? "Buscar" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}