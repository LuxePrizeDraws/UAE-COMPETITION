import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthPayload, Entry, User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  entries: Entry[];
  wins: number;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = 'uae-luxury-token';

const readStoredToken = () => (typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY));

const readErrorMessage = async (response: Response) => {
  const fallback = 'Something went wrong. Please try again.';
  try {
    const data = await response.json();
    return data.error || data.message || fallback;
  } catch {
    return fallback;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [wins, setWins] = useState(0);
  const [loading, setLoading] = useState(true);

  const persistAuth = (payload: AuthPayload) => {
    setToken(payload.token);
    window.localStorage.setItem(TOKEN_KEY, payload.token);
    setUser(payload.user);
    setEntries(payload.entries ?? []);
    setWins(payload.wins ?? 0);
    setLoading(false);
  };

  const clearAuth = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setEntries([]);
    setWins(0);
  }, []);

  const refreshProfile = useCallback(async () => {
    const activeToken = readStoredToken();
    if (!activeToken) {
      clearAuth();
      setLoading(false);
      return;
    }

    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: 'Bearer ' + activeToken,
      },
    });

    if (!response.ok) {
      clearAuth();
      setLoading(false);
      return;
    }

    const data = await response.json();
    setToken(activeToken);
    setUser(data.user);
    setEntries(data.entries ?? []);
    setWins(data.wins ?? 0);
    setLoading(false);
  }, [clearAuth]);

  useEffect(() => {
    refreshProfile().catch(() => {
      clearAuth();
      setLoading(false);
    });
  }, [clearAuth, refreshProfile]);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const data: AuthPayload = await response.json();
    persistAuth(data);
  };

  const signup = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const data: AuthPayload = await response.json();
    persistAuth(data);
  };

  const logout = () => {
    clearAuth();
    setLoading(false);
  };

  const value = useMemo(
    () => ({ user, token, entries, wins, loading, login, signup, logout, refreshProfile }),
    [user, token, entries, wins, loading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
