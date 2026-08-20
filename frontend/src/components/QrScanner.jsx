import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, Type } from 'lucide-react';
const QrScanner = ({ onScanSuccess, onScanError }) => {
  const [manualCode, setManualCode] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  useEffect(() => {
    if (!useCamera) return;
    // html5-qrcode scanner setup
    const scanner = new Html5QrcodeScanner('qr-reader-container', {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    }, false);
    scanner.render((decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        onScanSuccess(data.passId || decodedText);
      } catch (e) {
        onScanSuccess(decodedText); // simple string passId h toh fetch krlo direct
      }
      scanner.clear();
      setUseCamera(false);
    }, (error) => {
      if (onScanError) onScanError(error);
    });
    return () => {
      scanner.clear().catch(err => console.log('Scanner clearance error ignored:', err.message));
    };
  }, [useCamera]);
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
      setManualCode('');
    }
  };
  return (
    <div className="scanner-subpanel glass-panel">
      <div className="scanner-action-header">
        <button type="button" onClick={() => setUseCamera(!useCamera)} className={`camera-scan-toggle ${useCamera ? 'camera-on' : ''}`}>
          <Camera size={16} />
          <span>{useCamera ? 'Stop Camera Scan' : 'Start Camera Scan'}</span>
        </button>
      </div>
      {useCamera ? (
        <div id="qr-reader-container" className="reader-box"></div>
      ) : (
        <form onSubmit={handleManualSubmit} className="manual-code-form">
          <div className="input-group">
            <Type size={16} className="input-icon" />
            <input type="text" placeholder="Enter Pass ID manually (e.g., VP-2026-554433)" value={manualCode} onChange={(e) => setManualCode(e.target.value)} required />
          </div>
          <button type="submit" className="scan-submit-button">Submit Pass Code</button>
        </form>
      )}
    </div>
  );
};
export default QrScanner;
