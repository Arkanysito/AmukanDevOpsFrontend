import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Header from '../componentes/Header';
import Breadcrumb from '../componentes/Breadcrumb';
import { FaTrash, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';

export default function Carrito() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <Breadcrumb />
        <div className="flex-1 flex items-center justify-center">
          <div className="container mx-auto max-w-2xl text-center p-10 my-10 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-6">
              Parece que aún no has agregado ningún servicio a tu itinerario.
            </p>
            <button
              onClick={() => navigate('/busqueda')}
              className="bg-purple-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-purple-700 transition-colors"
            >
              Descubrir servicios
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

      <div className="flex-1 py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-6xl font-bold text-gray-900 mb-8">Tu Carrito</h2>
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Columna de ítems */}
            <div className="flex-grow lg:w-2/3">
              <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 relative">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Ítems ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                  </h2>
                  <div 
                    onClick={clearCart}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors duration-200 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                    aria-label="Vaciar carrito"
                  >
                    <FaTrash className="text-lg" />
                    <span className="text-sm font-medium">Vaciar carrito</span>
                  </div>
                </div>

                {/* Lista de ítems */}
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 py-6 relative"
                    >
                      {/* Imagen */}
                      <img
                        src={item.imageUrl || 'https://placehold.co/128x128/E9D8FD/4F46E5?text=Amukan'}
                        alt={item.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg shadow-sm flex-shrink-0 mx-auto sm:mx-0"
                      />

                      {/* Detalles del ítem */}
                      <div className="flex-grow w-full sm:w-auto">
                        <h3 className="font-semibold text-lg text-gray-900 pr-0 sm:pr-8 text-start sm:text-left">
                          {item.name}
                        </h3>

                        {/* Etiqueta de tipo de item */}
                        {item.itemType && (
                          <span className="block text-sm text-purple-600 font-medium capitalize text-start sm:text-left mt-1">
                            {item.itemType === 'paquete' ? 'Paquete Turístico' : 'Servicio Individual'}
                          </span>
                        )}

                        {/* Sección corregida para mostrar cantidad */}
                        {item.itemType === 'paquete' ? (
                          <div className="mt-2 text-start sm:text-left">
                            <p className="text-sm text-gray-500">
                              Cantidad: {item.quantity} paquete{item.quantity > 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-gray-500">
                              (Para {item.paqueteData?.cantidad_personas || 1} personas)
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                            <span className="text-sm text-gray-600 font-medium">Cantidad:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                              {/* Botón menos */}
                              <div
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200 cursor-pointer rounded-l-md"
                                aria-label="Disminuir cantidad"
                              >
                                <FaMinus className="text-sm" />
                              </div>

                              {/* Cantidad actual */}
                              <span className="px-3 py-1 text-sm font-semibold text-gray-800 min-w-8 text-center border-l border-r border-gray-300">
                                {item.quantity}
                              </span>

                              {/* Botón más */}
                              <div
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200 cursor-pointer rounded-r-md"
                                aria-label="Aumentar cantidad"
                              >
                                <FaPlus className="text-sm" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Precio */}
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-semibold text-lg text-gray-900">
                          ${(item.price * item.quantity).toLocaleString('es-CL')}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500">
                            ${item.price.toLocaleString('es-CL')} c/u
                          </p>
                        )}
                      </div>

                      {/* Icono X en esquina superior derecha del item - Solo para paquetes */}
                      {item.itemType === 'paquete' && (
                        <div 
                          onClick={() => removeFromCart(item.id)}
                          className="absolute top-2 right-0 text-gray-400 hover:text-red-600 transition-colors duration-200 cursor-pointer p-1"
                          aria-label="Eliminar ítem"
                        >
                          <FaTimes className="text-lg" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna de Resumen */}
            <div className="lg:w-1/3 w-full">
              <div className="bg-white shadow-lg rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-4">
                  Resumen del pedido
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-gray-700">
                      ${totalPrice.toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Descuentos</span>
                    <span className="font-semibold text-gray-700">$0</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${totalPrice.toLocaleString('es-CL')}
                  </span>
                </div>
                
                {/* Botón de pago */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="mt-6 w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors shadow-md"
                >
                  Reservar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}