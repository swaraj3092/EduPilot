import { Navigate, useLocation } from "react-router";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const userStr = localStorage.getItem("edupilot-user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || (!user.id && !user.isLoggedIn)) {
    // Redirect to login but save the current location to return back
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
