import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useGetMe } from "@workspace/api-client-react";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthUser {
  discordId: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  token: null,
  setToken: () => {},
  logout: () => {},
});

const SESSION_KEY = "sos_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY).then((stored) => {
      if (stored) setTokenState(stored);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  const setToken = async (newToken: string | null) => {
    if (newToken) {
      await AsyncStorage.setItem(SESSION_KEY, newToken);
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
    setTokenState(newToken);
  };

  const { data: user, isLoading: isUserLoading } = useGetMe({
    query: {
      queryKey: ["me", token],
      enabled: !!token && hydrated,
      retry: false,
    },
  });

  const logout = () => setToken(null);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: !hydrated || (!!token && isUserLoading),
        token,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
