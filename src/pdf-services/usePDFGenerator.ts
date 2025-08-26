import { useState, useCallback } from 'react';
import { pdfGeneratorService } from './pdfGenerator';
import type { AccessRequest, PDFGenerationResult } from './types';

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<PDFGenerationResult | null>(null);

  /**
   * Genera PDF para una solicitud de acceso
   */
  const generatePDF = useCallback(async (accessRequest: AccessRequest): Promise<PDFGenerationResult> => {
    setIsGenerating(true);
    setLastResult(null);

    try {
      const result = await pdfGeneratorService.generateAccessControlPDF(accessRequest);
      setLastResult(result);
      return result;
    } catch (error) {
      const errorResult: PDFGenerationResult = {
        success: false,
        errorMessage: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Descarga el PDF generado
   */
  const downloadPDF = useCallback((accessRequest: AccessRequest) => {
    if (lastResult?.success && lastResult.pdfBlob) {
      const filename = pdfGeneratorService.generateFilename(accessRequest);
      pdfGeneratorService.downloadPDF(lastResult.pdfBlob, filename);
    }
  }, [lastResult]);

  /**
   * Genera y descarga PDF automáticamente
   */
  const generateAndDownloadPDF = useCallback(async (accessRequest: AccessRequest) => {
    const result = await generatePDF(accessRequest);
    if (result.success) {
      downloadPDF(accessRequest);
    }
    return result;
  }, [generatePDF, downloadPDF]);

  /**
   * Limpia el último resultado
   */
  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    // Estado
    isGenerating,
    lastResult,
    
    // Acciones
    generatePDF,
    downloadPDF,
    generateAndDownloadPDF,
    clearResult,
    
    // Utilidades
    hasResult: lastResult !== null,
    isSuccess: lastResult?.success || false,
    errorMessage: lastResult?.errorMessage || null
  };
};
