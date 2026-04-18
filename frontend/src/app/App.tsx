import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("edupilot-theme") || "dark");

  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem("edupilot-theme") || "dark";
      setTheme(newTheme);
    };

    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  return (
    <div className={theme}>
      <RouterProvider router={router} />
    </div>
  );
}
