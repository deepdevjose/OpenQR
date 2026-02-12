import { useState, useRef, useEffect } from 'react';
import styles from './components.module.css';
import { ChevronDown } from 'lucide-react';

export default function RetroSelect({ value, options, onChange, label }) {
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

    const selectedLabel = options.find(opt => opt.value === value)?.label || value;

    return (
        <div className={styles.customControl} ref={ref}>
            <div className={styles.controlTrigger} onClick={() => setIsOpen(!isOpen)}>
                <span>{selectedLabel}</span>
                <ChevronDown size={14} color="#666" />
            </div>

            {isOpen && (
                <div className={styles.controlDropdown}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`${styles.dropdownItem} ${value === option.value ? styles.selected : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
