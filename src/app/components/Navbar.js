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


        </nav>
    );
}
