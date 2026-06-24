import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AmukanLogoBlanco from "../assets/logohorizontalblanco.png";
import AmukanLogoPurpura from "../assets/logohorizontal.png";
import HeaderDropdown from "./HeaderDropdown";
import { CgMenuGridO } from "react-icons/cg";
import { FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth"; // Hook antiguo
import { useCart } from "../context/CartContext";

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isAuthenticated } = useAuth(); // Hook antiguo
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const { itemCount } = useCart();

  const handleCartClick = () => {
    navigate("/carrito");
  };

  return (
    <header className="w-full shadow-md relative ">
      <div className="px-4 sm:px-6 py-2 sm:py-3 flex flex-wrap sm:flex-nowrap justify-between items-center gap-4">
        {/* Navegación a Home */}
        <Link
          to="/"
          className="flex items-center justify-center space-x-2 diseño-circulo hover:scale-105 transition-transform"
        >
          <img
            src={isHome ? AmukanLogoBlanco : AmukanLogoPurpura}
            alt="Logo AMUKAN"
            className="w-[140px] h-[50px] object-contain"
          />
        </Link>

        {/* Contenedor de íconos y dropdown */}
        <div className="relative flex items-center gap-4">
          {/* Carrito visible SOLO cuando está autenticado */}
          {isAuthenticated && (
            <div
              className="relative px-3 py-2 cursor-pointer rounded-md mr-2 group"
              onClick={handleCartClick}
            >
              <FaShoppingCart
                className={`text-xl transition-colors duration-200 ${
                  isHome
                    ? "text-white group-hover:text-black"
                    : "text-[#6E63CF] group-hover:text-black"
                }`}
              />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
          )}

          {/* Dropdown en desktop */}
          <div className="hidden sm:block">
            <HeaderDropdown />
          </div>

          {/* Dropdown en móvil */}
          <div className="block sm:hidden relative">
            <button
              className={` text-xl transition-colors duration-200 ${
                isHome ? "boton-transparente group-hover:text-black" : "boton-amukan group-hover:text-black"
              }`}
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <CgMenuGridO size={28} />
            </button>

            {showDropdown && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[260px] z-50">
                <HeaderDropdown forceOpen={true} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
