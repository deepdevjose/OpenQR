import { useState, useRef, useEffect } from 'react';
import styles from './components.module.css';
import { Palette } from 'lucide-react';

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#FF5E00', '#00FF41', '#00E5FF',
    '#FF0055', '#FFFF00', '#8800FF', '#444444', '#DDDDDD'
];

export default function RetroColorPicker({ value, onChange, label }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.customControl} ref={ref}>
            <div className={styles.controlTrigger} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.controlValue}>
                    <div style={{ width: '20px', height: '20px', background: value, border: '1px solid #666' }}></div>
                    <span>{value.toUpperCase()}</span>
                </div>
                <Palette size={14} color="#666" />
            </div>

            {isOpen && (
                <div className={styles.controlDropdown}>
                    <div className={styles.colorGrid}>
                        {PRESET_COLORS.map(color => (
                            <div
                                key={color}
                                className={`${styles.colorSwatch} ${value === color ? styles.selected : ''}`}
                                style={{ background: color }}
                                onClick={() => {
                                    onChange(color);
                                    setIsOpen(false);
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ padding: '10px', borderTop: '1px solid #222' }}>
                        <label style={{ fontSize: '0.6rem', color: '#666', marginBottom: '5px', display: 'block' }}>CUSTOM HEX</label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            style={{
                                background: '#111',
                                border: '1px solid #444',
                                color: '#fff',
                                width: '100%',
                                padding: '5px',
                                fontFamily: 'monospace'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
