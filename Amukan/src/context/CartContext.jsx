import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Crear el contexto
const CartContext = createContext();

// 2. Crear el Hook personalizado para usar el contexto
export const useCart = () => useContext(CartContext);

// 3. Crear el Proveedor del contexto
export const CartProvider = ({ children }) => {
  // Estado para los ítems del carrito, cargado desde localStorage si existe
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error al cargar el carrito de localStorage", error);
      return [];
    }
  });

  // Guardar en localStorage cada vez que cartItems cambie
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Función para agregar un ítem al carrito
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      // Buscar si el ítem ya existe
      const existingItem = prevItems.find((i) => i.id === item.id);

      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Función para eliminar un ítem del carrito
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  // Función para actualizar la cantidad de un ítem
  const updateQuantity = (itemId, newQuantity) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Función para limpiar el carrito
  const clearCart = () => {
    setCartItems([]);
  };

  // Calcular el total
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  // Calcular el total de ítems
  const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  // Valor que proveerá el contexto
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};