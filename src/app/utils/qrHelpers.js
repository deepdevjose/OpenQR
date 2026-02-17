// Helper functions to generate QR data strings for different types

export function generateEmailQR(data) {
    let url = `mailto:${data.email || ''}`;
    const params = [];
    
    if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
    if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
    
    if (params.length > 0) {
        url += `?${params.join('&')}`;
    }
    
    return url;
}

export function generatePhoneQR(data) {
    return `tel:${data.phone || ''}`;
}

export function generateSMSQR(data) {
    let url = `sms:${data.phone || ''}`;
    if (data.message) {
        url += `?body=${encodeURIComponent(data.message)}`;
    }
    return url;
}

export function generateLocationQR(data) {
    if (data.lat && data.lng) {
        return `geo:${data.lat},${data.lng}`;
    }
    return 'geo:0,0';
}

export function generateVCardQR(data) {
    const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${data.lastName || ''};${data.firstName || ''};;;`,
        `FN:${data.firstName || ''} ${data.lastName || ''}`,
    ];
    
    if (data.organization) vcard.push(`ORG:${data.organization}`);
    if (data.phone) vcard.push(`TEL:${data.phone}`);
    if (data.email) vcard.push(`EMAIL:${data.email}`);
    if (data.url) vcard.push(`URL:${data.url}`);
    
    vcard.push('END:VCARD');
    
    return vcard.join('\n');
}

export function generateWiFiQR(data) {
    const ssid = data.ssid || '';
    const password = data.password || '';
    const encryption = data.encryption || 'WPA';
    const hidden = data.hidden ? 'true' : 'false';
    
    return `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden};;`;
}

export function generateQRData(type, data) {
    switch (type) {
        case 'email':
            return generateEmailQR(data);
        case 'phone':
            return generatePhoneQR(data);
        case 'sms':
            return generateSMSQR(data);
        case 'location':
            return generateLocationQR(data);
        case 'vcard':
            return generateVCardQR(data);
        case 'wifi':
            return generateWiFiQR(data);
        case 'url':
        default:
            return data.url || '';
    }
}

export function getDefaultDataForType(type) {
    switch (type) {
        case 'email':
            return { email: '', subject: '', body: '' };
        case 'phone':
            return { phone: '' };
        case 'sms':
            return { phone: '', message: '' };
        case 'location':
            return { lat: '', lng: '' };
        case 'vcard':
            return { firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' };
        case 'wifi':
            return { ssid: '', password: '', encryption: 'WPA', hidden: false };
        case 'url':
        default:
            return { url: 'https://example.com' };
    }
}
