import React from 'react';
import './CertificateList.css';

const CertificateList = ({ certificates, currentIndex, onSelect, onDuplicate, onDelete }) => {
  
  const getBatteryStatus = (health) => {
    if (health >= 85) return { text: 'Excellent', color: '#52C41A', icon: '🟢' };
    if (health >= 65) return { text: 'Good', color: '#1890FF', icon: '🟡' };
    return { text: 'Bad', color: '#ff4d4f', icon: '🔴' };
  };

  if (certificates.length === 0) {
    return (
      <div className="empty-list">
        <div className="empty-icon">📋</div>
        <h2>No Certificates</h2>
        <p>Click "Add Certificate" below to create your first certificate</p>
      </div>
    );
  }

  return (
    <div className="certificate-list">
      <div className="list-header">
        <h2>Certificates ({certificates.length})</h2>
        <div className="list-stats">
          <span className="stat valid">
            ✓ {certificates.filter(c => c.is_valid).length} Valid
          </span>
          <span className="stat invalid">
            ✗ {certificates.filter(c => !c.is_valid).length} Invalid
          </span>
        </div>
      </div>

      <div className="certificate-cards">
        {certificates.map((cert, index) => {
          const status = getBatteryStatus(cert.state_of_health);
          const isActive = index === currentIndex;

          return (
            <div
              key={cert.id}
              className={`cert-card ${isActive ? 'active' : ''} ${cert.is_valid ? 'valid' : 'invalid'}`}
              onClick={() => onSelect(index)}
            >
              <div className="cert-header">
                <div className="cert-number">#{index + 1}</div>
                <div className="cert-validation">
                  {cert.is_valid ? (
                    <span className="validation-badge valid">✓ Valid</span>
                  ) : (
                    <span className="validation-badge invalid">
                      ✗ {cert.validation_errors?.length || 0} error(s)
                    </span>
                  )}
                </div>
              </div>

              <div className="cert-body">
                <div className="cert-main-info">
                  <h3 className="cert-title">
                    {cert.make && cert.model ? (
                      `${cert.make} ${cert.model}`
                    ) : (
                      <span className="missing">Make/Model not set</span>
                    )}
                  </h3>
                  
                  <div className="cert-registration">
                    {cert.registration ? (
                      <strong>{cert.registration}</strong>
                    ) : (
                      <span className="missing">No registration</span>
                    )}
                  </div>
                </div>

                <div className="cert-details">
                  <div className="cert-detail-item">
                    <span className="detail-label">Battery Health:</span>
                    <span className="detail-value">
                      {status.icon} {cert.state_of_health}% ({status.text})
                    </span>
                  </div>

                  {cert.recipient_email && (
                    <div className="cert-detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value email-value">
                        ✉️ {cert.recipient_email}
                      </span>
                    </div>
                  )}

                  {cert.tested_by && (
                    <div className="cert-detail-item">
                      <span className="detail-label">Tested by:</span>
                      <span className="detail-value">{cert.tested_by}</span>
                    </div>
                  )}
                </div>

                {!cert.is_valid && cert.validation_errors && cert.validation_errors.length > 0 && (
                  <div className="cert-errors">
                    <strong>Missing:</strong>
                    <ul>
                      {cert.validation_errors.slice(0, 3).map((error, i) => (
                        <li key={i}>{error.replace(' is required', '')}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="cert-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="action-btn duplicate"
                  onClick={() => onDuplicate(cert.id)}
                  title="Duplicate certificate"
                >
                  📋 Duplicate
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => onDelete(cert.id)}
                  title="Delete certificate"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CertificateList;