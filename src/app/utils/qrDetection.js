// Auto-detection heuristics for QR content types

export const QR_TYPES = {
  WIFI: 'wifi',
  EMAIL: 'email',
  PHONE: 'phone',
  SMS: 'sms',
  LOCATION: 'location',
  VCARD: 'vcard',
  URL: 'url',
};

export const CONFIDENCE = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Detect QR type from pasted/input text
 * @param {string} text - Input text to analyze
 * @returns {{ type: string, confidence: string, data: object }}
 */
export function detectQRType(text) {
  if (!text || typeof text !== 'string') {
    return { type: QR_TYPES.URL, confidence: CONFIDENCE.LOW, data: { url: '' } };
  }

  const trimmed = text.trim();

  // 1) WiFi (formato estándar)
  if (trimmed.startsWith('WIFI:')) {
    return {
      type: QR_TYPES.WIFI,
      confidence: CONFIDENCE.HIGH,
      data: parseWiFiString(trimmed),
    };
  }

  // 2) URI schemes directos
  if (trimmed.startsWith('mailto:')) {
    return {
      type: QR_TYPES.EMAIL,
      confidence: CONFIDENCE.HIGH,
      data: parseMailtoString(trimmed),
    };
  }

  if (trimmed.startsWith('tel:')) {
    return {
      type: QR_TYPES.PHONE,
      confidence: CONFIDENCE.HIGH,
      data: { phone: trimmed.substring(4) },
    };
  }

  if (trimmed.startsWith('sms:') || trimmed.startsWith('smsto:')) {
    return {
      type: QR_TYPES.SMS,
      confidence: CONFIDENCE.HIGH,
      data: parseSMSString(trimmed),
    };
  }

  if (trimmed.startsWith('geo:')) {
    return {
      type: QR_TYPES.LOCATION,
      confidence: CONFIDENCE.HIGH,
      data: parseGeoString(trimmed),
    };
  }

  if (trimmed.includes('BEGIN:VCARD')) {
    return {
      type: QR_TYPES.VCARD,
      confidence: CONFIDENCE.HIGH,
      data: parseVCardString(trimmed),
    };
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Check if it's a maps link
    if (isMapsLink(trimmed)) {
      return {
        type: QR_TYPES.URL, // Keep as URL but could offer conversion
        confidence: CONFIDENCE.HIGH,
        data: { url: trimmed },
        suggestion: 'This looks like a maps link. Convert to geo:?',
      };
    }
    return {
      type: QR_TYPES.URL,
      confidence: CONFIDENCE.HIGH,
      data: { url: trimmed },
    };
  }

  // 3) Email "plain" (sin mailto:)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) {
    return {
      type: QR_TYPES.EMAIL,
      confidence: CONFIDENCE.HIGH,
      data: { email: trimmed, subject: '', body: '' },
    };
  }

  // 4) Coordenadas "plain" (ej: "19.4326,-99.1332" o "19.4326, -99.1332")
  const coordsRegex = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  if (coordsRegex.test(trimmed)) {
    const [lat, lng] = trimmed.split(',').map(s => s.trim());
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
      return {
        type: QR_TYPES.LOCATION,
        confidence: CONFIDENCE.HIGH,
        data: { latitude: lat, longitude: lng, label: '' },
      };
    }
  }

  // 5) Teléfono "plain" (dígitos con +, espacios, -, ())
  const phoneRegex = /^[\+\d\s\-\(\)]+$/;
  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (phoneRegex.test(trimmed) && digitCount >= 7 && digitCount <= 15) {
    return {
      type: QR_TYPES.PHONE,
      confidence: CONFIDENCE.MEDIUM,
      data: { phone: trimmed },
    };
  }

  // 6) URL sin esquema (example.com, www.)
  const domainRegex = /^(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
  if (domainRegex.test(trimmed)) {
    return {
      type: QR_TYPES.URL,
      confidence: CONFIDENCE.HIGH,
      data: { url: `https://${trimmed}` },
    };
  }

  // 7) Fallback - assume URL
  return {
    type: QR_TYPES.URL,
    confidence: CONFIDENCE.LOW,
    data: { url: trimmed },
  };
}

// Helper parsers

