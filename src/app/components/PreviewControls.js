'use client';

import styles from './preview.module.css';

export default function PreviewControls({ 
    roundedModules, 
    setRoundedModules,
    quietZone,
    setQuietZone,
    invertColors,
    setInvertColors
}) {
    return (
        <div className={styles.previewControlsCard}>
            <div className={styles.controlsHeader}>
                <span>&gt; Quick Adjustments</span>
                <span className={styles.controlsSubtitle}>Optional visual tweaks</span>
            </div>
            <div className={styles.previewControls}>
                <label className={styles.toggleLabel}>
                    <input 
                        type="checkbox" 
                        checked={roundedModules}
                        onChange={(e) => setRoundedModules(e.target.checked)}
                        className={styles.checkbox}
                    />
                    <span className={styles.toggleText}>Rounded modules</span>
                </label>

                <label className={styles.toggleLabel}>
                    <input 
                        type="checkbox" 
                        checked={quietZone}
                        onChange={(e) => setQuietZone(e.target.checked)}
                        className={styles.checkbox}
                    />
                    <span className={styles.toggleText}>Add quiet zone</span>
                </label>

                <label className={styles.toggleLabel}>
                    <input 
                        type="checkbox" 
                        checked={invertColors}
                        onChange={(e) => setInvertColors(e.target.checked)}
                        className={styles.checkbox}
                    />
                    <span className={styles.toggleText}>Invert colors</span>
                </label>
            </div>
        </div>
    );
}
