import { supabase } from "../../../lib/supabase";
import styles from "../Ribbon.module.css";

export function TitleBar({ projectName, theme, onProjectNameChange, onToggleTheme }: {
  projectName: string;
  theme: "dark" | "light";
  onProjectNameChange: (name: string) => void;
  onToggleTheme: () => void;
}) {
  return (
    <div className={styles.titleBar}>
      <span className={styles.logo}>⬛ Veroboard Planner</span>
      <input
        className={styles.projectName}
        value={projectName}
        onChange={(e) => onProjectNameChange(e.target.value)}
        aria-label="Project name"
      />
      <button
        type="button"
        className={styles.themeToggle}
        onClick={onToggleTheme}
        title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>
      <button
        type="button"
        className={styles.logoutBtn}
        onClick={() => supabase.auth.signOut()}
        title="Log out"
      >
        ⏻
      </button>
    </div>
  );
}
