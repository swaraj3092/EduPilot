import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  useEffect(() => {
    const applyTheme = () => {
      const currentTheme = localStorage.getItem("edupilot-theme") || "dark";
      if (currentTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme(); // Apply initially

    window.addEventListener("themechange", applyTheme);
    return () => window.removeEventListener("themechange", applyTheme);
  }, []);

  return (
    <RouterProvider router={router} />
  );
}
