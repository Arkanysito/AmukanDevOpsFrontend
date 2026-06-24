import { SidebarDashboard } from "../componentes/SidebarDashboard";
import { InteriorReservas } from "../componentes/InteriorReservas";

function GestionReservas() {
  return (
    <div className="flex h-screen w-screen bg-[#6E63CF]">
      
      <SidebarDashboard />

      <div className="flex-1 flex flex-col items-center justify-start p-2 overflow-auto relative">
        <InteriorReservas /> 
      </div>

    </div>
  );
}

export default GestionReservas;