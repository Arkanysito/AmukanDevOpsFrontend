import { InteriorComercio} from "../componentes/InteriorComercio";
import { SidebarDashboard } from "../componentes/SidebarDashboard";

function MiComercio() {
  return (
    <div className="flex h-screen w-screen bg-[#6E63CF]">
      
      <SidebarDashboard />

      <div className="flex-1 flex flex-col items-center justify-start p-2 overflow-auto relative">
        <InteriorComercio />
      </div>

    </div>
  );
}

export default MiComercio;
