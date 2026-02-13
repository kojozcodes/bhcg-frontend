import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import CertificateForm from './components/CertificateForm';
import CertificateList from './components/CertificateList';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://bhcg.up.railway.app';

function App() {
  // ========================================
  // AUTHENTICATION STATE
  // ========================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ========================================
  // APP STATE
  // ========================================
  const [certificates, setCertificates] = useState([]);
  const [carData, setCarData] = useState({});
  const [currentCertIndex, setCurrentCertIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, message: '' });

  // ========================================
  // AUTHENTICATION
  // ========================================
  useEffect(() => {
    // No persistent sessions - always require login
    localStorage.removeItem('battery_health_token');
    setIsCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (token) => {
    setAuthToken(token);
    setIsAuthenticated(true);
    loadCarData(token);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setCertificates([]);
    setCarData({});
  };

  // ========================================
  // DATA LOADING
  // ========================================
  const loadCarData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/car-data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCarData(data.data);
      }
    } catch (error) {
      console.error('Error loading car data:', error);
    }
  };

  // ========================================
  // CERTIFICATE MANAGEMENT
  // ========================================
  const generateId = () => {
    return `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addCertificate = () => {
    const newCert = {
      id: generateId(),
      test_date: new Date().toISOString().split('T')[0],
      tested_by: '',
      make: '',
      model: '',
      registration: '',
      first_registered: '',
      vin: '',
      mileage: '',
      battery_capacity: '',
      state_of_health: 90,
      recipient_email: '',
      is_valid: false,
      validation_errors: []
    };
    
    setCertificates([...certificates, newCert]);
    setCurrentCertIndex(certificates.length);
    setActiveTab('form');
  };

  const duplicateCertificate = (certId) => {
    const original = certificates.find(c => c.id === certId);
    if (!original) return;
    
    const duplicate = {
      ...original,
      id: generateId(),
      registration: '',
      vin: '',
      mileage: '',
      recipient_email: '',
      is_valid: false
    };
    
    setCertificates([...certificates, duplicate]);
    setCurrentCertIndex(certificates.length);
    setActiveTab('form');
  };

  const updateCertificate = (certId, updates) => {
    setCertificates(certificates.map(cert => 
      cert.id === certId ? { ...cert, ...updates } : cert
    ));
  };

  const deleteCertificate = (certId) => {
    if (window.confirm('Delete this certificate?')) {
      const newCerts = certificates.filter(c => c.id !== certId);
      setCertificates(newCerts);
      
      if (currentCertIndex >= newCerts.length) {
        setCurrentCertIndex(Math.max(0, newCerts.length - 1));
      }
    }
  };

  const clearAllCertificates = () => {
    if (window.confirm('Clear all certificates? This cannot be undone.')) {
      setCertificates([]);
      setCurrentCertIndex(0);
    }
  };

  const selectCertificate = (index) => {
    setCurrentCertIndex(index);
    setActiveTab('form');
  };

  // ========================================
  // PDF UPLOAD
  // ========================================
  const handlePdfUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    const totalFiles = files.length;
    let successCount = 0;
    let failCount = 0;
    const failedFiles = [];
    const newCertificates = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        setUploadProgress({
          current: i + 1,
          total: totalFiles,
          message: `Processing ${file.name}...`
        });
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          failCount++;
          failedFiles.push({ name: file.name, reason: 'Not a PDF file' });
          continue;
        }
        
        // Validate file size (16MB limit)
        if (file.size > 16 * 1024 * 1024) {
          failCount++;
          failedFiles.push({ name: file.name, reason: 'File too large (>16MB)' });
          continue;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          // Upload and extract
          const response = await fetch(`${API_URL}/api/extract-pdf`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
            body: formData
          });
          
          if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.data) {
              // Process Make field: Try to match to known makes (case-insensitive)
              let extractedMake = result.data.make || '';
              let validMake = '';
              
              if (extractedMake) {
                // Try to find exact match (case-insensitive)
                const makeMatch = Object.keys(carData).find(
                  make => make.toLowerCase() === extractedMake.toLowerCase()
                );
                
                if (makeMatch) {
                  validMake = makeMatch; // Use proper case from CAR_DATA
                } else {
                  validMake = extractedMake; // Keep as-is, even if not in dropdown
                }
              }
              
              // Process Model field: Accept as-is from PDF
              let extractedModel = result.data.model || '';
              
              // Create new certificate with extracted data
              const newCert = {
                id: generateId(),
                test_date: result.data.test_date || new Date().toISOString().split('T')[0],
                tested_by: result.data.tested_by || '',
                make: validMake,
                model: extractedModel,
                registration: result.data.registration || '',
                first_registered: result.data.first_registered || '',
                vin: result.data.vin || '',
                mileage: result.data.mileage || '',
                battery_capacity: result.data.battery_capacity || '',
                state_of_health: result.data.state_of_health || 90,
                recipient_email: '',
                source_pdf: file.name,
                is_valid: false,
                validation_errors: []
              };
              
              newCertificates.push(newCert);
              successCount++;
            } else {
              failCount++;
              failedFiles.push({ name: file.name, reason: 'No data extracted from PDF' });
            }
          } else {
            if (response.status === 401) {
              alert('Session expired. Please login again.');
              handleLogout();
              return;
            }
            
            const errorData = await response.json();
            failCount++;
            failedFiles.push({ 
              name: file.name, 
              reason: errorData.error || 'Upload failed' 
            });
          }
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          failCount++;
          failedFiles.push({ name: file.name, reason: uploadError.message });
        }
        
        // Small delay between uploads
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Add all new certificates at once
      if (newCertificates.length > 0) {
        setCertificates(prev => [...prev, ...newCertificates]);
      }
      
      // Show results
      let message = '';
      
      if (successCount > 0) {
        message += `✅ Successfully processed ${successCount} PDF${successCount > 1 ? 's' : ''}!\n\n`;
        message += `${successCount} certificate${successCount > 1 ? 's' : ''} added to your list.\n`;
        message += `Please review the extracted data and complete any missing fields.`;
      }
      
      if (failCount > 0) {
        message += `\n\n❌ Failed: ${failCount} PDF${failCount > 1 ? 's' : ''}`;
        if (failedFiles.length > 0 && failedFiles.length <= 5) {
          message += '\n\nReasons:';
          failedFiles.forEach(f => {
            message += `\n• ${f.name}: ${f.reason}`;
          });
        } else if (failedFiles.length > 5) {
          message += `\n\nShowing first 5 errors:`;
          failedFiles.slice(0, 5).forEach(f => {
            message += `\n• ${f.name}: ${f.reason}`;
          });
          message += `\n... and ${failedFiles.length - 5} more`;
        }
      }
      
      if (message) {
        alert(message);
      }
      
      // Switch to form view and show the FIRST newly added certificate
      if (successCount > 0) {
        const firstNewCertIndex = certificates.length;
        setCurrentCertIndex(firstNewCertIndex);
        setActiveTab('form');
      }
      
    } catch (error) {
      console.error('PDF upload error:', error);
      alert(`Error uploading PDFs: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0, message: '' });
      // Clear file input
      event.target.value = '';
    }
  };

  // ========================================
  // VALIDATION
  // ========================================
  const validateCertificate = (cert) => {
    const errors = [];
    
    if (!cert.tested_by?.trim()) errors.push('Tested By is required');
    if (!cert.make?.trim()) errors.push('Make is required');
    if (!cert.model?.trim()) errors.push('Model is required');
    if (!cert.registration?.trim()) errors.push('Registration is required');
    if (!cert.battery_capacity?.trim()) errors.push('Battery Capacity is required');
    
    const is_valid = errors.length === 0;
    
    updateCertificate(cert.id, {
      is_valid,
      validation_errors: errors
    });
    
    return is_valid;
  };

  useEffect(() => {
    // Validate all certificates when they change
    certificates.forEach(cert => validateCertificate(cert));
    // eslint-disable-next-line
  }, [certificates.length]);

  // ========================================
  // PDF GENERATION
  // ========================================
  const generateSingleCertificate = async (cert) => {
    try {
      const response = await fetch(`${API_URL}/api/generate-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(cert)
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          handleLogout();
          return false;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert.registration}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert(`Failed to generate certificate: ${error.message}`);
      return false;
    }
  };

  const handleGenerateCurrent = async () => {
    if (certificates.length === 0) {
      alert('No certificates to generate');
      return;
    }

    const currentCert = certificates[currentCertIndex];
    
    if (!validateCertificate(currentCert)) {
      alert('Please fix validation errors before generating:\n\n• ' + 
            currentCert.validation_errors.join('\n• '));
      return;
    }

    setIsGenerating(true);
    setProgress({ current: 1, total: 1, message: 'Generating certificate...' });

    const success = await generateSingleCertificate(currentCert);

    setIsGenerating(false);
    setProgress({ current: 0, total: 0, message: '' });

    if (success) {
      alert('✅ Certificate generated successfully!');
    }
  };

  const handleGenerateAll = async () => {
    const validCerts = certificates.filter(cert => {
      validateCertificate(cert);
      return cert.is_valid;
    });

    if (validCerts.length === 0) {
      alert('No valid certificates to generate. Please fix validation errors.');
      return;
    }

    const invalidCount = certificates.length - validCerts.length;
    
    let message = `Generate ${validCerts.length} certificate(s)?`;
    if (invalidCount > 0) {
      message += `\n\n${invalidCount} certificate(s) will be skipped due to validation errors.`;
    }

    if (!window.confirm(message)) {
      return;
    }

    setIsGenerating(true);
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < validCerts.length; i++) {
      setProgress({
        current: i + 1,
        total: validCerts.length,
        message: `Generating certificate ${i + 1} of ${validCerts.length}...`
      });

      const success = await generateSingleCertificate(validCerts[i]);
      
      if (success) {
        successful++;
      } else {
        failed++;
      }

      // Small delay between requests
      if (i < validCerts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsGenerating(false);
    setProgress({ current: 0, total: 0, message: '' });

    let resultMessage = `✅ Successfully generated ${successful} certificate(s)!`;
    if (failed > 0) {
      resultMessage += `\n\n❌ Failed: ${failed} certificate(s)`;
    }

    alert(resultMessage);
  };

  // ========================================
  // RENDER
  // ========================================
  
  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} apiUrl={API_URL} />;
  }

  // Main app
  const currentCert = certificates[currentCertIndex];
  const validCount = certificates.filter(c => c.is_valid).length;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src="/BHG_logo.png" alt="Battery Health" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <h1>Battery Health</h1>
        </div>
        <button className="logout-button" onClick={handleLogout} title="Logout">
          Logout
        </button>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
          disabled={certificates.length === 0}
        >
          📝 Form {certificates.length > 0 && `(${currentCertIndex + 1}/${certificates.length})`}
        </button>
        <button
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Certificates ({certificates.length})
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {activeTab === 'form' && (
          <div className="form-container">
            {certificates.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔋</div>
                <h2>No Certificates Yet</h2>
                <p>Click "Add Certificate" below to get started</p>
              </div>
            ) : (
              <CertificateForm
                certificate={currentCert}
                carData={carData}
                onUpdate={(updates) => updateCertificate(currentCert.id, updates)}
                onValidate={() => validateCertificate(currentCert)}
              />
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="list-container">
            <CertificateList
              certificates={certificates}
              currentIndex={currentCertIndex}
              onSelect={selectCertificate}
              onDuplicate={duplicateCertificate}
              onDelete={deleteCertificate}
            />
          </div>
        )}
      </div>

      {/* Progress Overlay */}
      {isGenerating && (
        <div className="progress-overlay">
          <div className="progress-card">
            <div className="spinner"></div>
            <h3>Generating Certificates</h3>
            <p>{progress.message}</p>
            {progress.total > 1 && (
              <>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="progress-count">{progress.current} of {progress.total}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="progress-overlay">
          <div className="progress-card">
            <div className="spinner"></div>
            <h3>Processing PDFs</h3>
            <p>{uploadProgress.message}</p>
            {uploadProgress.total > 1 && (
              <>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
                <p className="progress-count">{uploadProgress.current} of {uploadProgress.total}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <footer className="footer">
        <div className="footer-buttons">
          {/* Single PDF Upload Button - accepts single or multiple files */}
          <label 
            className="btn btn-secondary" 
            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            📄 Upload PDF(s)
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handlePdfUpload}
              style={{ display: 'none' }}
              disabled={isGenerating || isUploading}
            />
          </label>

          <button
            className="btn btn-secondary"
            onClick={addCertificate}
            disabled={isGenerating || isUploading}
          >
            ➕ Add Certificate
          </button>
          
          {certificates.length > 0 && (
            <>
              <button
                className="btn btn-secondary"
                onClick={clearAllCertificates}
                disabled={isGenerating || isUploading}
              >
                🗑️ Clear All
              </button>
              
              <button
                className="btn btn-primary"
                onClick={handleGenerateCurrent}
                disabled={isGenerating || isUploading || !currentCert?.is_valid}
              >
                🚀 Generate Current
              </button>
              
              <button
                className="btn btn-success"
                onClick={handleGenerateAll}
                disabled={isGenerating || isUploading || validCount === 0}
              >
                ⚡ Generate All ({validCount})
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;