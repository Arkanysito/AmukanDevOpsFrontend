
import React, { useState } from "react";
import FiltrosBotones from "./FiltrosBotones";
import FiltroBusqueda from "./FiltrosBusqueda";

export default function Filtros({ categoriaActiva, setCategoriaActiva }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="space-y-4">
      <FiltrosBotones
        categoriaActiva={categoriaActiva}
        setCategoriaActiva={setCategoriaActiva}
      />
      <FiltroBusqueda abierto={abierto} setAbierto={setAbierto} />
    </div>
  );
}