import styles from './components.module.css';

export default function Navbar({ mode, setMode }) {
    return (
        <nav className={styles.navbar}>
            <div className={styles.brand}>
                <span className={styles.brandName}>
                    OpenQR <span className={styles.betaBadge}>BETA</span>
                </span>
                <span className={styles.brandTagline}>Free. Private. Infinite.</span>
            </div>

            <div className={styles.segmentedControl}>
                <button
                    className={`${styles.segmentBtn} ${mode === 'static' ? styles.activeSegment : ''}`}
                    onClick={() => setMode('static')}
                    title="Direct Link"
                >
                    STATIC
                </button>
                <button
                    className={`${styles.segmentBtn} ${mode === 'dynamic' ? styles.activeSegment : ''}`}
                    onClick={() => setMode('dynamic')}
                    title="Editable Link"
                >
                    DYNAMIC
                </button>
            </div>
        </nav>
    );
}
