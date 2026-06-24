import { useState } from 'react';
import Header from '../componentes/Header';
import Breadcrumb from '../componentes/Breadcrumb';
import { useFavorites } from '../hooks/useFavorites';
import CardFavorito from '../componentes/CardFavoritos';
import { FaHeart, FaBed, FaUtensils, FaCoffee, FaPizzaSlice, FaIceCream, FaHotel, FaHome, FaUmbrellaBeach, FaGlassCheers } from "react-icons/fa";
import { LuFerrisWheel } from "react-icons/lu";
import { MdOutlineFestival } from "react-icons/md";

// Categorías simplificadas
const CATEGORIAS = [
  {
    id: 'comida',
    nombre: 'Comidas',
    icono: FaUtensils,
    tipos: ['restaurant', 'cafe', 'bar', 'fast_food', 'bakery', 'pub', 'ice_cream']
  },
  {
    id: 'alojamiento', 
    nombre: 'Alojamiento',
    icono: FaBed,
    tipos: ['hotel', 'motel', 'guest_house', 'hostel', 'apartment', 'resort', 'bed_and_breakfast', 'campsite']
  },
  {
    id: 'actividades',
    nombre: 'Actividades',
    icono: LuFerrisWheel,
    tipos: ['experiences.activityservice']
  },
  {
    id: 'eventos',
    nombre: 'Eventos',
    icono: MdOutlineFestival,
    tipos: ['experiences.event']
  }

];

// Función para filtrar favoritos por categoría
const filtrarPorCategoria = (favoritos, categoria) => {
  // Obtener listas de tipos de comida y alojamiento para excluirlos de "actividades"
  const tiposComida = CATEGORIAS.find(c => c.id === 'comida')?.tipos || [];
  const tiposAlojamiento = CATEGORIAS.find(c => c.id === 'alojamiento')?.tipos || [];

  return favoritos.filter(favorito => {
    const { target_type, target_details } = favorito;
    const placeType = target_details?.place_type; // El tipo específico del Place

    if (categoria.id === 'comida') {
      return target_type === 'location.place' && tiposComida.includes(placeType);
    }

    if (categoria.id === 'alojamiento') {
      // Incluir Places de tipo alojamiento Y también AccommodationService si existiera
       if (target_type === 'location.place') {
            return tiposAlojamiento.includes(placeType);
       }
       //
       // if (target_type === 'experiences.accommodationservice') {
       //     return true;
       // }
       return false;
    }

    // Actividades (ActivityService + Places que NO son comida/alojamiento)
    if (categoria.id === 'actividades') {
      if (target_type === 'experiences.activityservice') {
        return true; // Es un ActivityService real
      }
      if (target_type === 'location.place') {
        return !tiposComida.includes(placeType) && !tiposAlojamiento.includes(placeType);
      }
      return false;
    }

    if (categoria.id === 'eventos') {
      return target_type === 'experiences.event';
    }

    return false;
  });
};

export default function Favoritos() {
  const { favorites, loading, error, removeFavorite, refetchFavorites } = useFavorites();
  const [categoriaActiva, setCategoriaActiva] = useState('comida');

  const categoriaSeleccionada = CATEGORIAS.find(cat => cat.id === categoriaActiva);
  const favoritosFiltrados = filtrarPorCategoria(favorites, categoriaSeleccionada);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <Breadcrumb />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando favoritos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <Breadcrumb />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={refetchFavorites}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg bg-transparent! hover:bg-purple-700 boton-popup"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb />
      
      <div className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mis Favoritos</h1>
            <p className="text-gray-600 text-lg">
              Tus lugares guardados en Viña del Mar
            </p>
          </div>

          {/* Filtros de categoría */}
          <div className="flex justify-center mb-12 px-4">
            <div className="bg-gray-100 rounded-2xl p-2 flex flex-wrap gap-2 md:space-x-2">
              {CATEGORIAS.map((categoria) => {
                const Icono = categoria.icono;
                const isActive = categoriaActiva === categoria.id;
                return (
                  <button
                    key={categoria.id}
                    onClick={() => setCategoriaActiva(categoria.id)}
                    className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-4 rounded-xl transition-all boton-popup text-sm md:text-base boton-popup
                      ${isActive ? 'bg-white text-white-700 shadow-md' : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    <Icono size={18} className="md:size-5" />
                    <span className="hidden md:inline font-semibold">{categoria.nombre}</span>
                    {isActive && (
                      <span className="bg-white-100 text-white-700 px-2 py-1 rounded-full text-xs md:text-sm">
                        {favoritosFiltrados.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de favoritos */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {categoriaSeleccionada.nombre}
              </h2>
              <span className="text-gray-500">
                {favoritosFiltrados.length} {favoritosFiltrados.length === 1 ? 'favorito' : 'favoritos'}
              </span>
            </div>

            {favoritosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoritosFiltrados.map((favorito) => (
                  <CardFavorito 
                    key={favorito.user_fav_id} 
                    favorito={favorito} 
                    onEliminar={removeFavorite}
                    isFavorite={true} //No es la mejor forma de hacer esto, pero era lo más rapido
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="text-gray-400 mb-4">
                  <FaHeart size={64} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No hay favoritos en {categoriaSeleccionada.nombre.toLowerCase()}
                </h3>
                <p className="text-gray-500 mb-6">
                  Explora Viña del Mar y guarda tus lugares favoritos
                </p>
                <button 
                  onClick={() => window.location.href = '/busqueda'}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold boton-popup"
                >
                  Explorar Lugares
                </button>
              </div>
            )}
          </div>

          {/* M
          {favorites.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-6">
                <FaHeart size={80} className="mx-auto" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Aún no tienes favoritos</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Descubre los mejores restaurantes y alojamientos de Viña del Mar y guárdalos para tu próxima visita
              </p>
              <button 
                onClick={() => window.location.href = '/busqueda'}
                className="px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold text-lg"
              >
                Comenzar a Explorar
              </button>
            </div>
          )} ensaje cuando no hay favoritos en absoluto */}


        </div>
      </div>
    </div>
  );
}