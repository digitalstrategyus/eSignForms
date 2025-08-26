import React from 'react';

import type { AccessRequest, Signature } from '../pdf-services/types';

interface DocumentViewerProps {
  document: AccessRequest;
  onSignatureClick: (signature: Signature) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onSignatureClick }) => {
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="document-viewer">
      <div className="solicitud-info">
        <h4>Información de la Solicitud</h4>
        <div className="info-grid">
          <div className="info-item">
            <label>Gerente Responsable:</label>
            <div className="person-info">
              <span className="person-name">{document.gerenteResponsable}</span>
              <span className="person-email">{document.emailGerenteResponsable}</span>
            </div>
          </div>
          <div className="info-item">
            <label>Gerente del Usuario:</label>
            <div className="person-info">
              <span className="person-name">{document.gerenteUsuario}</span>
              <span className="person-email">{document.emailGerenteUsuario}</span>
            </div>
          </div>
          <div className="info-item">
            <label>Usuario Solicitante:</label>
            <div className="person-info">
              <span className="person-name">{document.usuarioSolicitante}</span>
              <span className="person-email">{document.emailUsuarioSolicitante}</span>
            </div>
          </div>
          <div className="info-item">
            <label>Fecha de Creación:</label>
            <span>{formatTimestamp(document.fechaCreacion)}</span>
          </div>
        </div>
      </div>

      <div className="document-content">
        <div className="content-text">
          {document.content.split('\n').map((line: string, index: number) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        
        {document.signatures.map((signature: Signature) => (
          <div
            key={signature.id}
            className="signature-overlay"
            style={{
              position: 'absolute',
              left: signature.position.x,
              top: signature.position.y,
              cursor: 'pointer'
            }}
            onClick={() => onSignatureClick(signature)}
            title={`Firma de ${signature.name} - ${formatTimestamp(signature.timestamp)}`}
          >
            <div className="signature-box">
              <div className="signature-role">{signature.role}</div>
              <div className="signature-name">{signature.name}</div>
              <div className="signature-date">
                {formatTimestamp(signature.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="signatures-summary">
        <h4>Firmas del Documento</h4>
        {document.signatures.length === 0 ? (
          <p className="no-signatures">Este documento aún no tiene firmas</p>
        ) : (
          <div className="signatures-list">
            {document.signatures.map((signature: Signature) => (
                              <div key={signature.id} className="signature-item">
                  <div className="signature-info">
                    <div className="signature-role-badge">{signature.role}</div>
                    <strong>{signature.name}</strong>
                    <span className="signature-time">
                      {formatTimestamp(signature.timestamp)}
                    </span>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onSignatureClick(signature)}
                  >
                    Ver Detalles
                  </button>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
