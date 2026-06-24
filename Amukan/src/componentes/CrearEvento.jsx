// componentes/CrearEvento.jsx

import { useAuth } from "../hooks/useAuth";
import Header from "./Header";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { serviceService } from "../services/serviceService";
import { useState, useEffect, useMemo } from "react"; 
import Select from 'react-select';
import Breadcrumb from '../componentes/Breadcrumb';
import api from "../utils/api";

export default function CrearEvento() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // <-- Para la ruta de regreso

  const serviceType = 'event';
  const nombreTipo = "Evento";
  const hoy = new Date().toISOString().split("T")[0];
  const horaLocal = new Date().toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [loading, setLoading] = useState(false);
  const [choices, setChoices] = useState({ currency: [], placeType: [] });
  const [lugares, setLugares] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/choices/"),
      api.get("/destination/places/"),
    ])
    .then(([choicesRes, lugaresRes]) => {
      setChoices(choicesRes.data);
      setLugares(lugaresRes.data.data);
    })
    .catch(err => {
      console.error("Error al cargar datos:", err);
      Swal.fire("Error", "No se pudieron cargar los datos iniciales.", "error");
    });
  }, []);

  // --- RECOGER EL newPlaceId AL REGRESAR ---
  useEffect(() => {
    if (location.state?.newPlaceId) {
      // Un lugar fue creado y regresamos, seleccionarlo automáticamente
      setPlaceId(location.state.newPlaceId);
      // Opcional: recargar la lista de lugares para que aparezca
      api.get("/destination/places/").then(res => setLugares(res.data.data));
    }
  }, [location.state]);


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
  
  const [nombre, setNombre] = useState("");
  const [tags, setTags] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [details, setDetails] = useState("");
  const [precio, setPrecio] = useState("");
  const [moneda, setMoneda] = useState("CLP");
  const [coverImage, setCoverImage] = useState(null);    
  const [coverPreview, setCoverPreview] = useState(null); 
  const [coverFile, setCoverFile] = useState(null); 
  const [startDate, setStartDate] = useState(hoy);
  const [startTime, setStartTime] = useState(horaLocal);
  const [endDate, setEndDate] = useState(hoy);
  const [endTime, setEndTime] = useState(horaLocal);
  const [isFeatured, setIsFeatured] = useState(false);
  const [placeId, setPlaceId] = useState("");
  const [errores, setErrores] = useState({});

  const opcionesLugares = useMemo(() => {
    if (!Array.isArray(lugares)) return [];
    return lugares.map(lugar => ({
      value: lugar.place_id,
      label: `${lugar.name} (${lugar.type})`
    }));
  }, [lugares]);


  const inputStyle = "border border-gray-300 rounded-lg px-3 py-2 w-full bg-gray-50 text-gray-800";
  const inputErrorStyle = "border border-red-500 rounded-lg px-3 py-2 w-full bg-gray-50 text-gray-800";
  const textareaStyle = inputStyle;
  const textareaErrorStyle = "border border-red-500 rounded-lg px-3 py-2 w-full bg-gray-50 text-gray-800";

  const validarSeccion = () => {
    let todosErrores = {};
    if(!nombre.trim()) todosErrores.nombre = true;
    if(!startDate) todosErrores.startDate = true;
    if(!startTime) todosErrores.startDate = true;
    if(!endDate) todosErrores.endDate = true;
    if(!endTime) todosErrores.endDate = true;
    if(!descripcion.trim()) todosErrores.descripcion = true;
    
    if(!placeId) todosErrores.placeId = true;
    
    if(precio === "" || Number(precio) < 0) todosErrores.precio = true;
    if(!moneda) todosErrores.moneda = true;
    
    setErrores(todosErrores);
    
    if(Object.keys(todosErrores).length > 0){
      console.log("Errores de validación:", todosErrores);
      Swal.fire("Error", "Faltan campos obligatorios. Revisa todas las secciones.", "error");
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
      rating: 0,
      place_id: overridePlaceId || placeId, 
      start_date: `${startDate}T${startTime}`,
      end_date: `${endDate}T${endTime}`,
      is_featured: isFeatured,
    };
    return eventData;
  };

  const handleGuardar = async () => {
    if (!validarSeccion()) return;
    setLoading(true);

    try {
      let result;
      let finalPlaceId = placeId;
      let uploadedImageData = coverImage;

      if (coverFile && !coverImage) {
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
          setLoading(false);
          return;
        }
      }
      

      const eventData = prepareEventData();
      
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

      console.log("Enviando a createEvent:", eventData);
      result = await serviceService.createEvent(eventData);

      Swal.fire({
        icon: "success",
        title: `¡Evento creado!`,
        text: `"${result.name}" creado exitosamente`,
        timer: 2000,
        showConfirmButton: false
      });

      navigate("/mi-comercio");

    } catch (error) {
      console.error("Error al crear:", error);
      const errorMsg = error.response?.data?.detail || error.message || "Error al crear.";
      Swal.fire({ icon: "error", title: "Error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const renderCamposEspecificos = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de inicio</label>
          <div className="grid grid-cols-1 gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${errores.startDate ? inputErrorStyle : inputStyle} cursor-pointer`} onFocus={(e) => e.target.showPicker && e.target.showPicker()} />
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={`${errores.startDate ? inputErrorStyle : inputStyle} cursor-pointer`} onFocus={(e) => e.target.showPicker && e.target.showPicker()} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de término</label>
          <div className="grid grid-cols-1 gap-2">
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${errores.endDate ? inputErrorStyle : inputStyle} cursor-pointer`} onFocus={(e) => e.target.showPicker && e.target.showPicker()} />
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={`${errores.endDate ? inputErrorStyle : inputStyle} cursor-pointer`} onFocus={(e) => e.target.showPicker && e.target.showPicker()} />
          </div>
        </div>
        <div className="flex items-center mt-5">
          <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="h-5 w-5 accent-green-600 mr-2" />
          <label className="block text-sm font-medium text-gray-700">Evento destacado</label>
        </div>
      </div>
    );
  };



//-----------------------------------------------------------front---------------------------------------------------------------------

  const renderFormulario = () => {
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
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={errores.nombre ? inputErrorStyle : inputStyle} placeholder={"Ej: Concierto de Verano"} />
            </div>
            {/* --- Subida de imagen  --- */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del evento</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-[#8539A3] hover:bg-[#2c6f6d] text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200">
                  Subir imagen
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (coverPreview) URL.revokeObjectURL(coverPreview);
                    setCoverPreview(URL.createObjectURL(file));
                    setCoverFile(file);
                    setCoverImage(null);
                  }} />
                </label>
                {coverPreview ? (
                  <div className="w-32 h-32 rounded-md overflow-hidden border border-gray-300 bg-gray-100"><img src={coverPreview} alt="Portada" className="w-full h-full object-cover" /></div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 border border-gray-400 rounded-md flex items-center justify-center text-gray-500 text-sm">Vista previa</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-gray-800 font-semibold">{nombreTipo}</div>
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
            
            {/* --- SECCIÓN DESCRIPCIÓN --- */}
            <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("descripcion")}>
              <h3 className="text-xl text-gray-800">Descripción</h3>
              <span className="text-gray-500 text-xl">{seccionAbierta.descripcion ? "▲" : "▼"}</span>
            </div>
            {seccionAbierta.descripcion && (
              <div className="flex flex-col gap-4 px-6 pb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} className={errores.descripcion?textareaErrorStyle:textareaStyle} rows="3" placeholder="Describe el evento..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detalles adicionales</label>
                  <textarea value={details} onChange={e=>setDetails(e.target.value)} className={errores.details?textareaErrorStyle:textareaStyle} rows="2" placeholder="Cualquier información extra que quieras agregar"></textarea>
                </div>
              </div>
            )}
            
            {/* --- 8. SECCIÓN UBICACIÓN --- */}
            <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("ubicacion")}>
              <h3 className="text-xl text-gray-800">Ubicación</h3>
              <span className="text-gray-500 text-xl">{seccionAbierta.ubicacion ? "▲" : "▼"}</span>
            </div>
            {seccionAbierta.ubicacion && (
              <div className="flex flex-col gap-4 px-6 pb-6">
                {/* Solo mostramos el dropdown y el Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
                  <Select
                    options={opcionesLugares}
                    onChange={(opcionSeleccionada) => { setPlaceId(opcionSeleccionada ? opcionSeleccionada.value : ""); }}
                    value={opcionesLugares.find(op => op.value === placeId)}
                    placeholder="Escribe para buscar un lugar..."
                    isClearable isSearchable 
                    styles={{
                      control: (base, state) => ({ ...base, borderColor: errores.placeId ? 'red' : base.borderColor, borderWidth: errores.placeId ? '2px' : '1px' }),
                      option: (base, state) => ({ ...base, color: state.isSelected ? base.color : 'black' }),
                    }}
                  />
                </div>
                {/* Este botón ahora es un Link que pasa el 'state' de regreso */}
                <Link 
                  to="/crear-lugar"
                  state={{ from: location.pathname }} // <-- Pasa la ruta actual
                  className="px-6 py-2 rounded-xl bg-[#6E63CF]! text-white! font-semibold shadow hover:opacity-90 transition-all text-center"
                >
                  El lugar no está en la lista (Crear nuevo)
                </Link>
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
                  <input type="number" value={precio} min="0" onChange={e=>setPrecio(e.target.value)} className={errores.precio?inputErrorStyle:inputStyle} placeholder="Ej: 20000"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select value={moneda} onChange={e=>setMoneda(e.target.value)} className={errores.moneda?inputErrorStyle:inputStyle}>
                    {choices.currency && choices.currency.map((moneda) => (<option key={moneda.value} value={moneda.value}>{moneda.label}</option>))}
                  </select>
                </div>
              </div>
            )}
            
            
          </div>
        )}

        {/* --- BOTÓN DE GUARDAR --- */}
        <div className="w-full mt-10">
          <button onClick={handleGuardar} disabled={loading} className=" w-full mt-4 bg-[#368F8B]  text-white px-6 py-2 rounded-lg hover:bg-[#2c6f6d] disabled:opacity-50 boton-popup mb-10">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-white min-h-screen w-full overflow-y-auto">
      <Header user={user} isAuthenticated={isAuthenticated}/>
      <Breadcrumb />
      <h1 className="text-2xl font-bold text-gray-800 px-6 pt-4">
        Crea tu nuevo {nombreTipo}
      </h1>
      <div className="flex flex-col flex-1 gap-6 px-0 md:px-6 py-6 overflow-y-auto">
        <div className="flex-1 rounded-xl p-0 md:p-6 md:shadow-sm mb-5">
          {renderFormulario()}
        </div>
      </div>
    </div>
  );
}