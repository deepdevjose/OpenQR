import styles from './components.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.metadata}>
                <span>v1.0.0</span>
                <span>ECC: HIGH</span>
                <span>No Database</span>
            </div>

            <div className={styles.footerLinks}>
                <span>Built by Jose Manuel Cortes</span>
                <a href="https://github.com/tu-usuario/OpenQR" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>GitHub</a>
                <a href="#" className={styles.footerLink}>Report Bug</a>
            </div>
        </footer>
    );
}
