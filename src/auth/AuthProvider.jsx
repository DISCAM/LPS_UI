import { useState } from "react";
import { AuthContext } from "./authContext";
import { loginRequest } from "../api/authApi";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const login = async ({ email, password }) => {
    const result = await loginRequest({ email, password });

    localStorage.setItem("token", result.token);
    setToken(result.token);

    if (result.user) {
      setUser(result.user);
    }

    return result;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
