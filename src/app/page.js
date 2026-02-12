'use client';

import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import confetti from 'canvas-confetti';
import styles from './page.module.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RetroSelect from './components/RetroSelect';
import RetroColorPicker from './components/RetroColorPicker';
import ExportConfig from './components/ExportConfig';

// Placeholder for the QR Code Component
const QRPreview = ({ url, options, resolution, ecc, transparentBg }) => {
  const ref = useRef(null);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    const qr = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'svg',
      data: url,
      image: options.image,
      dotsOptions: {
        color: options.dotsColor || '#000000',
        type: options.dotsType || 'square'
      },
      backgroundOptions: {
        color: options.bgColor || '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10
      }
    });
    setQrCode(qr);
    if (ref.current) {
      ref.current.innerHTML = '';
      qr.append(ref.current);
    }
  }, []);

  useEffect(() => {
    if (qrCode) {
      // Trigger update animation
      if (ref.current) {
        ref.current.classList.remove(styles.updating);
        void ref.current.offsetWidth; // Trigger reflow
        ref.current.classList.add(styles.updating);
      }

      qrCode.update({
        data: url,
        image: options.image,
        dotsOptions: {
          color: options.dotsColor,
          type: options.dotsType
        },
        backgroundOptions: {
          color: transparentBg ? 'rgba(0,0,0,0)' : options.bgColor,
        },
        qrOptions: {
          errorCorrectionLevel: ecc
        }
      });
    }
  }, [url, options, qrCode, ecc, transparentBg]);

  const onDownloadClick = async (extension) => {
    if (qrCode) {
      // Trigger flash animation
      if (ref.current) {
        ref.current.style.animation = 'none';
        void ref.current.offsetWidth;
        ref.current.style.animation = 'flash 0.5s';
      }

      // Micro-feedback
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#FF5E00', '#00FF41', '#ffffff']
      });

      // Ensure all current options are applied before download
      const currentConfig = {
        data: url,
        image: options.image,
        dotsOptions: {
          color: options.dotsColor,
          type: options.dotsType
        },
        cornersSquareOptions: {
          type: options.dotsType === 'dot' ? 'dot' : 'square',
          color: options.dotsColor
        },
        cornersDotOptions: {
          type: options.dotsType === 'dot' ? 'dot' : 'square',
          color: options.dotsColor
        },
        backgroundOptions: {
          color: transparentBg ? 'rgba(0,0,0,0)' : options.bgColor,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10,
          imageSize: 0.4,
          hideBackgroundDots: true
        },
        qrOptions: {
          errorCorrectionLevel: ecc
        }
      };

      if (extension === 'png') {
        const exportSize = parseInt(resolution) || 2000;
        qrCode.update({ ...currentConfig, width: exportSize, height: exportSize });
        await new Promise(resolve => setTimeout(resolve, 50));
        await qrCode.download({ extension: extension, name: 'openqr-code' });
        qrCode.update({ width: 300, height: 300 });
      } else {
        qrCode.update(currentConfig);
        await new Promise(resolve => setTimeout(resolve, 50));
        qrCode.download({ extension: extension, name: 'openqr-code' });
      }
    }
  };

  return (
    <>
      <div className={styles.qrWrapper} ref={ref} />
      <div className={styles.downloadButtons}>
        <button className="pixel-btn" onClick={() => onDownloadClick('svg')}>SVG</button>
        <button className="pixel-btn" onClick={() => onDownloadClick('png')}>PNG (High Res)</button>
      </div>
    </>
  );
};

