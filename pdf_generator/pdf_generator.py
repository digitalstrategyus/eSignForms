import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime
import tempfile
from io import BytesIO

from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import black, blue
from PIL import Image

from config import Config
from models import AccessRequest, Signature, PDFGenerationResult
from esignforms_client import ESignFormsClient

logger = logging.getLogger(__name__)

class PDFGenerator:
    """Generador de PDFs para el formato Control de Acceso"""
    
    def __init__(self, template_path: str = None, output_dir: str = None):
        self.template_path = template_path or Config.PDF_TEMPLATE_PATH
        self.output_dir = output_dir or Config.PDF_OUTPUT_DIR
        self.field_coordinates = Config.PDF_FIELD_COORDINATES
        self.esignforms_client = ESignFormsClient()
        
        # Crear directorio de salida si no existe
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate_pdf(self, access_request: AccessRequest) -> PDFGenerationResult:
        """Generar PDF completo con datos y firmas"""
        try:
            logger.info(f"Generating PDF for access request: {access_request.id}")
            
            # Verificar que la solicitud esté completa
            if not access_request.is_complete():
                return PDFGenerationResult(
                    success=False,
                    error_message="La solicitud no tiene todas las firmas requeridas"
                )
            
            # Crear archivo temporal para el PDF
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
                temp_path = temp_pdf.name
            
            try:
                # Generar PDF con datos y firmas
                pdf_path = self._create_filled_pdf(access_request, temp_path)
                
                # Mover al directorio final
                final_path = self._move_to_final_location(pdf_path, access_request.id)
                
                # Actualizar estado en eSignForms
                self.esignforms_client.update_request_status(
                    access_request.id, 
                    'PDF_GENERATED', 
                    final_path
                )
                
                logger.info(f"PDF generated successfully: {final_path}")
                
                return PDFGenerationResult(
                    success=True,
                    pdf_path=final_path,
                    generated_at=datetime.now()
                )
                
            finally:
                # Limpiar archivo temporal
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    
        except Exception as e:
            logger.error(f"Error generating PDF for request {access_request.id}: {e}")
            return PDFGenerationResult(
                success=False,
                error_message=str(e)
            )
    
    def _create_filled_pdf(self, access_request: AccessRequest, output_path: str) -> str:
        """Crear PDF rellenado con datos y firmas"""
        
        # Leer plantilla PDF
        if os.path.exists(self.template_path):
            # Usar plantilla existente
            pdf_path = self._fill_existing_template(access_request, output_path)
        else:
            # Crear PDF desde cero
            pdf_path = self._create_new_pdf(access_request, output_path)
        
        return pdf_path
    
    def _fill_existing_template(self, access_request: AccessRequest, output_path: str) -> str:
        """Rellenar plantilla PDF existente"""
        try:
            # Leer plantilla
            reader = PdfReader(self.template_path)
            writer = PdfWriter()
            
            # Agregar primera página
            page = reader.pages[0]
            writer.add_page(page)
            
            # Crear overlay con datos
            overlay_path = self._create_data_overlay(access_request)
            
            # Combinar plantilla con overlay
            with open(overlay_path, 'rb') as overlay_file:
                overlay_reader = PdfReader(overlay_file)
                overlay_page = overlay_reader.pages[0]
                
                # Aplicar overlay
                page.merge_page(overlay_page)
            
            # Escribir PDF final
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            # Limpiar overlay temporal
            os.unlink(overlay_path)
            
            return output_path
            
        except Exception as e:
            logger.error(f"Error filling existing template: {e}")
            raise
    
    def _create_new_pdf(self, access_request: AccessRequest, output_path: str) -> str:
        """Crear PDF desde cero si no hay plantilla"""
        try:
            c = canvas.Canvas(output_path, pagesize=letter)
            width, height = letter
            
            # Título
            c.setFont("Helvetica-Bold", 16)
            c.drawString(width/2 - 100, height - 50, "FORMATO CONTROL DE ACCESO")
            c.drawString(width/2 - 80, height - 70, "FR-GRU-INF-SOL-001")
            
            # Información de la solicitud
            c.setFont("Helvetica-Bold", 12)
            y_position = height - 120
            
            # Datos del usuario
            c.drawString(50, y_position, "Usuario Solicitante:")
            c.setFont("Helvetica", 12)
            c.drawString(200, y_position, access_request.usuario_solicitante)
            
            y_position -= 30
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y_position, "Gerente del Usuario:")
            c.setFont("Helvetica", 12)
            c.drawString(200, y_position, access_request.gerente_usuario)
            
            y_position -= 30
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y_position, "Gerente Responsable:")
            c.setFont("Helvetica", 12)
            c.drawString(200, y_position, access_request.gerente_responsable)
            
            # Campos adicionales
            y_position -= 40
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y_position, "Justificación:")
            c.setFont("Helvetica", 12)
            
            # Texto multilínea para justificación
            text_lines = self._wrap_text(access_request.content, 60)
            for line in text_lines:
                y_position -= 20
                c.drawString(200, y_position, line)
            
            # Agregar firmas
            self._add_signatures_to_canvas(c, access_request, width, height)
            
            c.save()
            return output_path
            
        except Exception as e:
            logger.error(f"Error creating new PDF: {e}")
            raise
    
    def _create_data_overlay(self, access_request: AccessRequest) -> str:
        """Crear overlay con datos para aplicar a la plantilla"""
        try:
            # Crear archivo temporal para el overlay
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_overlay:
                overlay_path = temp_overlay.name
            
            c = canvas.Canvas(overlay_path, pagesize=letter)
            
            # Agregar datos en las coordenadas especificadas
            self._add_text_fields(c, access_request)
            self._add_signatures_to_canvas(c, access_request, 612, 792)  # Tamaño letter
            
            c.save()
            return overlay_path
            
        except Exception as e:
            logger.error(f"Error creating data overlay: {e}")
            raise
    
    def _add_text_fields(self, canvas_obj, access_request: AccessRequest):
        """Agregar campos de texto al canvas"""
        try:
            # Configurar fuente
            canvas_obj.setFont("Helvetica", 10)
            
            # Mapear datos a campos
            field_data = {
                'usuario_solicitante': access_request.usuario_solicitante,
                'gerente_usuario': access_request.gerente_usuario,
                'gerente_responsable': access_request.gerente_responsable,
                'puesto_usuario': access_request.puesto_usuario or 'N/A',
                'correo_usuario': access_request.correo_usuario or 'N/A',
                'departamento': access_request.departamento or 'N/A',
                'region': access_request.region or 'N/A',
                'fecha_solicitud': access_request.fecha_creacion.strftime('%d/%m/%Y'),
                'justificacion': access_request.content
            }
            
            # Agregar cada campo en su posición
            for field_name, data in field_data.items():
                if field_name in self.field_coordinates:
                    coords = self.field_coordinates[field_name]
                    
                    if field_name == 'justificacion':
                        # Texto multilínea para justificación
                        self._add_multiline_text(canvas_obj, data, coords)
                    else:
                        # Texto simple
                        canvas_obj.drawString(coords['x'], coords['y'], str(data))
                        
        except Exception as e:
            logger.error(f"Error adding text fields: {e}")
            raise
    
    def _add_multiline_text(self, canvas_obj, text: str, coords: Dict[str, Any]):
        """Agregar texto multilínea"""
        try:
            # Dividir texto en líneas
            words = text.split()
            lines = []
            current_line = ""
            
            for word in words:
                test_line = current_line + " " + word if current_line else word
                if len(test_line) * 6 < coords['width']:  # Aproximación de ancho
                    current_line = test_line
                else:
                    if current_line:
                        lines.append(current_line)
                    current_line = word
            
            if current_line:
                lines.append(current_line)
            
            # Dibujar líneas
            y_position = coords['y']
            for line in lines:
                canvas_obj.drawString(coords['x'], y_position, line)
                y_position -= 15  # Espaciado entre líneas
                
        except Exception as e:
            logger.error(f"Error adding multiline text: {e}")
            raise
    
    def _add_signatures_to_canvas(self, canvas_obj, access_request: AccessRequest, width: float, height: float):
        """Agregar firmas digitales al canvas"""
        try:
            # Mapear roles a posiciones de firma
            signature_positions = {
                'Usuario Solicitante': self.field_coordinates.get('firma_usuario', {'x': 100, 'y': 200}),
                'Gerente del Usuario': self.field_coordinates.get('firma_gerente_usuario', {'x': 250, 'y': 200}),
                'Gerente Responsable': self.field_coordinates.get('firma_gerente_responsable', {'x': 400, 'y': 200})
            }
            
            for signature in access_request.signatures:
                if signature.role in signature_positions:
                    coords = signature_positions[signature.role]
                    
                    # Agregar firma
                    self._add_signature_image(canvas_obj, signature, coords)
                    
                    # Agregar información de la firma
                    canvas_obj.setFont("Helvetica", 8)
                    canvas_obj.drawString(coords['x'], coords['y'] - 20, signature.name)
                    canvas_obj.drawString(coords['x'], coords['y'] - 35, signature.role)
                    canvas_obj.drawString(coords['x'], coords['y'] - 50, 
                                       signature.timestamp.strftime('%d/%m/%Y %H:%M'))
                    
        except Exception as e:
            logger.error(f"Error adding signatures to canvas: {e}")
            raise
    
    def _add_signature_image(self, canvas_obj, signature: Signature, coords: Dict[str, Any]):
        """Agregar imagen de firma al canvas"""
        try:
            # Obtener imagen de firma
            image_bytes = self.esignforms_client.get_signature_image(signature.signature_data)
            if not image_bytes:
                logger.warning(f"Could not get signature image for {signature.role}")
                return
            
            # Crear imagen PIL
            image = Image.open(BytesIO(image_bytes))
            
            # Redimensionar si es necesario
            max_width = coords.get('width', 120)
            max_height = coords.get('height', 60)
            
            image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Guardar imagen temporal
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_img:
                temp_img_path = temp_img.name
                image.save(temp_img_path, 'PNG')
            
            try:
                # Agregar imagen al canvas
                canvas_obj.drawImage(temp_img_path, coords['x'], coords['y'], 
                                   image.width, image.height)
            finally:
                # Limpiar imagen temporal
                os.unlink(temp_img_path)
                
        except Exception as e:
            logger.error(f"Error adding signature image: {e}")
            raise
    
    def _wrap_text(self, text: str, max_width: int) -> list:
        """Envolver texto en líneas de ancho máximo"""
        words = text.split()
        lines = []
        current_line = ""
        
        for word in words:
            test_line = current_line + " " + word if current_line else word
            if len(test_line) <= max_width:
                current_line = test_line
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word
        
        if current_line:
            lines.append(current_line)
        
        return lines
    
    def _move_to_final_location(self, temp_path: str, request_id: str) -> str:
        """Mover PDF temporal a ubicación final"""
        filename = f"FR-GRU-INF-SOL-001_{request_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        final_path = os.path.join(self.output_dir, filename)
        
        os.rename(temp_path, final_path)
        return final_path
