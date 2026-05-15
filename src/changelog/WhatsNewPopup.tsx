import { ChangeEntry } from "./changelog";
import styles from "./WhatsNewPopup.module.css";

interface WhatsNewPopupProps {
  entries: ChangeEntry[];
  isNewUser: boolean;
  onClose: () => void;
}

export function WhatsNewPopup({ entries, isNewUser, onClose }: WhatsNewPopupProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.title}>✦ What's New</span>
            {isNewUser && <span className={styles.badge}>Welcome!</span>}
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">✕</button>
        </div>

        <div className={styles.body}>
          {entries.map(entry => (
            <div key={entry.version} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.version}>v{entry.version}</span>
                <span className={styles.entryTitle}>{entry.title}</span>
                <span className={styles.date}>{entry.date}</span>
              </div>
              <ul className={styles.items}>
                {entry.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.doneBtn} onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
