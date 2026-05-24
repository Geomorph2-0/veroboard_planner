import styles from "../Ribbon.module.css";

export function RibbonBtn({
  icon, label, onClick, active, disabled, title, testId
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      className={`${styles.btn} ${active ? styles.btnActive : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <span className={styles.btnIcon}>{icon}</span>
      <span className={styles.btnLabel}>{label}</span>
    </button>
  );
}
