import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = { id?: string; [key: string]: any };
type Session = { accessToken?: string | null; user?: User | null } | null;

const STORAGE_KEY = '@pi6:session';

interface SessionContextValue {
  session: Session;
  setSession: (s: Session) => Promise<void>;
  login: (s: Exclude<Session, null>) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSessionState] = useState<Session>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setSessionState(JSON.parse(json));
      } catch (e) {
        console.warn('Failed to load session', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const setSession = async (s: Session) => {
    try {
      if (s) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      else await AsyncStorage.removeItem(STORAGE_KEY);
      setSessionState(s);
    } catch (e) {
      console.warn('Failed to persist session', e);
    }
  };

  const login = async (s: Exclude<Session, null>) => setSession(s);
  const logout = async () => setSession(null);

  return (
    <SessionContext.Provider value={{ session, setSession, login, logout, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}

export default useSession;
