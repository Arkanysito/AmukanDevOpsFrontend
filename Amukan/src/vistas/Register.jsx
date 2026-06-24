import { useEffect, useState } from "react";
import AmukanLogo from "../assets/logohorizontal.jpg";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import Swal from 'sweetalert2';
import { FaRegCircle, FaCheckCircle, FaCheck, FaTimes,FaEye, FaEyeSlash, FaSearch } from "react-icons/fa";

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    usuario: "",
    correo: "",
    contraseña: "",
    repetirContraseña: "",
    genero: "",
    pais: ""
  });

  const [choices, setChoices] = useState({ gender: [], nationality: [] });
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailFormatValid, setEmailFormatValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [interestsError, setInterestsError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [pendingUsername, setPendingUsername] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const [interestFilter, setInterestFilter] = useState("");

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/choices/`).then(res => res.json()),
      fetch(`${API_BASE_URL}/user/interests/`).then(res => res.json())
    ])
      .then(([choicesData, interestsData]) => {
        setChoices(choicesData);
        setInterests(interestsData);
      })
      .catch(err => console.error("Error al cargar datos:", err));
  }, []);

  const checkUsernameAvailability = async (username) => {
    if (!username) return setUsernameStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/user/check-username/?username=${username}`);
      const data = await res.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch (err) {
      console.error("Error al verificar usuario:", err);
      setUsernameStatus(null);
    }
  };

  const checkEmailAvailability = async (email) => {
    if (!email) return setEmailStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/user/check-email/?email=${email}`);
      const data = await res.json();
      setEmailStatus(data.available ? "available" : "taken");
    } catch (err) {
      console.error("Error al verificar correo:", err);
      setEmailStatus(null);
    }
  };

  useEffect(() => {
    if (!pendingUsername) {
      setUsernameStatus(null);
      return;
    }
    
    const timer = setTimeout(() => {
      checkUsernameAvailability(pendingUsername);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [pendingUsername]);

  useEffect(() => {
    if (!pendingEmail) {
      setEmailStatus(null);
      setEmailFormatValid(true);
      return;
    }
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = regex.test(pendingEmail.trim());
    setEmailFormatValid(isValid);
    
    if (!isValid) {
      setEmailStatus(null);
      return;
    }
    
    const timer = setTimeout(() => {
      checkEmailAvailability(pendingEmail);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [pendingEmail]);

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 10,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordChecks(checks);
    return Object.values(checks).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "usuario") {
      setPendingUsername(value);
    }
    
    if (name === "correo") {
      setPendingEmail(value);
    }
    
    if (name === "contraseña") {
      validatePassword(value);
    }
  };

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => {
      const newSelection = prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId];

      if (newSelection.length < 5) {
        setInterestsError(`Debes seleccionar al menos 5 intereses (${newSelection.length}/5)`);
      } 
      else if(newSelection.length > 10){
        setInterestsError(`Ups, no puedes seleccionar más de 10 (${newSelection.length}/10)`);
      }
      else {
        setInterestsError("");
      }

      return newSelection;
    });
  };

  const canProceedToNextStep = () => {
    if (step === 1) {
      return formData.nombre.trim() &&
        formData.apellido.trim() &&
        formData.usuario.trim() &&
        usernameStatus === "available";
    }
    if (step === 2) {
      const passwordValid = Object.values(passwordChecks).every(Boolean);
      const samePassword = formData.contraseña === formData.repetirContraseña;
      return formData.correo.trim() &&
        formData.contraseña.trim() &&
        emailFormatValid &&
        emailStatus === "available" &&
        passwordValid &&
        samePassword;
    }
    if (step === 3) {
      return formData.genero && formData.pais;
    }
    if (step === 4) {
      return selectedInterests.length >= 5 && selectedInterests.length <=10;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (usernameStatus === "taken") {
      Swal.fire({
        icon: "error",
        title: "Nombre de usuario en uso",
        text: "El nombre de usuario ya está en uso.",
        confirmButtonColor: "#6E63CF",
      });
      setLoading(false);
      return;
    }

    if (emailStatus === "taken") {
      Swal.fire({
        icon: "error",
        title: "Correo registrado",
        text: "El correo electrónico ya está registrado.",
        confirmButtonColor: "#6E63CF",
      });
      setLoading(false);
      return;
    }

    if (!emailFormatValid) {
      Swal.fire({
        icon: "warning",
        title: "Formato de correo inválido",
        text: "Usa algo como usuario@dominio.com",
        confirmButtonColor: "#6E63CF",
      });
      setLoading(false);
      return;
    }

    if (!formData.genero || !formData.pais) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos.",
        confirmButtonColor: "#6E63CF",
      });
      setLoading(false);
      return;
    }

    if (selectedInterests.length < 5) {
      setInterestsError("Debes seleccionar al menos 5 intereses para continuar.");
      Swal.fire({
        icon: "info",
        title: "Selecciona más intereses",
        text: "Debes seleccionar al menos 5 intereses para continuar.",
        confirmButtonColor: "#6E63CF",
      });
      setLoading(false);
      return;
    }

    const userPayload = {
      first_name: formData.nombre.trim(),
      last_name: formData.apellido.trim(),
      username: formData.usuario.trim().toLowerCase(),
      email: formData.correo.trim().toLowerCase(),
      password: formData.contraseña,
      gender: formData.genero,
      nationality: formData.pais,
    };

    try {
      const userRes = await fetch(`${API_BASE_URL}/user/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      });

      const userResponseData = await userRes.json();

      if (!userRes.ok) {
        console.error("Error al registrar:", userResponseData);
        let errorMessage = "Error al registrar usuario";

        if (userResponseData.detail) {
          errorMessage = userResponseData.detail;
        } else if (userResponseData.email) {
          errorMessage = userResponseData.email[0];
        } else if (userResponseData.username) {
          errorMessage = userResponseData.username[0];
        }

        Swal.fire({
          icon: "error",
          title: "Error al registrar",
          text: errorMessage,
          confirmButtonColor: "#6E63CF",
        });
        setLoading(false);
        return;
      }

      const loginRes = await fetch(`${API_BASE_URL}/user/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userPayload.username,
          password: userPayload.password,
        }),
      });

      if (!loginRes.ok) throw new Error("Error al iniciar sesión tras el registro");

      const tokenData = await loginRes.json();
      
      // IMPORTANTE: Guardar tokens en localStorage
      localStorage.setItem("access_token", tokenData.access);
      localStorage.setItem("refresh_token", tokenData.refresh);

      const interestsRes = await fetch(`${API_BASE_URL}/user/me/interests/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.access}`,
        },
        body: JSON.stringify({ interests: selectedInterests }),
      });

      if (!interestsRes.ok) {
        console.warn("No se pudieron guardar los intereses");
      }

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: "Tu cuenta fue creada y has iniciado sesión correctamente.",
        confirmButtonColor: "#6E63CF",
        timer: 2000,
        showConfirmButton: false,
      });

      // IMPORTANTE: Forzar recarga de la página para que el contexto de autenticación se actualice
      // Opción 1: Navegar y recargar
      window.location.href = "/";
      
      // Opción 2 (alternativa): Si tienes un contexto de autenticación, actualizarlo antes de navegar
      // await refreshAuthContext(); // Tu función que actualiza el contexto
      // navigate("/", { replace: true });

    } catch (err) {
      console.error("Error de red:", err);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "Intenta nuevamente.",
        confirmButtonColor: "#6E63CF",
      });
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (canProceedToNextStep()) {
      setStep((prev) => prev + 1);
    } else {
      if (step === 4 && selectedInterests.length < 5) {
        setInterestsError(`Debes seleccionar al menos 5 intereses (${selectedInterests.length}/5)`);
      } else {
        Swal.fire({
          title: "Campos incompletos",
          text: "Por favor completa todos los campos correctamente antes de continuar.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
      }
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const filteredInterests = interests.filter(interest =>
    interest.name.toLowerCase().includes(interestFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full max-w-2xl">

        <div className="w-full px-4 sm:px-6 flex justify-center items-center">
          <img
            src={AmukanLogo}
            alt="Logo AMUKAN"
            className="w-[170px] h-[50px] object-contain"
          />
        </div>
        <p className="text-3xl md:text-4xl text-center font-bold">
          Crea tu cuenta
        </p>
        <p className="text-center text-gray-500 mb-6 text-sm sm:text-base">
          Paso {step} de 4
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Nombre <span className="text-red-500">*</span>
                   </label>
                   <input
                     type="text"
                     name="nombre"
                     value={formData.nombre}
                     onChange={handleChange}
                     className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E63CF] text-black"
                     placeholder="Ej: Juan"
                     required
                   />
                 </div>
 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Apellido <span className="text-red-500">*</span>
                   </label>
                   <input
                     type="text"
                     name="apellido"
                     value={formData.apellido}
                     onChange={handleChange}
                     className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E63CF] text-black"
                     placeholder="Ej: Pérez"
                     required
                   />
                 </div>
               </div>
 
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Usuario <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="text"
                   name="usuario"
                   value={formData.usuario}
                   onChange={handleChange}
                   className={`w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E63CF] text-black ${
                     usernameStatus === "taken" ? "border-red-500" : "border-gray-300"
                   }`}
                   placeholder="Tu usuario (sin espacios)"
                   required
                 />
                 {usernameStatus === "available" && (
                   <p className="text-sm text-green-600 mt-1 flex justify-center items-center gap-2">
                     <FaCheck className="text-green-500" /> Usuario disponible
                   </p>
                 )}
                 {usernameStatus === "taken" && (
                   <p className="text-sm text-red-600 mt-1 flex justify-center items-center gap-2">
                     <FaTimes className="text-red-500" /> Este usuario ya está en uso
                   </p>
                 )}
               </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Correo electrónico <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="email"
                   name="correo"
                   value={formData.correo}
                   onChange={handleChange}
                   className={`w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E63CF] text-black ${
                     (!emailFormatValid || emailStatus === "taken") && formData.correo ? "border-red-500" : "border-gray-300"
                   }`}
                   placeholder="tucorreo@example.com"
                   required
                 />
                 {!emailFormatValid && formData.correo && (
                   <p className="text-sm text-red-600 mt-1 flex items-center gap-2">
                     <FaTimes className="text-red-500" /> Formato inválido. Usa usuario@dominio.com
                   </p>
                 )}
                 {emailStatus === "available" && emailFormatValid && formData.correo && (
                   <div className="flex justify-center mt-1">
                     <p className="text-sm text-green-600 flex items-center gap-2">
                       Correo disponible <FaCheck className="text-green-500" />
                     </p>
                   </div>
                 )}
 
                 {emailStatus === "taken" && emailFormatValid && formData.correo && (
                   <p className="text-sm text-red-600 mt-1 flex items-center gap-2">
                     <FaTimes className="text-red-500" /> Este correo ya está registrado
                   </p>
                 )}
               </div>
 
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Contraseña <span className="text-red-500">*</span>
                 </label>
                 <div className="relative">
                   <input
                     type={showPassword ? "text" : "password"}
                     name="contraseña"
                     value={formData.contraseña}
                     onChange={handleChange}
                     className="w-full px-3 sm:px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E63CF] text-black"
                     placeholder="**********"
                     minLength="10"
                     required
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 bg-white! top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#6E63CF]"
                   >
                     {showPassword ? <FaEye /> : <FaEyeSlash />}
                   </button>
                 </div>
               </div>
 
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Repite la contraseña <span className="text-red-500">*</span>
                 </label>
                 <div className="relative">
                   <input
                     type={showRepeatPassword ? "text" : "password"}
                     name="repetirContraseña"
                     value={formData.repetirContraseña || ""}
                     onChange={handleChange}
                     className={`w-full px-3 sm:px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E63CF] text-black ${
                       formData.repetirContraseña && formData.repetirContraseña !== formData.contraseña
                         ? "border-red-500"
                         : "border-gray-300"
                     }`}
                     placeholder="Vuelve a escribir la contraseña"
                     required
                   />
                   <button
                     type="button"
                     onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent! text-gray-500 hover:text-[#6E63CF]"
                   >
                     {showRepeatPassword ? <FaEye /> : <FaEyeSlash />}
                   </button>
                 </div>
 
                 {formData.repetirContraseña &&
                   formData.repetirContraseña !== formData.contraseña && (
                     <p className="text-sm text-red-600 mt-1 flex justify-center gap-2">
                       Las contraseñas no coinciden
                       <FaTimes className="text-red-500" />
                     </p>
                   )}
 
                 {formData.repetirContraseña &&
                   formData.repetirContraseña === formData.contraseña && (
                     <p className="text-sm text-green-600 mt-1 flex justify-center gap-2">
                       Las contraseñas coinciden
                       <FaCheck className="text-green-500" />
                     </p>
                   )}
 
                 <ul className="mt-3 space-y-1 text-sm">
                   <li className={`flex items-center gap-2 ${passwordChecks.length ? "text-green-600" : "text-gray-500"}`}>
                     {passwordChecks.length ? <FaCheckCircle /> : <FaRegCircle />}
                     Al menos 10 caracteres
                   </li>
                   <li className={`flex items-center gap-2 ${passwordChecks.uppercase ? "text-green-600" : "text-gray-500"}`}>
                     {passwordChecks.uppercase ? <FaCheckCircle /> : <FaRegCircle />}
                     Una letra mayúscula
                   </li>
                   <li className={`flex items-center gap-2 ${passwordChecks.lowercase ? "text-green-600" : "text-gray-500"}`}>
                     {passwordChecks.lowercase ? <FaCheckCircle /> : <FaRegCircle />}
                     Una letra minúscula
                   </li>
                   <li className={`flex items-center gap-2 ${passwordChecks.number ? "text-green-600" : "text-gray-500"}`}>
                     {passwordChecks.number ? <FaCheckCircle /> : <FaRegCircle />}
                     Un número
                   </li>
                   <li className={`flex items-center gap-2 ${passwordChecks.symbol ? "text-green-600" : "text-gray-500"}`}>
                     {passwordChecks.symbol ? <FaCheckCircle /> : <FaRegCircle />}
                     Un símbolo especial (!@#...)
                   </li>
                 </ul>
               </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Género <span className="text-red-500">*</span>
                 </label>
                 <select
                   name="genero"
                   value={formData.genero}
                   onChange={handleChange}
                   className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
                   style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
                   required
                 >
                   <option value="">Selecciona</option>
                   {choices.gender?.map((g, index) => (
                     <option key={index} value={g.value} style={{ backgroundColor: "#FFFFFF", color: "#000000" }}>
                       {g.label}
                     </option>
                   ))}
                 </select>
               </div>
 
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   País <span className="text-red-500">*</span>
                 </label>
                 <select
                   name="pais"
                   value={formData.pais}
                   onChange={handleChange}
                   className="w-full px-3 text-black! bg-white! sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
                   required
                 >
                   <option value="">Selecciona</option>
                   {choices.nationality?.map((n, index) => (
                     <option key={index} value={n.value} style={{ backgroundColor: "#FFFFFF", color: "#000000" }}>
                       {n.label}
                     </option>
                   ))}
                 </select>
               </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3 text-center">
                  Selecciona tus intereses
                </h3>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Elige <span className="font-semibold text-[#6E63CF]">5 intereses</span> que más te gusten
                </p>
                
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Buscar interés (ej. Hiking, Museo...)"
                    value={interestFilter}
                    onChange={(e) => setInterestFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E63CF] text-gray-900"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div 
                  className="flex flex-wrap gap-3 justify-center p-2 border border-gray-200 rounded-lg"
                  style={{ maxHeight: '250px', overflowY: 'auto' }} 
                >
                  {filteredInterests.length > 0 ? (
                    filteredInterests.map((interest) => {
                      const isSelected = selectedInterests.includes(interest.id);
                      return (
                        <button
                          key={interest.id}
                          type="button"
                          onClick={() => toggleInterest(interest.id)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-full border-2 transition-all boton-categoria 
                            ${isSelected ? "activo" : ""}`}
                        >
                          {isSelected ? (
                            <FaCheckCircle className="text-white text-lg" />
                          ) : (
                            <FaRegCircle className="text-gray-400 text-lg" />
                          )}
                          <span className="font-medium">{interest.name}</span>
                        </button>



                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm p-2 w-full text-center">
                      No se encontraron intereses con "{interestFilter}".
                    </p>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <p className={`text-sm font-medium flex items-center justify-center gap-2 ${
                    selectedInterests.length >= 5 ? "text-green-600" : "text-red-600"
                  }`}>
                    {selectedInterests.length >= 5 && selectedInterests.length <=10
                      ? <><FaCheck className="text-green-500" /> ¡Perfecto! Has seleccionado {selectedInterests.length} intereses</>
                      : <><FaTimes className="text-red-500" /> Seleccionados: {selectedInterests.length}/5-10 intereses</>
                    }
                  </p>
                  {interestsError && selectedInterests.length < 5 || selectedInterests.length > 10 && (
                    <p className="text-sm text-red-600 mt-1">{interestsError}</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-100"
                style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
                disabled={loading}
              >
                Atrás
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-4 py-2 rounded-md text-white disabled:opacity-50"
                style={{ backgroundColor: "#6E63CF" }}
                disabled={!canProceedToNextStep() || loading}
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-4 py-2 rounded-md text-white disabled:opacity-50"
                style={{ backgroundColor: "#6E63CF" }}
                disabled={!canProceedToNextStep() || loading}
              >
                {loading ? "Registrando..." : "Completar registro"}
              </button>
            )}
          </div>
        </form>

        <Link
          to="/"
          className="text-sm h-4 mt-5 text-[#6E63CF] hover:underline block text-center"
          style={{
            color: "#6E63CF",
            textDecoration: "none"
          }}
        >
          Seguir como invitado
        </Link>

        <div className="text-center mt-6">
          <a href="/login" className="text-sm text-[#6E63CF] hover:underline">
            ¿Ya tienes una cuenta? Inicia sesión
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;