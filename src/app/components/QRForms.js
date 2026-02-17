'use client';

import styles from './qrforms.module.css';

export function EmailForm({ data, onChange }) {
    return (
        <div className={styles.formContainer}>
            <div className={styles.formField}>
                <label>Email Address *</label>
                <input
                    className="pixel-input"
                    type="email"
                    value={data.email || ''}
                    onChange={(e) => onChange({ ...data, email: e.target.value })}
                    placeholder="name@example.com"
                    required
                />
            </div>
            <div className={styles.formField}>
                <label>Subject (Optional)</label>
                <input
                    className="pixel-input"
                    type="text"
                    value={data.subject || ''}
                    onChange={(e) => onChange({ ...data, subject: e.target.value })}
                    placeholder="Email subject"
                />
            </div>
            <div className={styles.formField}>
                <label>Body (Optional)</label>
                <textarea
                    className={`pixel-input ${styles.textarea}`}
                    value={data.body || ''}
                    onChange={(e) => onChange({ ...data, body: e.target.value })}
                    placeholder="Email message"
                    rows={4}
                />
            </div>
        </div>
    );
}

export function PhoneForm({ data, onChange }) {
    return (
        <div className={styles.formContainer}>
            <div className={styles.formField}>
                <label>Phone Number *</label>
                <input
                    className="pixel-input"
                    type="tel"
                    value={data.phone || ''}
                    onChange={(e) => onChange({ ...data, phone: e.target.value })}
                    placeholder="+1234567890"
                    required
                />
            </div>
            <p className={styles.hint}>Include country code (e.g., +1 for USA)</p>
        </div>
    );
}

export function SMSForm({ data, onChange }) {
    return (
        <div className={styles.formContainer}>
            <div className={styles.formField}>
                <label>Phone Number *</label>
                <input
                    className="pixel-input"
                    type="tel"
                    value={data.phone || ''}
                    onChange={(e) => onChange({ ...data, phone: e.target.value })}
                    placeholder="+1234567890"
                    required
                />
            </div>
            <div className={styles.formField}>
                <label>Message (Optional)</label>
                <textarea
                    className={`pixel-input ${styles.textarea}`}
                    value={data.message || ''}
                    onChange={(e) => onChange({ ...data, message: e.target.value })}
                    placeholder="Text message"
                    rows={4}
                />
            </div>
        </div>
    );
}

export function LocationForm({ data, onChange }) {
    return (
        <div className={styles.formContainer}>
            <div className={styles.formField}>
                <label>Latitude *</label>
                <input
                    className="pixel-input"
                    type="text"
                    value={data.lat || ''}
                    onChange={(e) => onChange({ ...data, lat: e.target.value })}
                    placeholder="37.7749"
                    required
                />
            </div>
            <div className={styles.formField}>
                <label>Longitude *</label>
                <input
                    className="pixel-input"
                    type="text"
                    value={data.lng || ''}
                    onChange={(e) => onChange({ ...data, lng: e.target.value })}
                    placeholder="-122.4194"
                    required
                />
            </div>
            <p className={styles.hint}>Example: 37.7749, -122.4194 (San Francisco)</p>
        </div>
    );
}

export function VCardForm({ data, onChange }) {
    return (
        <div className={styles.formContainer}>
            <div className={styles.formField}>
                <label>First Name *</label>
                <input
                    className="pixel-input"
                    type="text"
                    value={data.firstName || ''}
                    onChange={(e) => onChange({ ...data, firstName: e.target.value })}
                    placeholder="John"
                    required
                />
            </div>
            <div className={styles.formField}>
                <label>Last Name *</label>
                <input
                    className="pixel-input"
                    type="text"
                    value={data.lastName || ''}
                    onChange={(e) => onChange({ ...data, lastName: e.target.value })}
                    placeholder="Doe"
                    required
                />
            </div>
            <div className={styles.formField}>
                <label>Phone (Optional)</label>
                <input
                    className="pixel-input"
                    type="tel"
                    value={data.phone || ''}
                    onChange={(e) => onChange({ ...data, phone: e.target.value })}
                    placeholder="+1234567890"
                />
            </div>
            <div className={styles.formField}>
                <label>Email (Optional)</label>
                <input
                    className="pixel-input"
                    type="email"
                    value={data.email || ''}
                    onChange={(e) => onChange({ ...data, email: e.target.value })}
                    placeholder="john@example.com"
                />
            </div>
            <div className={styles.formField}>
                <label>Organization (Optional)</label>
                <input
                    className="pixel-input"
                    type="text"
                    value={data.organization || ''}
                    onChange={(e) => onChange({ ...data, organization: e.target.value })}
                    placeholder="Company Name"
                />
            </div>
            <div className={styles.formField}>
                <label>Website (Optional)</label>
                <input
                    className="pixel-input"
                    type="url"
                    value={data.url || ''}
                    onChange={(e) => onChange({ ...data, url: e.target.value })}
                    placeholder="https://example.com"
                />
            </div>
        </div>
    );
}

export function WiFiForm({ data, onChange }) {
    return (
        <div className={styles.formContainer}>
            <div className={styles.formField}>
                <label>Network Name (SSID) *</label>
                <input
                    className="pixel-input"
                    type="text"
                    value={data.ssid || ''}
                    onChange={(e) => onChange({ ...data, ssid: e.target.value })}
                    placeholder="MyWiFiNetwork"
                    required
                />
            </div>
            <div className={styles.formField}>
                <label>Password *</label>
                <input
                    className="pixel-input"
                    type="text"
                    value={data.password || ''}
                    onChange={(e) => onChange({ ...data, password: e.target.value })}
                    placeholder="Network password"
                    required
                />
            </div>
            <div className={styles.formField}>
                <label>Security Type</label>
                <select
                    className={`pixel-input ${styles.select}`}
                    value={data.encryption || 'WPA'}
                    onChange={(e) => onChange({ ...data, encryption: e.target.value })}
                >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                </select>
            </div>
            <div className={styles.formField}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={data.hidden || false}
                        onChange={(e) => onChange({ ...data, hidden: e.target.checked })}
                    />
                    <span>Hidden Network</span>
                </label>
            </div>
        </div>
    );
}
