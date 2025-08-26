from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
import json

@dataclass
class Signature:
    """Modelo para las firmas digitales"""
    id: str
    name: str
    role: str
    position: dict
    timestamp: datetime
    signature_data: str
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'position': self.position,
            'timestamp': self.timestamp.isoformat(),
            'signature_data': self.signature_data
        }

@dataclass
class AccessRequest:
    """Modelo para la solicitud de acceso"""
    id: str
    name: str
    content: str
    gerente_responsable: str
    gerente_usuario: str
    usuario_solicitante: str
    signatures: List[Signature]
    fecha_creacion: datetime
    
    # Campos adicionales del formulario
    puesto_usuario: Optional[str] = None
    correo_usuario: Optional[str] = None
    departamento: Optional[str] = None
    region: Optional[str] = None
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'content': self.content,
            'gerente_responsable': self.gerente_responsable,
            'gerente_usuario': self.gerente_usuario,
            'usuario_solicitante': self.usuario_solicitante,
            'puesto_usuario': self.puesto_usuario,
            'correo_usuario': self.correo_usuario,
            'departamento': self.departamento,
            'region': self.region,
            'signatures': [sig.to_dict() for sig in self.signatures],
            'fecha_creacion': self.fecha_creacion.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: dict):
        """Crear instancia desde diccionario"""
        signatures = [Signature(**sig) for sig in data.get('signatures', [])]
        
        return cls(
            id=data['id'],
            name=data['name'],
            content=data['content'],
            gerente_responsable=data['gerente_responsable'],
            gerente_usuario=data['gerente_usuario'],
            usuario_solicitante=data['usuario_solicitante'],
            puesto_usuario=data.get('puesto_usuario'),
            correo_usuario=data.get('correo_usuario'),
            departamento=data.get('departamento'),
            region=data.get('region'),
            signatures=signatures,
            fecha_creacion=datetime.fromisoformat(data['fecha_creacion'])
        )
    
    def is_complete(self) -> bool:
        """Verificar si la solicitud tiene todas las firmas requeridas"""
        required_roles = {'Gerente Responsable', 'Gerente del Usuario', 'Usuario Solicitante'}
        signed_roles = {sig.role for sig in self.signatures}
        return required_roles.issubset(signed_roles)
    
    def get_signature_by_role(self, role: str) -> Optional[Signature]:
        """Obtener firma por rol"""
        for signature in self.signatures:
            if signature.role == role:
                return signature
        return None

@dataclass
class PDFGenerationResult:
    """Resultado de la generación del PDF"""
    success: bool
    pdf_path: Optional[str] = None
    error_message: Optional[str] = None
    generated_at: Optional[datetime] = None
    
    def to_dict(self):
        return {
            'success': self.success,
            'pdf_path': self.pdf_path,
            'error_message': self.error_message,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None
        }
