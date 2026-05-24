import styles from "../BoardCanvas.module.css";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className={styles.zoomControls}>
      <button className={styles.zoomBtn} onClick={onZoomIn} title="Zoom in (Ctrl+scroll)">+</button>
      <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
      <button className={styles.zoomBtn} onClick={onZoomOut} title="Zoom out (Ctrl+scroll)">−</button>
      <button className={styles.zoomBtn} onClick={onReset} title="Reset zoom">⊡</button>
    </div>
  );
}
