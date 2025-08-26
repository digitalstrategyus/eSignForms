import React from 'react';
import { usePDFGenerator } from './usePDFGenerator';
import type { AccessRequest } from './types';

interface PDFGeneratorButtonProps {
  accessRequest: AccessRequest;
  className?: string;
  children?: React.ReactNode;
  showStatus?: boolean;
  autoDownload?: boolean;
}

export const PDFGeneratorButton: React.FC<PDFGeneratorButtonProps> = ({
  accessRequest,
  className = '',
  children = 'Generar PDF',
  showStatus = true,
  autoDownload = true
}) => {
  const {
    isGenerating,
    generateAndDownloadPDF,
    hasResult,
    isSuccess,
    errorMessage,
    clearResult
  } = usePDFGenerator();

  const handleGeneratePDF = async () => {
    if (autoDownload) {
      await generateAndDownloadPDF(accessRequest);
    } else {
      // Solo generar sin descargar
      // Implementar lógica según necesites
    }
  };

  const isComplete = accessRequest.signatures.length >= 3;

  if (!isComplete) {
    return (
      <button
        className={`btn btn-secondary ${className}`}
        disabled
        title="La solicitud debe tener todas las firmas para generar el PDF"
      >
        ⏳ Pendiente de Firmas
      </button>
    );
  }

  return (
    <div className="pdf-generator-container">
      <button
        className={`btn ${className} ${isGenerating ? 'btn-secondary' : 'btn-success'}`}
        onClick={handleGeneratePDF}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="spinner"></span>
            Generando PDF...
          </>
        ) : (
          <>
            📄 {children}
          </>
        )}
      </button>

      {showStatus && hasResult && (
        <div className={`pdf-status ${isSuccess ? 'success' : 'error'}`}>
          {isSuccess ? (
            <div className="status-success">
              <div className="success-header">
                <span className="success-icon">✅</span>
                <span className="success-text">PDF generado exitosamente</span>
                <button
                  className="btn btn-sm btn-outline close-btn"
                  onClick={() => clearResult()}
                  title="Cerrar mensaje"
                >
                  ✕
                </button>
              </div>
              
              <div className="download-section">
                <p className="download-description">
                  El PDF del Control de Acceso está listo para descargar
                </p>
                <button
                  className="btn btn-primary download-btn"
                  onClick={() => generateAndDownloadPDF(accessRequest)}
                  title="Descargar PDF del Control de Acceso"
                >
                  📥 Descargar PDF
                </button>
                <span className="download-info">
                  Archivo: Control_Acceso_{accessRequest.name.replace(/\s+/g, '_')}.pdf
                </span>
              </div>
            </div>
          ) : (
            <div className="status-error">
              <div className="error-header">
                <span className="error-icon">❌</span>
                <span className="error-text">Error: {errorMessage}</span>
                <button
                  className="btn btn-sm btn-outline close-btn"
                  onClick={() => clearResult()}
                  title="Cerrar mensaje"
                >
                  ✕
                </button>
              </div>
              
              <div className="retry-section">
                <button
                  className="btn btn-secondary retry-btn"
                  onClick={handleGeneratePDF}
                  title="Reintentar generación del PDF"
                >
                  🔄 Reintentar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFGeneratorButton;
