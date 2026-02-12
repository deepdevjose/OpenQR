import styles from './components.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>


            <div className={styles.footerLeft}>
                <span>Built by deepdevjose</span>
            </div>

            <div className={styles.footerLinks}>
                <a href="https://github.com/deepdevjose/OpenQR" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>GitHub</a>
                <a
                    href="https://github.com/deepdevjose/OpenQR/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.bugLink}
                >
                    Report Bug
                </a>
            </div>
        </footer>
    );
}
