import React, { useState, useRef } from 'react';
import { StorageService } from '../services/storageService';
import type { AccessRequest } from '../pdf-services/types';

interface HistoryManagerProps {
  onImportSuccess: (requests: AccessRequest[]) => void;
}

export const HistoryManager: React.FC<HistoryManagerProps> = ({ onImportSuccess }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    StorageService.exportRequests();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage('');

    try {
      const requests = await StorageService.importRequests(file);
      
      // Combinar con las solicitudes existentes
      const existingRequests = StorageService.loadAccessRequests();
      const allRequests = [...existingRequests, ...requests];
      
      // Guardar todas las solicitudes
      StorageService.saveAccessRequests(allRequests);
      
      // Notificar al componente padre
      onImportSuccess(allRequests);
      
      setImportMessage(`✅ ${requests.length} solicitudes importadas exitosamente`);
      
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportMessage(`❌ Error importando: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todas las solicitudes? Esta acción no se puede deshacer.')) {
      StorageService.clearAllRequests();
      onImportSuccess([]);
      setImportMessage('🗑️ Todas las solicitudes han sido eliminadas');
    }
  };

  const stats = StorageService.getStorageStats();

  return (
    <div className="history-manager">
      <div className="history-header">
        <h4>📚 Gestión del Historial</h4>
        <div className="history-stats">
          <span className="stat-item">
            <strong>{stats.total}</strong> solicitudes
          </span>
          <span className="stat-item">
            <strong>{stats.totalSize}</strong>
          </span>
          {stats.lastUpdated && (
            <span className="stat-item">
              Última: <strong>{stats.lastUpdated}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="history-actions">
        <button
          className="btn btn-outline"
          onClick={handleExport}
          title="Exportar todas las solicitudes como archivo JSON"
        >
          📤 Exportar Historial
        </button>

        <button
          className="btn btn-outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          title="Importar solicitudes desde un archivo JSON"
        >
          {isImporting ? '📥 Importando...' : '📥 Importar Historial'}
        </button>

        <button
          className="btn btn-danger"
          onClick={handleClearAll}
          title="Eliminar todas las solicitudes del almacenamiento"
        >
          🗑️ Limpiar Todo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      {importMessage && (
        <div className={`import-message ${importMessage.includes('✅') ? 'success' : 'error'}`}>
          {importMessage}
        </div>
      )}

      <div className="history-info">
        <p className="info-text">
          <strong>💡 Información:</strong> Las solicitudes se guardan automáticamente en tu navegador.
          Puedes exportarlas para respaldo o importarlas en otro dispositivo.
        </p>
      </div>
    </div>
  );
};

export default HistoryManager;
