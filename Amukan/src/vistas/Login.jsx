// components/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Cambia a usar el contexto
import AmukanLogo from "../assets/logovertical.jpg";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, updateUser } = useAuth(); // Usa el contexto

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Opción 1: Usar el login del AuthProvider
      const result = await login(username, password);
      
      if (result.success) {
        navigate("/"); // Redirige al home
      } else {
        setError(result.error || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // O si prefieres mantener tu lógica actual de login, pero actualizar el AuthProvider:
  const handleLoginOriginal = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/user/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Credenciales inválidas");
        return;
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      // Actualizar el AuthProvider después del login
      await updateUser();
      
      navigate("/"); // Redirige al home
    } catch (err) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (  
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md p-2 sm:p-8 w-full max-w-md">
        <div className="w-full px-2 sm:px-6 flex justify-center items-center">
          <img
            src={AmukanLogo}
            alt="Logo AMUKAN"
            className="w-[170px] h-[100px] object-contain"
          />
        </div>
        <p className="text-3xl md:text-4xl text-center font-bold">
          Inicia sesión
        </p>
        <p className="text-center text-gray-500 mb-10">Ingresa tus datos para acceder</p>

        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          handleLogin(); // o handleLoginOriginal()
        }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo o Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
              placeholder="tucorreo@example.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
              placeholder="********"
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6E63CF] text-white py-3 rounded-md font-medium hover:bg-[#5a52b8] focus:outline-none focus:ring-2 focus:ring-[#6E63CF] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          <div className="flex items-center">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="mx-4 text-gray-500 font-medium">o</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <Link to="/" className="w-full block text-center py-3 rounded-md font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
            Seguir como invitado
          </Link>

          <div className="text-black">
            ¿Eres nuev@ en Amukan?{" "}
            <Link
              to="/register"
              className="text-[#6E63CF] hover:text-[#5a4fb8] font-medium underline hover:underline"
            >
              Registrate
            </Link>
          </div>
        </form>

        <div className="text-center mt-3 my-3">
          <a href="#" className="text-sm text-center mt-6 text-sm text-[#6E63CF] hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;