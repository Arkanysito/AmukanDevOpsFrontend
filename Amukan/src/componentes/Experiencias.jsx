import { TbPigMoney } from "react-icons/tb";
import { LiaRobotSolid } from "react-icons/lia";
import { MdSportsEsports } from "react-icons/md";

export default function Experiencias() {
  return (
    <section className="bg-white py-1 px-1 sm:px-10 md:px-20 lg:px-32">

      {/* Íconos alineados horizontalmente y centrados */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-12">
        {/* Item 1 */}
        <div className="flex items-center gap-4">
          <div className="bg-teal-600 rounded-full w-16 h-16 flex items-center justify-center shrink-0">
            <LiaRobotSolid size={32} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-800">Personalización</h3>
            <p className="text-sm text-gray-500">Cada viaje se adapta a tus gustos y estilo</p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-4">
          <div className="bg-teal-600 rounded-full w-16 h-16 flex items-center justify-center shrink-0">
            <TbPigMoney size={32} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-800">Presupuesto inteligente</h3>
            <p className="text-sm text-gray-500">Planificas sin pasarte de plata</p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-center gap-4">
          <div className="bg-teal-600 rounded-full w-16 h-16 flex items-center justify-center shrink-0">
            <MdSportsEsports size={32} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-800">Recomendaciones dinámicas</h3>
            <p className="text-sm text-gray-500">El sistema te sugiere lo que realmente te interesa</p>
          </div>
        </div>
      </div>
    </section>
  );
}