import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

function getStoredUser() {
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const refreshProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("user");
      setUser(null);
      return null;
    }

    try {
      const { data } = await api.get("/api/auth/profile");
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      return null;
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (payload) => {
    const { data } = await api.post("/api/auth/forgot-password", payload);
    return data;
  };

  const resetPassword = async (token, payload) => {
    const { data } = await api.post(`/api/auth/reset-password/${token}`, payload);
    return data;
  };

  const updateProfile = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.put("/api/auth/update-profile", payload);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const deleteAccount = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.delete("/api/auth/delete-account", { data: payload });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      return data;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function bootstrapAuth() {
      await refreshProfile();
      if (active) {
        setInitializing(false);
      }
    }

    bootstrapAuth();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      initializing,
      signup,
      login,
      logout,
      forgotPassword,
      resetPassword,
      refreshProfile,
      updateProfile,
      deleteAccount
    }),
    [user, loading, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
