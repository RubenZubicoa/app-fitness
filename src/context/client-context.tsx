import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { fetchClientById, loginClient as apiLogin } from '@/api/clients';
import type { Client } from '@/types/client';
import { Brand } from '@/constants/theme';

type ClientContextValue = {
  client: Client | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<Client>;
  logout: () => void;
  refreshClient: () => Promise<void>;
  setClient: (client: Client | null) => void;
};

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const logged = await apiLogin(email, password);
    setClient(logged);
    return logged;
  }, []);

  const logout = useCallback(() => {
    setClient(null);
  }, []);

  const refreshClient = useCallback(async () => {
    if (!client?._id) return;
    const fresh = await fetchClientById(client._id);
    setClient(fresh);
  }, [client?._id]);

  const value = useMemo<ClientContextValue>(
    () => ({
      client,
      isAuthenticated: client !== null,
      login,
      logout,
      refreshClient,
      setClient,
    }),
    [client, login, logout, refreshClient],
  );

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient debe usarse dentro de ClientProvider');
  }
  return context;
}

/** Cliente autenticado; redirige al login si no hay sesión. */
export function useRequiredClient(): Client | null {
  const { client } = useClient();
  return client;
}

/** Guard de rutas autenticadas. */
export function RequireClient({ children }: { children: ReactNode }) {
  const { client } = useClient();

  if (!client) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export function ClientLoadingFallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Brand.gold} size="large" />
    </View>
  );
}
