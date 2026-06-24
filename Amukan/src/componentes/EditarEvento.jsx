// componentes/EditarEvento.jsx

import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { serviceService } from "../services/serviceService";
import { useState, useEffect, useMemo } from "react"; 
import Select from 'react-select';
import api from "../utils/api";
import MapaSelector from './MapaSelector';

export default function EditarEvento({ eventId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [choices, setChoices] = useState({ currency: [], placeType: [] });
  const [lugares, setLugares] = useState([]);
  const [zonas, setZonas] = useState([]);

  // --- Estados de las secciones ---
  const [seccionAbierta, setSeccionAbierta] = useState({
    general: true,
    informacion: true,
    descripcion: true,
    ubicacion: true,
    precio: true,
    extras: true,
  });

  const toggleSeccion = (id) => {
    setSeccionAbierta(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Estados de Inputs ---
  const [nombre, setNombre] = useState("");
  const [tags, setTags] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [details, setDetails] = useState("");
  const [precio, setPrecio] = useState("");
  const [moneda, setMoneda] = useState("CLP");
  const [coverImage, setCoverImage] = useState(null);    
  const [coverPreview, setCoverPreview] = useState(null); 
  const [coverFile, setCoverFile] = useState(null); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [placeId, setPlaceId] = useState("");
  const [errores, setErrores] = useState({});
  const [isCreatingNewPlace, setIsCreatingNewPlace] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [placeType, setPlaceType] = useState("");
  const [horario, setHorario] = useState("");

  // Cargar Choices, Lugares y Zonas
  useEffect(() => {
    Promise.all([
      api.get("/choices/"),
      api.get("/destination/places/"),
      api.get("/location/zones/")
    ])
    .then(([choicesRes, lugaresRes, zonasRes]) => {
      setChoices(choicesRes.data);
      setLugares(lugaresRes.data.data);
      setZonas(zonasRes.data.data);
    })
    .catch(err => console.error("Error al cargar datos:", err));
  }, []);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    let date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Cargar datos del Evento a Editar
  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/experiences/events/${eventId}/`);
        const s = res.data;
        setNombre(s.name || "");
        setDescripcion(s.description || "");
        setDetails(s.details || "");
        setPrecio(s.price || "");
        setMoneda(s.price_currency || "CLP");
        setPlaceId(s.place_id || "");
        setStartDate(formatDateForInput(s.start_date));
        setEndDate(formatDateForInput(s.end_date));
        setIsFeatured(s.is_featured || false);
        setCoverPreview(s.cover_image?.public_url || null); 
      } catch (err) {
        console.error("Error cargando el evento:", err);
        Swal.fire("Error", "No se pudo cargar el evento a editar", "error");
        navigate("/mi-comercio");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, navigate]);
  
  // Recoger newPlaceId al regresar
  useEffect(() => {
    if (location.state?.newPlaceId) {
      setPlaceId(location.state.newPlaceId);
      setIsCreatingNewPlace(false);
      api.get("/destination/places/").then(res => setLugares(res.data.data));
    }
  }, [location.state]);


  const opcionesLugares = useMemo(() => {
    if (!Array.isArray(lugares)) return [];
    return lugares.map(lugar => ({ value: lugar.place_id, label: `${lugar.name} (${lugar.type})` }));
  }, [lugares]);
  const opcionesZonas = useMemo(() => {
    if (!Array.isArray(zonas)) return [];
    return zonas.map(z => ({ value: z.zone_id, label: `${z.name} (${z.level})` }));
  }, [zonas]);
  const handleLocationSelect = async (coords) => {
    const { lat, lng } = coords;
    setLatitud(lat.toFixed(6));
    setLongitud(lng.toFixed(6));
    setCoordinates({ lat, lng });
    setLoading(true);
    setErrores(prev => ({ ...prev, zona: false, latitud: false, longitud: false }));
    try {
      const zonaRes = await api.get(`/location/get-info-from-coords/?lat=${lat}&lng=${lng}`);
      if (zonaRes.data.zone_id) setZona(zonaRes.data.zone_id);
    } catch (zonaError) {
      setZona("");
      setErrores(prev => ({ ...prev, zona: true }));
      Swal.fire("Advertencia", "El punto seleccionado está fuera de una zona registrada.", "warning");
    } finally {
      setLoading(false);
    }
  };
  const inputStyle = "border border-gray-300 rounded-lg px-3 py-2 w-full bg-gray-50 text-gray-800";
  const inputErrorStyle = "border border-red-500 rounded-lg px-3 py-2 w-full bg-gray-50 text-gray-800";
  const textareaStyle = inputStyle;
  const textareaErrorStyle = "border border-red-500 rounded-lg px-3 py-2 w-full bg-gray-50 text-gray-800";

  // --- Validación ---
  const validarSeccion = () => {
    let todosErrores = {};
    if(!nombre.trim()) todosErrores.nombre = true;
    if(!startDate) todosErrores.startDate = true;
    if(!endDate) todosErrores.endDate = true;
    if(!descripcion.trim()) todosErrores.descripcion = true;
    if (isCreatingNewPlace) {
      if(!zona) todosErrores.zona = true;
      if(!latitud.trim()) todosErrores.latitud = true;
      if(!longitud.trim()) todosErrores.longitud = true;
      if(!placeType) todosErrores.placeType = true;
    } else {
      if(!placeId) todosErrores.placeId = true;
    }
    if(precio === "" || Number(precio) < 0) todosErrores.precio = true;
    if(!moneda) todosErrores.moneda = true;
    
    setErrores(todosErrores);
    if(Object.keys(todosErrores).length > 0){
      Swal.fire("Error", "Faltan campos obligatorios.", "error");
      return false;
    }
    return true;
  };

  const prepareEventData = (overridePlaceId = null) => {
    const eventData = {
      name: nombre,
      description: descripcion,
      price: parseFloat(precio) || 0,
      price_currency: moneda,
      details: details,
      place_id: overridePlaceId || placeId, 
      start_date: startDate,
      end_date: endDate,
      is_featured: isFeatured,
    };
    return eventData;
  };

  const handleActualizar = async () => {
    if (!validarSeccion()) return;
    setSaving(true);

    try {
      let finalPlaceId = placeId;
      let uploadedImageData = coverImage;

      if (coverFile) {
        try {
          const orgId = user?.organization_id?.organization_id || user?.organization_id || null;
          const formData = new FormData();
          formData.append("file", coverFile);
          if (orgId) formData.append("organization_id", orgId);
          const res = await api.post("/uploads/direct", formData, { headers: { "Content-Type": "multipart/form-data" } });
          uploadedImageData = res.data;
          setCoverImage(uploadedImageData);
        } catch (err) {
          console.error("Error subiendo imagen al guardar:", err);
          Swal.fire("Error", "No se pudo subir la imagen. Intenta nuevamente.", "error");
          setSaving(false);
          return;
        }
      }
      
      if (isCreatingNewPlace) {
        const newPlacePayload = {
          name: nombre, description: descripcion, type: placeType,
          address: direccion, zone_id: zona,
          coordinates: (longitud && latitud) ? { type: "Point", coordinates: [parseFloat(longitud), parseFloat(latitud)] } : null,
          schedule: horario ? { info: horario } : null, 
          average_price: parseFloat(precio) || 0
        };
        if (uploadedImageData) newPlacePayload.cover_image_id = uploadedImageData.image_id;
        
        const newPlaceResult = await serviceService.createPlace(newPlacePayload);
        finalPlaceId = newPlaceResult.place_id;
        loadInitialData();
      }

      const eventData = prepareEventData(finalPlaceId);
      
      if (!eventData.details || typeof eventData.details !== "object") {
        eventData.details = typeof eventData.details === "string" ? { text: eventData.details } : {};
      }
      
      if (uploadedImageData) {
        eventData.details.cover_image = {
          id: uploadedImageData.image_id,
          object_key: uploadedImageData.object_key,
          url: uploadedImageData.public_url,
        };
        eventData.cover_image_id = uploadedImageData.image_id;
      }        

      console.log("Enviando a updateEvent (PATCH):", eventData);
      
      await api.patch(`/experiences/events/${eventId}/update/`, eventData);

      Swal.fire({
        icon: "success",
        title: `¡Evento Actualizado!`,
        text: `"${eventData.name}" actualizado exitosamente`,
        timer: 2000,
        showConfirmButton: false
      });

      navigate("/mi-comercio");

    } catch (error) {
      console.error("Error al actualizar:", error);
      const errorMsg = error.response?.data?.detail || error.message || "Error al actualizar.";
      Swal.fire({ icon: "error", title: "Error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const renderCamposEspecificos = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de inicio</label>
        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${errores.startDate ? inputErrorStyle : inputStyle} cursor-pointer`} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de término</label>
        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${errores.endDate ? inputErrorStyle : inputStyle} cursor-pointer`} />
      </div>
      <div className="flex items-center mt-5">
        <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="h-5 w-5 accent-green-600 mr-2" />
        <label className="block text-sm font-medium text-gray-700">Evento destacado</label>
      </div>
    </div>
  );

  const renderMapCreator = () => (
    <div className="flex flex-col gap-4">
      <label className="block text-sm font-medium text-gray-700">{loading ? "Buscando zona..." : "Mueve el marcador para reubicar"}</label>
      <MapaSelector onLocationSelect={handleLocationSelect} initialCoordinates={coordinates} /> 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (Opcional)</label>
        <textarea value={direccion} onChange={e => setDireccion(e.target.value)} className={errores.direccion ? textareaErrorStyle : textareaStyle} placeholder="Ej: Av. Siempre Viva 123. (Opcional)" rows={2} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Zona (automática)</label>
        <Select
          options={opcionesZonas}
          value={opcionesZonas.find(op => op.value === zona)}
          placeholder={errores.zona ? "¡Punto fuera de zona registrada!" : (zona ? "Zona encontrada" : "Haz clic en el mapa...")}
          isDisabled={true} 
          styles={{
            control: (base, state) => ({ ...base, borderColor: errores.zona ? 'red' : (zona ? 'green' : '#D1D5DB'), backgroundColor: '#E5E7EB', cursor: 'not-allowed' }),
            placeholder: (base) => ({ ...base, color: errores.zona ? 'red' : '#6B7280' }),
            singleValue: (base) => ({ ...base, color: 'black' }),
          }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitud (automática)</label>
          <input type="text" readOnly value={latitud} className={errores.latitud ? inputErrorStyle : "border border-gray-300 rounded-lg px-3 py-2 w-full bg-gray-200 text-gray-700 cursor-not-allowed"} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitud (automática)</label>
          <input type="text" readOnly value={longitud} className={errores.longitud ? inputErrorStyle : "border border-gray-300 rounded-lg px-3 py-2 w-full bg-gray-200 text-gray-700 cursor-not-allowed"} />
        </div>
      </div>
    </div>
  );

  const renderFormulario = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center flex-1 py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#368F8B]" />
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4 mr-0 md:mr-10 ml-0 md:ml-10 text-left ">
        
        {/* --- SECCIÓN INFORMACIÓN --- */}
        <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("informacion")}>
          <h3 className="text-2xl font-bold text-gray-800">Información</h3>
          <span className="text-gray-500 text-xl">{seccionAbierta.informacion ? "▲" : "▼"}</span>
        </div>
        {seccionAbierta.informacion && (
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={errores.nombre ? inputErrorStyle : inputStyle} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del evento</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-[#8539A3] hover:bg-[#2c6f6d] text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200">
                  Cambiar imagen
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (coverPreview) URL.revokeObjectURL(coverPreview);
                    setCoverPreview(URL.createObjectURL(file));
                    setCoverFile(file);
                    setCoverImage(null);
                  }} />
                </label>
                {(coverPreview) ? (
                  <div className="w-32 h-32 rounded-md overflow-hidden border border-gray-300 bg-gray-100"><img src={coverPreview} alt="Portada" className="w-full h-full object-cover" /></div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 border border-gray-400 rounded-md flex items-center justify-center text-gray-500 text-sm">Sin imagen</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-gray-800 font-semibold">Evento</div>
            </div>
            {renderCamposEspecificos()}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} className={inputStyle} placeholder="Ej: musica, aire libre, familiar" />
            </div>
          </div>
        )}
        
        {/* --- SECCIÓN GENERAL --- */}
        <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => setSeccionAbierta(prev => ({ ...prev, general: !prev.general }))}>
          <h3 className="text-2xl font-bold text-gray-800">General</h3>
          <span className="text-gray-500 text-xl">{seccionAbierta.general ? "▲" : "▼"}</span>
        </div>
        {seccionAbierta.general && (
          <div className="flex flex-col gap-4 px-6 pb-6">
            
            <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("descripcion")}>
              <h3 className="text-xl text-gray-800">Descripción</h3>
              <span className="text-gray-500 text-xl">{seccionAbierta.descripcion ? "▲" : "▼"}</span>
            </div>
            {seccionAbierta.descripcion && (
              <div className="flex flex-col gap-4 px-6 pb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} className={errores.descripcion?textareaErrorStyle:textareaStyle} rows="3"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detalles adicionales</label>
                  <textarea value={details} onChange={e=>setDetails(e.target.value)} className={errores.details?textareaErrorStyle:textareaStyle} rows="2"></textarea>
                </div>
              </div>
            )}
            
            {/* --- SECCIÓN UBICACIÓN --- */}
            <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("ubicacion")}>
              <h3 className="text-xl text-gray-800">Ubicación</h3>
              <span className="text-gray-500 text-xl">{seccionAbierta.ubicacion ? "▲" : "▼"}</span>
            </div>
            {seccionAbierta.ubicacion && (
              <div className="flex flex-col gap-4 px-6 pb-6">
                { !isCreatingNewPlace ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
                      <Select
                        options={opcionesLugares}
                        onChange={(op) => { setPlaceId(op ? op.value : ""); }}
                        value={opcionesLugares.find(op => op.value === placeId)}
                        placeholder="Escribe para buscar un lugar..."
                        isClearable isSearchable 
                        styles={{
                          control: (base, state) => ({ ...base, borderColor: errores.placeId ? 'red' : base.borderColor, borderWidth: errores.placeId ? '2px' : '1px' }),
                          option: (base, state) => ({ ...base, color: state.isSelected ? base.color : 'black' }),
                        }}
                      />
                    </div>
                    <Link 
                      to="/crear-lugar"
                      state={{ from: location.pathname }}
                      className="text-sm text-[#368F8B] hover:underline text-left mt-2"
                    >
                      + El lugar no está en la lista (Crear nuevo)
                    </Link>
                  </>
                ) : (
                  <>
                    {renderMapCreator()}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Lugar</label>
                      <select value={placeType} onChange={e => setPlaceType(e.target.value)} className={errores.placeType ? inputErrorStyle : inputStyle}>
                        <option value="">Selecciona el tipo de lugar</option>
                        {choices.placeType && choices.placeType.map((tipo) => (<option key={tipo.value} value={tipo.value}>{tipo.label}</option>))}
                      </select>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horario del Lugar (texto)</label>
                      <input type="text" value={horario} onChange={e => setHorario(e.target.value)} className={inputStyle} placeholder="Ej: Lunes a Viernes de 9:00 a 18:00 (Opcional)" />
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsCreatingNewPlace(false);
                        setLatitud(""); setLongitud(""); setCoordinates(null); setZona(""); setPlaceType(""); setHorario("");
                      }}
                      className="text-sm text-gray-600 hover:underline text-left mt-2"
                    >
                      ← Cancelar y seleccionar un lugar existente
                    </button>
                  </>
                )}
              </div>
            )}

            {/* --- SECCIÓN PRECIO --- */}
            <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("precio")}>
              <h3 className="text-xl text-gray-800">Precio</h3>
              <span className="text-gray-500 text-xl">{seccionAbierta.precio ? "▲" : "▼"}</span>
            </div>
            {seccionAbierta.precio && (
              <div className="flex flex-col gap-4 px-6 pb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input type="number" value={precio} min="0" onChange={e=>setPrecio(e.target.value)} className={errores.precio?inputErrorStyle:inputStyle}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select value={moneda} onChange={e=>setMoneda(e.target.value)} className={errores.moneda?inputErrorStyle:inputStyle}>
                    {choices.currency && choices.currency.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                  </select>
                </div>
              </div>
            )}
            
            
          </div>
        )}

        {/* --- BOTÓN DE GUARDAR --- */}
        <div className="w-full mt-10">
          <button onClick={handleActualizar} disabled={saving} className=" w-full mt-4 bg-[#368F8B]  text-white px-6 py-2 rounded-lg hover:bg-[#2c6f6d] disabled:opacity-50 boton-popup mb-10">
            {saving ? "Actualizando..." : "Actualizar Evento"}
          </button>
        </div>
      </div>
    );
  };

  return renderFormulario();
}