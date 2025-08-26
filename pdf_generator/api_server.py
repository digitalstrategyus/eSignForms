from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import logging
import os
from datetime import datetime
from typing import List, Dict, Any

from config import Config
from models import AccessRequest, PDFGenerationResult
from esignforms_client import ESignFormsClient
from pdf_generator import PDFGenerator

# Configurar logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(Config.LOG_FILE),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Crear aplicación Flask
app = Flask(__name__)
CORS(app)

# Inicializar clientes
esignforms_client = ESignFormsClient()
pdf_generator = PDFGenerator()

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de salud del sistema"""
    try:
        esignforms_health = esignforms_client.health_check()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'esignforms_connection': 'connected' if esignforms_health else 'disconnected',
            'pdf_generator': 'ready'
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/api/access-requests', methods=['GET'])
def get_access_requests():
    """Obtener todas las solicitudes de acceso"""
    try:
        requests = esignforms_client.get_access_requests()
        
        return jsonify({
            'success': True,
            'data': [req.to_dict() for req in requests],
            'count': len(requests)
        })
    except Exception as e:
        logger.error(f"Error getting access requests: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/access-requests/<request_id>', methods=['GET'])
def get_access_request(request_id: str):
    """Obtener una solicitud de acceso específica"""
    try:
        access_request = esignforms_client.get_access_request_by_id(request_id)
        
        if not access_request:
            return jsonify({
                'success': False,
                'error': 'Solicitud no encontrada'
            }), 404
        
        return jsonify({
            'success': True,
            'data': access_request.to_dict()
        })
    except Exception as e:
        logger.error(f"Error getting access request {request_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/access-requests/<request_id>/generate-pdf', methods=['POST'])
def generate_pdf_for_request(request_id: str):
    """Generar PDF para una solicitud específica"""
    try:
        # Obtener la solicitud
        access_request = esignforms_client.get_access_request_by_id(request_id)
        
        if not access_request:
            return jsonify({
                'success': False,
                'error': 'Solicitud no encontrada'
            }), 404
        
        # Verificar que esté completa
        if not access_request.is_complete():
            return jsonify({
                'success': False,
                'error': 'La solicitud no tiene todas las firmas requeridas'
            }), 400
        
        # Generar PDF
        result = pdf_generator.generate_pdf(access_request)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': result.to_dict(),
                'message': 'PDF generado exitosamente'
            })
        else:
            return jsonify({
                'success': False,
                'error': result.error_message
            }), 500
            
    except Exception as e:
        logger.error(f"Error generating PDF for request {request_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/access-requests/completed', methods=['GET'])
def get_completed_requests():
    """Obtener solicitudes completas"""
    try:
        completed_requests = esignforms_client.get_completed_requests()
        
        return jsonify({
            'success': True,
            'data': [req.to_dict() for req in completed_requests],
            'count': len(completed_requests)
        })
    except Exception as e:
        logger.error(f"Error getting completed requests: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/access-requests/batch-generate-pdf', methods=['POST'])
def batch_generate_pdfs():
    """Generar PDFs para múltiples solicitudes completas"""
    try:
        data = request.get_json()
        request_ids = data.get('request_ids', [])
        
        if not request_ids:
            return jsonify({
                'success': False,
                'error': 'No se proporcionaron IDs de solicitud'
            }), 400
        
        results = []
        for request_id in request_ids:
            try:
                access_request = esignforms_client.get_access_request_by_id(request_id)
                if access_request and access_request.is_complete():
                    result = pdf_generator.generate_pdf(access_request)
                    results.append({
                        'request_id': request_id,
                        'result': result.to_dict()
                    })
                else:
                    results.append({
                        'request_id': request_id,
                        'result': {
                            'success': False,
                            'error_message': 'Solicitud no encontrada o incompleta'
                        }
                    })
            except Exception as e:
                results.append({
                    'request_id': request_id,
                    'result': {
                        'success': False,
                        'error_message': str(e)
                    }
                })
        
        return jsonify({
            'success': True,
            'data': results,
            'total_processed': len(results)
        })
        
    except Exception as e:
        logger.error(f"Error in batch PDF generation: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Obtener estadísticas del sistema"""
    try:
        stats = esignforms_client.get_request_statistics()
        
        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/download-pdf/<filename>', methods=['GET'])
def download_pdf(filename: str):
    """Descargar un PDF generado"""
    try:
        pdf_path = os.path.join(Config.PDF_OUTPUT_DIR, filename)
        
        if not os.path.exists(pdf_path):
            return jsonify({
                'success': False,
                'error': 'PDF no encontrado'
            }), 404
        
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"Error downloading PDF {filename}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/auto-generate-pdfs', methods=['POST'])
def auto_generate_pdfs():
    """Generar automáticamente PDFs para todas las solicitudes completas"""
    try:
        # Obtener solicitudes completas
        completed_requests = esignforms_client.get_completed_requests()
        
        if not completed_requests:
            return jsonify({
                'success': True,
                'message': 'No hay solicitudes completas para procesar',
                'data': []
            })
        
        results = []
        for access_request in completed_requests:
            try:
                result = pdf_generator.generate_pdf(access_request)
                results.append({
                    'request_id': access_request.id,
                    'result': result.to_dict()
                })
            except Exception as e:
                results.append({
                    'request_id': access_request.id,
                    'result': {
                        'success': False,
                        'error_message': str(e)
                    }
                })
        
        return jsonify({
            'success': True,
            'message': f'Procesadas {len(completed_requests)} solicitudes',
            'data': results
        })
        
    except Exception as e:
        logger.error(f"Error in auto PDF generation: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint no encontrado'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Error interno del servidor'
    }), 500

if __name__ == '__main__':
    logger.info("Starting PDF Generator API Server...")
    logger.info(f"Server will run on {Config.FLASK_HOST}:{Config.FLASK_PORT}")
    
    app.run(
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )
