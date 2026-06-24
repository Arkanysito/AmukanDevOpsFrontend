import { useState, useEffect } from "react";
import {
  FaRegEdit,
  FaUserShield,
  FaBell,
  FaTrash,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import Header from "../componentes/Header";
import Swal from "sweetalert2";
import Breadcrumb from "../componentes/Breadcrumb";
import { useNavigate, Link } from "react-router-dom";

export default function Perfil() {
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState("Mi perfil");
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-600">
        <p>Debes iniciar sesión para ver tu perfil.</p>
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará tu cuenta de forma permanente. No podrás recuperarla.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6E63CF",
      confirmButtonText: "Sí, eliminar cuenta",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/users/me", { method: "DELETE" });
        if (res.ok) {
          await Swal.fire({
            title: "Cuenta eliminada",
            text: "Tu cuenta ha sido eliminada correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
          localStorage.removeItem("access_token");
          window.location.href = "/";
        } else {
          await Swal.fire({
            title: "Error",
            text: "No se pudo eliminar la cuenta. Intenta nuevamente.",
            icon: "error",
          });
        }
      } catch {
        Swal.fire({
          title: "Error de conexión",
          text: "No fue posible conectarse con el servidor.",
          icon: "error",
        });
      }
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas cerrar tu sesión actual?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />


      <div className="flex flex-col md:flex-row relative">

        {/* Contenido principal */}
        <main className="flex-1 p-6 md:p-10">
          {activeSection === "Mi perfil" && (
            <PerfilView user={user} onLogout={handleLogout} />
          )}
          {activeSection === "Seguridad" && <SeguridadView user={user} />}
          {activeSection === "Notificaciones" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h2 className="text-2xl font-semibold text-gray-700">
                Aún no tienes notificaciones configuradas.
              </h2>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* === SECCIÓN PERFIL === */
function PerfilView({ user, onLogout }) {
  return (
    <>
      <div className="px-2 pt-0">
        <Breadcrumb />
      </div>

      <h1 className="text-3xl font-semibold text-gray-800 mb-2">Mi Perfil</h1>
      <p className="text-gray-500 mb-8">Información general del perfil</p>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-20 h-20 bg-[#6E63CF] rounded-full text-white flex items-center justify-center text-3xl font-bold shadow-lg">
            {user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {user?.nombreCompleto || user?.username}
            </h2>
            <p className="text-gray-500">{user?.rol || "Usuario"}</p>
            <p className="text-[#6E63CF] text-sm cursor-pointer hover:underline">
              Empresa
            </p>
          </div>
        </div>

        <Link
          to="/editar-perfil"
          className="flex items-center gap-2 text-[#6E63CF] hover:text-[#4a3bb8] transition-colors cursor-pointer select-none text-sm md:text-base opacity-90 hover:opacity-100"
        >
          <FaRegEdit className="text-lg" />
          <span className="font-medium">Editar perfil</span>
        </Link>
      </div>

      <Section title="Información personal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          <InfoItem
            label="Nombre completo"
            value={user?.nombreCompleto || user?.username}
          />
          <InfoItem label="Nombre de usuario" value={user?.username} />
          <InfoItem label="Género" value={user?.gender || "No especificado"} />
          <InfoItem
            label="Nacionalidad"
            value={user?.nationality || "No especificada"}
          />
        </div>
      </Section>

      <Section title="Configuración">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          <InfoItem
            label="Idioma preferido"
            value={user?.language || "No especificado"}
          />
          <InfoItem label="Moneda" value={user?.currency || "No especificada"} />
          <InfoItem
            label="Fecha de registro"
            value={
              user?.date_joined
                ? new Date(user.date_joined).toLocaleDateString()
                : "Desconocida"
            }
          />
          <InfoItem
            label="Último acceso"
            value={
              user?.last_login
                ? new Date(user.last_login).toLocaleDateString()
                : "Desconocido"
            }
          />
        </div>
      </Section>

      <div className="pt-10 border-t mt-12 text-center">
        <button
          onClick={onLogout}
          className="!bg-transparent text-red-500 hover:text-red-700 font-semibold transition-all"
        >
          Cerrar sesión
        </button>
      </div>
    </>
  );
}

/* === SECCIÓN SEGURIDAD === */
function SeguridadView({ user }) {
  const [telefono, setTelefono] = useState(user?.telefono || "");

  useEffect(() => {
    setTelefono(user?.telefono || "");
  }, [user]);

  const handleSavePhone = async () => {
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono }),
      });
      if (res.ok) {
        Swal.fire({ title: "Guardado", text: "Número actualizado", icon: "success" });
      } else {
        Swal.fire({ title: "Error", text: "No se pudo actualizar", icon: "error" });
      }
    } catch {
      Swal.fire({ title: "Error", text: "Error de conexión", icon: "error" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
        Seguridad
      </h2>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl space-y-8">
        <div className="text-center">
          <p className="text-sm text-gray-500">Correo electrónico</p>
          <p className="font-medium text-gray-800">{user?.email}</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Contraseña</p>
          <p className="font-medium text-gray-800 tracking-widest">********</p>
        </div>

        <div className="w-full text-center">
          <p className="text-sm text-gray-500 mb-2">Teléfono</p>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#6E63CF]"
          />
          <button
            onClick={handleSavePhone}
            className="w-full mt-4 !bg-[#6E63CF] text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-all"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

/* === COMPONENTES AUXILIARES === */
function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="border rounded-xl p-6 bg-white shadow-sm">{children}</div>
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-gray-800 font-medium break-words">{value}</p>
    </div>
  );
}

function SidebarItem({ icon, text, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        active
          ? "bg-[#f0edff] text-[#6E63CF] font-semibold"
          : "text-gray-700 hover:bg-[#f0edff] hover:text-[#6E63CF]"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
