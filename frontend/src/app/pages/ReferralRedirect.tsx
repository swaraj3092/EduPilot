import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";

export function ReferralRedirect() {
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      // Save referrer to track rewards on signup
      localStorage.setItem("edupilot-referrer", username);
      
      // We can also show a toast or message later
      console.log(`Referred by ${username}`);
    }
    
    // Redirect to Hero or Auth page
    navigate("/auth?ref=" + username);
  }, [username, navigate]);

  return (
    <div className="min-h-screen bg-[#06060F] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-white">Connecting you to {username}'s network...</h2>
        <p className="text-white/50 text-sm mt-2">Loading your personalized experience</p>
      </div>
    </div>
  );
}