function parseWiFiString(str) {
  // WIFI:T:WPA;S:MiSSID;P:MiPass;H:false;;
  const data = { ssid: '', password: '', encryption: 'WPA', hidden: false };
  
  const sMatch = str.match(/S:([^;]+)/);
  const pMatch = str.match(/P:([^;]+)/);
  const tMatch = str.match(/T:([^;]+)/);
  const hMatch = str.match(/H:([^;]+)/);
  
  if (sMatch) data.ssid = sMatch[1];
  if (pMatch) data.password = pMatch[1];
  if (tMatch) data.encryption = tMatch[1];
  if (hMatch) data.hidden = hMatch[1] === 'true';
  
  return data;
}

function parseMailtoString(str) {
  // mailto:someone@x.com?subject=Hi&body=Hello
  const data = { email: '', subject: '', body: '' };
  
  try {
    const url = new URL(str);
    data.email = url.pathname;
    data.subject = url.searchParams.get('subject') || '';
    data.body = url.searchParams.get('body') || '';
  } catch (e) {
    // Fallback simple parsing
    const emailMatch = str.match(/mailto:([^?]+)/);
    if (emailMatch) data.email = emailMatch[1];
  }
  
  return data;
}

function parseSMSString(str) {
  // sms:+521234?body=Hello or SMSTO:+521234:Hello
  const data = { phone: '', message: '' };
  
  if (str.startsWith('SMSTO:')) {
    const parts = str.substring(6).split(':');
    data.phone = parts[0] || '';
    data.message = parts[1] || '';
  } else {
    try {
      const url = new URL(str);
      data.phone = url.pathname;
      data.message = url.searchParams.get('body') || '';
    } catch (e) {
      // Fallback
      const phoneMatch = str.match(/sms:([^?]+)/);
      if (phoneMatch) data.phone = phoneMatch[1];
    }
  }
  
  return data;
}

function parseGeoString(str) {
  // geo:19.4326,-99.1332 or geo:19.4326,-99.1332?q=19.4326,-99.1332(Label)
  const data = { latitude: '', longitude: '', label: '' };
  
  const coordMatch = str.match(/geo:([-\d.]+),([-\d.]+)/);
  if (coordMatch) {
    data.latitude = coordMatch[1];
    data.longitude = coordMatch[2];
  }
  
  const labelMatch = str.match(/\(([^)]+)\)/);
  if (labelMatch) {
    data.label = labelMatch[1];
  }
  
  return data;
}

function parseVCardString(str) {
  // Basic vCard parsing
  const data = { firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' };
  
  const fnMatch = str.match(/FN:([^\r\n]+)/);
  const telMatch = str.match(/TEL[^:]*:([^\r\n]+)/);
  const emailMatch = str.match(/EMAIL:([^\r\n]+)/);
  const orgMatch = str.match(/ORG:([^\r\n]+)/);
  const urlMatch = str.match(/URL:([^\r\n]+)/);
  
  if (fnMatch) {
    const fullName = fnMatch[1].split(' ');
    data.firstName = fullName[0] || '';
    data.lastName = fullName.slice(1).join(' ') || '';
  }
  if (telMatch) data.phone = telMatch[1];
  if (emailMatch) data.email = emailMatch[1];
  if (orgMatch) data.organization = orgMatch[1];
  if (urlMatch) data.url = urlMatch[1];
  
  return data;
}

function isMapsLink(url) {
  return url.includes('maps.google.com') ||
         url.includes('goo.gl/maps') ||
         url.includes('google.com/maps');
}

/**
 * Validate and normalize phone number
 * @param {string} phone
 * @returns {{ valid: boolean, normalized: string }}
 */
export function validatePhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const digitCount = (cleaned.match(/\d/g) || []).length;
  
  return {
    valid: digitCount >= 7 && digitCount <= 15,
    normalized: cleaned.startsWith('+') ? cleaned : `+${cleaned}`,
  };
}

/**
 * Validate email address
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate coordinates
 * @param {string|number} lat
 * @param {string|number} lng
 * @returns {boolean}
 */
export function validateCoordinates(lat, lng) {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  return !isNaN(latNum) && !isNaN(lngNum) &&
         latNum >= -90 && latNum <= 90 &&
         lngNum >= -180 && lngNum <= 180;
}