export default function Home() {
  const [url, setUrl] = useState('https://example.com');
  const [options, setOptions] = useState({
    dotsColor: '#000000',
    bgColor: '#ffffff',
    dotsType: 'square',
    image: null
  });

  // Export Config State
  const [resolution, setResolution] = useState(2000); // 1000 or 2000
  const [ecc, setEcc] = useState('H'); // L, M, Q, H
  const [transparentBg, setTransparentBg] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOptions(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [mode, setMode] = useState('static'); // 'static' or 'dynamic'

  const shapeOptions = [
    { value: 'square', label: 'Square (Classic)' },
    { value: 'dots', label: 'Dots (Modern)' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'extra-rounded', label: 'Extra Rounded' },
    { value: 'classy', label: 'Classy' },
    { value: 'classy-rounded', label: 'Classy Rounded' }
  ];

  const mainRef = useRef(null);

  const triggerShake = () => {
    if (mainRef.current) {
      mainRef.current.classList.remove(styles.shake);
      void mainRef.current.offsetWidth;
      mainRef.current.classList.add(styles.shake);
      setTimeout(() => {
        if (mainRef.current) mainRef.current.classList.remove(styles.shake);
      }, 400);
    }
  };

  const normalizeColor = (c) => c ? c.toLowerCase().trim() : '';

  return (
    <main className={styles.main} ref={mainRef}>
      <Navbar mode={mode} setMode={setMode} />

      <div className={styles.content}>
        {mode === 'static' ? (
          <>
            <div className={styles.controls}>
              {/* URL Input */}
              <section className={styles.section}>
                <label className={styles.label}>1. Destination URL</label>
                <input
                  className="pixel-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-website.com"
                />
              </section>

              {/* Style Config */}
              <section className={styles.section}>
                <label className={styles.label}>2. Visual DNA</label>

                <div className={styles.controlGroup}>
                  <label>Dots Color</label>
                  <RetroColorPicker
                    value={options.dotsColor}
                    onChange={(color) => {
                      if (normalizeColor(color) === normalizeColor(options.bgColor)) {
                        triggerShake();
                        return;
                      }
                      setOptions({ ...options, dotsColor: color });
                    }}
                    label="DOTS_COLOR"
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label>Background</label>
                  <RetroColorPicker
                    value={options.bgColor}
                    onChange={(color) => {
                      if (normalizeColor(color) === normalizeColor(options.dotsColor)) {
                        triggerShake();
                        return;
                      }
                      setOptions({ ...options, bgColor: color });
                    }}
                    label="BACKGROUND"
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label>Module Shape</label>
                  <RetroSelect
                    value={options.dotsType}
                    options={shapeOptions}
                    onChange={(val) => setOptions({ ...options, dotsType: val })}
                    label="SHAPE"
                  />
                </div>
              </section>

              {/* Logo Upload */}
              <section className={styles.section}>
                <label className={styles.label}>3. Organization Logo</label>
                <div className={styles.fileUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="logo-upload"
                    hidden
                  />
                  <label htmlFor="logo-upload" className={`pixel-btn ${styles.uploadBtn}`}>
                    {options.image ? 'CHANGE LOGO' : 'UPLOAD LOGO'}
                  </label>
                  {options.image && (
                    <button
                      className="pixel-btn"
                      style={{ marginLeft: '10px' }}
                      onClick={() => setOptions({ ...options, image: null })}
                    >
                      REMOVE
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#666' }}>
                  *Auto-centers with High Error Correction
                </p>
              </section>
            </div>

            <div className={styles.preview}>
              <div className={styles.previewContainer}>
                <div className={styles.previewLabel}>&gt; PREVIEW OUTPUT</div>
                <div className={styles.qrFrame}>
                  <QRPreview
                    url={url}
                    options={options}
                    ecc={ecc}
                    resolution={resolution}
                    transparentBg={transparentBg}
                  />
                  <div className={styles.qrMetadata}>
                    <span>No Data Stored</span>
                    <span>Client-Side</span>
                  </div>
                </div>

                {/* Interactive Export Config */}
                <ExportConfig
                  resolution={resolution}
                  setResolution={setResolution}
                  ecc={ecc}
                  setEcc={setEcc}
                  mode={mode}
                  transparentBg={transparentBg}
                  setTransparentBg={setTransparentBg}
                />
              </div>
            </div>
          </>
        ) : (
          <div className={styles.dynamicInfo}>
            <h2 className={styles.infoTitle}>Dynamic QR Codes</h2>
            <p className={styles.infoText}>
              Dynamic QRs allow you to change the destination URL after printing.
              This requires a server to redirect the short URL to your destination.
            </p>
            <div className={styles.infoBox}>
              <h3>How to get Dynamic QRs for Free?</h3>
              <ol>
                <li>Use a free URL shortener like <strong>bit.ly</strong> or <strong>tinyurl.com</strong>.</li>
                <li>Paste the shortened URL into the <strong>Static</strong> generator.</li>
                <li>If you need to change the destination later, just update the link in your URL shortener dashboard!</li>
              </ol>
            </div>
            <button className="pixel-btn pixel-btn-accent" onClick={() => setMode('static')}>
              GO CREATE (STATIC)
            </button>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
