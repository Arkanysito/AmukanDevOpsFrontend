import { PiMailboxBold } from "react-icons/pi";
import fondocta from "../assets/CTA/fondocta.jpg";

function CTA() {
  return (
    <section className="relative text-white py-10 px-4 sm:px-6">
      {/* Fondo con imagen */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${fondocta})` }}
      >
        <div className="absolute inset-0 bg-purple-400/20" />
      </div>

      {/* Contenedor centrado sin scroll horizontal */}
      <div className="relative flex justify-center">
        <div className="w-full max-w-xl bg-white/10 backdrop-blur-md rounded-xl p-6 text-center sm:text-left">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-4 leading-snug">
            Explora como turista, vive como local
          </h2>
          <p className="text-sm text-blanco sm:text-base mb-4 leading-relaxed">
            Este itinerario reúne lo mejor de tu destino en una sola experiencia: alojamiento,
            panoramas, comidas y rutas pensadas para ti. Con Amukan, viajar es simple, 
            cómodo y personalizado.
          </p>
          <div className="flex justify-center sm:justify-end">
            <a
              href="mailto:amukanchile.oficial@gmail.com"
              className="flex items-center btn-cta text-indigo-600 px-4 sm:px-6 py-2 rounded font-semibold duration-300 min-w-[160px] mt-2"
            >
              <PiMailboxBold className="text-xl mr-2" />
              Contáctanos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;