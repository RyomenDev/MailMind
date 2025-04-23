import { useAuth } from "../contexts/AuthContext";
import DashboardPage from "./DashboardPage";
import LoginPage from "./LoginPage";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
//   return <LoginPage />;
};

export default Index;
