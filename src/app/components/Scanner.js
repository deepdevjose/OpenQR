import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Upload, RefreshCw, Copy, ExternalLink, ArrowRight, Wifi, Eye, EyeOff } from 'lucide-react';
import styles from './scanner.module.css';

// Function to parse WiFi QR format: WIFI:S:SSID;T:WPA;P:password;H:false;;
function parseWifiQR(text) {
    if (!text.startsWith('WIFI:')) return null;
    
    const params = {};
    const matches = text.matchAll(/([STPH]):(.*?);/g);
    
    for (const match of matches) {
        const key = match[1];
        const value = match[2];
        
        switch(key) {
            case 'S': params.ssid = value; break;
            case 'T': params.type = value; break;
            case 'P': params.password = value; break;
            case 'H': params.hidden = value === 'true'; break;
        }
    }
    
    return params;
}

export default function Scanner({ onGenerateFromResult }) {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [cameraFacing, setCameraFacing] = useState('environment');
    const [cameras, setCameras] = useState([]);
    const [currentCameraId, setCurrentCameraId] = useState(null);
    const [wifiData, setWifiData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [scanTime, setScanTime] = useState(0);
    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);
    const scanTimerRef = useRef(null);

    useEffect(() => {
        // Get available cameras on component mount
        const getCameras = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length > 0) {
                    setCameras(devices);
                    // Try to find back camera first, otherwise use first available
                    const backCamera = devices.find(device => 
                        device.label.toLowerCase().includes('back') || 
                        device.label.toLowerCase().includes('rear') ||
                        device.label.toLowerCase().includes('environment')
                    );
                    setCurrentCameraId(backCamera ? backCamera.id : devices[0].id);
                }
            } catch (err) {
                console.error("Failed to get cameras", err);
            }
        };
        getCameras();

        return () => {
            if (scanTimerRef.current) {
                clearInterval(scanTimerRef.current);
            }
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear();
                } catch (e) {
                    console.error("Failed to clear scanner", e);
                }
            }
        };
    }, []);

    // Effect to start scanner when "scanning" state becomes true and "reader" element exists
    useEffect(() => {
        if (scanning && !scannerRef.current) {
            const startCamera = async () => {
                setError(null);
                try {
                    // Small delay to ensure DOM is ready if needed, though usually effect runs after render
                    await new Promise(r => setTimeout(r, 100));

                    const tempScanner = new Html5Qrcode("reader", {
                        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                        verbose: false
                    });
                    scannerRef.current = tempScanner;

                    // Try using specific camera ID first (better for macOS/Edge)
                    let cameraConfig;
                    if (currentCameraId) {
                        cameraConfig = currentCameraId;
                    } else {
                        // Fallback to facingMode if no camera ID available
                        cameraConfig = { facingMode: cameraFacing };
                    }

                    await tempScanner.start(
                        cameraConfig,
                        {
                            fps: 10,
                            qrbox: function(viewfinderWidth, viewfinderHeight) {
                                // Make qrbox responsive for better compatibility
                                let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                                let qrboxSize = Math.floor(minEdge * 0.7);
                                return {
                                    width: qrboxSize,
                                    height: qrboxSize
                                };
                            },
                            aspectRatio: 1.0,
                            disableFlip: false
                        },
                        (decodedText, decodedResult) => {
                            // Detection animation
                            setDetecting(true);
                            
                            // Vibrate if supported (mobile)
                            if ('vibrate' in navigator) {
                                navigator.vibrate(200);
                            }
                            
                            setTimeout(() => {
                                setResult(decodedText);
                                // Check if it's a WiFi QR
                                const wifi = parseWifiQR(decodedText);
                                if (wifi) {
                                    setWifiData(wifi);
                                }
                                stopScanning();
                                setDetecting(false);
                            }, 300);
                        },
                        (errorMessage) => {
                            // ignore frame errors
                        }
                    );
                } catch (err) {
                    setError("Camera access failed. Please check permissions and ensure camera is not in use by another app.");
                    console.error("Camera error:", err);
                    setScanning(false);
                    scannerRef.current = null;
                }
            };
            startCamera();
        }
    }, [scanning, currentCameraId]);

    const startScanning = () => {
        setResult(null);
        setError(null);
        setWifiData(null);
        setShowPassword(false);
        setScanTime(0);
        setScanning(true);
        
        // Start timer for "no QR found" message
        scanTimerRef.current = setInterval(() => {
            setScanTime(prev => prev + 1);
        }, 1000);
    };

    const stopScanning = async () => {
        if (scanTimerRef.current) {
            clearInterval(scanTimerRef.current);
            scanTimerRef.current = null;
        }
        if (scannerRef.current) {
            try {
                // Check if scanner is actually running before stopping
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
                scannerRef.current = null; // Clear ref to allow re-initialization
                setScanning(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
                setScanning(false); // Force state reset even if error
            }
        } else {
            setScanning(false);
        }
    };

    const switchCamera = () => {
        if (cameras.length <= 1) {
            return; // No other camera to switch to
        }

        stopScanning().then(() => {
            // Find next camera in the list
            const currentIndex = cameras.findIndex(cam => cam.id === currentCameraId);
            const nextIndex = (currentIndex + 1) % cameras.length;
            setCurrentCameraId(cameras[nextIndex].id);
            
            // Auto-restart for better UX
            setTimeout(() => { 
                startScanning();
            }, 500);
        });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        scanFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) scanFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const scanFile = async (file) => {
        setError(null);
        setResult(null);
        setWifiData(null);
        try {
            const html5QrCode = new Html5Qrcode("reader-file");
            const decodedText = await html5QrCode.scanFile(file, true);
            setResult(decodedText);
            // Check if it's a WiFi QR
            const wifi = parseWifiQR(decodedText);
            if (wifi) {
                setWifiData(wifi);
            }
        } catch (err) {
            setError("Could not find QR code in image.");
        }
    };

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            // Could add toast here
        }
    };

    const copyWifiField = (text) => {
        if (text) {
            navigator.clipboard.writeText(text);
        }
    };

    return (
        <div className={styles.scannerContainer}>
            <div className={styles.controls}>

                {!result && !scanning && (
                    <div className={styles.startWrapper}>
                        <button className="pixel-btn" onClick={startScanning}>
                            <Camera size={20} style={{ marginRight: '10px' }} />
                            START CAMERA
                        </button>

                        <div
                            className={styles.dropZone}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <Upload size={24} className={styles.uploadIcon} />
                            <p>Drop image or click to upload</p>
                        </div>
                        {/* Hidden div for file scanning instance */}
                        <div id="reader-file" style={{ display: 'none' }}></div>
                    </div>
                )}

                {scanning && (
                    <div className={`${styles.activeScanner} ${detecting ? styles.detecting : ''}`}>
                        <div id="reader" className={styles.visualScanner}></div>
                        <div className={styles.scannerOverlay}>
                            {cameras.length > 1 && (
                                <button className={styles.iconBtn} onClick={switchCamera} title="Switch Camera">
                                    <RefreshCw size={20} />
                                </button>
                            )}
                            <button className={`${styles.iconBtn} ${styles.closeBtn}`} onClick={stopScanning} title="Close Camera">
                                X
                            </button>
                        </div>
                        <p className={styles.instructions}>
                            {detecting ? '✓ QR DETECTED' : scanTime > 8 ? 'No QR found yet...' : 'Point camera at a QR code'}
                        </p>
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}

                {result && wifiData && (
                    <>
                        <div className={styles.modalOverlay} onClick={() => { setResult(null); setWifiData(null); setShowPassword(false); }}></div>
                        <div className={styles.resultCard}>
                            <div className={styles.resultHeader}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Wifi size={16} />
                                    WIFI NETWORK
                                </span>
                                <button className={styles.closeResult} onClick={() => { setResult(null); setWifiData(null); setShowPassword(false); }}>X</button>
                            </div>
                            
                            <div className={styles.wifiInfo}>
                                <div className={styles.wifiField}>
                                    <label>NETWORK NAME (SSID)</label>
                                    <div className={styles.wifiValue}>
                                        <span>{wifiData.ssid}</span>
                                        <button className={styles.copyBtn} onClick={() => copyWifiField(wifiData.ssid)} title="Copy SSID">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className={styles.wifiField}>
                                    <label>PASSWORD</label>
                                    <div className={styles.wifiValue}>
                                        <span style={{ fontFamily: 'monospace' }}>
                                            {showPassword ? wifiData.password : '•'.repeat(wifiData.password?.length || 8)}
                                        </span>
                                        <button className={styles.copyBtn} onClick={() => setShowPassword(!showPassword)} title="Toggle visibility">
                                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button className={styles.copyBtn} onClick={() => copyWifiField(wifiData.password)} title="Copy password">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    {showPassword && (
                                        <div className={styles.securityWarning}>
                                            <span>⚠</span>
                                            <span>Sensitive data visible</span>
                                        </div>
                                    )}
                                </div>
                            
                            <div className={styles.wifiField}>
                                <label>SECURITY TYPE</label>
                                <div className={styles.wifiValue}>
                                    <span>{wifiData.type || 'None'}</span>
                                </div>
                            </div>
                            
                            {wifiData.hidden && (
                                <div className={styles.wifiField}>
                                    <label>HIDDEN NETWORK</label>
                                    <div className={styles.wifiValue}>
                                        <span>Yes</span>
                                    </div>
                                </div>
                            )}
                        </div>
                            
                            <button className="pixel-btn pixel-btn-accent" onClick={() => onGenerateFromResult(result)} style={{ width: '100%', marginTop: '1.5rem' }}>
                                <ArrowRight size={16} style={{ marginRight: '8px' }} />
                                GENERATE FROM THIS
                            </button>
                        </div>
                    </>
                )}

                {result && !wifiData && (
                    <div className={styles.resultCard}>
                        <div className={styles.resultHeader}>
                            <span>SCAN RESULT</span>
                            <button className={styles.closeResult} onClick={() => setResult(null)}>X</button>
                        </div>
                        <div className={styles.resultContent}>
                            <p className={styles.resultText}>{result}</p>
                        </div>
                        <div className={styles.actionButtons}>
                            <a href={result} target="_blank" rel="noopener noreferrer" className="pixel-btn" style={{ flex: 1, textAlign: 'center' }}>
                                <ExternalLink size={16} style={{ marginRight: '8px' }} />
                                OPEN
                            </a>
                            <button className="pixel-btn" onClick={copyToClipboard} style={{ flex: 1 }}>
                                <Copy size={16} style={{ marginRight: '8px' }} />
                                COPY
                            </button>
                        </div>
                        <button className="pixel-btn pixel-btn-accent" onClick={() => onGenerateFromResult(result)} style={{ width: '100%', marginTop: '1rem' }}>
                            <ArrowRight size={16} style={{ marginRight: '8px' }} />
                            GENERATE FROM THIS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
