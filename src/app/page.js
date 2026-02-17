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
import Scanner from './components/Scanner';
import URLInput from './components/URLInput';
import PreviewControls from './components/PreviewControls';

// Placeholder for the QR Code Component
const QRPreview = ({ url, options, resolution, ecc, transparentBg }) => {
  const ref = useRef(null);
  const [qrCode, setQrCode] = useState(null);
  const [isValidUrl, setIsValidUrl] = useState(true);

  useEffect(() => {
    // Validate URL
    try {
      new URL(url);
      setIsValidUrl(true);
    } catch {
      setIsValidUrl(false);
    }
  }, [url]);

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
      // Trigger update animation with fade and scale
      if (ref.current) {
        ref.current.style.transition = 'opacity 120ms ease, transform 120ms ease';
        ref.current.style.opacity = '0.7';
        ref.current.style.transform = 'scale(0.99)';
        
        setTimeout(() => {
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'scale(1)';
        }, 120);
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

  // Calculate contrast ratio for badge
  const getContrastRatio = () => {
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.replace('#', ''), 16);
      const r = ((rgb >> 16) & 0xff) / 255;
      const g = ((rgb >> 8) & 0xff) / 255;
      const b = (rgb & 0xff) / 255;
      const [rL, gL, bL] = [r, g, b].map(c => 
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
    };
    
    try {
      const fgLum = getLuminance(options.dotsColor || '#000000');
      const bgLum = getLuminance(options.bgColor || '#ffffff');
      const lighter = Math.max(fgLum, bgLum);
      const darker = Math.min(fgLum, bgLum);
      return ((lighter + 0.05) / (darker + 0.05)).toFixed(1);
    } catch {
      return '7.0';
    }
  };

  const contrastRatio = getContrastRatio();
  const isHighContrast = parseFloat(contrastRatio) >= 4.5;

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
      
      {/* Contrast Badge */}
      <div className={styles.contrastBadge} data-high={isHighContrast}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
        {isHighContrast ? 'High Contrast' : `Contrast ${contrastRatio}:1`}
        {isHighContrast && <span className={styles.checkmark}>✓</span>}
      </div>
      
      {/* Main CTA Button */}
      <button 
        className={`pixel-btn pixel-btn-accent ${styles.primaryCTA}`}
        onClick={() => onDownloadClick('png')}
        disabled={!isValidUrl}
        title={!isValidUrl ? 'Enter a valid URL first' : 'Download QR code as PNG'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download PNG
      </button>

      {/* Secondary Actions */}
      <div className={styles.secondaryActions}>
        <button className={`pixel-btn ${styles.secondaryBtn}`} onClick={() => onDownloadClick('svg')}>
          Download SVG
        </button>
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

  // Preview Controls State
  const [roundedModules, setRoundedModules] = useState(false);
  const [quietZone, setQuietZone] = useState(false);
  const [invertColors, setInvertColors] = useState(false);

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
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'scan'
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

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

  const handleScanResult = (resultText) => {
    setUrl(resultText);
    setActiveTab('generate');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className={styles.main} ref={mainRef}>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        mode={mode}
        setMode={setMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === 'scan' ? (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Scanner onGenerateFromResult={handleScanResult} />
        </div>
      ) : (
        <div className={styles.content}>
          {mode === 'static' ? (
            <>
              <div className={styles.controls}>
                {/* URL Input */}
                <section className={styles.section}>
                  <label className={styles.label}>1. Destination URL</label>
                  <URLInput
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </section>

                {/* Style Config */}
                <section className={styles.section}>
                  <label className={styles.label}>2. Appearance</label>

                  <div className={styles.controlGroup}>
                    <label>Modules</label>
                    <RetroColorPicker
                      value={options.dotsColor}
                      onChange={(color) => {
                        if (normalizeColor(color) === normalizeColor(options.bgColor)) {
                          triggerShake();
                          return;
                        }
                        setOptions({ ...options, dotsColor: color });
                      }}
                      label="MODULES"
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
                    <label>Shape</label>
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
                  <label className={styles.label}>3. Logo (Optional)</label>
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

                  {/* Inline Preview Controls */}
                  <PreviewControls
                    roundedModules={roundedModules}
                    setRoundedModules={setRoundedModules}
                    quietZone={quietZone}
                    setQuietZone={setQuietZone}
                    invertColors={invertColors}
                    setInvertColors={setInvertColors}
                  />

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
      )}
      <Footer />
    </main>
  );
}
