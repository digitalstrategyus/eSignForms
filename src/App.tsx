import React, { useState, useEffect } from 'react';
import DocumentUploader from './components/DocumentUploader';
import DocumentViewer from './components/DocumentViewer';
import SignatureManager from './components/SignatureManager';
import PDFGeneratorButton from './pdf-services/PDFGeneratorButton';
import HistoryManager from './components/HistoryManager';
import { StorageService } from './services/storageService';
import type { AccessRequest, Signature } from './pdf-services/types';
import './styles/design-system.css';
import './App.css';
import './components/components.css';

interface Document extends AccessRequest {
  // Document extiende AccessRequest, por lo que hereda todas las propiedades
  // eslint-disable-line @typescript-eslint/no-empty-interface
}

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showSignatureManager, setShowSignatureManager] = useState(false);

  // Cargar solicitudes guardadas al iniciar la aplicación
  useEffect(() => {
    const savedRequests = StorageService.loadAccessRequests();
    setDocuments(savedRequests);
    
    if (savedRequests.length > 0) {
      console.log(`📥 ${savedRequests.length} solicitudes cargadas desde el almacenamiento local`);
    }
  }, []);

  const handleDocumentUpload = (document: Document) => {
    const updatedDocuments = [...documents, document];
    setDocuments(updatedDocuments);
    setSelectedDocument(document);
    
    // Guardar en localStorage
    StorageService.saveAccessRequests(updatedDocuments);
  };

  const handleSignaturesUpdate = (updatedSignatures: Signature[]) => {
    if (selectedDocument) {
      const updatedDocument = {
        ...selectedDocument,
        signatures: updatedSignatures
      };
      setSelectedDocument(updatedDocument);
      
      const updatedDocuments = documents.map(doc => 
        doc.id === selectedDocument.id ? updatedDocument : doc
      );
      setDocuments(updatedDocuments);
      
      // Guardar cambios en localStorage
      StorageService.saveAccessRequests(updatedDocuments);
    }
  };

  const handleImportSuccess = (importedRequests: AccessRequest[]) => {
    setDocuments(importedRequests);
    if (importedRequests.length > 0) {
      setSelectedDocument(importedRequests[0]);
    } else {
      setSelectedDocument(null);
    }
  };

  return (
    <div className="App">
                  <header className="App-header">
              <div className="header-content">
                <div className="logo-section">
                  <div className="logo-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="48" rx="12" fill="url(#gradient)"/>
                      <path d="M12 16h24M12 24h24M12 32h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#2563eb"/>
                          <stop offset="100%" stopColor="#1d4ed8"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="brand-text">
                    <h1 className="app-title">Digital Government Access Mobility ADO</h1>
                    <p className="app-subtitle">Plataforma de Gestión de Nuevas Solicitudes de Acceso DevSecOps</p>
                  </div>
                </div>
                <div className="header-actions">
                  <div className="status-indicator">
                    <span className="status-dot"></span>
                    <span className="status-text">Sistema Activo</span>
                  </div>
                </div>
              </div>
            </header>
      
      <div className="container">
        <div className="main-content">
                          <div className="sidebar">
                  <DocumentUploader onDocumentUpload={handleDocumentUpload} />
                  
                  <HistoryManager onImportSuccess={handleImportSuccess} />
                  
                  <div className="documents-list">
                    <h3>Solicitudes de Acceso</h3>
                    {documents.length === 0 ? (
                      <div className="no-documents">
                        <p>No hay solicitudes de acceso</p>
                        <p className="hint">Crea una nueva solicitud para comenzar</p>
                      </div>
                    ) : (
                      documents.map(doc => (
                        <div 
                          key={doc.id} 
                          className={`document-item ${selectedDocument?.id === doc.id ? 'active' : ''}`}
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <span className="document-name">{doc.name}</span>
                          <div className="document-meta">
                            <span className="signature-count">
                              {doc.signatures.length}/3 firmas
                            </span>
                            <span className="document-date">
                              {doc.fechaCreacion.toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
          
          <div className="document-area">
            {selectedDocument ? (
              <>
                <div className="document-header">
                  <h2>{selectedDocument.name}</h2>
                  <div className="document-actions">
                                               <button 
                             className="btn"
                             onClick={() => setShowSignatureManager(true)}
                           >
                             ✍️ Gestionar Firmas
                           </button>
                    
                    <PDFGeneratorButton 
                      accessRequest={selectedDocument}
                      className="btn-success"
                      showStatus={true}
                      autoDownload={true}
                    >
                      📄 Generar PDF del Control de Acceso
                    </PDFGeneratorButton>
                  </div>
                </div>
                
                <DocumentViewer 
                  document={selectedDocument}
                  onSignatureClick={(signature) => console.log('Firma clickeada:', signature)}
                />
              </>
            ) : (
              <div className="no-document">
                <p>Selecciona una solicitud de acceso para comenzar</p>
              </div>
            )}
          </div>
        </div>
        
                         {showSignatureManager && selectedDocument && (
                   <SignatureManager 
                     accessRequest={selectedDocument}
                     onSignaturesUpdate={handleSignaturesUpdate}
                     onClose={() => setShowSignatureManager(false)}
                   />
                 )}
      </div>
    </div>
  );
}

export default App;
