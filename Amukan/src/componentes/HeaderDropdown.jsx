import { useState, useEffect, useRef } from "react";
import UsuarioTurista from "../assets/user.png";
import { GrMapLocation } from "react-icons/gr";
import { MdSupportAgent } from "react-icons/md";
import { IoMdExit } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaRegUser, FaRegEdit, FaHeart, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HeaderDropdown({ forceOpen = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { user, isAuthenticated, logout, hasOrganization, loading } = useAuth(); // Usar el contexto

  const isHome = location.pathname === "/";
  const isMobile = window.innerWidth < 768;
  const visible = forceOpen !== null ? forceOpen : isOpen;

  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="px-4 py-2">
        <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div
      className="relative group"
      ref={dropdownRef}
      {...(!isMobile && {
        onMouseEnter: () => setIsOpen(true),
        onMouseLeave: () => setIsOpen(false),
      })}
    >
      {isAuthenticated ? (
        forceOpen === null && (
          <div
            className="px-4 py-2 cursor-pointer transition-colors duration-200 group-hover:bg-purple-200 rounded-md"
            onClick={() => {
              if (isMobile) {
                setIsOpen((prev) => !prev);
              } else {
                navigate("/perfil");
              }
            }}
          >
            <div className="flex items-center gap-3 mr-12">
              <div className="w-10 h-10 rounded-full bg-[#368F8B] text-white flex items-center justify-center text-base font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 font-semibold text-base sm:text-lg truncate max-w-[150px] mr-7">
                {user?.username}
              </span>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2 px-4 py-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 absolute top-0 right-25 mt-2 text-black sm:relative sm:top-auto sm:right-auto sm:mt-0 sm:w-auto sm:flex-row sm:bg-transparent sm:shadow-none sm:border-none sm:text-gray-800">
      {/* Botón Iniciar sesión */}
      <button
        onClick={() => navigate("/login")}
        className={`btn-home text-gray-800 px-4 py-2 rounded-md hover:bg-purple-700 ${
          isHome
            ? "flex items-center text-black sm:text-white space-x-2 sm:space-x-4 text-sm sm:text-base"
            : "btn-home1"
        }`}
      >
        <div className="flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base">
          <FaRegUser />
          <span>Iniciar sesión</span>
        </div>
      </button>

      {/* Botón Registrarse */}
      <button
        onClick={() => navigate("/register")}
        className={`boton-servicio  px-4 py-2 rounded-md hover:bg-gray-300 ${
          isHome
            ? "flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base"
            : "boton-servicio1"
        }`}
      >
        <div className="flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base">
          <FaRegEdit />
          <span>Registrarse</span>
        </div>
      </button>
    </div>
      )}

      {isAuthenticated && visible && (
      <div className="absolute top-full right-25 -mt-1 w-45 md:left-0 bg-white shadow-lg rounded-md border border-gray-200 z-[1000]">
          <ul>
            {forceOpen && (
              <li className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3 mr-12">
                  <div className="w-10 h-10 rounded-full bg-[#368F8B] text-white flex items-center justify-center text-base font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-semibold text-base sm:text-lg truncate max-w-[150px]">
                    {user?.username}
                  </span>
                </div>
              </li>
            )}
            <li
              className="flex items-center px-4 py-2 hover:bg-purple-100 cursor-pointer text-gray-800"
              onClick={() => navigate("/perfil")}
            >
              <FaRegUser />
              <p className="p-2">Mi perfil</p>
            </li>
            <li className="flex items-center px-4 py-2 hover:bg-purple-100 cursor-pointer text-gray-800" onClick={() => navigate("/misitinerarios")}>
              <GrMapLocation />
              <p className="p-2">Mis itinerarios</p>
            </li>
            <li className="flex items-center px-4 py-2 hover:bg-purple-100 cursor-pointer text-gray-800" onClick={() => navigate("/favoritos")}>
              <FaHeart />
              <p className="p-2">Favoritos</p>
            </li>
            {/*
            <li className="flex items-center px-4 py-2 hover:bg-purple-100 cursor-pointer" onClick={() => navigate("/soporte")}>
              <MdSupportAgent />
              <p className="p-2">Soporte</p>
            </li>
            */}
            
            {/* MOSTRAR DASHBOARD SOLO SI TIENE ORGANIZACIÓN - USANDO EL CONTEXTO */}
            {hasOrganization && (
              <>
                <li
                  className="flex items-center px-4 py-2 hover:bg-purple-100 cursor-pointer text-gray-800"
                  onClick={() => navigate("/dashboard")}
                >
                  <FaChartBar />
                  <p className="p-2">Dashboard</p>
                </li>

                <li
                  className="flex items-center px-4 py-2 hover:bg-purple-100 cursor-pointer text-gray-800"
                  onClick={() => navigate("/mi-comercio")}
                >
                  <FaRegUser />
                  <p className="p-2">Mi Comercio</p>
                </li>

                <li
                  className="flex items-center px-4 py-2 hover:bg-purple-100 cursor-pointer text-gray-800"
                  onClick={() => navigate("/reservas")}
                >
                  <FaCalendarAlt />
                  <p className="p-2">Reservas</p>
                </li>
              </>
            )}

            
            <li
              className="flex items-center px-4 py-2 hover:bg-purple-100 cursor-pointer text-gray-800"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <IoMdExit />
              <p className="p-2">Cerrar sesión</p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}