import styles from './components.module.css';

const ECC_LEVELS = [
    { value: 'L', label: 'L', name: 'Low', tooltip: '7% recovery - Best for large data' },
    { value: 'M', label: 'M', name: 'Medium', tooltip: '15% recovery - Standard use' },
    { value: 'Q', label: 'Q', name: 'Quartile', tooltip: '25% recovery - Good for logos' },
    { value: 'H', label: 'H', name: 'High', tooltip: '30% recovery - Best for complex logos' }
];

export default function ExportConfig({ resolution, setResolution, ecc, setEcc, mode, transparentBg, setTransparentBg }) {
    const currentECC = ECC_LEVELS.find(level => level.value === ecc);
    
    return (
        <div className={styles.exportConfig}>
            <div className={styles.configHeader}>
                <span>&gt; EXPORT SETTINGS</span>
            </div>

            {/* Summary */}
            <div className={styles.exportSummary}>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Size</span>
                    <span className={styles.summaryValue}>{resolution}×{resolution}px</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>ECC</span>
                    <span className={styles.summaryValue}>{currentECC.name} ({ecc})</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Background</span>
                    <span className={styles.summaryValue}>{transparentBg ? 'Transparent' : 'Solid'}</span>
                </div>
            </div>

            <div className={styles.configGrid}>
                {/* Resolution Selector */}
                <div className={styles.configItem}>
                    <span className={styles.configLabel}>Resolution</span>
                    <div className={styles.chipGroup}>
                        {[1000, 2000, 3000, 4000].map((res) => (
                            <button
                                key={res}
                                className={`${styles.chip} ${resolution === res ? styles.activeChip : ''}`}
                                onClick={() => setResolution(res)}
                                title={`${res}×${res} pixels`}
                            >
                                {res / 1000}K
                            </button>
                        ))}
                    </div>
                </div>

                {/* ECC Selector */}
                <div className={styles.configItem}>
                    <span className={styles.configLabel}>Error Correction</span>
                    <div className={styles.chipGroup}>
                        {ECC_LEVELS.map((level) => (
                            <button
                                key={level.value}
                                className={`${styles.chip} ${ecc === level.value ? styles.activeChip : ''}`}
                                onClick={() => setEcc(level.value)}
                                title={level.tooltip}
                            >
                                {level.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transparency Toggle */}
                <div className={styles.configItem}>
                    <span className={styles.configLabel}>Background Mode</span>
                    <div className={styles.chipGroup}>
                        <button
                            className={`${styles.chip} ${!transparentBg ? styles.activeChip : ''}`}
                            onClick={() => setTransparentBg(false)}
                            title="Solid background color"
                        >
                            Solid
                        </button>
                        <button
                            className={`${styles.chip} ${transparentBg ? styles.activeChip : ''}`}
                            onClick={() => setTransparentBg(true)}
                            title="Transparent background for PNG/SVG"
                        >
                            Transparent
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
