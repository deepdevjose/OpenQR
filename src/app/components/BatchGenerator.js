'use client';
import { useState, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Upload, Download, Trash2, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { generateQRData } from '../utils/qrHelpers';
import styles from './batchgenerator.module.css';

export default function BatchGenerator({ options, ecc, resolution, transparentBg, logoSize }) {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [typeColumn, setTypeColumn] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const parseJSON = (text) => {
    try {
      const data = JSON.parse(text);
      
      // Validate it's an array
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of QR code objects');
      }
      
      // Validate each item has required fields
      const validatedData = data.map((item, index) => {
        if (!item.type) {
          throw new Error(`Item ${index + 1}: Missing "type" field`);
        }
        
        const validTypes = ['url', 'text', 'email', 'phone', 'sms', 'location', 'vcard', 'wifi'];
        if (!validTypes.includes(item.type.toLowerCase())) {
          throw new Error(`Item ${index + 1}: Invalid type "${item.type}". Valid types: ${validTypes.join(', ')}`);
        }
        
        return item;
      });
      
      // Extract all unique keys for headers (for display purposes)
      const allKeys = new Set();
      validatedData.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });
      
      return { 
        headers: Array.from(allKeys), 
        data: validatedData 
      };
    } catch (error) {
      alert(`JSON Parse Error: ${error.message}`);
      return { headers: [], data: [] };
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };

    // Parse CSV properly handling quoted values
    const parseLine = (line) => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    };

    const headers = parseLine(lines[0]);
    const data = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = parseLine(line);
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      })
      .filter(row => Object.values(row).some(val => val)); // Filter empty rows

    return { headers, data };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isJSON = fileName.endsWith('.json');
    const isCSV = fileName.endsWith('.csv');
    
    if (!isJSON && !isCSV) {
      alert('Please upload a valid CSV or JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      
      // Parse based on file type
      const { headers, data } = isJSON ? parseJSON(text) : parseCSV(text);
      
      if (data.length === 0) {
        return; // Error already shown by parser
      }
      
      setHeaders(headers);
      setCsvData(data);
      
      // Auto-detect type column (for CSV mainly)
      const typeCol = headers.find(h => 
        h.toLowerCase().includes('type') || 
        h.toLowerCase().includes('qr')
      ) || headers[0];
      setTypeColumn(typeCol);
    };
    reader.readAsText(file);
  };

  const generateBatchQRs = async () => {
    if (csvData.length === 0) return;

    setGenerating(true);
    setProgress(0);

    const zip = new JSZip();
    const total = csvData.length;

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      // Determine QR type and data from row
      const qrType = (row.type || row.Type || row.qr_type || 'url').toLowerCase();
      const qrData = buildQRDataFromRow(row, qrType);
      const qrContent = generateQRData(qrType, qrData);

      // Skip if QR content is empty
      if (!qrContent || qrContent.trim() === '' || qrContent === 'geo:0,0') {
        console.warn(`⚠️ Row ${i + 1} (${qrType}): Empty or invalid content - skipped`, row);
        continue;
      }

      // Generate QR code
      const qr = new QRCodeStyling({
        width: resolution,
        height: resolution,
        type: 'png',
        data: qrContent,
        image: options.image,
        dotsOptions: {
          color: options.dotsColor,
          type: options.dotsType
        },
        backgroundOptions: {
          color: transparentBg ? 'rgba(0,0,0,0)' : options.bgColor,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10,
          imageSize: logoSize || 0.3
        },
        qrOptions: {
          errorCorrectionLevel: ecc
        }
      });

      // Get blob and add to zip
      const blob = await qr.getRawData('png');
      const filename = row.filename || row.name || row.id || `qr_${i + 1}`;
      zip.file(`${filename}.png`, blob);

      // Update progress
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    // Download zip
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'qr-codes-batch.zip');

    setGenerating(false);
    setProgress(0);
  };

  const buildQRDataFromRow = (row, type) => {
    // For JSON, data might be directly in the object
    // For CSV, need to map columns
    
    switch (type) {
      case 'url':
      case 'text': // Support plain text as URL type
        return { url: row.url || row.link || row.data || row.content || '' };
      
      case 'email':
        return {
          email: row.email || '',
          subject: row.subject || '',
          body: row.body || row.message || ''
        };
      
      case 'phone':
        return { phone: (row.phone || row.tel || row.number || '').trim() };
      
      case 'sms':
        return {
          phone: (row.phone || row.tel || '').trim(),
          message: row.message || row.text || ''
        };
      
      case 'location':
        // Support direct lat/lng or extract from Google Maps URL
        let lat = row.latitude || row.lat || '';
        let lng = row.longitude || row.lng || row.lon || '';
        
        // Try to extract coordinates from Google Maps URL if present
        if (!lat && !lng && row.url) {
          const coordMatch = row.url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (coordMatch) {
            lat = coordMatch[1];
            lng = coordMatch[2];
          }
        }
        
        return {
          lat: lat,
          lng: lng,
          label: row.label || row.name || ''
        };
      
      case 'vcard':
        return {
          firstName: row.firstName || row.first_name || '',
          lastName: row.lastName || row.last_name || '',
          phone: row.phone || '',
          email: row.email || '',
          organization: row.organization || row.company || '',
          url: row.url || row.website || ''
        };
      
      case 'wifi':
        return {
          ssid: row.ssid || row.network || '',
          password: row.password || row.pass || '',
          encryption: row.encryption || row.security || 'WPA',
          hidden: row.hidden === 'true' || row.hidden === '1'
        };
      
      default:
        return { url: row.data || row.content || '' };
    }
  };

  const clearData = () => {
    setCsvData([]);
    setHeaders([]);
    setTypeColumn('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Batch QR Generator</h2>
        <p className={styles.subtitle}>
          Upload CSV or JSON to generate multiple QR codes at once
        </p>
      </div>

      <div className={styles.uploadSection}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          onChange={handleFileUpload}
          id="batch-upload"
          hidden
        />
        
        {csvData.length === 0 ? (
          <>
            <label htmlFor="batch-upload" className={styles.uploadArea}>
              <Upload size={48} />
              <h3>Upload Batch File</h3>
              <p>Click to browse or drag & drop your file</p>
              <span className={styles.formats}>Supports: .csv, .json</span>
            </label>
            
            <div className={styles.examplesSection}>
              <p className={styles.examplesLabel}>Need examples?</p>
              <div className={styles.exampleButtons}>
                <a 
                  href="/openqr-test-batch.csv" 
                  download="openqr-sample.csv"
                  className={styles.exampleBtn}
                >
                  <FileText size={16} />
                  Download Sample CSV
                </a>
                <a 
                  href="/openqr-batch-test.json" 
                  download="openqr-sample.json"
                  className={styles.exampleBtn}
                >
                  <FileText size={16} />
                  Download Sample JSON
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.dataPreview}>
            <div className={styles.previewHeader}>
              <div className={styles.previewInfo}>
                <CheckCircle size={20} />
                <span>{csvData.length} rows loaded</span>
              </div>
              <button onClick={clearData} className="pixel-btn-secondary">
                <Trash2 size={16} />
                Clear
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    {headers.map((header, i) => (
                      <th key={i}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {headers.map((header, j) => (
                        <td key={j}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.length > 5 && (
                <div className={styles.moreRows}>
                  + {csvData.length - 5} more rows...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {csvData.length > 0 && (
        <div className={styles.actions}>
          <button
            onClick={generateBatchQRs}
            disabled={generating}
            className={`pixel-btn ${styles.generateBtn}`}
          >
            {generating ? (
              <>
                <span className={styles.spinner}></span>
                Generating... {progress}%
              </>
            ) : (
              <>
                <Download size={18} />
                Generate {csvData.length} QR Codes
              </>
            )}
          </button>

          {generating && (
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className={styles.csvGuide}>
        <div className={styles.guideHeader}>
          <FileText size={18} />
          <h3>CSV Format Guide</h3>
        </div>
        
        <div className={styles.examples}>
          <div className={styles.example}>
            <h4>URL/General</h4>
            <code>type,url,filename<br/>url,https://example.com,ticket-001</code>
          </div>
          
          <div className={styles.example}>
            <h4>Event Tickets</h4>
            <code>type,url,filename<br/>url,https://event.com/t/123,ticket-123</code>
          </div>
          
          <div className={styles.example}>
            <h4>vCard Contacts</h4>
            <code>type,firstName,lastName,phone,email,filename<br/>vcard,John,Doe,+1234567890,john@example.com,contact-john</code>
          </div>

          <div className={styles.example}>
            <h4>WiFi Credentials</h4>
            <code>type,ssid,password,encryption,filename<br/>wifi,MyNetwork,pass123,WPA,wifi-guest</code>
          </div>
        </div>

        <div className={styles.tips}>
          <AlertCircle size={16} />
          <div>
            <strong>Tips:</strong>
            <ul>
              <li>First row must be column headers</li>
              <li>Include a "type" column (url, email, phone, sms, location, vcard, wifi)</li>
              <li>Add "filename" column for custom QR filenames</li>
              <li>All QRs will use the same styling options from the main generator</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
