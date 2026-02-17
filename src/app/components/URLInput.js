'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clipboard } from 'lucide-react';
import styles from './urlinput.module.css';

export default function URLInput({ value, onChange }) {
    const [isValid, setIsValid] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        if (!value || value.trim() === '') {
            setIsValid(null);
            setShowFeedback(false);
            return;
        }

        setShowFeedback(true);
        
        // Simple URL validation
        try {
            const url = new URL(value);
            setIsValid(url.protocol === 'http:' || url.protocol === 'https:');
        } catch {
            // Check if it's a valid-looking string that could be a URL
            const hasProtocol = value.startsWith('http://') || value.startsWith('https://');
            const hasDomain = value.includes('.');
            setIsValid(hasProtocol && hasDomain);
        }
    }, [value]);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            onChange({ target: { value: text } });
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    return (
        <div className={styles.urlInputContainer}>
            <div className={styles.inputWrapper}>
                <input
                    className={`pixel-input ${styles.urlInput}`}
                    value={value}
                    onChange={onChange}
                    placeholder="https://example.com"
                    type="url"
                />
                <button 
                    className={styles.pasteBtn}
                    onClick={handlePaste}
                    title="Paste from clipboard"
                    type="button"
                >
                    <Clipboard size={16} />
                    PASTE
                </button>
            </div>
            {showFeedback && (
                <div className={`${styles.feedback} ${isValid ? styles.valid : styles.invalid}`}>
                    {isValid ? (
                        <>
                            <CheckCircle size={14} />
                            <span>Valid URL</span>
                        </>
                    ) : (
                        <>
                            <XCircle size={14} />
                            <span>Invalid URL format</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
