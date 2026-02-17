'use client';

import { Mail, Phone, MessageSquare, MapPin, User, Wifi, Link } from 'lucide-react';
import styles from './components.module.css';

const QR_TYPES = [
    { id: 'url', label: 'URL', icon: Link, description: 'Website or link' },
    { id: 'email', label: 'Email', icon: Mail, description: 'Email address' },
    { id: 'phone', label: 'Phone', icon: Phone, description: 'Phone number' },
    { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message' },
    { id: 'location', label: 'Location', icon: MapPin, description: 'GPS coordinates' },
    { id: 'vcard', label: 'vCard', icon: User, description: 'Contact info' },
    { id: 'wifi', label: 'WiFi', icon: Wifi, description: 'Network credentials' }
];

export default function QRTypeSelector({ selectedType, onChange }) {
    return (
        <div className={styles.typeSelector}>
            <label className={styles.typeSelectorLabel}>QR Type</label>
            <div className={styles.typeGrid}>
                {QR_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                        <button
                            key={type.id}
                            className={`${styles.typeCard} ${selectedType === type.id ? styles.typeCardActive : ''}`}
                            onClick={() => onChange(type.id)}
                            type="button"
                        >
                            <Icon size={24} className={styles.typeIcon} />
                            <span className={styles.typeLabel}>{type.label}</span>
                            <span className={styles.typeDescription}>{type.description}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export { QR_TYPES };
