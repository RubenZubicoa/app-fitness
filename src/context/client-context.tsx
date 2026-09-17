import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import {
  fetchClientById,
  loginClient as apiLogin,
  updateClient as apiUpdateClient,
  type UpdateClientPayload,
} from '@/api/clients';
import { clearAuthToken, setAuthFailureHandler } from '@/api/http';
import type { Client } from '@/types/client';
import { Brand } from '@/constants/theme';

type ClientContextValue = {
  client: Client | null;
  isAuthenticated: boolean;
  saving: boolean;
  login: (email: string, password: string) => Promise<Client>;
  logout: () => void;
  refreshClient: () => Promise<void>;
  updateClientProfile: (payload: UpdateClientPayload) => Promise<Client>;
  setClient: (client: Client | null) => void;
};

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  const logout = useCallback(() => {
    clearAuthToken();
    setClient(null);
    router.replace('/');
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      setClient(null);
      router.replace('/');
    });
    return () => setAuthFailureHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const logged = await apiLogin(email, password);
    setClient(logged);
    return logged;
  }, []);

  const refreshClient = useCallback(async () => {
    if (!client?._id) return;
    const fresh = await fetchClientById(client._id);
    setClient(fresh);
  }, [client?._id]);

  const updateClientProfile = useCallback(
    async (payload: UpdateClientPayload) => {
      if (!client?._id) {
        throw new Error('No hay cliente autenticado');
      }
      setSaving(true);
      try {
        const updated = await apiUpdateClient(client._id, payload);
        setClient(updated);
        return updated;
      } finally {
        setSaving(false);
      }
    },
    [client?._id],
  );

  const value = useMemo<ClientContextValue>(
    () => ({
      client,
      isAuthenticated: client !== null,
      saving,
      login,
      logout,
      refreshClient,
      updateClientProfile,
      setClient,
    }),
    [client, saving, login, logout, refreshClient, updateClientProfile],
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
