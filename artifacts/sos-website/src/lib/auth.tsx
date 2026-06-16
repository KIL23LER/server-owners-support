import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, useLogout, getGetMeQueryKey, User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("sos_session"));

  // Check URL for session token (Discord OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get("session");
    if (sessionToken) {
      localStorage.setItem("sos_session", sessionToken);
      setToken(sessionToken);
      // Redirect to templates page
      window.location.href = "/templates";
    }
  }, []);

  const { data: user, isLoading: isUserLoading, refetch, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  // If token is invalid/expired
  useEffect(() => {
    if (error && token) {
      localStorage.removeItem("sos_session");
      setToken(null);
    }
  }, [error, token]);

  const login = () => {
    window.location.href = "/api/auth/login";
  };

  const logoutMutation = useLogout();

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        localStorage.removeItem("sos_session");
        setToken(null);
        window.location.reload();
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading: isUserLoading && !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
