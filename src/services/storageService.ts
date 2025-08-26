import type { AccessRequest } from '../pdf-services/types';

const STORAGE_KEY = 'esignforms_access_requests';

export class StorageService {
  /**
   * Guarda las solicitudes de acceso en localStorage
   */
  static saveAccessRequests(requests: AccessRequest[]): void {
    try {
      const serializedData = JSON.stringify(requests, (key, value) => {
        // Convertir fechas a string para serialización
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
      
      localStorage.setItem(STORAGE_KEY, serializedData);
      console.log(`✅ ${requests.length} solicitudes guardadas en localStorage`);
    } catch (error) {
      console.error('❌ Error guardando solicitudes:', error);
    }
  }

  /**
   * Carga las solicitudes de acceso desde localStorage
   */
  static loadAccessRequests(): AccessRequest[] {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) {
        return [];
      }

      const requests = JSON.parse(storedData, (key, value) => {
        // Convertir strings de fecha de vuelta a objetos Date
        if (key === 'fechaCreacion' || key === 'timestamp') {
          return new Date(value);
        }
        return value;
      });

      console.log(`📥 ${requests.length} solicitudes cargadas desde localStorage`);
      return requests;
    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error);
      return [];
    }
  }

  /**
   * Agrega una nueva solicitud al almacenamiento
   */
  static addAccessRequest(request: AccessRequest): void {
    const requests = this.loadAccessRequests();
    requests.push(request);
    this.saveAccessRequests(requests);
  }

  /**
   * Actualiza una solicitud existente
   */
  static updateAccessRequest(updatedRequest: AccessRequest): void {
    const requests = this.loadAccessRequests();
    const index = requests.findIndex(req => req.id === updatedRequest.id);
    
    if (index !== -1) {
      requests[index] = updatedRequest;
      this.saveAccessRequests(requests);
    }
  }

  /**
   * Elimina una solicitud del almacenamiento
   */
  static deleteAccessRequest(requestId: string): void {
    const requests = this.loadAccessRequests();
    const filteredRequests = requests.filter(req => req.id !== requestId);
    this.saveAccessRequests(filteredRequests);
  }

  /**
   * Limpia todas las solicitudes del almacenamiento
   */
  static clearAllRequests(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Todas las solicitudes eliminadas del almacenamiento');
  }

  /**
   * Exporta las solicitudes como archivo JSON
   */
  static exportRequests(): void {
    try {
      const requests = this.loadAccessRequests();
      const dataStr = JSON.stringify(requests, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `solicitudes_acceso_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      console.log('📤 Solicitudes exportadas exitosamente');
    } catch (error) {
      console.error('❌ Error exportando solicitudes:', error);
    }
  }

  /**
   * Importa solicitudes desde un archivo JSON
   */
  static async importRequests(file: File): Promise<AccessRequest[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const requests = JSON.parse(content, (key, value) => {
            if (key === 'fechaCreacion' || key === 'timestamp') {
              return new Date(value);
            }
            return value;
          });
          
          // Validar que sea un array de solicitudes válidas
          if (Array.isArray(requests) && requests.every(req => req.id && req.name)) {
            resolve(requests);
          } else {
            reject(new Error('Formato de archivo inválido'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsText(file);
    });
  }

  /**
   * Obtiene estadísticas del almacenamiento
   */
  static getStorageStats(): { total: number; totalSize: string; lastUpdated: string | null } {
    const requests = this.loadAccessRequests();
    const totalSize = new Blob([JSON.stringify(requests)]).size;
    
    const lastUpdated = requests.length > 0 
      ? new Date(Math.max(...requests.map(r => r.fechaCreacion.getTime()))).toLocaleString('es-ES')
      : null;
    
    return {
      total: requests.length,
      totalSize: this.formatBytes(totalSize),
      lastUpdated
    };
  }

  /**
   * Formatea bytes en formato legible
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
