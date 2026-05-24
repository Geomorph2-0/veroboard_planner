import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { CHANGELOG, CURRENT_VERSION, ChangeEntry } from "../changelog/changelog";
import { WhatsNewPopup } from "../changelog/WhatsNewPopup";
import { AuthPage } from "./AuthPage";
import styles from "./AuthGate.module.css";

function computeWhatsNew(user: User): { entries: ChangeEntry[]; isNewUser: boolean } {
  const last = user.user_metadata?.lastSeenVersion as string | undefined;
  if (!last) return { entries: CHANGELOG, isNewUser: true };
  const entries = CHANGELOG.filter(e => e.version > last);
  return { entries, isNewUser: false };
}

// E2E test bypass — when VITE_E2E_AUTH_BYPASS is set, skip Supabase auth entirely.
// Inert in normal builds (flag unset). The mock user's lastSeenVersion = CURRENT_VERSION
// so computeWhatsNew yields no entries and the What's New popup never overlays the canvas.
const E2E_BYPASS = import.meta.env.VITE_E2E_AUTH_BYPASS === "true";
const MOCK_SESSION = {
  user: { id: "e2e", user_metadata: { lastSeenVersion: CURRENT_VERSION } },
} as unknown as Session;

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | "loading">(E2E_BYPASS ? MOCK_SESSION : "loading");
  const [whatsNew, setWhatsNew] = useState<{ entries: ChangeEntry[]; isNewUser: boolean } | null>(null);

  useEffect(() => {
    if (E2E_BYPASS) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (s && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        const result = computeWhatsNew(s.user);
        if (result.entries.length > 0) setWhatsNew(result);
      }
      if (event === "SIGNED_OUT") setWhatsNew(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCloseWhatsNew = async () => {
    await supabase.auth.updateUser({ data: { lastSeenVersion: CURRENT_VERSION } });
    setWhatsNew(null);
  };

  if (session === "loading") {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingLogo}>⬛</span>
        <span className={styles.loadingText}>Loading…</span>
      </div>
    );
  }

  if (!session) return <AuthPage />;

  return (
    <>
      {children}
      {whatsNew && whatsNew.entries.length > 0 && (
        <WhatsNewPopup
          entries={whatsNew.entries}
          isNewUser={whatsNew.isNewUser}
          onClose={handleCloseWhatsNew}
        />
      )}
    </>
  );
}
