import styles from './components.module.css';
import { Sun, Moon } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, activeTab, setActiveTab }) {
    return (
        <nav className={styles.navbar}>
            <div className={styles.brand}>
                <span className={styles.brandName}>
                    Open<span className={styles.pixelLetter}>Q</span>R <span className={styles.betaBadge}>BETA</span>
                </span>
                <span className={styles.brandTagline}>Free. Private. Infinite.</span>
            </div>

            <div className={styles.segmentedControl}>
                <button
                    className={`${styles.segmentBtn} ${activeTab === 'generate' ? styles.activeSegment : ''}`}
                    onClick={() => setActiveTab('generate')}
                >
                    GENERATE
                </button>
                <button
                    className={`${styles.segmentBtn} ${activeTab === 'scan' ? styles.activeSegment : ''}`}
                    onClick={() => setActiveTab('scan')}
                >
                    SCAN
                </button>
            </div>

            <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Theme">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
        </nav>
    );
}
