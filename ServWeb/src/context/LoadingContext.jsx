import React, { createContext, useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loading from "../routes/Loading";

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Show loading automatically on route changes
  useEffect(() => {
    // Only show loading for routes other than home ("/")
    if (location.pathname !== "/") {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500); // Wait 500ms for route load feel, can be adjusted
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <Loading />}
      {children}
    </LoadingContext.Provider>
  );
};
