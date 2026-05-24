import styles from "../Ribbon.module.css";

export function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.group}>
      <div className={styles.groupItems}>{children}</div>
      <div className={styles.groupLabel}>{label}</div>
    </div>
  );
}
