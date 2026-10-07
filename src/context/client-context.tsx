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
import { clearAuthToken, getAuthToken, setAuthFailureHandler, setAuthToken } from '@/api/http';
import {
  clearAuthSessionStore,
  clearSessionStore,
  isSessionWithinTtl,
  loadAuthToken,
  loadClientId,
  loadClientSnapshot,
  loadSessionExpiresAt,
  persistAuthToken,
  persistClientId,
  persistClientSnapshot,
  startSessionTtl,
} from '@/api/session-store';
import type { Client } from '@/types/client';
import { Brand } from '@/constants/theme';
import { stopBackgroundStepTracking } from '@/services/pedometer';
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

  /** Cierre de sesión intencional: limpia auth y caché de pasos. */
  const clearLocalSession = useCallback(() => {
    clearAuthToken();
    void clearSessionStore();
    void stopBackgroundStepTracking();
    void unregisterDailyStepsBackgroundTask();
    setClient(null);
  }, []);

  /** Fallo de auth (401): limpia credenciales pero conserva pasos del día. */
  const clearAuthKeepSteps = useCallback(() => {
    clearAuthToken();
    void clearAuthSessionStore();
    void stopBackgroundStepTracking();
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

        if (!token || !clientId) {
          // Sin JWT no hay sesión usable: limpia restos de snapshot.
          if (clientId) await clearAuthSessionStore();
          return;
        }

        // Migración: sesiones antiguas sin caducidad reciben 7 días desde ahora.
        let withinTtl = await isSessionWithinTtl();
        if (!withinTtl) {
          const expiresAt = await loadSessionExpiresAt();
          if (expiresAt == null) {
            await startSessionTtl();
            withinTtl = true;
          }
        }

        if (!withinTtl) {
          clearAuthToken();
          await clearAuthSessionStore();
          return;
        }

        setAuthToken(token);

        try {
          const restored = await fetchClientById(clientId);
          if (cancelled) return;
          // Si un 401 limpió el token durante el fetch, no montar cliente.
          if (!getAuthToken()) return;
          setClient(restored);
          await persistClientSnapshot(restored);
        } catch {
          // Solo offline/red: snapshot con JWT aún presente.
          // Si fue 401, getAuthToken() ya es null → no dejar sesión zombi.
          if (!getAuthToken()) return;
          const snapshot = await loadClientSnapshot();
          if (!cancelled && snapshot && snapshot._id === clientId) {
            setClient(snapshot);
          }
        }
      } catch {
        // Si falla el restore, el usuario puede volver a entrar.
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
      clearAuthKeepSteps();
      router.replace('/');
    });
    return () => setAuthFailureHandler(null);
  }, [clearAuthKeepSteps]);

  const login = useCallback(async (email: string, password: string) => {
    const logged = await apiLogin(email, password);
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se pudo conservar el token de autenticación');
    }
    await persistClientId(logged._id);
    await persistClientSnapshot(logged);
    await startSessionTtl();
    // Persiste de nuevo el JWT tras el resto de escrituras (y fuerza await).
    await persistAuthToken(token);
    setAuthToken(token);
    setClient(logged);
    return logged;
  }, []);

  const refreshClient = useCallback(async () => {
    if (!client?._id) return;
    const fresh = await fetchClientById(client._id);
    setClient(fresh);
    await persistClientSnapshot(fresh);
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
        await persistClientSnapshot(updated);
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
