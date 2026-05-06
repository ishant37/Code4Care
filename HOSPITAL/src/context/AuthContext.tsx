import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { MOCK_CREDENTIALS } from "../services/mockData";

interface User {
  username: string;
  full_name: string;
  role: "doctor" | "wardman";
  department: string;
  employee_id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isDoctor: boolean;
  isWardMan: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("hiss_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setToken("demo-token");
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const entry = MOCK_CREDENTIALS[username.toLowerCase()];
    if (!entry || entry.password !== password) {
      throw new Error("Invalid username or password");
    }
    setToken("demo-token");
    setUser(entry.user);
    localStorage.setItem("hiss_user", JSON.stringify(entry.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("hiss_user");
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isDoctor:  user?.role === "doctor",
      isWardMan: user?.role === "wardman",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
