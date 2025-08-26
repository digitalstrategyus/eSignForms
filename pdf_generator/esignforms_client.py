import requests
import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
import base64

from config import Config
from models import AccessRequest, Signature

logger = logging.getLogger(__name__)

class ESignFormsClient:
    """Cliente para interactuar con la API de eSignForms"""
    
    def __init__(self, api_url: str = None, api_key: str = None):
        self.api_url = api_url or Config.ESIGNFORMS_API_URL
        self.api_key = api_key or Config.ESIGNFORMS_API_KEY
        self.session = requests.Session()
        
        if self.api_key:
            self.session.headers.update({'Authorization': f'Bearer {self.api_key}'})
        
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def get_access_requests(self) -> List[AccessRequest]:
        """Obtener todas las solicitudes de acceso"""
        try:
            response = self.session.get(f"{self.api_url}/api/access-requests")
            response.raise_for_status()
            
            requests_data = response.json()
            access_requests = []
            
            for req_data in requests_data:
                try:
                    access_request = AccessRequest.from_dict(req_data)
                    access_requests.append(access_request)
                except Exception as e:
                    logger.error(f"Error parsing access request {req_data.get('id')}: {e}")
                    continue
            
            return access_requests
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching access requests: {e}")
            return []
    
    def get_access_request_by_id(self, request_id: str) -> Optional[AccessRequest]:
        """Obtener una solicitud de acceso específica por ID"""
        try:
            response = self.session.get(f"{self.api_url}/api/access-requests/{request_id}")
            response.raise_for_status()
            
            req_data = response.json()
            return AccessRequest.from_dict(req_data)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching access request {request_id}: {e}")
            return None
    
    def get_completed_requests(self) -> List[AccessRequest]:
        """Obtener solicitudes completas (con todas las firmas)"""
        all_requests = self.get_access_requests()
        return [req for req in all_requests if req.is_complete()]
    
    def update_request_status(self, request_id: str, status: str, pdf_path: str = None) -> bool:
        """Actualizar el estado de una solicitud después de generar el PDF"""
        try:
            update_data = {
                'status': status,
                'pdf_generated': True,
                'pdf_path': pdf_path,
                'pdf_generated_at': datetime.now().isoformat()
            }
            
            response = self.session.put(
                f"{self.api_url}/api/access-requests/{request_id}/status",
                json=update_data
            )
            response.raise_for_status()
            
            logger.info(f"Successfully updated status for request {request_id}")
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error updating status for request {request_id}: {e}")
            return False
    
    def get_signature_image(self, signature_data: str) -> Optional[bytes]:
        """Convertir datos de firma base64 a imagen"""
        try:
            # Remover el prefijo data:image/png;base64, si existe
            if ';base64,' in signature_data:
                signature_data = signature_data.split(';base64,')[1]
            
            # Decodificar base64 a bytes
            image_bytes = base64.b64decode(signature_data)
            return image_bytes
            
        except Exception as e:
            logger.error(f"Error converting signature data to image: {e}")
            return None
    
    def validate_signature(self, signature: Signature) -> bool:
        """Validar que una firma sea válida"""
        try:
            # Verificar que la firma tenga todos los campos requeridos
            if not all([signature.id, signature.name, signature.role, signature.signature_data]):
                return False
            
            # Verificar que el timestamp sea válido
            if not isinstance(signature.timestamp, datetime):
                return False
            
            # Verificar que los datos de firma sean base64 válido
            try:
                self.get_signature_image(signature.signature_data)
                return True
            except:
                return False
                
        except Exception as e:
            logger.error(f"Error validating signature: {e}")
            return False
    
    def get_request_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de las solicitudes"""
        try:
            all_requests = self.get_access_requests()
            completed_requests = [req for req in all_requests if req.is_complete()]
            pending_requests = [req for req in all_requests if not req.is_complete()]
            
            return {
                'total_requests': len(all_requests),
                'completed_requests': len(completed_requests),
                'pending_requests': len(pending_requests),
                'completion_rate': len(completed_requests) / len(all_requests) if all_requests else 0
            }
            
        except Exception as e:
            logger.error(f"Error getting request statistics: {e}")
            return {}
    
    def health_check(self) -> bool:
        """Verificar la salud de la API de eSignForms"""
        try:
            response = self.session.get(f"{self.api_url}/health", timeout=5)
            return response.status_code == 200
        except:
            return False
