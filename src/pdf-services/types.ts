export interface Signature {
  id: string;
  name: string;
  role: string;
  position: { x: number; y: number };
  timestamp: Date;
  signatureData: string;        // Canvas para compatibilidad
  signatureSVG?: string;        // SVG vectorial para calidad
  status: 'pending' | 'completed' | 'cancelled';
  email?: string; // Email del firmante para identificación
}

export interface AccessRequest {
  id: string;
  name: string;
  content: string;
  gerenteResponsable: string;
  emailGerenteResponsable: string;
  gerenteUsuario: string;
  emailGerenteUsuario: string;
  usuarioSolicitante: string;
  emailUsuarioSolicitante: string;
  signatures: Signature[];
  fechaCreacion: Date;
  puestoUsuario?: string;
  departamento?: string;
  region?: string;
}

export interface PDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  errorMessage?: string;
  generatedAt?: Date;
}
