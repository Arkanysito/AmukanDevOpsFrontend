import { InteriorDashboard } from "../componentes/InteriorDashboard";
import { SidebarDashboard } from "../componentes/SidebarDashboard";
import { useAuth } from "../context/AuthContext";
import Login from "./Login"; 

function Dashboard() {
  const { user, loading, isAuthenticated, hasOrganization } = useAuth();

  console.log('🔍 DASHBOARD AUTH STATE:', {
    user,
    loading,
    isAuthenticated,
    hasOrganization
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#6E63CF]">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, showing login form');
    return <Login />;
  }

  if (!user.is_superuser && !hasOrganization) {
    console.log('🚫 No organization membership');
    return (
      <div className="flex items-center justify-center h-screen bg-[#6E63CF]">
        <div className="text-white text-center bg-red-500 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
          <p className="mb-4">Debes pertenecer a una organización para acceder.</p>
          
        </div>
      </div>
    );
  }

  console.log('✅ Access granted, showing dashboard');
  return (
    <div className="flex h-screen w-screen bg-[#6E63CF]">
      <SidebarDashboard />
      <div className="flex-1 flex flex-col items-center justify-start p-2 overflow-auto relative">
        <InteriorDashboard />
      </div>
    </div>
  );
}

export default Dashboard;