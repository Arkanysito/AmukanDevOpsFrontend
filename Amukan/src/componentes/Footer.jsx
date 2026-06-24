import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import AmukanLogo from "../assets/logovertical.jpg";

function Footer() {
  const redes = [
    { icon: FaInstagram, url: "https://www.instagram.com/explora.amukan" },
  ];

  return (
    <footer className="bg-white py-8 px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        {/* Logo */}
        <div className="flex flex-col items-center diseño-circulo space-y-1">
          <img
            src={AmukanLogo}
            alt="Logo AMUKAN"
            className="w-[140px] h-[90px] object-contain"
          />
        </div>

        {/* Menú */}
        <div>
          <p className="font-semibold mb-2">Menú</p>
          <ul className="space-y-1">
            <li><a href="#inicio" className="hover:underline">Inicio</a></li>
            <li><a href="#destinos" className="hover:underline">Destinos</a></li>
            <li><a href="#experiencias" className="hover:underline">Experiencias</a></li>
            <li><a href="#nosotros" className="hover:underline">Nosotros</a></li>
            <li><a href="#contacto" className="hover:underline">Contacto</a></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <p className="font-semibold mb-2">Contacto</p>
          <ul className="space-y-1">
            <li>amukanchile.oficial@gmail.com</li>
          </ul>
        </div>

        {/* Redes sociales */}
        <div className="mr-30">
          <p className="font-semibold mb-2 text-center sm:text-right">Síguenos</p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-3">
            {redes.map(({ icon: Icon, url }, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full w-9 h-9 flex items-center justify-center btn-redes hover:bg-purple-700 transition duration-300"
              >
                <Icon size={20} className="text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;