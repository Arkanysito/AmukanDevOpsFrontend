// componentes/EditarServicio.jsx
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { serviceService } from "../services/serviceService";
import { useState, useEffect, useMemo } from "react"; 
import Select from 'react-select';
import api from "../utils/api";
import MapaSelector from './MapaSelector';

export default function EditarServicio({ serviceType, serviceId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const nombresTipo = {
    accommodation: "Hospedaje",
    activity: "Actividad",
    transport: "Transporte"
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [choices, setChoices] = useState({ currency: [], placeType: [], activityType: [], accommodationType: []});
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
  const [policies, setPolicies] = useState("");
  const [details, setDetails] = useState("");
  const [precio, setPrecio] = useState("");
  const [moneda, setMoneda] = useState("CLP");
  const [coverImage, setCoverImage] = useState(null);    
  const [coverPreview, setCoverPreview] = useState(null); 
  const [coverFile, setCoverFile] = useState(null); 
  const [accommodationType, setAccommodationType] = useState("");
  const [amenities, setAmenities] = useState("");
  const [beds, setBeds] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [parking, setParking] = useState(false);
  const [activityType, setActivityType] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [guideIncluded, setGuideIncluded] = useState(false);
  const [detallesCheck, setDetallesCheck] = useState(false);
  const [detallesTexto, setDetallesTexto] = useState("");
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
  const [accesibilidadCheck, setAccesibilidadCheck] = useState(false);
  const [accesibilidadTipo, setAccesibilidadTipo] = useState("");


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

  // Cargar datos del Servicio a Editar
  useEffect(() => {
    if (!serviceId || !serviceType) return;
    
    const fetchService = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/experiences/services/${serviceType}/${serviceId}/`);
        const s = res.data;
        
        setNombre(s.name || "");
        setDescripcion(s.description || "");
        setPrecio(s.price || "");
        setMoneda(s.price_currency || "CLP");
        setPolicies(s.policies || "");
        setDetails(s.details || "");
        setPlaceId(s.place_id || "");
        setTags(s.tags || ""); 


        if (serviceType === "accommodation") {
          setAccommodationType(s.accommodation_type || "");
          setBeds(s.beds || "");
          setRoomCapacity(s.capacity || "");
          setCheckInTime(s.check_in_time || "14:00");
          setCheckOutTime(s.check_out_time || "12:00");
          setParking(s.parking || false);
          setAmenities(s.amenities || "");
        } else if (serviceType === "activity") {
          setActivityType(s.activity_type || "");
          setDurationMinutes(s.duration_minutes || "");
          setGuideIncluded(s.guide_included || false);
        }
        setCoverPreview(s.cover_image?.public_url || null);
        
      } catch (err) {
        console.error("Error cargando el servicio:", err);
        Swal.fire("Error", "No se pudo cargar el servicio a editar", "error");
        navigate("/mi-comercio");
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [serviceId, serviceType, navigate]);
  
  // Recoger newPlaceId al regresar 
  useEffect(() => {
    if (location.state?.newPlaceId) {
      setPlaceId(location.state.newPlaceId);
      setIsCreatingNewPlace(false);
      api.get("/destination/places/").then(res => setLugares(res.data.data));
    }
  }, [location.state]);


  // (Opciones, selects, estilos, etc.)
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
    if (serviceType === "accommodation") {
      if(!accommodationType) todosErrores.accommodationType = true;
      if(!beds || parseInt(beds) <= 0) todosErrores.beds = true;
      if(!roomCapacity || parseInt(roomCapacity) <= 0) todosErrores.roomCapacity = true;
    } else if (serviceType === "activity") {
      if(!activityType) todosErrores.activityType = true;
      if(!durationMinutes || parseInt(durationMinutes) <= 0) todosErrores.durationMinutes = true;
    }
    if(!descripcion.trim()) todosErrores.descripcion = true;
    if(!policies.trim()) todosErrores.policies = true; 
    if(!details.trim()) todosErrores.details = true;
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

  const prepareServiceData = (overridePlaceId = null) => {
    const baseData = {
      name: nombre,
      description: descripcion,
      price: parseFloat(precio) || 0,
      price_currency: moneda,
      policies: policies,
      details: details,
      place_id: overridePlaceId || placeId, 
      service_type: serviceType,
    };
    switch (serviceType) {
      case "accommodation":
        baseData.accommodation_type = accommodationType;
        baseData.amenities = amenities;
        baseData.beds = parseInt(beds) || 0;
        baseData.capacity = parseInt(roomCapacity) || 0;
        baseData.check_in_time = checkInTime;
        baseData.check_out_time = checkOutTime;
        baseData.parking = parking;
        break;
      case "activity":
        baseData.activity_type = activityType;
        baseData.duration_minutes = parseInt(durationMinutes) || 0;
        baseData.guide_included = guideIncluded;
        break;
    }
    return baseData;
  };

  const handleActualizar = async () => {
    if (!validarSeccion()) return;
    setSaving(true);

    try {
      let finalPlaceId = placeId;
      let uploadedImageData = null; // Inicia como null
      let newCoverImageId = null; // ID a enviar al backend

      // 1. Revisa si se subió un archivo nuevo
      if (coverFile) {
        try {
          const orgId = user?.organization_id?.organization_id || user?.organization_id || null;
          const formData = new FormData();
          formData.append("file", coverFile);
          if (orgId) formData.append("organization_id", orgId);
          const res = await api.post("/uploads/direct", formData, { headers: { "Content-Type": "multipart/form-data" } });
          uploadedImageData = res.data; // Datos de la imagen nueva
          newCoverImageId = uploadedImageData.image_id; // ID de la imagen nueva
        } catch (err) {
          console.error("Error subiendo imagen al guardar:", err);
          Swal.fire("Error", "No se pudo subir la imagen. Intenta nuevamente.", "error");
          setSaving(false);
          return;
        }
      } else if (coverPreview) {
        // 2. Si no hay archivo nuevo, pero hay preview, significa que mantenemos la imagen existente
        // No hacemos nada, 'newCoverImageId' sigue siendo null
        // El backend no recibirá 'cover_image_id' y no tocará la imagen
      } else {
        // 3. Si no hay archivo nuevo NI preview, el usuario borró la imagen
        newCoverImageId = null; // Enviaremos 'null' explícitamente
      }
      
      if (isCreatingNewPlace) {
        const newPlacePayload = {
          name: nombre, description: descripcion, type: placeType,
          address: direccion, zone_id: zona,
          coordinates: (longitud && latitud) ? { type: "Point", coordinates: [parseFloat(longitud), parseFloat(latitud)] } : null,
          schedule: horario ? { info: horario } : null, 
          average_price: parseFloat(precio) || 0
        };
        // Si creamos un lugar nuevo, le asignamos la imagen que acabamos de subir
        if (uploadedImageData) {
          newPlacePayload.cover_image_id = uploadedImageData.image_id;
        }
        
        const newPlaceResult = await serviceService.createPlace(newPlacePayload);
        finalPlaceId = newPlaceResult.place_id;
        loadInitialData();
      }

      const serviceData = prepareServiceData(finalPlaceId);
      
      if (!serviceData.details || typeof serviceData.details !== "object") {
        serviceData.details = typeof serviceData.details === "string" ? { text: serviceData.details } : {};
      }
      
      // --- Lógica de Imagen para el SERVICIO ---
      if (coverFile) { 
        // Si se subió un archivo NUEVO, lo ponemos en 'details' y 'cover_image_id'
        serviceData.details.cover_image = {
          id: uploadedImageData.image_id,
          object_key: uploadedImageData.object_key,
          url: uploadedImageData.public_url,
        };
        serviceData.cover_image_id = uploadedImageData.image_id;
      } else if (!coverPreview) {
        // Si no hay archivo Y no hay preview (borrado), enviamos 'null'
        serviceData.cover_image_id = null;
      }
      // Si hay preview pero no coverFile, no enviamos 'cover_image_id'
      // para que el backend no toque la imagen existente.
      
      console.log("Enviando a updateService (PATCH):", serviceData);
      
      await api.patch(`/experiences/services/${serviceType}/${serviceId}/update/`, serviceData);

      Swal.fire({
        icon: "success",
        title: `¡Servicio Actualizado!`,
        text: `"${serviceData.name}" actualizado exitosamente`,
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

  const renderCamposEspecificos = () => {
    switch(serviceType) {
      case "accommodation":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de alojamiento</label>
              <select value={accommodationType} onChange={e => setAccommodationType(e.target.value)} className={errores.accommodationType ? inputErrorStyle : inputStyle}>
                <option value="">Selecciona tipo</option>
                {choices.accommodationType && choices.accommodationType.map((tipo) => (<option key={tipo.value} value={tipo.value}>{tipo.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de camas</label>
              <input type="number" value={beds} onChange={e => setBeds(e.target.value)} className={errores.beds ? inputErrorStyle : inputStyle} min="1"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad de habitación</label>
              <input type="number" value={roomCapacity} onChange={e => setRoomCapacity(e.target.value)} className={errores.roomCapacity ? inputErrorStyle : inputStyle} min="1"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
              <input type="time" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} className={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
              <input type="time" value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} className={inputStyle} />
            </div>
            <div className="flex items-center">
              <input type="checkbox" checked={parking} onChange={e => setParking(e.target.checked)} className="h-5 w-5 accent-green-600 mr-2" />
              <label className="text-sm font-medium text-gray-700">Estacionamiento disponible</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amenidades (separadas por coma)</label>
              <input type="text" value={amenities} onChange={e => setAmenities(e.target.value)} className={inputStyle} placeholder="WiFi, Aire acondicionado, Piscina, etc." />
            </div>
          </div>
        );
      case "activity":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de actividad</label>
              <select value={activityType} onChange={e => setActivityType(e.target.value)} className={errores.activityType ? inputErrorStyle : inputStyle}>
                <option value="">Selecciona tipo</option>
                {choices.activityType && choices.activityType.map((tipo) => (<option key={tipo.value} value={tipo.value}>{tipo.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
              <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} className={errores.durationMinutes ? inputErrorStyle : inputStyle} min="1" />
            </div>
            <div className="flex items-center mt-5">
              <input type="checkbox" checked={guideIncluded} onChange={e => setGuideIncluded(e.target.checked)} className="h-5 w-5 accent-green-600 mr-2" />
              <label className="text-sm font-medium text-gray-700">Guía incluido</label>
            </div>
          </div>
        );
      default: return null;
    }
  };


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
            {/* --- Lógica de borrado de imagen --- */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del servicio</label>
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
                  <div className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-300 bg-gray-100">
                    <img src={coverPreview} alt="Portada" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => { setCoverPreview(null); setCoverFile(null); }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                      title="Eliminar imagen"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 border border-gray-400 rounded-md flex items-center justify-center text-gray-500 text-sm">Sin imagen</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-gray-800 font-semibold">{nombresTipo[serviceType] || "Servicio"}</div>
            </div>
            {serviceType && renderCamposEspecificos()}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} className={inputStyle} placeholder="Ej: tour, ciudad, familiar" />
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
            
            {/* --- SECCIÓN DESCRIPCIÓN --- */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Políticas</label>
                  <textarea value={policies} onChange={e=>setPolicies(e.target.value)} className={errores.policies?textareaErrorStyle:textareaStyle} rows="2"></textarea>
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
                        onChange={(op) => setPlaceId(op ? op.value : "")}
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

            {/* --- SECCIÓN DISPONIBILIDAD --- */}
            
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
            
            {/* --- SECCIÓN EXTRAS --- */}
            <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("extras")}>
              <h3 className="text-xl text-gray-800">Extras</h3>
              <span className="text-gray-500 text-xl">{seccionAbierta.extras ? "▲" : "▼"}</span>
            </div>
            {seccionAbierta.extras && (
              <div className="flex flex-col gap-4 px-6 pb-6">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={detallesCheck} onChange={(e) => setDetallesCheck(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#368F8B]/40 rounded-full peer peer-checked:bg-[#368F8B] transition-all"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Añadir detalles específicos</span>
                  </div>
                  {detallesCheck && (
                    <textarea value={detallesTexto} onChange={(e) => setDetallesTexto(e.target.value)} rows="3" className={errores.detallesTexto ? textareaErrorStyle : textareaStyle} placeholder="Agrega detalles opcionales" />
                  )}
              </div>
            )}
          </div>
        )}

        <div className="w-full mt-10">
          <button onClick={handleActualizar} disabled={saving} className=" w-full mt-4 bg-[#368F8B]  text-white px-6 py-2 rounded-lg hover:bg-[#2c6f6d] disabled:opacity-50 boton-popup mb-10">
            {saving ? "Actualizando..." : "Actualizar Servicio"}
          </button>
        </div>
      </div>
    );
  };

  return renderFormulario();
}