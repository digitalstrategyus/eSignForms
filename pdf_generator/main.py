#!/usr/bin/env python3
"""
Sistema de Generación Automática de PDFs para eSignForms
Genera automáticamente el formato Control de Acceso (FR-GRU-INF-SOL-001) en PDF
"""

import os
import sys
import logging
import argparse
from datetime import datetime
from typing import List

# Agregar el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import Config
from esignforms_client import ESignFormsClient
from pdf_generator import PDFGenerator
from models import AccessRequest, PDFGenerationResult

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

class PDFGeneratorService:
    """Servicio principal de generación de PDFs"""
    
    def __init__(self):
        self.esignforms_client = ESignFormsClient()
        self.pdf_generator = PDFGenerator()
    
    def check_esignforms_connection(self) -> bool:
        """Verificar conexión con eSignForms"""
        try:
            is_healthy = self.esignforms_client.health_check()
            if is_healthy:
                logger.info("✅ Conexión con eSignForms establecida")
                return True
            else:
                logger.error("❌ No se pudo conectar con eSignForms")
                return False
        except Exception as e:
            logger.error(f"❌ Error verificando conexión con eSignForms: {e}")
            return False
    
    def get_pending_requests(self) -> List[AccessRequest]:
        """Obtener solicitudes pendientes de procesar"""
        try:
            all_requests = self.esignforms_client.get_access_requests()
            pending_requests = [req for req in all_requests if not req.is_complete()]
            
            logger.info(f"📋 Encontradas {len(pending_requests)} solicitudes pendientes")
            return pending_requests
            
        except Exception as e:
            logger.error(f"Error obteniendo solicitudes pendientes: {e}")
            return []
    
    def get_completed_requests(self) -> List[AccessRequest]:
        """Obtener solicitudes completas listas para PDF"""
        try:
            completed_requests = self.esignforms_client.get_completed_requests()
            
            logger.info(f"✅ Encontradas {len(completed_requests)} solicitudes completas")
            return completed_requests
            
        except Exception as e:
            logger.error(f"Error obteniendo solicitudes completas: {e}")
            return []
    
    def process_single_request(self, request_id: str) -> PDFGenerationResult:
        """Procesar una solicitud específica"""
        try:
            logger.info(f"🔄 Procesando solicitud: {request_id}")
            
            # Obtener la solicitud
            access_request = self.esignforms_client.get_access_request_by_id(request_id)
            
            if not access_request:
                return PDFGenerationResult(
                    success=False,
                    error_message=f"Solicitud {request_id} no encontrada"
                )
            
            if not access_request.is_complete():
                return PDFGenerationResult(
                    success=False,
                    error_message=f"Solicitud {request_id} no tiene todas las firmas requeridas"
                )
            
            # Generar PDF
            result = self.pdf_generator.generate_pdf(access_request)
            
            if result.success:
                logger.info(f"✅ PDF generado exitosamente para solicitud {request_id}")
            else:
                logger.error(f"❌ Error generando PDF para solicitud {request_id}: {result.error_message}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error procesando solicitud {request_id}: {e}")
            return PDFGenerationResult(
                success=False,
                error_message=str(e)
            )
    
    def process_all_completed_requests(self) -> List[PDFGenerationResult]:
        """Procesar todas las solicitudes completas"""
        try:
            completed_requests = self.get_completed_requests()
            
            if not completed_requests:
                logger.info("ℹ️ No hay solicitudes completas para procesar")
                return []
            
            results = []
            logger.info(f"🚀 Iniciando procesamiento de {len(completed_requests)} solicitudes...")
            
            for i, access_request in enumerate(completed_requests, 1):
                logger.info(f"📝 Procesando {i}/{len(completed_requests)}: {access_request.name}")
                
                result = self.process_single_request(access_request.id)
                results.append(result)
                
                if result.success:
                    logger.info(f"✅ Solicitud {access_request.id} procesada exitosamente")
                else:
                    logger.error(f"❌ Solicitud {access_request.id} falló: {result.error_message}")
            
            # Resumen
            successful = sum(1 for r in results if r.success)
            failed = len(results) - successful
            
            logger.info(f"📊 Resumen del procesamiento:")
            logger.info(f"   ✅ Exitosas: {successful}")
            logger.info(f"   ❌ Fallidas: {failed}")
            logger.info(f"   📁 Total: {len(results)}")
            
            return results
            
        except Exception as e:
            logger.error(f"Error en procesamiento masivo: {e}")
            return []
    
    def show_statistics(self):
        """Mostrar estadísticas del sistema"""
        try:
            stats = self.esignforms_client.get_request_statistics()
            
            print("\n" + "="*50)
            print("📊 ESTADÍSTICAS DEL SISTEMA")
            print("="*50)
            print(f"📋 Total de solicitudes: {stats.get('total_requests', 0)}")
            print(f"✅ Solicitudes completas: {stats.get('completed_requests', 0)}")
            print(f"⏳ Solicitudes pendientes: {stats.get('pending_requests', 0)}")
            
            completion_rate = stats.get('completion_rate', 0) * 100
            print(f"📈 Tasa de completitud: {completion_rate:.1f}%")
            print("="*50)
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {e}")
    
    def run_interactive_mode(self):
        """Ejecutar en modo interactivo"""
        print("\n" + "="*60)
        print("🚀 SISTEMA DE GENERACIÓN AUTOMÁTICA DE PDFs")
        print("   Formato Control de Acceso (FR-GRU-INF-SOL-001)")
        print("="*60)
        
        # Verificar conexión
        if not self.check_esignforms_connection():
            print("❌ No se puede continuar sin conexión a eSignForms")
            return
        
        while True:
            print("\n📋 MENÚ PRINCIPAL:")
            print("1. 📊 Mostrar estadísticas")
            print("2. 🔄 Procesar solicitudes completas")
            print("3. 📝 Procesar solicitud específica")
            print("4. 📋 Ver solicitudes pendientes")
            print("5. ✅ Ver solicitudes completas")
            print("6. 🚪 Salir")
            
            choice = input("\n👉 Selecciona una opción (1-6): ").strip()
            
            if choice == '1':
                self.show_statistics()
                
            elif choice == '2':
                print("\n🔄 Procesando solicitudes completas...")
                results = self.process_all_completed_requests()
                
                if results:
                    print(f"\n✅ Procesamiento completado. {len(results)} solicitudes procesadas.")
                else:
                    print("\nℹ️ No hay solicitudes para procesar.")
                    
            elif choice == '3':
                request_id = input("\n📝 Ingresa el ID de la solicitud: ").strip()
                if request_id:
                    result = self.process_single_request(request_id)
                    if result.success:
                        print(f"✅ PDF generado exitosamente: {result.pdf_path}")
                    else:
                        print(f"❌ Error: {result.error_message}")
                        
            elif choice == '4':
                pending = self.get_pending_requests()
                if pending:
                    print(f"\n⏳ Solicitudes pendientes ({len(pending)}):")
                    for req in pending:
                        print(f"   📄 {req.name} (ID: {req.id})")
                else:
                    print("\nℹ️ No hay solicitudes pendientes.")
                    
            elif choice == '5':
                completed = self.get_completed_requests()
                if completed:
                    print(f"\n✅ Solicitudes completas ({len(completed)}):")
                    for req in completed:
                        print(f"   📄 {req.name} (ID: {req.id})")
                else:
                    print("\nℹ️ No hay solicitudes completas.")
                    
            elif choice == '6':
                print("\n👋 ¡Hasta luego!")
                break
                
            else:
                print("\n❌ Opción no válida. Intenta de nuevo.")

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description="Sistema de Generación Automática de PDFs para eSignForms"
    )
    
    parser.add_argument(
        '--auto',
        action='store_true',
        help='Ejecutar en modo automático (procesar todas las solicitudes completas)'
    )
    
    parser.add_argument(
        '--request-id',
        type=str,
        help='Procesar una solicitud específica por ID'
    )
    
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Mostrar estadísticas y salir'
    )
    
    parser.add_argument(
        '--interactive',
        action='store_true',
        help='Ejecutar en modo interactivo (por defecto)'
    )
    
    args = parser.parse_args()
    
    try:
        service = PDFGeneratorService()
        
        if args.stats:
            service.show_statistics()
            
        elif args.auto:
            print("🔄 Ejecutando en modo automático...")
            service.process_all_completed_requests()
            
        elif args.request_id:
            print(f"📝 Procesando solicitud específica: {args.request_id}")
            result = service.process_single_request(args.request_id)
            if result.success:
                print(f"✅ PDF generado: {result.pdf_path}")
            else:
                print(f"❌ Error: {result.error_message}")
                
        else:
            # Modo interactivo por defecto
            service.run_interactive_mode()
            
    except KeyboardInterrupt:
        print("\n\n👋 Proceso interrumpido por el usuario")
    except Exception as e:
        logger.error(f"Error en el sistema principal: {e}")
        print(f"\n❌ Error del sistema: {e}")

if __name__ == '__main__':
    main()
