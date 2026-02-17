'use client';
import { useState, useEffect } from 'react';
import { detectQRType, CONFIDENCE } from '../utils/qrDetection';
import styles from './universalinput.module.css';
import { Mail, Phone, MessageSquare, MapPin, User, Wifi, Link, AlertCircle } from 'lucide-react';

const typeIcons = {
  url: Link,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  location: MapPin,
  vcard: User,
  wifi: Wifi,
};

const typeLabels = {
  url: 'URL',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
  location: 'Location',
  vcard: 'vCard',
  wifi: 'WiFi',
};

export default function UniversalInput({ onDetect, onToggleManual, showManual = false }) {
  const [inputValue, setInputValue] = useState('');
  const [detection, setDetection] = useState(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const result = detectQRType(inputValue);
      setDetection(result);
      onDetect(result);
    } else {
      setDetection(null);
      onDetect(null);
    }
  }, [inputValue]);

  const handlePaste = (e) => {
    // Let the browser handle the paste, then detect
    setTimeout(() => {
      const text = e.target.value;
      setInputValue(text);
    }, 0);
  };

  const Icon = detection ? typeIcons[detection.type] : Link;
  const confidenceClass = detection ? styles[`confidence-${detection.confidence}`] : '';

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <textarea
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPaste={handlePaste}
          placeholder="Paste anything: URL, email, phone, coordinates, WiFi config..."
          rows={3}
        />
      </div>

      {detection && (
        <div className={styles.detectionBar}>
          <div className={`${styles.badge} ${confidenceClass}`}>
            <Icon size={14} />
            <span>Detected: {typeLabels[detection.type]}</span>
            {detection.confidence === CONFIDENCE.MEDIUM && (
              <AlertCircle size={12} className={styles.warningIcon} />
            )}
            {detection.confidence === CONFIDENCE.LOW && (
              <AlertCircle size={12} className={styles.warningIcon} />
            )}
          </div>
          
          <button
            onClick={onToggleManual}
            className={`pixel-btn-secondary ${styles.changeBtn}`}
          >
            {showManual ? 'Hide Selector' : 'Change Type'}
          </button>
        </div>
      )}

      {detection && detection.suggestion && (
        <div className={styles.suggestion}>
          <AlertCircle size={14} />
          <span>{detection.suggestion}</span>
        </div>
      )}

      {detection && detection.confidence === CONFIDENCE.LOW && (
        <div className={styles.lowConfidence}>
          <AlertCircle size={14} />
          <span>Low confidence detection. Use "Change Type" if incorrect.</span>
        </div>
      )}
    </div>
  );
}
