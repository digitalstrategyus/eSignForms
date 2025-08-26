import React, { useState } from 'react';

import type { AccessRequest } from '../pdf-services/types';

interface DocumentUploaderProps {
  onDocumentUpload: (document: AccessRequest) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentUpload }) => {
  const [documentName, setDocumentName] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [gerenteResponsable, setGerenteResponsable] = useState('');
  const [emailGerenteResponsable, setEmailGerenteResponsable] = useState('');
  const [gerenteUsuario, setGerenteUsuario] = useState('');
  const [emailGerenteUsuario, setEmailGerenteUsuario] = useState('');
  const [usuarioSolicitante, setUsuarioSolicitante] = useState('');
  const [emailUsuarioSolicitante, setEmailUsuarioSolicitante] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentName.trim() || !documentContent.trim() || 
        !gerenteResponsable.trim() || !emailGerenteResponsable.trim() ||
        !gerenteUsuario.trim() || !emailGerenteUsuario.trim() ||
        !usuarioSolicitante.trim() || !emailUsuarioSolicitante.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const newDocument: AccessRequest = {
      id: Date.now().toString(),
      name: documentName,
      content: documentContent,
      gerenteResponsable,
      emailGerenteResponsable,
      gerenteUsuario,
      emailGerenteUsuario,
      usuarioSolicitante,
      emailUsuarioSolicitante,
      signatures: [],
      fechaCreacion: new Date()
    };

    onDocumentUpload(newDocument);
    setDocumentName('');
    setDocumentContent('');
    setGerenteResponsable('');
    setEmailGerenteResponsable('');
    setGerenteUsuario('');
    setEmailGerenteUsuario('');
    setUsuarioSolicitante('');
    setEmailUsuarioSolicitante('');
  };

  return (
    <div className="card">
      <h3>Nueva Solicitud de Acceso</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="documentName">Nombre de la Solicitud</label>
          <input
            id="documentName"
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Ej: Solicitud de Acceso al Sistema CRM"
            required
          />
        </div>
        
                      <div className="form-group">
                <label htmlFor="gerenteResponsable">Gerente Responsable *</label>
                <input
                  id="gerenteResponsable"
                  type="text"
                  value={gerenteResponsable}
                  onChange={(e) => setGerenteResponsable(e.target.value)}
                  placeholder="Nombre del gerente responsable del área"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="emailGerenteResponsable">Email del Gerente Responsable *</label>
                <input
                  id="emailGerenteResponsable"
                  type="email"
                  value={emailGerenteResponsable}
                  onChange={(e) => setEmailGerenteResponsable(e.target.value)}
                  placeholder="gerente.responsable@empresa.com"
                  required
                />
              </div>

                      <div className="form-group">
                <label htmlFor="gerenteUsuario">Gerente del Usuario *</label>
                <input
                  id="gerenteUsuario"
                  type="text"
                  value={gerenteUsuario}
                  onChange={(e) => setGerenteUsuario(e.target.value)}
                  placeholder="Nombre del gerente del usuario solicitante"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="emailGerenteUsuario">Email del Gerente del Usuario *</label>
                <input
                  id="emailGerenteUsuario"
                  type="email"
                  value={emailGerenteUsuario}
                  onChange={(e) => setEmailGerenteUsuario(e.target.value)}
                  placeholder="gerente.usuario@empresa.com"
                  required
                />
              </div>

                      <div className="form-group">
                <label htmlFor="usuarioSolicitante">Usuario que Solicita el Acceso *</label>
                <input
                  id="usuarioSolicitante"
                  type="text"
                  value={usuarioSolicitante}
                  onChange={(e) => setUsuarioSolicitante(e.target.value)}
                  placeholder="Nombre del usuario que solicita el acceso"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="emailUsuarioSolicitante">Email del Usuario Solicitante *</label>
                <input
                  id="emailUsuarioSolicitante"
                  type="email"
                  value={emailUsuarioSolicitante}
                  onChange={(e) => setEmailUsuarioSolicitante(e.target.value)}
                  placeholder="usuario.solicitante@empresa.com"
                  required
                />
              </div>
        
        <div className="form-group">
          <label htmlFor="documentContent">Justificación del Acceso</label>
          <textarea
            id="documentContent"
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            placeholder="Describe la justificación para solicitar el acceso al sistema..."
            rows={6}
            required
          />
        </div>
        
        <button type="submit" className="btn">
          Crear Solicitud de Acceso
        </button>
      </form>
    </div>
  );
};

export default DocumentUploader;
