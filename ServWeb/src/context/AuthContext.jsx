import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../Services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await getCurrentUser();

      // 'res' now contains { id, email, role, profileId , fullname} from your backend
      if (res) {
        const isAdmin = res.role === "Admin";
        setUser({
          ...res,
          id: res.id || res.Id,
          // Match profileId to userId for Admin only, else keep backend profileId
          profileId: isAdmin ? (res.id || res.Id) : (res.profileId || res.ProfileId),
          // Add another specific field for Admin as requested
          adminProfileId: isAdmin ? (res.id || res.Id) : null,
          fullname: res.fullName || res.fullname || res.Fullname || (isAdmin ? "Administrator" : "")
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth refresh failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);