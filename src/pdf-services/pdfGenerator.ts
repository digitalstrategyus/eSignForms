import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { AccessRequest, PDFGenerationResult } from './types';

export class PDFGeneratorService {
  private static instance: PDFGeneratorService;
  
  private constructor() {} // eslint-disable-line @typescript-eslint/no-empty-function
  
  public static getInstance(): PDFGeneratorService {
    if (!PDFGeneratorService.instance) {
      PDFGeneratorService.instance = new PDFGeneratorService();
    }
    return PDFGeneratorService.instance;
  }

  /**
   * Genera el PDF del formato Control de Acceso (FR-GRU-INF-SOL-001)
   */
  public async generateAccessControlPDF(accessRequest: AccessRequest): Promise<PDFGenerationResult> {
    try {
      // Debug: Verificar las firmas
      console.log('Generando PDF para solicitud:', accessRequest.id);
      console.log('Firmas encontradas:', accessRequest.signatures);
      console.log('Firmas completadas:', accessRequest.signatures.filter(sig => sig.status === 'completed'));
      
      // Verificar contenido de cada firma
      accessRequest.signatures.forEach((signature, index) => {
        console.log(`Firma ${index + 1} - ${signature.role}:`);
        console.log('  - Nombre:', signature.name);
        console.log('  - Email:', signature.email);
        console.log('  - Estado:', signature.status);
        console.log('  - Timestamp:', signature.timestamp);
        console.log('  - Tiene signatureData:', !!signature.signatureData);
        if (signature.signatureData) {
          console.log('  - Tipo de signatureData:', signature.signatureData.substring(0, 30) + '...');
        }
        console.log('---');
      });
      
      // Verificar que la solicitud esté completa
      if (!this.isRequestComplete(accessRequest)) {
        return {
          success: false,
          errorMessage: 'La solicitud no tiene todas las firmas requeridas'
        };
      }
      
      // Crear un PDF simple de prueba primero
      console.log('Creando PDF de prueba con firmas...');
      const testResult = await this.createTestPDFWithSignatures(accessRequest);
      if (testResult.success) {
        console.log('PDF de prueba creado exitosamente');
        return testResult;
      } else {
        console.log('Fallback a PDF normal:', testResult.errorMessage);
      }
      
      // También crear el PDF principal con firmas síncronas
      console.log('Creando PDF principal con firmas síncronas...');
      const mainResult = await this.createMainPDFWithSignatures(accessRequest);
      if (mainResult.success) {
        console.log('PDF principal creado exitosamente');
        return mainResult;
      } else {
        console.log('Fallback a PDF normal:', mainResult.errorMessage);
      }

      // Crear el PDF estándar como fallback
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configurar estilos
      pdf.setFont('helvetica');
      
      // ===== ENCABEZADO DEL FORMATO =====
      // Título principal
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('FORMATO CONTROL DE ACCESO', pageWidth / 2, 30, { align: 'center' });
      
      // Código del documento
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text('FR-GRU-INF-SOL-001', pageWidth / 2, 40, { align: 'center' });
      
      // Línea separadora
      pdf.setDrawColor(0, 123, 255);
      pdf.setLineWidth(2);
      pdf.line(20, 50, pageWidth - 20, 50);
      
      // ===== DATOS DEL USUARIO SOLICITANTE =====
      let yPosition = 70;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('DATOS DEL USUARIO SOLICITANTE', 25, yPosition);
      yPosition += 20;
      
      this.addFieldEnhanced(pdf, 'Usuario Solicitante:', accessRequest.usuarioSolicitante, 25, yPosition);
      yPosition += 15;
      this.addFieldEnhanced(pdf, 'Email Usuario:', accessRequest.emailUsuarioSolicitante, 25, yPosition);
      yPosition += 20;
      
      // ===== DATOS DEL GERENTE DEL USUARIO =====
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DEL GERENTE DEL USUARIO', 25, yPosition);
      yPosition += 20;
      
      this.addFieldEnhanced(pdf, 'Gerente del Usuario:', accessRequest.gerenteUsuario, 25, yPosition);
      yPosition += 15;
      this.addFieldEnhanced(pdf, 'Email Gerente Usuario:', accessRequest.emailGerenteUsuario, 25, yPosition);
      yPosition += 20;
      
      // ===== DATOS DEL GERENTE RESPONSABLE =====
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DEL GERENTE RESPONSABLE', 25, yPosition);
      yPosition += 20;
      
      this.addFieldEnhanced(pdf, 'Gerente Responsable:', accessRequest.gerenteResponsable, 25, yPosition);
      yPosition += 15;
      this.addFieldEnhanced(pdf, 'Email Gerente Responsable:', accessRequest.emailGerenteResponsable, 25, yPosition);
      yPosition += 20;
      
      // ===== DATOS DE LA SOLICITUD =====
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DE LA SOLICITUD', 25, yPosition);
      yPosition += 20;
      
      const fechaSolicitud = accessRequest.fechaCreacion.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      this.addFieldEnhanced(pdf, 'Fecha de Solicitud:', fechaSolicitud, 25, yPosition);
      yPosition += 20;
      
      // ===== ESTADO DE FIRMAS =====
      pdf.setFont('helvetica', 'bold');
      pdf.text('ESTADO DE FIRMAS', 25, yPosition);
      yPosition += 20;
      
      const stats = this.getSignatureStats(accessRequest);
      const estadoFirmas = `Firmas Completadas: ${stats.completed}/${stats.total} (${stats.percentage}%)`;
      this.addFieldEnhanced(pdf, 'Estado:', estadoFirmas, 25, yPosition);
      yPosition += 25;
      
      // Campos adicionales si existen
      if (accessRequest.puestoUsuario || accessRequest.departamento || accessRequest.region) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('INFORMACIÓN ADICIONAL', 25, yPosition);
        yPosition += 20;
        
        if (accessRequest.puestoUsuario) {
          this.addFieldEnhanced(pdf, 'Puesto:', accessRequest.puestoUsuario, 25, yPosition);
          yPosition += 15;
        }
        
        if (accessRequest.departamento) {
          this.addFieldEnhanced(pdf, 'Departamento:', accessRequest.departamento, 25, yPosition);
          yPosition += 15;
        }
        
        if (accessRequest.region) {
          this.addFieldEnhanced(pdf, 'Región:', accessRequest.region, 25, yPosition);
          yPosition += 15;
        }
      }
      
      yPosition += 10;
      
      // ===== JUSTIFICACIÓN DEL ACCESO =====
      pdf.setFont('helvetica', 'bold');
      pdf.text('JUSTIFICACIÓN DEL ACCESO:', 25, yPosition);
      yPosition += 20;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      
      // Texto multilínea para justificación
      const maxWidth = pageWidth - 50;
      const justificacionLines = this.splitTextIntoLines(accessRequest.content, maxWidth);
      
      justificacionLines.forEach(line => {
        if (yPosition < pageHeight - 80) { // Verificar que quepa en la página
          pdf.text(line, 25, yPosition);
          yPosition += 6;
        }
      });
      
      // ===== FIRMAS DIGITALES =====
      yPosition = Math.max(yPosition + 20, pageHeight - 80);
      this.addSignatures(pdf, accessRequest, yPosition);
      
      // Generar el PDF como Blob
      const pdfBlob = pdf.output('blob');
      
      return {
        success: true,
        pdfBlob,
        generatedAt: new Date()
      };
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      return {
        success: false,
        errorMessage: `Error generando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Verifica si una solicitud tiene todas las firmas requeridas
   */
  private isRequestComplete(accessRequest: AccessRequest): boolean {
    const requiredRoles = new Set(['Gerente Responsable', 'Gerente del Usuario', 'Usuario Solicitante']);
    const completedSignatures = accessRequest.signatures.filter(sig => sig.status === 'completed');
    const signedRoles = new Set(completedSignatures.map(sig => sig.role));
    
    return requiredRoles.size === signedRoles.size && 
           Array.from(requiredRoles).every(role => signedRoles.has(role));
  }
  
  /**
   * Obtiene estadísticas de las firmas
   */
  private getSignatureStats(accessRequest: AccessRequest): {
    total: number;
    completed: number;
    pending: number;
    percentage: number;
  } {
    const total = 3; // Firmas requeridas
    const completed = accessRequest.signatures.filter(sig => sig.status === 'completed').length;
    const pending = total - completed;
    const percentage = Math.round((completed / total) * 100);
    
    return { total, completed, pending, percentage };
  }

  /**
   * Agrega un campo con etiqueta y valor
   */
  private addField(pdf: jsPDF, label: string, value: string, x: number, y: number): void {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, x, y);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, x + 60, y);
  }

  /**
   * Agrega un campo mejorado con etiqueta y valor (versión profesional)
   */
  private addFieldEnhanced(pdf: jsPDF, label: string, value: string, x: number, y: number): void {
    // Etiqueta en negrita
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(label, x, y);
    
    // Valor en texto normal
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50, 50, 50);
    pdf.text(value, x + 80, y);
    
    // Línea separadora sutil
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(x + 75, y + 2, x + 170, y + 2);
  }

  /**
   * Divide texto en líneas para ajustarse al ancho
   */
  private splitTextIntoLines(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    // Aproximación simple del ancho del texto (6px por carácter)
    const charWidth = 6;
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = testLine.length * charWidth;
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  /**
   * Agrega las firmas digitales al PDF
   */
  private addSignatures(pdf: jsPDF, accessRequest: AccessRequest, yPosition: number): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // ===== TÍTULO DE FIRMAS =====
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('FIRMAS DIGITALES AUTORIZADAS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 25;
    
    // Línea separadora
    pdf.setDrawColor(0, 123, 255);
    pdf.setLineWidth(1);
    pdf.line(30, yPosition, pageWidth - 30, yPosition);
    yPosition += 20;
    
    // Verificar que hay firmas
    if (!accessRequest.signatures || accessRequest.signatures.length === 0) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text('No hay firmas registradas', pageWidth / 2, yPosition, { align: 'center' });
      return;
    }
    
    // Configurar posiciones de las firmas
    const signaturePositions = [
      { x: 50, role: 'Usuario Solicitante', y: yPosition },
      { x: pageWidth / 2, role: 'Gerente del Usuario', y: yPosition },
      { x: pageWidth - 50, role: 'Gerente Responsable', y: yPosition }
    ];
    
    // Agregar cada firma
    signaturePositions.forEach((pos) => {
      const signature = accessRequest.signatures.find(sig => sig.role === pos.role);
      
      if (signature && signature.status === 'completed') {
        // Dibujar área de firma
        pdf.setDrawColor(0, 123, 255); // Azul
        pdf.setLineWidth(1);
        pdf.rect(pos.x - 40, pos.y, 80, 60);
        
        // Agregar imagen de la firma si existe
        if (signature.signatureData && signature.signatureData.startsWith('data:image')) {
          console.log(`Procesando firma para ${signature.role}:`, signature.signatureData.substring(0, 100) + '...');
          
          // Usar el método simplificado para agregar la firma
          this.addSignatureToPDF(pdf, signature, pos.x - 35, pos.y + 5, 70, 30);
          
        } else {
          console.log(`No hay imagen de firma válida para ${signature.role}, usando placeholder`);
          // Placeholder si no hay imagen
          this.drawSignaturePlaceholder(pdf, pos.x - 35, pos.y + 5, 70, 30);
        }
        
        // Información del firmante
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.text(signature.name, pos.x, pos.y + 70, { align: 'center' });
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(signature.role, pos.x, pos.y + 75, { align: 'center' });
        
        // Fecha de firma
        const fechaFirma = signature.timestamp.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        pdf.text(fechaFirma, pos.x, pos.y + 80, { align: 'center' });
        
        // Email del firmante si existe
        if (signature.email) {
          pdf.setFontSize(7);
          pdf.text(signature.email, pos.x, pos.y + 85, { align: 'center' });
        }
        
        // Indicador de estado
        pdf.setFillColor(34, 197, 94); // Verde
        pdf.circle(pos.x + 30, pos.y - 5, 3, 'F');
        
      } else {
        // Área de firma pendiente
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.setLineDashPattern([3, 3], 0);
        pdf.rect(pos.x - 40, pos.y, 80, 60);
        pdf.setLineDashPattern([], 0);
        
        // Texto de pendiente
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Pendiente de Firma', pos.x, pos.y + 30, { align: 'center' });
        pdf.text(pos.role, pos.x, pos.y + 40, { align: 'center' });
        
        // Indicador de estado pendiente
        pdf.setFillColor(245, 158, 11); // Amarillo
        pdf.circle(pos.x + 30, pos.y - 5, 3, 'F');
      }
    });
    
    // Agregar leyenda de estados
    yPosition += 100;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('LEYENDA DE ESTADOS:', 25, yPosition);
    yPosition += 15;
    
    // Estado completado
    pdf.setFillColor(34, 197, 94);
    pdf.circle(30, yPosition, 3, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('Firma Completada', 40, yPosition + 2);
    
    // Estado pendiente
    yPosition += 15;
    pdf.setFillColor(245, 158, 11);
    pdf.circle(30, yPosition, 3, 'F');
    pdf.text('Firma Pendiente', 40, yPosition + 2);
  }

  /**
   * Agrega imagen de firma al PDF (método síncrono)
   */
  private addSignatureImageSync(pdf: jsPDF, signatureData: string, x: number, y: number, width: number, height: number): void {
    try {
      if (signatureData && signatureData.startsWith('data:image')) {
        console.log('Procesando firma digital:', signatureData.substring(0, 50) + '...');
        
        // Crear canvas temporal para procesar la imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('No se pudo crear contexto de canvas');
        }
        
        // Configurar canvas
        canvas.width = width;
        canvas.height = height;
        
        // Crear imagen
        const img = new Image();
        
        // Procesar imagen de forma síncrona
        img.onload = () => {
          try {
            console.log('Imagen cargada, procesando...');
            
            // Fondo blanco
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            
            // Dibujar imagen
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir a base64
            const processedImage = canvas.toDataURL('image/png');
            console.log('Imagen procesada, agregando al PDF...');
            
            // Agregar imagen al PDF
            pdf.addImage(processedImage, 'PNG', x, y, width, height);
            console.log('Firma agregada exitosamente al PDF');
            
          } catch (error) {
            console.warn('Error procesando imagen:', error);
            this.drawSignaturePlaceholder(pdf, x, y, width, height);
          }
        };
        
        img.onerror = () => {
          console.warn('Error cargando imagen de firma');
          this.drawSignaturePlaceholder(pdf, x, y, width, height);
        };
        
        // Cargar imagen
        img.src = signatureData;
        
      } else {
        console.log('No hay imagen de firma válida, usando placeholder');
        // Si no hay imagen válida, dibujar placeholder
        this.drawSignaturePlaceholder(pdf, x, y, width, height);
      }
    } catch (error) {
      console.warn('No se pudo agregar imagen de firma:', error);
      // Fallback a placeholder
      this.drawSignaturePlaceholder(pdf, x, y, width, height);
    }
  }
  
  /**
   * Agrega imagen de firma al PDF (método asíncrono - mantenido para compatibilidad)
   */
  private addSignatureImage(pdf: jsPDF, signatureData: string, x: number, y: number, width: number, height: number): void {
    this.addSignatureImageSync(pdf, signatureData, x, y, width, height);
  }
  
  /**
   * Procesa y agrega una firma al PDF de forma síncrona
   */
  private addSignatureToPDF(pdf: jsPDF, signature: any, x: number, y: number, width: number, height: number): void {
    try {
      if (signature.signatureData && signature.signatureData.startsWith('data:image')) {
        console.log(`Procesando firma para ${signature.role}:`, signature.signatureData.substring(0, 100) + '...');
        
        // Crear canvas temporal
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('No se pudo crear contexto de canvas');
        }
        
        // Configurar canvas
        canvas.width = width;
        canvas.height = height;
        
        // Crear imagen
        const img = new Image();
        
        // Procesar imagen de forma síncrona
        img.onload = () => {
          try {
            console.log(`Imagen cargada para ${signature.role}, procesando...`);
            
            // Fondo blanco
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            
            // Dibujar imagen
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir a base64
            const processedImage = canvas.toDataURL('image/png');
            console.log(`Imagen procesada para ${signature.role}, agregando al PDF...`);
            
            // Agregar imagen al PDF
            pdf.addImage(processedImage, 'PNG', x, y, width, height);
            console.log(`Firma para ${signature.role} agregada exitosamente al PDF`);
            
          } catch (error) {
            console.warn(`Error procesando imagen para ${signature.role}:`, error);
            this.drawSignaturePlaceholder(pdf, x, y, width, height);
          }
        };
        
        img.onerror = () => {
          console.warn(`Error cargando imagen para ${signature.role}`);
          this.drawSignaturePlaceholder(pdf, x, y, width, height);
        };
        
        // Cargar imagen
        img.src = signature.signatureData;
        
      } else {
        console.log(`No hay imagen de firma válida para ${signature.role}:`, signature.role);
        this.drawSignaturePlaceholder(pdf, x, y, width, height);
      }
    } catch (error) {
      console.warn(`Error procesando firma para ${signature.role}:`, error);
      this.drawSignaturePlaceholder(pdf, x, y, width, height);
    }
  }
  
  /**
   * Crea un PDF de prueba simple con las firmas
   */
  private async createTestPDFWithSignatures(accessRequest: AccessRequest): Promise<PDFGenerationResult> {
    try {
      console.log('Creando PDF de prueba...');
      
      // Crear PDF simple
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Título
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRUEBA DE FIRMAS DIGITALES', pageWidth / 2, 30, { align: 'center' });
      
      // Información básica
      pdf.setFontSize(12);
      pdf.text(`Solicitud: ${accessRequest.id}`, 25, 50);
      pdf.text(`Usuario: ${accessRequest.usuarioSolicitante}`, 25, 60);
      
      // Sección de firmas
      let yPosition = 80;
      pdf.setFontSize(14);
      pdf.text('FIRMAS DIGITALES:', 25, yPosition);
      yPosition += 20;
      
      // Procesar cada firma
      const completedSignatures = accessRequest.signatures.filter(sig => sig.status === 'completed');
      console.log(`Procesando ${completedSignatures.length} firmas completadas...`);
      
      for (let i = 0; i < completedSignatures.length; i++) {
        const signature = completedSignatures[i];
        console.log(`Procesando firma ${i + 1}: ${signature.role}`);
        
        // Información de la firma
        pdf.setFontSize(10);
        pdf.text(`${signature.role}: ${signature.name}`, 25, yPosition);
        yPosition += 10;
        
        // Área de firma
        pdf.setDrawColor(0, 123, 255);
        pdf.setLineWidth(1);
        pdf.rect(25, yPosition, 80, 40);
        
        // Agregar imagen de la firma
        if (signature.signatureData && signature.signatureData.startsWith('data:image')) {
          try {
            console.log(`Intentando agregar firma para ${signature.role}...`);
            
            // Crear canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              canvas.width = 80;
              canvas.height = 40;
              
              // Crear imagen
              const img = new Image();
              
              // Procesar imagen de forma síncrona usando una promesa
              const processImage = () => {
                return new Promise<void>((resolve, reject) => {
                  img.onload = () => {
                    try {
                      console.log(`Imagen cargada para ${signature.role}`);
                      
                      // Fondo blanco
                      ctx.fillStyle = 'white';
                      ctx.fillRect(0, 0, 80, 40);
                      
                      // Dibujar imagen
                      ctx.drawImage(img, 0, 0, 80, 40);
                      
                      // Convertir a base64
                      const processedImage = canvas.toDataURL('image/png');
                      console.log(`Imagen procesada para ${signature.role}, agregando al PDF...`);
                      
                      // Agregar imagen al PDF
                      pdf.addImage(processedImage, 'PNG', 25, yPosition, 80, 40);
                      console.log(`Firma para ${signature.role} agregada exitosamente al PDF`);
                      
                      resolve();
                    } catch (error) {
                      console.warn(`Error procesando imagen para ${signature.role}:`, error);
                      reject(error);
                    }
                  };
                  
                  img.onerror = () => {
                    console.warn(`Error cargando imagen para ${signature.role}`);
                    reject(new Error('Error cargando imagen'));
                  };
                  
                  // Cargar imagen
                  img.src = signature.signatureData;
                });
              };
              
              // Esperar a que se procese la imagen antes de continuar
              await processImage();
              
            } else {
              console.warn(`No se pudo crear contexto de canvas para ${signature.role}`);
              // Dibujar placeholder
              pdf.setFillColor(240, 248, 255);
              pdf.rect(25, yPosition, 80, 40, 'F');
              pdf.setFontSize(8);
              pdf.setTextColor(100, 100, 100);
              pdf.text('Sin Canvas', 65, yPosition + 20, { align: 'center' });
            }
            
          } catch (error) {
            console.warn(`Error procesando firma para ${signature.role}:`, error);
            // Dibujar placeholder
            pdf.setFillColor(240, 248, 255);
            pdf.rect(25, yPosition, 80, 40, 'F');
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text('Error', 65, yPosition + 20, { align: 'center' });
          }
        } else {
          console.log(`No hay signatureData para ${signature.role}`);
          // Dibujar placeholder
          pdf.setFillColor(240, 248, 255);
          pdf.rect(25, yPosition, 80, 40, 'F');
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Sin Firma', 65, yPosition + 20, { align: 'center' });
        }
        
        yPosition += 60;
      }
      
      // Generar PDF
      const pdfBlob = pdf.output('blob');
      console.log('PDF de prueba generado exitosamente');
      
      return {
        success: true,
        pdfBlob,
        generatedAt: new Date()
      };
      
    } catch (error) {
      console.error('Error creando PDF de prueba:', error);
      return {
        success: false,
        errorMessage: `Error creando PDF de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }
  
  /**
   * Procesa la imagen de firma para el PDF de forma síncrona
   */
  private processSignatureImageSync(signatureData: string, width: number, height: number): string | null {
    try {
      // Crear canvas temporal
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.warn('No se pudo crear contexto de canvas');
        return null;
      }
      
      // Configurar canvas
      canvas.width = width;
      canvas.height = height;
      
      // Crear imagen
      const img = new Image();
      
      // Procesar imagen de forma síncrona
      let processedImage: string | null = null;
      let processingError: Error | null = null;
      
      img.onload = () => {
        try {
          // Fondo blanco
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          
          // Dibujar imagen
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a base64
          processedImage = canvas.toDataURL('image/png');
        } catch (error) {
          processingError = error instanceof Error ? error : new Error('Error desconocido');
        }
      };
      
      img.onerror = () => {
        processingError = new Error('Error cargando imagen');
      };
      
      // Cargar imagen
      img.src = signatureData;
      
      // Esperar un poco para que se procese (no es ideal, pero es necesario para el contexto del PDF)
      // En un entorno real, esto debería ser asíncrono
      if (processingError) {
        throw processingError;
      }
      
      return processedImage;
      
    } catch (error) {
      console.warn('Error procesando imagen de firma:', error);
      return null;
    }
  }
  
