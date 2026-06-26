"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types/user";
import { getStoredUser, logout as clearSession } from "@/lib/auth-service";

interface AuthContextValue {
  /** The signed-in user, or null until hydrated / when logged out. */
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Hydrate from the persisted session after mount. Reading localStorage must
  // happen post-render (it's unavailable during SSR), so the mount-only
  // setState is intentional despite the set-state-in-effect rule.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getStoredUser());
  }, []);

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
