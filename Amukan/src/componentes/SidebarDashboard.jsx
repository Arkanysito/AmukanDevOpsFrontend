import { useState } from "react";
import {
  FaStore,
  FaFileImport,
  FaCog,
  FaHeadphones,
  FaSignOutAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdDashboard, MdRateReview } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { CgMenuGridO } from "react-icons/cg";
import { FiMenu, FiX } from "react-icons/fi";
import AmukanLogoBlanco from "../assets/logohorizontalblanco.png";
import { Link, NavLink } from "react-router-dom";
import HeaderDropdown from "./HeaderDropdown";

// Funcion para la sidebar y reutilizarla en movil y PC
function SidebarItem({ to, label, icon: Icon, onClick, end }) {
  return (
    <li className="list-none">
      <NavLink
        to={to}
        end={end}
        onClick={onClick}
        className={({ isActive }) =>
          `group flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer
          ${isActive ? "bg-white text-[#6E63CF]" : "!text-white hover:bg-white hover:!text-[#6E63CF]"}`
        }
      >
        <Icon
          size={20}
          className="shrink-0 group-hover:text-[#6E63CF]"
        />
        <span className="font-medium text-lg">{label}</span>
      </NavLink>
    </li>
  );
}

export function SidebarDashboard() {
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); 
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      {/* HEADER MÓVIL */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#6E63CF] text-white px-4 py-3 flex justify-between items-center z-50">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center space-x-2 diseño-circulo hover:scale-105 transition-transform"
        >
          <img
            src={AmukanLogoBlanco}
            alt="Logo AMUKAN"
            className="w-[140px] h-[50px] object-contain"
          />
        </Link>

        {/* Dropdown visible SOLO en móvil */}
        <div className="relative flex items-center">
          <div className="hidden sm:block">
            <HeaderDropdown user={user} isAuthenticated={isAuthenticated} />
          </div>
          <div className="block sm:hidden relative">
            <button
              className="btn-header text-purple-800"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <CgMenuGridO size={28} />
            </button>
            {showDropdown && (
              <div
                className={`absolute mt-2 z-50 transition-all duration-300 ${
                  showDropdown ? "right-[-100px]" : "right-30"
                }`}
              >
                <HeaderDropdown
                  forceOpen={true}
                  user={user}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SIDEBAR PARA PC */}
      <div className="hidden md:flex h-screen w-60 bg-[#6E63CF] text-white flex-col rounded-r-3xl">
        {/* Logo para pc */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-purple-500/40">
          <Link to="/" className="flex items-center justify-center space-x-2 diseño-circulo hover:scale-105 transition-transform"
    >
      <img
        src={ AmukanLogoBlanco }

        alt="Logo AMUKAN"
        className="w-[140px] h-[50px] object-contain"
      />
        </Link>
        </div>

        {/* Menú principal */}
        <nav className="flex-1 px-4 py-10">
          <ul className="space-y-6">
            <SidebarItem to="/dashboard" end label="Dashboard" icon={MdDashboard} />
            <SidebarItem to="/mi-comercio" label="Mi comercio" icon={FaStore} />
            {/*<SidebarItem to="/importar" label="Importar Doc" icon={FaFileImport} />*/}
            {/*<SidebarItem to="/resenas" label="Reseñas" icon={MdRateReview} />*/}
            <SidebarItem to="/reservas" label="Reservas" icon={FaCalendarAlt} />
          </ul>
        </nav>

        {/* Menú abajo */}
        <div className="px-4 py-6 border-t border-purple-500/40">
          <ul className="space-y-6">
            {/*<SidebarItem to="/configuracion" label="Configuración" icon={FaCog} />*/}
            <SidebarItem to="/soporte" label="Soporte" icon={FaHeadphones} />
            <SidebarItem to="/salir" label="Salir" icon={FaSignOutAlt} />
          </ul>
        </div>
      </div>

      {/* SIDEBAR MÓVIL */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#6E63CF] text-white flex flex-col rounded-r-3xl transform transition-transform duration-300 z-40 pt-16 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Menú */}
        <nav className="flex-1 px-4 py-10">
          <ul className="space-y-6">
            <SidebarItem to="/dashboard" end onClick={() => setOpen(false)} label="Dashboard" icon={MdDashboard} />
            <SidebarItem to="/mi-comercio" onClick={() => setOpen(false)} label="Mi comercio" icon={FaStore} />
            {/*<SidebarItem to="/importar" onClick={() => setOpen(false)} label="Importar Doc" icon={FaFileImport} />*/}
            {/*<SidebarItem to="/resenas" onClick={() => setOpen(false)} label="Reseñas" icon={MdRateReview} />*/}
            {/*<SidebarItem to="/configuracion" onClick={() => setOpen(false)} label="Configuración" icon={FaCog} />*/}
            <SidebarItem to="/reservas" onClick={() => setOpen(false)} label="Reservas" icon={FaCalendarAlt} />
            <SidebarItem to="/soporte" onClick={() => setOpen(false)} label="Soporte" icon={FaHeadphones} />
            <SidebarItem to="/salir" onClick={() => setOpen(false)} label="Salir" icon={FaSignOutAlt} />
          </ul>
        </nav>
      </div>
    </>
  );
}
