import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../componentes/Header";
import Breadcrumb from "../componentes/Breadcrumb";
import Swal from "sweetalert2";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { logout, fetchUser } = useAuth();

  const [originalData, setOriginalData] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    gender: "",
    nationality: "",
    language: "",
  });
  const [choices, setChoices] = useState({ 
    gender: [], 
    nationality: [], 
    language: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Cargar datos del usuario y las opciones de los selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Realizar ambas peticiones en paralelo para mayor eficiencia
        const [userRes, choicesRes] = await Promise.allSettled([
          api.get("/user/me/"),
          api.get("/user/choices/")
        ]);

        // Manejar respuesta del usuario
        if (userRes.status === 'rejected') {
          const err = userRes.reason;
          if (err.response?.status === 401) {
            setError("Token inválido o expirado. Por favor, inicia sesión nuevamente.");
            return;
          }
          throw new Error(err.message || "Error al obtener datos del usuario");
        }

        const userData = userRes.value.data;

        // Manejar respuesta de choices
        let choicesData = { gender: [], nationality: [], language: [] };
        if (choicesRes.status === 'fulfilled') {
          choicesData = choicesRes.value.data;
          console.log("[EditarPerfil] choicesData recibida:", choicesData);
        } else {
          console.warn("[EditarPerfil] Error fetching choices:", choicesRes.reason);
        }

        // Aplicar datos al estado
        setChoices({
          gender: Array.isArray(choicesData.gender) ? choicesData.gender : [],
          nationality: Array.isArray(choicesData.nationality) ? choicesData.nationality : [],
          language: Array.isArray(choicesData.language) ? choicesData.language : [],
        });

        setOriginalData(userData);
        setFormData({
          username: userData.username || "",
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          gender: userData.gender || "",
          nationality: userData.nationality || "",
          language: userData.language || "",
        });

      } catch (err) {
        console.error("[EditarPerfil] fetchData error:", err);
        
        if (err.response?.status === 401) {
          setError("Token inválido o expirado. Por favor, inicia sesión nuevamente.");
        } else {
          setError(err.message || "Error desconocido al cargar datos.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manejar cambios en inputs y selects
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar solo los campos modificados
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFields = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => value !== originalData[key])
    );

    if (!Object.keys(updatedFields).length) {
      Swal.fire("Sin cambios", "No has modificado ningún campo", "info");
      return;
    }

    console.log("[EditarPerfil] PATCH /user/me/ body:", updatedFields);

    try {
      const res = await api.patch("/user/me/", updatedFields);
      
      console.log("[EditarPerfil] submit response =", res.data);

      // Actualizar el contexto de autenticación
      if (fetchUser) {
        await fetchUser();
      }

      await Swal.fire({
        title: "¡Listo!",
        text: "Perfil actualizado correctamente",
        icon: "success",
        confirmButtonColor: "#6E63CF",
      });

      setOriginalData((prev) => ({ ...prev, ...updatedFields }));
      navigate("/perfil");
    } catch (err) {
      console.error("[EditarPerfil] submit error:", err);
      
      if (err.response?.status === 401) {
        Swal.fire({
          title: "Sesión expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonColor: "#6E63CF",
        }).then(() => {
          logout();
          navigate("/login");
        });
      } else {
        const errorMessage = err.response?.data?.detail || 
                           (err.response?.data && typeof err.response.data === 'object' ? 
                            JSON.stringify(err.response.data) : err.response?.data) || 
                           err.message || 
                           "Error al actualizar perfil";
        Swal.fire("Error", errorMessage, "error");
      }
    }
  };

  // Función para manejar el cierre de sesión manual
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#6E63CF] border-opacity-50"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Breadcrumb />

      <main className="flex-1 px-6 sm:px-12 lg:px-32 py-10">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-12 border border-gray-100">
          <Breadcrumb className="mb-8" />

          <h1 className="text-4xl font-bold text-gray-800 mb-3 text-center">
            Editar perfil
          </h1>
          <p className="text-gray-500 mb-6 text-center">
            Actualiza solo lo que necesites, el resto permanecerá igual.
          </p>

          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="flex justify-between items-center">
                <div>
                  <strong>Error:</strong> {error}
                </div>
                {error.includes("Token inválido") && (
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Iniciar sesión
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Cuenta */}
            <section>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Cuenta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Nombre de usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Tu nombre de usuario"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Idioma preferido</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
                  >
                    <option value="">Selecciona un idioma</option>
                    {choices.language.map((lang, index) => (
                      <option key={index} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Información básica */}
            <section>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Información personal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Tu apellido"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
                  />
                </div>
              </div>
            </section>

            {/* Información adicional */}
            <section>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Información adicional</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Género</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
                  >
                    <option value="">Selecciona</option>
                    {choices.gender.map((g, index) => (
                      <option key={index} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">País</label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
                  >
                    <option value="">Selecciona</option>
                    {choices.nationality.map((n, index) => (
                      <option key={index} value={n.value}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/perfil")}
                className="px-6 py-2 rounded-xl border border-gray-300 text-red-700 bg-white! hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#6E63CF] text-white font-semibold shadow hover:opacity-90 transition-all"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}