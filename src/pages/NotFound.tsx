
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 text-gradient">404</h1>
            <p className="text-xl text-gray-400 mb-6">Oops! Page not found</p>
            <a href="/" className="text-cutelist-primary hover:text-cutelist-accent underline">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default NotFound;
