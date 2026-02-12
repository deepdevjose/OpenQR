import styles from './components.module.css';

const ECC_LEVELS = [
    { value: 'L', label: 'Low (7%)', tooltip: 'Best for large data' },
    { value: 'M', label: 'Medium (15%)', tooltip: 'Standard use' },
    { value: 'Q', label: 'Quartile (25%)', tooltip: 'Good for logos' },
    { value: 'H', label: 'High (30%)', tooltip: 'Best for complex logos' }
];

export default function ExportConfig({ resolution, setResolution, ecc, setEcc, mode, transparentBg, setTransparentBg }) {
    return (
        <div className={styles.exportConfig}>
            <div className={styles.configHeader}>&gt; EXPORT CONFIG</div>

            <div className={styles.configGrid}>
                {/* Resolution Selector */}
                <div className={styles.configItem}>
                    <span className={styles.configLabel}>RESOLUTION (PX)</span>
                    <div className={styles.eccSelector}>
                        {[1000, 2000, 3000, 4000].map((res) => (
                            <button
                                key={res}
                                className={`${styles.eccBtn} ${resolution === res ? styles.activeEcc : ''}`}
                                onClick={() => setResolution(res)}
                                title={`${res}x${res} px`}
                            >
                                {res / 1000}K
                            </button>
                        ))}
                    </div>
                </div>

                {/* ECC Selector */}
                <div className={styles.configItem}>
                    <span className={styles.configLabel}>ECC LEVEL</span>
                    <div className={styles.eccSelector}>
                        {ECC_LEVELS.map((level) => (
                            <button
                                key={level.value}
                                className={`${styles.eccBtn} ${ecc === level.value ? styles.activeEcc : ''}`}
                                onClick={() => setEcc(level.value)}
                                title={level.tooltip}
                            >
                                {level.value}
                            </button>
                        ))}
                    </div>
                </div>



                {/* Transparency Toggle */}
                <div className={styles.configItem}>
                    <span className={styles.configLabel}>BACKGROUND</span>
                    <button
                        className={`${styles.eccBtn} ${transparentBg ? styles.activeEcc : ''}`}
                        onClick={() => setTransparentBg(!transparentBg)}
                        title="Remove background for PNG/SVG"
                    >
                        {transparentBg ? 'TRANSPARENT' : 'SOLID'}
                    </button>
                </div>
            </div>
        </div>
    );
}
