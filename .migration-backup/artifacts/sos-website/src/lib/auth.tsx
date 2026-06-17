import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useGetMe, useLogout, getGetMeQueryKey, User, setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

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

function getStoredToken(): string | null {
  return localStorage.getItem("sos_session");
}

function saveToken(token: string): void {
  localStorage.setItem("sos_session", token);
  setAuthTokenGetter(() => token);
}

function clearToken(): void {
  localStorage.removeItem("sos_session");
  setAuthTokenGetter(null);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const stored = getStoredToken();
    if (stored) setAuthTokenGetter(() => stored);
    return stored;
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get("session");

    if (sessionToken) {
      saveToken(sessionToken);
      setToken(sessionToken);
      window.history.replaceState({}, "", window.location.pathname);
      window.location.replace("/templates");
      return;
    }

    const errorCode = params.get("error");
    if (errorCode) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const { data: user, isLoading: isUserLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  useEffect(() => {
    if (error && token) {
      clearToken();
      setToken(null);
      queryClient.clear();
    }
  }, [error, token, queryClient]);

  const login = useCallback(() => {
    window.location.href = "/api/auth/login";
  }, []);

  const logoutMutation = useLogout();

  const logout = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearToken();
        setToken(null);
        queryClient.clear();
        window.location.replace("/");
      },
    });
  }, [logoutMutation, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isUserLoading && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
