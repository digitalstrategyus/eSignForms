import React, { useState } from 'react';
import IndividualSignaturePad from './IndividualSignaturePad';
import type { AccessRequest, Signature } from '../pdf-services/types';

interface SignatureManagerProps {
  accessRequest: AccessRequest;
  onSignaturesUpdate: (signatures: Signature[]) => void;
  onClose: () => void;
}

export const SignatureManager: React.FC<SignatureManagerProps> = ({
  accessRequest,
  onSignaturesUpdate,
  onClose
}) => {
  const [showIndividualPad, setShowIndividualPad] = useState(false);
  const [currentSigner, setCurrentSigner] = useState<{
    name: string;
    role: string;
    email: string;
  } | null>(null);

  // Definir los firmantes requeridos
  const requiredSigners = [
    { 
      name: accessRequest.gerenteResponsable, 
      role: 'Gerente Responsable',
      email: accessRequest.emailGerenteResponsable
    },
    { 
      name: accessRequest.gerenteUsuario, 
      role: 'Gerente del Usuario',
      email: accessRequest.emailGerenteUsuario
    },
    { 
      name: accessRequest.usuarioSolicitante, 
      role: 'Usuario Solicitante',
      email: accessRequest.emailUsuarioSolicitante
    }
  ];

  // Obtener el estado de cada firma
  const getSignatureStatus = (role: string) => {
    const existingSignature = accessRequest.signatures.find(sig => sig.role === role);
    if (existingSignature) {
      return {
        status: existingSignature.status,
        signature: existingSignature
      };
    }
    return { status: 'pending', signature: null };
  };

  const handleStartSignature = (signer: { name: string; role: string; email: string }) => {
    setCurrentSigner(signer);
    setShowIndividualPad(true);
  };

  const handleSignatureComplete = (signature: Signature) => {
    // Verificar si ya existe una firma para este rol
    const existingSignatures = accessRequest.signatures.filter(sig => sig.role !== signature.role);
    const updatedSignatures = [...existingSignatures, signature];
    
    onSignaturesUpdate(updatedSignatures);
    setShowIndividualPad(false);
    setCurrentSigner(null);
  };

  const handleSignatureCancel = () => {
    setShowIndividualPad(false);
    setCurrentSigner(null);
  };

  const handleEditSignature = (signature: Signature) => {
    const signer = requiredSigners.find(s => s.role === signature.role);
    if (signer) {
      setCurrentSigner({
        name: signature.name,
        role: signature.role,
        email: signature.email || signer.email
      });
      setShowIndividualPad(true);
    }
  };

  const handleDeleteSignature = (signatureId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta firma?')) {
      const updatedSignatures = accessRequest.signatures.filter(sig => sig.id !== signatureId);
      onSignaturesUpdate(updatedSignatures);
    }
  };

  const getProgressPercentage = () => {
    const completedSignatures = accessRequest.signatures.filter(sig => sig.status === 'completed').length;
    return Math.round((completedSignatures / requiredSigners.length) * 100);
  };

  return (
    <div className="signature-manager-overlay">
      <div className="signature-manager-modal">
        <div className="signature-manager-header">
          <h3>Gestión de Firmas - {accessRequest.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="signature-manager-content">
          {/* Barra de progreso */}
          <div className="progress-bar">
            <div className="progress-info">
              <span>Progreso de Firmas</span>
              <span className="progress-percentage">{getProgressPercentage()}%</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Lista de firmantes */}
          <div className="signers-list">
            {requiredSigners.map((signer, index) => {
              const signatureStatus = getSignatureStatus(signer.role);
              const isCompleted = signatureStatus.status === 'completed';
              const isPending = signatureStatus.status === 'pending';

              return (
                <div 
                  key={index} 
                  className={`signer-item ${isCompleted ? 'completed' : isPending ? 'pending' : ''}`}
                >
                  <div className="signer-info">
                    <div className="signer-header">
                      <span className="signer-number">{index + 1}</span>
                      <div className="signer-details">
                        <h4>{signer.role}</h4>
                        <p className="signer-name">{signer.name}</p>
                        <p className="signer-email">{signer.email}</p>
                      </div>
                    </div>
                    
                    <div className="signature-status">
                      {isCompleted ? (
                        <div className="status-completed">
                          <span className="status-icon">✅</span>
                          <span className="status-text">Firmado</span>
                          <span className="signature-date">
                            {signatureStatus.signature?.timestamp.toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      ) : (
                        <div className="status-pending">
                          <span className="status-icon">⏳</span>
                          <span className="status-text">Pendiente</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="signer-actions">
                    {isCompleted ? (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditSignature(signatureStatus.signature!)}
                          title="Editar firma"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteSignature(signatureStatus.signature!.id)}
                          title="Eliminar firma"
                        >
                          🗑️ Eliminar
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStartSignature(signer)}
                        title="Agregar firma"
                      >
                        ✍️ Agregar Firma
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Información adicional */}
          <div className="signature-info">
            <p className="info-text">
              <strong>💡 Información:</strong> Cada usuario puede firmar por separado. 
              Las firmas se guardan automáticamente y puedes editarlas o eliminarlas según sea necesario.
            </p>
          </div>
        </div>

        <div className="signature-manager-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de firma individual */}
      {showIndividualPad && currentSigner && (
        <IndividualSignaturePad
          onSignatureComplete={handleSignatureComplete}
          onClose={handleSignatureCancel}
          document={accessRequest}
          currentSigner={currentSigner}
        />
      )}
    </div>
  );
};

export default SignatureManager;
