import { useState, useRef, useEffect } from 'react';
import styles from './components.module.css';
import { Palette } from 'lucide-react';

const PRESET_COLORS = [
    { hex: '#000000', label: 'VOID' },
    { hex: '#FFFFFF', label: 'PAPER' },
    { hex: '#FF5E00', label: 'AMBER' },
    { hex: '#00FF41', label: 'CRT' },
    { hex: '#00E5FF', label: 'ICE' },
    { hex: '#FF0055', label: 'CRIMSON' },
    { hex: '#FFFF00', label: 'LIME' },
    { hex: '#8800FF', label: 'CYBER' },
    { hex: '#444444', label: 'SLATE' },
    { hex: '#DDDDDD', label: 'SILVER' }
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
                        {PRESET_COLORS.map(({ hex, label }) => (
                            <div
                                key={hex}
                                className={`${styles.colorSwatch} ${value === hex ? styles.selected : ''}`}
                                style={{ background: hex }}
                                data-label={label}
                                onClick={() => {
                                    onChange(hex);
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
