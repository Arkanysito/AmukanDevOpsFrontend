import { useState } from "react";
import { IoBookmarkSharp } from "react-icons/io5";
import { PiBirdFill } from "react-icons/pi";

import Benja from '../assets/destinos/Benjamin.jpg';
import Ashley from '../assets/destinos/Ashley.jpg';
import Ethan from '../assets/destinos/Ethan.jpg';
import Nata from '../assets/destinos/Nata.jpg';
import Zada from '../assets/destinos/Karime.png';
import AmukanLogo from '../assets/logopajarosolo.jpg';

const equipo = [
  {
    nombre: "Natanael Roque",
    comentario: "Desarrollador Fullstack",
    mensajeUsuario: "¡Hola! Espero que disfrutes Amukan tanto como nosotros disfrutamos crearla. Tu viaje empieza aquí 🧭",
    imagen: Nata
  },
  {
    nombre: "Benjamin Lillo",
    comentario: "P.O",
    mensajeUsuario: "Gracias por confiar en Amukan. Tenemos herramientas pensadas especialmente para ti. ¡Explora sin límites!",
    imagen: Benja
  },
  {
    nombre: "Ashley Iturriaga",
    comentario: "Frontend",
    mensajeUsuario: "¡Gracias por usar Amukan! Nos alegra un montón tenerte con nosotros. Ahora que formas parte, todo es más fácil, más rápido y mucho más entretenido. ¡Vamos con todo, que esto recién comienza! 😺✨",
    imagen: Ashley
  },
  {
    nombre: "Ethan Yañez",
    comentario: "Scrum Master",
    mensajeUsuario: "Esta app está hecha para que sientas que el mundo te habla. ¡Descúbrelo con Amukan!",
    imagen: Ethan
  },
  {
    nombre: "Zada Riquelme",
    comentario: "Diseñadora UI/UX",
    mensajeUsuario: "¡Gracias por confiar en nosotros! En Amukan, cada paso que das es parte de una experiencia pensada especialmente para ti. Estamos emocionados de que formes parte de esta comunidad que ama explorar, descubrir y conectar. Aquí no solo encontrarás lugares… encontrarás momentos que valen la pena. ¡Vamos a hacer de tu viaje algo inolvidable!",
    imagen: Zada
  }
];

export default function QuienesSomos() {
  const [activo, setActivo] = useState(null);
  const handleClickSection = () => setActivo(null);

  return (
    <section className="relative py-3 px-3 bg-white text-center" onClick={handleClickSection}>
      {/* Decoraciones solo en desktop */}
      <div className="hidden md:block absolute top-[0%] left-[15%] rotate-12 scale-[1.8]">
      <img
            src={AmukanLogo}
            alt="Logo AMUKAN"
            className="w-[90px] h-[90px] object-contain"
          />
      </div>
      <div className="hidden md:block absolute top-[10%] right-[10%] w-70 h-70 fondo-experiencia rounded-full  opacity-30 "></div>
      <div className="hidden md:block absolute top-[10%] right-[25%] w-30 h-30 fondo-experiencia rounded-full  opacity-40"></div>
      <div className="hidden md:block absolute bottom-[15%] left-[10%] w-50 h-50 fondo-experiencia rounded-full  opacity-40"></div>
      <div className="hidden md:block absolute bottom-[15%] left-[20%] w-25 h-25 fondo-experiencia rounded-full  opacity-30"></div>

      {/* Título fijo */}
      <h2 className="relative text-3xl sm:text-4xl md:text-6xl font-bold mb-6">
        ¿QUIÉNES SOMOS?
      </h2>

      {/* Texto introductorio solo en móvil */}
      {activo === null && (
        <p className=" relative max-w-md mx-auto text-gray-700 mb-4 text-sm leading-relaxed px-4">
          En Amukan, creemos que viajar no es solo llegar a un lugar, sino vivir una experiencia única que conecte con tus intereses, tu tiempo y tu forma de explorar...
        </p>
      )}

      {/* Contenido central */}
      <div className="relative flex flex-col md:flex-row md:items-start md:justify-center md:pl-10 mb-10 gap-8">
        {/* Perfil activo */}
        <div className="flex flex-col items-center transition-all duration-300 md:w-2/5">
          {activo !== null ? (
            <>
              <img
                src={equipo[activo].imagen}
                alt={equipo[activo].nombre}
                className="h-40 w-40 md:h-70 md:w-70 object-cover rounded-full mb-4"
              />
              <h4 className="text-base md:text-lg font-semibold">{equipo[activo].nombre}</h4>
              <p className="text-gray-600 max-w-md text-sm md:text-base">{equipo[activo].comentario}</p>
            </>
          ) : (
            <p className="text-gray-500 italic text-sm">Haz clic en un círculo para conocer más sobre el equipo.</p>
          )}
        </div>

        {/* Mensaje largo con tamaño reducido en móvil */}
        {activo !== null && (
          <div className="bg-gray-100 p-4 rounded shadow text-left text-gray-700 md:w-2/5 mt-6 md:mt-10 max-w-md mx-auto md:max-w-none">
            <h4 className="text-sm md:text-md font-semibold mb-2">Mensaje para ti</h4>
            <p className="text-sm leading-relaxed md:text-base md:leading-loose">{equipo[activo].mensajeUsuario}</p>
          </div>
        )}
      </div>

      {/* Círculos interactivos */}
      <div className="flex justify-center gap-1 md:gap-4 flex-wrap">
        {equipo
          .map((persona, idx) => ({ ...persona, idx }))
          .filter((persona) => persona.idx !== activo)
          .map((persona) => (
            <div
              key={persona.idx}
              onClick={(e) => {
                e.stopPropagation();
                setActivo(persona.idx);
              }}
              className={`cursor-pointer text-center transition-all duration-300 ${
                activo === persona.idx
                  ? "scale-110"
                  : "scale-90 opacity-70 hover:scale-100 hover:opacity-100"
              }`}
            >
              <img
                src={persona.imagen}
                alt={persona.nombre}
                className={`h-12 w-12 md:h-20 md:w-20 object-cover rounded-full mx-auto mb-1 ${
                  activo === persona.idx ? "ring-4 ring-indigo-400" : ""
                }`}
              />
              <p className="text-[10px] md:text-sm font-medium">{persona.nombre}</p>
            </div>
          ))}
      </div>

      {/* Icono decorativo solo en desktop */}
      {activo !== null && (
        <div className="hidden md:block absolute top-[20%] left-[26%] z-10 scale-[1.8]">
          <IoBookmarkSharp className="w-[70px] h-[70px] diseño-circulo" />
        </div>
      )}
    </section>
  );
}