  /**
   * Crea el PDF principal con firmas síncronas
   */
  private async createMainPDFWithSignatures(accessRequest: AccessRequest): Promise<PDFGenerationResult> {
    try {
      console.log('Creando PDF principal con firmas síncronas...');
      
      // Crear PDF principal
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configurar estilos
      pdf.setFont('helvetica');
      
      // Título principal
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FORMATO CONTROL DE ACCESO', pageWidth / 2, 30, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text('FR-GRU-INF-SOL-001', pageWidth / 2, 40, { align: 'center' });
      
      // Línea separadora
      pdf.setDrawColor(0, 0, 0);
      pdf.line(20, 50, pageWidth - 20, 50);
      
      // Información de la solicitud
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      
      let yPosition = 70;
      
      // Datos principales
      this.addField(pdf, 'Usuario Solicitante:', accessRequest.usuarioSolicitante, 25, yPosition);
      yPosition += 15;
      this.addField(pdf, 'Email Usuario:', accessRequest.emailUsuarioSolicitante, 25, yPosition);
      yPosition += 15;
      
      this.addField(pdf, 'Gerente del Usuario:', accessRequest.gerenteUsuario, 25, yPosition);
      yPosition += 15;
      this.addField(pdf, 'Email Gerente Usuario:', accessRequest.emailGerenteUsuario, 25, yPosition);
      yPosition += 15;
      
      this.addField(pdf, 'Gerente Responsable:', accessRequest.gerenteResponsable, 25, yPosition);
      yPosition += 15;
      this.addField(pdf, 'Email Gerente Responsable:', accessRequest.emailGerenteResponsable, 25, yPosition);
      yPosition += 15;
      
      // Campos adicionales si existen
      if (accessRequest.puestoUsuario) {
        this.addField(pdf, 'Puesto:', accessRequest.puestoUsuario, 25, yPosition);
        yPosition += 15;
      }
      
      if (accessRequest.departamento) {
        this.addField(pdf, 'Departamento:', accessRequest.departamento, 25, yPosition);
        yPosition += 15;
      }
      
      if (accessRequest.region) {
        this.addField(pdf, 'Región:', accessRequest.region, 25, yPosition);
        yPosition += 15;
      }
      
      // Fecha de solicitud
      this.addField(pdf, 'Fecha de Solicitud:', 
        accessRequest.fechaCreacion.toLocaleDateString('es-ES'), 25, yPosition);
      yPosition += 20;
      
      // Estado de firmas
      const signatureStats = this.getSignatureStats(accessRequest);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Estado de Firmas:', 25, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Firmas Completadas: ${signatureStats.completed}/${signatureStats.total} (${signatureStats.percentage}%)`, 25, yPosition);
      yPosition += 8;
      
      if (signatureStats.pending > 0) {
        pdf.setTextColor(245, 158, 11); // Amarillo para pendientes
        pdf.text(`Firmas Pendientes: ${signatureStats.pending}`, 25, yPosition);
        yPosition += 8;
        pdf.setTextColor(0, 0, 0); // Reset color
      }
      
      yPosition += 10;
      
      // Justificación
      pdf.setFont('helvetica', 'bold');
      pdf.text('Justificación del Acceso:', 25, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      // Texto multilínea para justificación
      const maxWidth = pageWidth - 50;
      const justificacionLines = this.splitTextIntoLines(accessRequest.content, maxWidth);
      
      justificacionLines.forEach(line => {
        if (yPosition < pageHeight - 120) { // Verificar que quepa en la página
          pdf.text(line, 25, yPosition);
          yPosition += 6;
        }
      });
      
      // Agregar firmas de forma síncrona
      yPosition = Math.max(yPosition + 20, pageHeight - 120);
      await this.addSignaturesSync(pdf, accessRequest, yPosition);
      
      // Generar el PDF como Blob
      const pdfBlob = pdf.output('blob');
      console.log('PDF principal generado exitosamente');
      
      return {
        success: true,
        pdfBlob,
        generatedAt: new Date()
      };
      
    } catch (error) {
      console.error('Error generando PDF principal:', error);
      return {
        success: false,
        errorMessage: `Error generando PDF principal: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }
  
  /**
   * Agrega las firmas digitales al PDF de forma síncrona
   */
  private async addSignaturesSync(pdf: jsPDF, accessRequest: AccessRequest, yPosition: number): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Título de firmas
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FIRMAS DIGITALES AUTORIZADAS:', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Verificar que hay firmas
    if (!accessRequest.signatures || accessRequest.signatures.length === 0) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text('No hay firmas registradas', pageWidth / 2, yPosition, { align: 'center' });
      return;
    }
    
    // Configurar posiciones de las firmas
    const signaturePositions = [
      { x: 50, role: 'Usuario Solicitante', y: yPosition },
      { x: pageWidth / 2, role: 'Gerente del Usuario', y: yPosition },
      { x: pageWidth - 50, role: 'Gerente Responsable', y: yPosition }
    ];
    
    // Agregar cada firma de forma síncrona
    for (const pos of signaturePositions) {
      const signature = accessRequest.signatures.find(sig => sig.role === pos.role);
      
      if (signature && signature.status === 'completed') {
        // Dibujar área de firma
        pdf.setDrawColor(0, 123, 255); // Azul
        pdf.setLineWidth(1);
        pdf.rect(pos.x - 40, pos.y, 80, 60);
        
        // Agregar firma vectorial SVG si existe, sino usar imagen raster
        if (signature.signatureSVG && signature.signatureSVG.startsWith('data:image/svg+xml')) {
          try {
            console.log(`Procesando firma SVG para ${signature.role} en PDF principal...`);
            
            // Extraer el SVG del data URL
            const svgBase64 = signature.signatureSVG.split(',')[1];
            const svgString = atob(svgBase64);
            
            // Usar svg2pdf.js para convertir SVG a PDF
            const { svg2pdf } = await import('svg2pdf.js');
            
            // Crear un elemento SVG temporal
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgString;
            const svgElement = tempDiv.querySelector('svg');
            
            if (svgElement) {
              // Configurar el SVG para el tamaño deseado
              svgElement.setAttribute('width', '70');
              svgElement.setAttribute('height', '30');
              svgElement.setAttribute('viewBox', '0 0 400 200');
              
              // Convertir SVG a PDF usando svg2pdf
              await svg2pdf(svgElement, pdf, {
                x: pos.x - 35,
                y: pos.y + 5,
                width: 70,
                height: 30
              });
              
              console.log(`Firma SVG para ${signature.role} agregada exitosamente al PDF principal`);
            } else {
              throw new Error('No se pudo parsear el SVG');
            }
            
          } catch (error) {
            console.warn(`Error procesando firma SVG para ${signature.role} en PDF principal:`, error);
            // Fallback a imagen raster
            await this.addRasterSignature(pdf, signature, pos.x - 35, pos.y + 5, 70, 30);
          }
        } else if (signature.signatureData && signature.signatureData.startsWith('data:image')) {
          // Fallback a imagen raster si no hay SVG
          console.log(`Usando imagen raster para ${signature.role} en PDF principal...`);
          await this.addRasterSignature(pdf, signature, pos.x - 35, pos.y + 5, 70, 30);
        } else {
          console.log(`No hay firma válida para ${signature.role} en PDF principal, usando placeholder`);
          this.drawSignaturePlaceholder(pdf, pos.x - 35, pos.y + 5, 70, 30);
        }
        
        // Información del firmante
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.text(signature.name, pos.x, pos.y + 70, { align: 'center' });
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(signature.role, pos.x, pos.y + 75, { align: 'center' });
        
        // Fecha de firma
        const fechaFirma = signature.timestamp.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        pdf.text(fechaFirma, pos.x, pos.y + 80, { align: 'center' });
        
        // Email del firmante si existe
        if (signature.email) {
          pdf.setFontSize(7);
          pdf.text(signature.email, pos.x, pos.y + 85, { align: 'center' });
        }
        
        // Indicador de estado
        pdf.setFillColor(34, 197, 94); // Verde
        pdf.circle(pos.x + 30, pos.y - 5, 3, 'F');
        
      } else {
        // Área de firma pendiente
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.setLineDashPattern([3, 3], 0);
        pdf.rect(pos.x - 40, pos.y, 80, 60);
        pdf.setLineDashPattern([], 0);
        
        // Texto de pendiente
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Pendiente de Firma', pos.x, pos.y + 30, { align: 'center' });
        pdf.text(pos.role, pos.x, pos.y + 40, { align: 'center' });
        
        // Indicador de estado pendiente
        pdf.setFillColor(245, 158, 11); // Amarillo
        pdf.circle(pos.x + 30, pos.y - 5, 3, 'F');
      }
    }
    
    // Agregar leyenda de estados
    yPosition += 100;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('LEYENDA DE ESTADOS:', 25, yPosition);
    yPosition += 15;
    
    // Estado completado
    pdf.setFillColor(34, 197, 94);
    pdf.circle(30, yPosition, 3, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('Firma Completada', 40, yPosition + 2);
    
    // Estado pendiente
    yPosition += 15;
    pdf.setFillColor(245, 158, 11);
    pdf.circle(30, yPosition, 3, 'F');
    pdf.text('Firma Pendiente', 40, yPosition + 2);
  }
  
  /**
   * Agrega una firma raster al PDF (fallback cuando no hay SVG)
   */
  private async addRasterSignature(pdf: jsPDF, signature: any, x: number, y: number, width: number, height: number): Promise<void> {
    try {
      console.log(`Procesando firma raster para ${signature.role}...`);
      
      // Crear canvas temporal
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = width;
        canvas.height = height;
        
        // Crear imagen
        const img = new Image();
        
        // Procesar imagen de forma síncrona
        const processImage = () => {
          return new Promise<void>((resolve, reject) => {
            img.onload = () => {
              try {
                console.log(`Imagen raster cargada para ${signature.role}`);
                
                // Fondo blanco
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                
                // Dibujar imagen
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir a base64
                const processedImage = canvas.toDataURL('image/png');
                console.log(`Imagen raster procesada para ${signature.role}, agregando...`);
                
                // Agregar imagen al PDF
                pdf.addImage(processedImage, 'PNG', x, y, width, height);
                console.log(`Firma raster para ${signature.role} agregada exitosamente al PDF`);
                
                resolve();
              } catch (error) {
                console.warn(`Error procesando imagen raster para ${signature.role}:`, error);
                reject(error);
              }
            };
            
            img.onerror = () => {
              console.warn(`Error cargando imagen raster para ${signature.role}`);
              reject(new Error('Error cargando imagen'));
            };
            
            // Cargar imagen
            img.src = signature.signatureData;
          });
        };
        
        // Esperar a que se procese la imagen antes de continuar
        await processImage();
        
      } else {
        console.warn(`No se pudo crear contexto de canvas para ${signature.role}`);
        this.drawSignaturePlaceholder(pdf, x, y, width, height);
      }
      
    } catch (error) {
      console.warn(`Error procesando firma raster para ${signature.role}:`, error);
      this.drawSignaturePlaceholder(pdf, x, y, width, height);
    }
  }
  
  /**
   * Dibuja un placeholder para la firma
   */
  private drawSignaturePlaceholder(pdf: jsPDF, x: number, y: number, width: number, height: number): void {
    // Fondo del placeholder
    pdf.setFillColor(248, 250, 252);
    pdf.rect(x, y, width, height, 'F');
    
    // Borde del placeholder
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, width, height);
    
    // Texto del placeholder
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Firma Digital', x + width/2, y + height/2, { align: 'center' });
    
    // Icono de firma (simulado con texto)
    pdf.setFontSize(12);
    pdf.text('✍️', x + width/2, y + height/2 - 8, { align: 'center' });
  }

  /**
   * Descarga el PDF generado
   */
  public downloadPDF(pdfBlob: Blob, filename: string): void {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera nombre de archivo para el PDF
   */
  public generateFilename(accessRequest: AccessRequest): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `FR-GRU-INF-SOL-001_${accessRequest.id}_${timestamp}.pdf`;
  }
}

// Exportar instancia singleton
export const pdfGeneratorService = PDFGeneratorService.getInstance();
