import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Upload, RefreshCw, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import styles from './scanner.module.css';

export default function Scanner({ onGenerateFromResult }) {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [cameraFacing, setCameraFacing] = useState('environment');
    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
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

                    const tempScanner = new Html5Qrcode("reader");
                    scannerRef.current = tempScanner;

                    await tempScanner.start(
                        { facingMode: cameraFacing },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
                        },
                        (decodedText, decodedResult) => {
                            setResult(decodedText);
                            stopScanning();
                        },
                        (errorMessage) => {
                            // ignore frame errors
                        }
                    );
                } catch (err) {
                    setError("Camera access failed. Please check permissions.");
                    console.error(err);
                    setScanning(false);
                }
            };
            startCamera();
        }
    }, [scanning, cameraFacing]);

    const startScanning = () => {
        setResult(null);
        setError(null);
        setScanning(true);
    };

    const stopScanning = async () => {
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
        stopScanning().then(() => {
            setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
            // Re-start will happen via user action or effect depending on UX preference.
            // For now, let's make the user click start again to avoid permission loops or just auto-start.
            // Let's auto-restart for better UX if it was scanning.
            setTimeout(() => { // small delay to ensure cleanup
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
        try {
            const html5QrCode = new Html5Qrcode("reader-file");
            const decodedText = await html5QrCode.scanFile(file, true);
            setResult(decodedText);
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
                    <div className={styles.activeScanner}>
                        <div id="reader" className={styles.visualScanner}></div>
                        <div className={styles.scannerOverlay}>
                            <button className={styles.iconBtn} onClick={switchCamera} title="Switch Camera">
                                <RefreshCw size={20} />
                            </button>
                            <button className={`${styles.iconBtn} ${styles.closeBtn}`} onClick={stopScanning} title="Close Camera">
                                X
                            </button>
                        </div>
                        <p className={styles.instructions}>Point camera at a QR code</p>
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}

                {result && (
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
