import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import {
  deleteClient as apiDeleteClient,
  fetchClientById,
  loginClient as apiLogin,
  updateClient as apiUpdateClient,
  type UpdateClientPayload,
} from '@/api/clients';
import { clearAuthToken, setAuthFailureHandler, setAuthToken } from '@/api/http';
import {
  loadAuthToken,
  loadClientId,
  persistAndroidStepsCache,
  persistClientId,
} from '@/api/session-store';
import type { Client } from '@/types/client';
import { Brand } from '@/constants/theme';
import { unregisterDailyStepsBackgroundTask } from '@/services/sync-daily-steps';

type ClientContextValue = {
  client: Client | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  saving: boolean;
  login: (email: string, password: string) => Promise<Client>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  refreshClient: () => Promise<void>;
  updateClientProfile: (payload: UpdateClientPayload) => Promise<Client>;
  setClient: (client: Client | null) => void;
};

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  const clearLocalSession = useCallback(() => {
    clearAuthToken();
    void persistClientId(null);
    void persistAndroidStepsCache(null);
    void unregisterDailyStepsBackgroundTask();
    setClient(null);
  }, []);

  const logout = useCallback(() => {
    clearLocalSession();
    router.replace('/');
  }, [clearLocalSession]);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const token = await loadAuthToken();
        const clientId = await loadClientId();
        if (!token || !clientId) return;
        setAuthToken(token);
        const restored = await fetchClientById(clientId);
        if (!cancelled) setClient(restored);
      } catch {
        // 401 limpia el token en http; si no hay red, el usuario puede volver a entrar.
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      void persistClientId(null);
      void persistAndroidStepsCache(null);
      void unregisterDailyStepsBackgroundTask();
      setClient(null);
      router.replace('/');
    });
    return () => setAuthFailureHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const logged = await apiLogin(email, password);
    await persistClientId(logged._id);
    setClient(logged);
    return logged;
  }, []);

  const refreshClient = useCallback(async () => {
    if (!client?._id) return;
    const fresh = await fetchClientById(client._id);
    setClient(fresh);
  }, [client?._id]);

  const deleteAccount = useCallback(async () => {
    if (!client?._id) {
      throw new Error('No hay cliente autenticado');
    }
    await apiDeleteClient(client._id);
    logout();
  }, [client?._id, logout]);

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
      isRestoring,
      saving,
      login,
      logout,
      deleteAccount,
      refreshClient,
      updateClientProfile,
      setClient,
    }),
    [client, isRestoring, saving, login, logout, deleteAccount, refreshClient, updateClientProfile],
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
  const { client, isRestoring } = useClient();

  if (isRestoring) {
    return <ClientLoadingFallback />;
  }

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
