// componentes/CrearLugar.jsx

import { useAuth } from "../hooks/useAuth";
import Header from "./Header";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { serviceService } from "../services/serviceService";
import { useState, useEffect, useMemo } from "react"; 
import Select from 'react-select';
import Breadcrumb from '../componentes/Breadcrumb';
import api from "../utils/api";
import MapaSelector from './MapaSelector';

export default function CrearLugar() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || '/mi-comercio';

  const serviceType = 'place';
  const nombreTipo = "Lugar";

  const [loading, setLoading] = useState(false);
  const [choices, setChoices] = useState({ currency: [], placeType: [] });
  const [zonas, setZonas] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/choices/"),
      api.get("/location/zones/")
    ])
    .then(([choicesRes, zonasRes]) => {
      setChoices(choicesRes.data);
      setZonas(zonasRes.data.data);
    })
    .catch(err => {
      console.error("Error al cargar datos:", err);
      Swal.fire("Error", "No se pudieron cargar los datos iniciales.", "error");
    });
  }, []);

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
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [placeType, setPlaceType] = useState("");
  const [horario, setHorario] = useState("");
  const [precio, setPrecio] = useState("");
  const [coverImage, setCoverImage] = useState(null);    
  const [coverPreview, setCoverPreview] = useState(null); 
  const [coverFile, setCoverFile] = useState(null); 
  const [accesibilidadCheck, setAccesibilidadCheck] = useState(false);
  const [accesibilidadTipo, setAccesibilidadTipo] = useState("");
  const [errores, setErrores] = useState({});

  const opcionesZonas = useMemo(() => {
    if (!Array.isArray(zonas)) return [];
    return zonas.map(z => ({
      value: z.zone_id,
      label: `${z.name} (${z.level})`
    }));
  }, [zonas]);


  const handleLocationSelect = async (coords) => {
    const { lat, lng } = coords;
    setLatitud(lat.toFixed(6));
    setLongitud(lng.toFixed(6));
    setLoading(true);
    setErrores(prev => ({ ...prev, zona: false, latitud: false, longitud: false }));
    try {
      const zonaRes = await api.get(`/location/get-info-from-coords/?lat=${lat}&lng=${lng}`);
      if (zonaRes.data.zone_id) {
        setZona(zonaRes.data.zone_id);
      }
    } catch (zonaError) {
      const errorMsg = zonaError.response?.data?.detail || "Punto fuera de zona";
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

  const validarSeccion = () => {
    let todosErrores = {};
    if(!nombre.trim()) todosErrores.nombre = true;
    if(!placeType) todosErrores.placeType = true;
    if(!descripcion.trim()) todosErrores.descripcion = true;
    if(!zona) todosErrores.zona = true;
    if(!latitud.trim()) todosErrores.latitud = true;
    if(!longitud.trim()) todosErrores.longitud = true;
    if(precio === "" || Number(precio) < 0) todosErrores.precio = true;
    if(accesibilidadCheck && !accesibilidadTipo.trim()) todosErrores.accesibilidadTipo = true;
    setErrores(todosErrores);
    if(Object.keys(todosErrores).length > 0){
      Swal.fire("Error", "Faltan campos obligatorios. Revisa todas las secciones.", "error");
      return false;
    }
    return true;
  };

  const preparePlaceData = () => {
    const payload = {
      name: nombre,
      description: descripcion,
      type: placeType,
      address: direccion,
      zone_id: zona,
      average_price: parseFloat(precio) || 0,
      schedule: horario ? { info: horario } : null,
      coordinates: null,
    };
    if (longitud && latitud) {
      payload.coordinates = {
        type: "Point",
        coordinates: [parseFloat(longitud), parseFloat(latitud)]
      };
    }
    if (accesibilidadCheck && accesibilidadTipo) {
      payload.accessibility_features = { info: accesibilidadTipo };
    }
    return payload;
  };

  const handleGuardar = async () => {
    if (!validarSeccion()) return;
    setLoading(true);

    try {
      let result;
      const placeData = preparePlaceData();
      
      if (coverFile && !coverImage) {
        try {
          const orgId = user?.organization_id?.organization_id || user?.organization_id || null;
          const formData = new FormData();
          formData.append("file", coverFile);
          if (orgId) formData.append("organization_id", orgId);
          const res = await api.post("/uploads/direct", formData, { headers: { "Content-Type": "multipart/form-data" } });
          setCoverImage(res.data);
          placeData.cover_image_id = res.data.image_id; 
        } catch (err) {
          console.error("Error subiendo imagen del lugar:", err);
          Swal.fire("Error", "No se pudo subir la imagen del lugar. Intenta nuevamente.", "error");
          setLoading(false);
          return;
        }
      } else if (coverImage) {
        placeData.cover_image_id = coverImage.image_id;
      }

      console.log("Enviando a createPlace:", placeData);
      result = await serviceService.createPlace(placeData);

      Swal.fire({
        icon: "success",
        title: `¡Lugar creado!`,
        text: `"${result.name}" creado exitosamente`,
        timer: 1500,
        showConfirmButton: false
      });

      navigate(returnTo, { 
        state: { newPlaceId: result.place_id } 
      });

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Lugar</label>
          <select 
            value={placeType} 
            onChange={e => setPlaceType(e.target.value)}
            className={errores.placeType ? inputErrorStyle : inputStyle}
          >
            <option value="">Selecciona tipo</option>
            {choices.placeType && choices.placeType.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Horario (texto)</label>
          <input 
            type="text" 
            value={horario} 
            onChange={e => setHorario(e.target.value)}
            className={inputStyle}
            placeholder="Ej: Lunes a Viernes de 9:00 a 18:00"
          />
        </div>
      </div>
    );
  };

  const renderMapCreator = () => {
    return (
      <div className="flex flex-col gap-4">
        <label className="block text-sm font-medium text-gray-700">{loading ? "Buscando zona..." : "Haz clic en el mapa para ubicar el lugar"}</label>
        <MapaSelector onLocationSelect={handleLocationSelect} /> 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (Opcional)</label>
          <textarea value={direccion} onChange={e => setDireccion(e.target.value)} className={errores.direccion ? textareaErrorStyle : textareaStyle} placeholder="Ej: Av. Siempre Viva 123. (Opcional)" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zona (automática)</label>
          <Select
            options={opcionesZonas}
            value={opcionesZonas.find(op => op.value === zona)}
            placeholder={errores.zona ? "¡Punto fuera de zona registrada!" : (zona ? "Zona encontrada" : "Se completará al hacer clic...")}
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
  };
  const renderFormulario = () => {
    return (
      <div className="flex flex-col gap-4 mr-0 md:mr-10 ml-0 md:ml-10 text-left ">
        
        <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("informacion")}>
          <h3 className="text-2xl font-bold text-gray-800">Información</h3>
          <span className="text-gray-500 text-xl">{seccionAbierta.informacion ? "▲" : "▼"}</span>
        </div>
        {seccionAbierta.informacion && (
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={errores.nombre ? inputErrorStyle : inputStyle} placeholder={"Ej: Hotel del Lago"} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del lugar</label>
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
          </div>
        )}
        
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
                  <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} className={errores.descripcion?textareaErrorStyle:textareaStyle} rows="3" placeholder="Describe el lugar..."></textarea>
                </div>
              </div>
            )}
            
            <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("ubicacion")}>
              <h3 className="text-xl text-gray-800">Ubicación</h3>
              <span className="text-gray-500 text-xl">{seccionAbierta.ubicacion ? "▲" : "▼"}</span>
            </div>
            {seccionAbierta.ubicacion && (
              <div className="flex flex-col gap-4 px-6 pb-6">
                {renderMapCreator()}
              </div>
            )}

            <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("precio")}>
              <h3 className="text-xl text-gray-800">Precio</h3>
              <span className="text-gray-500 text-xl">{seccionAbierta.precio ? "▲" : "▼"}</span>
            </div>
            {seccionAbierta.precio && (
              <div className="flex flex-col gap-4 px-6 pb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Promedio</label>
                  <input type="number" value={precio} min="0" onChange={e=>setPrecio(e.target.value)} className={errores.precio?inputErrorStyle:inputStyle} placeholder="Ej: 20000"/>
                </div>
              </div>
            )}
            
            <div className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-black select-none" onClick={() => toggleSeccion("extras")}>
              <h3 className="text-xl text-gray-800">Extras</h3>
              <span className="text-gray-500 text-xl">{seccionAbierta.extras ? "▲" : "▼"}</span>
            </div>
            {seccionAbierta.extras && (
              <div className="flex flex-col gap-4 px-6 pb-6">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={accesibilidadCheck} onChange={(e) => setAccesibilidadCheck(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#368F8B]/40 rounded-full peer peer-checked:bg-[#368F8B] transition-all"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">Accesibilidad disponible</span>
                </div>
                {accesibilidadCheck && (
                  <input type="text" value={accesibilidadTipo} onChange={(e) => setAccesibilidadTipo(e.target.value)} className={errores.accesibilidadTipo ? inputErrorStyle : inputStyle} placeholder="Especifica el tipo de accesibilidad" />
                )}
              </div>
            )}
          </div>
        )}

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