import React, { useEffect } from 'react';
import './CertificateForm.css';

const CertificateForm = ({ certificate, carData, onUpdate, onValidate }) => {
  
  // Auto-validate when certificate changes
  useEffect(() => {
    if (certificate && onValidate) {
      const timer = setTimeout(() => {
        onValidate();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [certificate, onValidate]);

  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  const handleMakeChange = (make) => {
    // Reset model when make changes
    onUpdate({ make, model: '' });
  };

  const getBatteryStatus = (health) => {
    if (health >= 85) return { text: 'Excellent', color: '#52C41A' };
    if (health >= 65) return { text: 'Good', color: '#1890FF' };
    return { text: 'Bad', color: '#ff4d4f' };
  };

  if (!certificate) return null;

  const makes = Object.keys(carData || {}).sort();
  const models = (carData && certificate.make ? carData[certificate.make] : []) || [];
  const status = getBatteryStatus(certificate.state_of_health);

  return (
    <div className="certificate-form">
      {/* PDF Source Indicator */}
      {certificate.source_pdf && (
        <div className="info-card" style={{ 
          borderColor: '#1890FF', 
          backgroundColor: 'rgba(24, 144, 255, 0.05)',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: 0, color: '#1890FF', fontWeight: 600, marginBottom: '0.25rem' }}>
            📄 Data extracted from: {certificate.source_pdf}
          </p>
          <small style={{ color: '#666', fontSize: '0.875rem' }}>
            Please review and complete any missing fields
          </small>
        </div>
      )}

      {/* Validation Status */}
      {certificate.validation_errors && certificate.validation_errors.length > 0 && (
        <div className="validation-alert">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <strong>Validation Errors</strong>
          </div>
          <ul className="error-list">
            {certificate.validation_errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Test Information */}
      <div className="card">
        <h2 className="card-title">Test Information</h2>
        
        <div className="form-group">
          <label>Test Date</label>
          <input
            type="date"
            value={certificate.test_date || ''}
            onChange={(e) => handleChange('test_date', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Tested By *</label>
          <input
            type="text"
            value={certificate.tested_by || ''}
            onChange={(e) => handleChange('tested_by', e.target.value)}
            placeholder="Enter tester name"
          />
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="card">
        <h2 className="card-title">Vehicle Information</h2>
        
        <div className="form-group">
          <label>Make *</label>
          <select
            value={certificate.make || ''}
            onChange={(e) => handleMakeChange(e.target.value)}
          >
            <option value="">Select make...</option>
            {makes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Model *</label>
          <select
            value={certificate.model || ''}
            onChange={(e) => handleChange('model', e.target.value)}
            disabled={!certificate.make}
          >
            <option value="">Select model...</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Registration *</label>
          <input
            type="text"
            value={certificate.registration || ''}
            onChange={(e) => handleChange('registration', e.target.value.toUpperCase())}
            placeholder="e.g. AB12 CDE"
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        <div className="form-group">
          <label>First Registered</label>
          <input
            type="date"
            value={certificate.first_registered || ''}
            onChange={(e) => handleChange('first_registered', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>VIN</label>
          <input
            type="text"
            value={certificate.vin || ''}
            onChange={(e) => handleChange('vin', e.target.value.toUpperCase())}
            placeholder="Enter VIN number"
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        <div className="form-group">
          <label>Mileage</label>
          <input
            type="text"
            value={certificate.mileage || ''}
            onChange={(e) => handleChange('mileage', e.target.value)}
            placeholder="e.g. 25000"
          />
        </div>
      </div>

      {/* Battery Information */}
      <div className="card">
        <h2 className="card-title">Battery Information</h2>
        
        <div className="form-group">
          <label>Battery Capacity (kWh) *</label>
          <input
            type="text"
            value={certificate.battery_capacity || ''}
            onChange={(e) => handleChange('battery_capacity', e.target.value)}
            placeholder="e.g. 64"
          />
        </div>

        <div className="form-group">
          <label>
            State of Health: {certificate.state_of_health}%
            <span 
              className="battery-status-badge" 
              style={{ backgroundColor: status.color }}
            >
              {status.text}
            </span>
          </label>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="100"
              value={certificate.state_of_health || 90}
              onChange={(e) => handleChange('state_of_health', parseInt(e.target.value))}
              className="battery-slider"
              style={{
                background: `linear-gradient(to right, ${status.color} 0%, ${status.color} ${certificate.state_of_health}%, #e0e0e0 ${certificate.state_of_health}%, #e0e0e0 100%)`
              }}
            />
            <div className="slider-labels">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Information */}
      <div className="card">
        <h2 className="card-title">Delivery</h2>
        
        <div className="form-group">
          <label>Recipient Email (Optional)</label>
          <input
            type="email"
            value={certificate.recipient_email || ''}
            onChange={(e) => handleChange('recipient_email', e.target.value)}
            placeholder="customer@example.com"
          />
          <small className="field-hint">
            Leave empty to skip email delivery. PDF will still download.
          </small>
        </div>
      </div>

      {/* Required Fields Note */}
      <div className="info-card">
        <p><strong>* Required fields</strong></p>
        <p>All required fields must be filled to generate the certificate.</p>
      </div>
    </div>
  );
};

export default CertificateForm;