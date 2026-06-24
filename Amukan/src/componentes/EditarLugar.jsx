// componentes/EditarLugar.jsx
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { serviceService } from "../services/serviceService";
import { useState, useEffect, useMemo } from "react"; 
import Select from 'react-select';
import api from "../utils/api";
import MapaSelector from './MapaSelector';

export default function EditarLugar({ placeId }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [choices, setChoices] = useState({ currency: [], placeType: [] });
  const [zonas, setZonas] = useState([]);

  // Añadir los estados de las secciones
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

  // Estados de Inputs
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [coordinates, setCoordinates] = useState(null);
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

  // Cargar Choices y Zonas
  useEffect(() => {
    Promise.all([
      api.get("/choices/"),
      api.get("/location/zones/")
    ])
    .then(([choicesRes, zonasRes]) => {
      setChoices(choicesRes.data);
      setZonas(zonasRes.data.data);
    })
    .catch(err => console.error("Error al cargar datos:", err));
  }, []);

  // Cargar datos del Lugar a Editar
  useEffect(() => {
    if (!placeId) return;
    
    const fetchPlace = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/location/${placeId}/`);
        const s = res.data;
        
        setNombre(s.name || "");
        setDescripcion(s.description || "");
        setPlaceType(s.type || "");
        setDireccion(s.address || "");
        setZona(s.zone_id || "");
        setPrecio(s.average_price || "");
        setHorario(s.schedule?.info || "");
        if (s.coordinates && s.coordinates.coordinates) {
          const coords = { lat: s.coordinates.coordinates[1], lng: s.coordinates.coordinates[0] };
          setCoordinates(coords);
          setLatitud(coords.lat.toString());
          setLongitud(coords.lng.toString());
        }
        setAccesibilidadCheck(!!s.accessibility_features);
        setAccesibilidadTipo(s.accessibility_features?.info || "");
        setCoverPreview(s.cover_image?.public_url || null); 
        
      } catch (err) {
        console.error("Error cargando el lugar:", err);
        Swal.fire("Error", "No se pudo cargar el lugar a editar", "error");
        navigate("/mi-comercio");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlace();
  }, [placeId, navigate]);

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
    setCoordinates({ lat, lng });
    setLoading(true);
    setErrores(prev => ({ ...prev, zona: false, latitud: false, longitud: false }));
    try {
      const zonaRes = await api.get(`/location/get-info-from-coords/?lat=${lat}&lng=${lng}`);
      if (zonaRes.data.zone_id) {
        setZona(zonaRes.data.zone_id);
      }
    } catch (zonaError) {
      setZona("");
      setErrores(prev => ({ ...prev, zona: true }));
      Swal.fire("Advertencia", "El punto seleccionado está fuera de una zona registrada.", "warning");
    } finally {
      setLoading(false);
    }
  };

  // Estilos y validación 
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

  const handleActualizar = async () => {
    if (!validarSeccion()) return;
    setSaving(true);

    try {
      const placeData = preparePlaceData();
      
      if (coverFile) {
        try {
          const orgId = user?.organization_id?.organization_id || user?.organization_id || null;
          const formData = new FormData();
          formData.append("file", coverFile);
          if (orgId) formData.append("organization_id", orgId);
          const res = await api.post("/uploads/direct", formData, { headers: { "Content-Type": "multipart/form-data" } });
          placeData.cover_image_id = res.data.image_id; 
        } catch (err) {
          console.error("Error subiendo imagen del lugar:", err);
          Swal.fire("Error", "No se pudo subir la imagen del lugar. Intenta nuevamente.", "error");
          setSaving(false);
          return;
        }
      } else if (!coverPreview) { // Si el preview es null, significa que se borró
        placeData.cover_image_id = null;
      }
      // Si hay preview pero no file, no se envía 'cover_image_id' y el backend no la toca.

      console.log("Enviando a updatePlace (PATCH):", placeData);
      
      await api.patch(`/location/${placeId}/update/`, placeData);

      Swal.fire({
        icon: "success",
        title: `¡Lugar Actualizado!`,
        text: `"${placeData.name}" actualizado exitosamente`,
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/mi-comercio');

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
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Lugar</label>
        <select 
          value={placeType} 
          onChange={e => setPlaceType(e.target.value)}
          className={errores.placeType ? inputErrorStyle : inputStyle}
        >
          <option value="">Selecciona tipo</option>
          {choices.placeType && choices.placeType
            .map((tipo) => (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del lugar</label>
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
                  // --- AÑADIR BOTÓN DE BORRAR IMAGEN ---
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
              <div className="bg-gray-100 px-4 py-2 rounded-md text-gray-800 font-semibold">Lugar</div>
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
                  <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} className={errores.descripcion?textareaErrorStyle:textareaStyle} rows="3"></textarea>
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
                  <input type="number" value={precio} min="0" onChange={e=>setPrecio(e.target.value)} className={errores.precio?inputErrorStyle:inputStyle} />
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
          <button onClick={handleActualizar} disabled={saving} className=" w-full mt-4 bg-[#368F8B]  text-white px-6 py-2 rounded-lg hover:bg-[#2c6f6d] disabled:opacity-50 boton-popup mb-10">
            {saving ? "Actualizando..." : "Actualizar Lugar"}
          </button>
        </div>
      </div>
    );
  };

  return renderFormulario();
}