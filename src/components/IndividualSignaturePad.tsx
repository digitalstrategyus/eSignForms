import React, { useState, useRef, useEffect } from 'react';
import type { Signature } from '../pdf-services/types';

interface IndividualSignaturePadProps {
  onSignatureComplete: (signature: Signature) => void;
  onClose: () => void;
  document: any; // eslint-disable-line @typescript-eslint/no-unused-vars
  currentSigner: {
    name: string;
    role: string;
    email: string;
  };
}

export const IndividualSignaturePad: React.FC<IndividualSignaturePadProps> = ({
  onSignatureComplete,
  onClose,
  document: _document, // eslint-disable-line @typescript-eslint/no-unused-vars
  currentSigner
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [signatureSVG, setSignatureSVG] = useState<string>('');
  const [signerName, setSignerName] = useState(currentSigner.name);
  const [signerEmail, setSignerEmail] = useState(currentSigner.email);
  const [isValid, setIsValid] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingPoints = useRef<Array<{x: number, y: number}>>([]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 400;
      canvas.height = 200;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.strokeStyle = '#000';
        context.lineWidth = 2;
        context.lineCap = 'round';
        contextRef.current = context;
      }
    }
  }, []);

  useEffect(() => {
    setIsValid(signatureData.length > 0 && signerName.trim().length > 0 && signerEmail.trim().length > 0);
  }, [signatureData, signerName, signerEmail]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    
    // Limpiar puntos anteriores
    drawingPoints.current = [];
    
    // Canvas
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    
    // Guardar punto inicial
    drawingPoints.current.push({ x: offsetX, y: offsetY });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    
    // Canvas
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
    
    // Guardar punto
    drawingPoints.current.push({ x: offsetX, y: offsetY });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    // Capturar canvas (para compatibilidad)
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL());
    }
    
    // Generar SVG vectorial a partir de los puntos capturados
    if (drawingPoints.current.length > 0) {
      const svgString = generateSVGFromPoints(drawingPoints.current);
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
      setSignatureSVG(svgDataUrl);
    }
  };

  const clearCanvas = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignatureData('');
    }
    
    // Limpiar puntos y SVG
    drawingPoints.current = [];
    setSignatureSVG('');
  };

  const handleSubmit = () => {
    if (!isValid) {
      alert('Por favor completa todos los campos y dibuja tu firma');
      return;
    }

    const newSignature: Signature = {
      id: Date.now().toString(),
      name: signerName.trim(),
      role: currentSigner.role,
      position: { x: 50, y: 50 }, // Posición por defecto
      timestamp: new Date(),
      signatureData: signatureData, // Canvas para compatibilidad
      signatureSVG: signatureSVG,   // SVG vectorial para calidad
      status: 'completed',
      email: signerEmail.trim()
    };

    onSignatureComplete(newSignature);
  };

  const handleCancel = () => {
    if (signatureData || signerName !== currentSigner.name || signerEmail !== currentSigner.email) {
      if (window.confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Función para generar SVG a partir de los puntos capturados
  const generateSVGFromPoints = (points: Array<{x: number, y: number}>): string => {
    if (points.length === 0) return '';
    
    let pathData = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      pathData += ` L ${points[i].x} ${points[i].y}`;
    }
    
    const svg = `
      <svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <path d="${pathData}" 
              stroke="#000" 
              stroke-width="2" 
              fill="none" 
              stroke-linecap="round" 
              stroke-linejoin="round"/>
      </svg>
    `;
    
    return svg.trim();
  };

  return (
    <div className="signature-pad-overlay">
      <div className="signature-pad-modal individual-signature">
        <div className="signature-pad-header">
          <h3>Firma Individual - {currentSigner.role}</h3>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>
        
        <div className="signature-pad-content">
          <div className="signer-info">
            <h4>Firmando como: {currentSigner.role}</h4>
            <p><strong>{currentSigner.name}</strong></p>
            <p className="signer-email">{currentSigner.email}</p>
          </div>

          <div className="signature-form">
            <div className="form-group">
              <label htmlFor="signerName">Nombre del Firmante *</label>
              <input
                id="signerName"
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signerEmail">Email del Firmante *</label>
              <input
                id="signerEmail"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="tu.email@empresa.com"
                required
              />
            </div>
          </div>
          
          <div className="signature-area">
            <label>Dibuja tu Firma *</label>
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="signature-canvas"
              />
            </div>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={clearCanvas}
            >
              Limpiar Firma
            </button>
          </div>
        </div>
        
        <div className="signature-pad-actions">
          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancelar
          </button>
          <button 
            className="btn" 
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Completar Firma
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndividualSignaturePad;
