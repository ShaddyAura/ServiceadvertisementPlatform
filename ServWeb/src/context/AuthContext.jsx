import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../Services/authService";  // Assuming this is your service to fetch user data

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch user data
    getCurrentUser()
      .then(u => {
        if (u) {
          setUser(u);  // u = {email, role}
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
