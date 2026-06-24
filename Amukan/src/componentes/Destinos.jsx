import Palacio from "../assets/destinos/palacio.png";
import Reloj from "../assets/destinos/reloj.png";
import Jardin from "../assets/destinos/jardin.png";

export default function VistaCollage() {
  const lugares = [
    {
      nombre: "Palacio Rioja",
      imagen: Palacio,
      descripcion: [
        "Residencia neoclásica construida entre 1907 y 1912 por Fernando Rioja Medel.",
        "Actualmente funciona como Museo de Artes Decorativas con mobiliario europeo.",
        "Ubicado en calle Quillota 214, Viña del Mar. Entrada gratuita."
      ],
      categorias: ["Cultura", "Historia", "Arte"]
    },
    {
      nombre: "Reloj de flores",
      imagen: Reloj,
      descripcion: [
        "Reloj jardinizado inaugurado en 1962 para la Copa Mundial de Fútbol.",
        "Ubicado frente a Caleta Abarca, es uno de los íconos turísticos de Viña.",
        "Su mecanismo suizo y diseño floral lo hacen ideal para fotos memorables."
      ],
      categorias: ["Turismo", "Fotografía", "Amigos"]
    },
    {
      nombre: "Jardín Botánico",
      imagen: Jardin,
      descripcion: [
        "Parque de 393 hectáreas con más de 1.300 especies vegetales.",
        "Ideal para caminatas, picnics y actividades educativas al aire libre.",
        "Ubicado en Camino El Olivar, abierto todos los días del año."
      ],
      categorias: ["Naturaleza", "Familia", "Relajo"]
    },
  ];

  return (
    <section className="bg-white py-1 px-6 sm:px-10 md:px-20 lg:px-32">

      {/*  
      <div className="mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
          Atracciones destacadas
        </h2>
        <p className="text-base text-gray-600 mt-2">Explora aquí, aquí y aquí</p>
      </div>
      */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagen grande a la izquierda */}
        <div className="relative w-full rounded-lg overflow-hidden shadow-md group">
          <img
            src={lugares[0].imagen}
            alt={lugares[0].nombre}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 p-6 flex flex-col justify-end items-start bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-xl font-semibold mb-2">{lugares[0].nombre}</h3>
            <div className="space-y-2 text-sm  mb-4 text-justify">
              {lugares[0].descripcion.map((linea, i) => (
                <h4 key={i}>{linea}</h4>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {lugares[0].categorias.map((cat, i) => (
                <span
                  key={i}
                  className=" text-white text-xs px-3 py-1 boton-transparente"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dos imágenes apiladas a la derecha */}
        <div className="flex flex-col gap-8">
          {lugares.slice(1).map((lugar, index) => (
            <div
              key={index}
              className="relative w-full h-80 rounded-lg overflow-hidden shadow-md group"
            >
              <img
                src={lugar.imagen}
                alt={lugar.nombre}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-end items-start bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-lg font-semibold mb-1">{lugar.nombre}</h3>
                <div className="space-y-1 text-sm mb-3 text-justify">
                  {lugar.descripcion.map((linea, i) => (
                    <h4 key={i}>{linea}</h4>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {lugar.categorias.map((cat, i) => (
                    <span
                      key={i}
                      className=" text-white text-xs px-3 py-1 boton-transparente"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}