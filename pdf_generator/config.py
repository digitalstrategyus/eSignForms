import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración del sistema de generación de PDFs"""
    
    # Configuración de eSignForms
    ESIGNFORMS_API_URL = os.getenv('ESIGNFORMS_API_URL', 'http://localhost:3000')
    ESIGNFORMS_API_KEY = os.getenv('ESIGNFORMS_API_KEY', '')
    
    # Configuración de PDF
    PDF_TEMPLATE_PATH = os.getenv('PDF_TEMPLATE_PATH', 'templates/FR-GRU-INF-SOL-001.pdf')
    PDF_OUTPUT_DIR = os.getenv('PDF_OUTPUT_DIR', 'generated_pdfs/')
    
    # Coordenadas de campos en el PDF (ajustar según tu plantilla)
    PDF_FIELD_COORDINATES = {
        'usuario_solicitante': {'x': 150, 'y': 700, 'width': 200, 'height': 20},
        'gerente_usuario': {'x': 150, 'y': 650, 'width': 200, 'height': 20},
        'gerente_responsable': {'x': 150, 'y': 600, 'width': 200, 'height': 20},
        'puesto_usuario': {'x': 150, 'y': 550, 'width': 200, 'height': 20},
        'correo_usuario': {'x': 150, 'y': 500, 'width': 200, 'height': 20},
        'departamento': {'x': 150, 'y': 450, 'width': 200, 'height': 20},
        'region': {'x': 150, 'y': 400, 'width': 200, 'height': 20},
        'fecha_solicitud': {'x': 150, 'y': 350, 'width': 200, 'height': 20},
        'justificacion': {'x': 150, 'y': 300, 'width': 400, 'height': 100},
        
        # Coordenadas para las firmas digitales
        'firma_usuario': {'x': 100, 'y': 200, 'width': 120, 'height': 60},
        'firma_gerente_usuario': {'x': 250, 'y': 200, 'width': 120, 'height': 60},
        'firma_gerente_responsable': {'x': 400, 'y': 200, 'width': 120, 'height': 60}
    }
    
    # Configuración del servidor Flask
    FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Configuración de logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'pdf_generator.log')
