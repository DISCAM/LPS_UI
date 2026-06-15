import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { loginRequest, getMeRequest } from "../api/authApi";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const userData = await getMeRequest(token);
        setUser(userData);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async ({ email, password }) => {
    const result = await loginRequest({ email, password });

    localStorage.setItem("token", result.token);
    setToken(result.token);

    const userData = await getMeRequest(result.token);
    setUser(userData);

    return result;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  const hasAnyRole = (roles) => {
    return roles.some((role) => user?.roles?.includes(role));
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated,
        isAuthLoading,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
