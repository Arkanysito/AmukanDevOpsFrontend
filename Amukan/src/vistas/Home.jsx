import Header from '../componentes/Header';
import Buscador from '../componentes/BuscadorHome';
import Destinos from '../componentes/Destinos';
import Experiencias from '../componentes/Experiencias';
import Nosotros from '../componentes/Nosotros';
import CTA from '../componentes/CTA';
import Footer from '../componentes/Footer';

function Home() {
  return (
    <main className="font-sans text-gray-800 h-full w-full base-color">

      <section id="inicio">
        <Buscador />
      </section>

      <section id="experiencias" className="py-8 hidden md:block">
        <Experiencias />
      </section>
      
      <section id="destinos" className="py-8">
        <Destinos />
      </section>

      <section id="nosotros" className="py-8">
        <Nosotros />
      </section>

      <section id="cta" className="py-8">
        <CTA />
      </section>

      <section id="contacto">
        <Footer />
      </section>
    </main>
  );
}

export default Home;