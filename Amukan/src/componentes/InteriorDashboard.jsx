import { useState } from "react";
import { Download, Filter, Search } from "lucide-react";
import EmbeddedMetabaseFrame from "./DashboardEmbedFrame.jsx";

import HeaderDropdown from "./HeaderDropdown";
import { CgMenuGridO } from "react-icons/cg";
import { useAuth } from "../hooks/useAuth";
import { METABASE_URL } from "../config";

export function InteriorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex flex-col bg-white rounded-[30px] pt-20 sm:pt-8 px-4 sm:px-6 h-screen w-full max-w-[1700px] mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between w-full relative mb-4 gap-2">

        {/* Título centrado */}
        <p className="text-[#6E63CF] text-xl sm:text-2xl font-bold text-center flex-1 order-2 sm:order-none">
          Dashboard
        </p>

        {/* Usuario */}
        <div className="relative flex items-center order-3 sm:order-none">
          <div className="hidden sm:block">
            <HeaderDropdown user={user} isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </div>

      {/* Contenido con scroll interno */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-8">

        {/* Grid con el primer gráfico a todo el ancho */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <EmbeddedMetabaseFrame
              endpoint={`${METABASE_URL}/metabase/org-dashboard`}
              height="70vh"
              className="w-full rounded-2xl overflow-hidden min-h-[520px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}