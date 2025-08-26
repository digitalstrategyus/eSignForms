#!/usr/bin/env python3
"""
Script de instalación y configuración automática para el Sistema de Generación de PDFs
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command, description):
    """Ejecutar comando y mostrar resultado"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completado")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en {description}: {e}")
        print(f"   Salida de error: {e.stderr}")
        return False

def check_python_version():
    """Verificar versión de Python"""
    print("🐍 Verificando versión de Python...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ requerido. Versión actual: {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detectado")
    return True

def create_directories():
    """Crear directorios necesarios"""
    print("📁 Creando directorios del sistema...")
    
    directories = [
        'templates',
        'generated_pdfs',
        'logs'
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"   ✅ Directorio '{directory}' creado/verificado")
    
    return True

def create_virtual_environment():
    """Crear entorno virtual Python"""
    print("🔧 Creando entorno virtual Python...")
    
    if os.path.exists('venv'):
        print("   ℹ️ Entorno virtual ya existe")
        return True
    
    if not run_command('python3 -m venv venv', 'Creando entorno virtual'):
        return False
    
    print("   ✅ Entorno virtual creado")
    return True

def install_dependencies():
    """Instalar dependencias Python"""
    print("📦 Instalando dependencias...")
    
    # Activar entorno virtual
    if os.name == 'nt':  # Windows
        activate_script = 'venv\\Scripts\\activate'
        pip_path = 'venv\\Scripts\\pip'
    else:  # Unix/Linux/macOS
        activate_script = 'venv/bin/activate'
        pip_path = 'venv/bin/pip'
    
    # Instalar dependencias
    if not run_command(f'{pip_path} install -r requirements.txt', 'Instalando dependencias'):
        return False
    
    print("   ✅ Dependencias instaladas")
    return True

def setup_environment_file():
    """Configurar archivo de variables de entorno"""
    print("⚙️ Configurando variables de entorno...")
    
    env_file = '.env'
    env_example = 'env_example.txt'
    
    if os.path.exists(env_file):
        print("   ℹ️ Archivo .env ya existe")
        return True
    
    if not os.path.exists(env_example):
        print("   ❌ Archivo env_example.txt no encontrado")
        return False
    
    # Copiar archivo de ejemplo
    shutil.copy(env_example, env_file)
    print("   ✅ Archivo .env creado desde env_example.txt")
    print("   📝 Edita .env con tus configuraciones específicas")
    
    return True

def create_sample_template():
    """Crear plantilla PDF de ejemplo"""
    print("📄 Creando plantilla PDF de ejemplo...")
    
    template_path = 'templates/FR-GRU-INF-SOL-001.pdf'
    
    if os.path.exists(template_path):
        print("   ℹ️ Plantilla PDF ya existe")
        return True
    
    # Crear PDF de ejemplo usando reportlab
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        c = canvas.Canvas(template_path, pagesize=letter)
        width, height = letter
        
        # Título
        c.setFont("Helvetica-Bold", 16)
        c.drawString(width/2 - 100, height - 50, "FORMATO CONTROL DE ACCESO")
        c.drawString(width/2 - 80, height - 70, "FR-GRU-INF-SOL-001")
        
        # Campos de ejemplo
        c.setFont("Helvetica-Bold", 12)
        y_position = height - 120
        
        fields = [
            ("Usuario Solicitante:", 50, y_position),
            ("Gerente del Usuario:", 50, y_position - 30),
            ("Gerente Responsable:", 50, y_position - 60),
            ("Puesto:", 50, y_position - 90),
            ("Correo:", 50, y_position - 120),
            ("Departamento:", 50, y_position - 150),
            ("Región:", 50, y_position - 180),
            ("Fecha:", 50, y_position - 210),
            ("Justificación:", 50, y_position - 250)
        ]
        
        for label, x, y in fields:
            c.drawString(x, y, label)
        
        # Áreas de firma
        c.setFont("Helvetica", 10)
        c.drawString(100, 200, "Firma Usuario")
        c.drawString(250, 200, "Firma Gerente Usuario")
        c.drawString(400, 200, "Firma Gerente Responsable")
        
        c.save()
        print("   ✅ Plantilla PDF de ejemplo creada")
        return True
        
    except ImportError:
        print("   ⚠️ ReportLab no disponible, saltando creación de plantilla")
        return True
    except Exception as e:
        print(f"   ❌ Error creando plantilla: {e}")
        return False

def test_installation():
    """Probar la instalación"""
    print("🧪 Probando instalación...")
    
    try:
        # Importar módulos principales
        from config import Config
        from models import AccessRequest, Signature
        from esignforms_client import ESignFormsClient
        from pdf_generator import PDFGenerator
        
        print("   ✅ Módulos principales importados correctamente")
        
        # Verificar configuración
        config = Config()
        print(f"   ✅ Configuración cargada: {config.ESIGNFORMS_API_URL}")
        
        print("   ✅ Instalación verificada correctamente")
        return True
        
    except Exception as e:
        print(f"   ❌ Error en prueba de instalación: {e}")
        return False

def show_next_steps():
    """Mostrar próximos pasos"""
    print("\n" + "="*60)
    print("🎉 ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!")
    print("="*60)
    
    print("\n📋 PRÓXIMOS PASOS:")
    print("1. 🔧 Edita el archivo .env con tu configuración")
    print("2. 📄 Coloca tu plantilla PDF en templates/FR-GRU-INF-SOL-001.pdf")
    print("3. 🚀 Ejecuta el sistema: python main.py")
    print("4. 🌐 O inicia el servidor API: python api_server.py")
    
    print("\n📚 DOCUMENTACIÓN:")
    print("   • README.md - Guía completa del sistema")
    print("   • config.py - Configuración de coordenadas PDF")
    print("   • .env - Variables de entorno")
    
    print("\n🔍 COMANDOS ÚTILES:")
    print("   • python main.py --help")
    print("   • python main.py --stats")
    print("   • python main.py --auto")
    
    print("\n📞 SOPORTE:")
    print("   • Revisa los logs en logs/")
    print("   • Verifica la configuración en .env")
    print("   • Consulta la documentación en README.md")
    
    print("="*60)

def main():
    """Función principal de instalación"""
    print("🚀 INSTALADOR DEL SISTEMA DE GENERACIÓN DE PDFs")
    print("   Formato Control de Acceso (FR-GRU-INF-SOL-001)")
    print("="*60)
    
    # Verificar Python
    if not check_python_version():
        sys.exit(1)
    
    # Crear directorios
    if not create_directories():
        sys.exit(1)
    
    # Crear entorno virtual
    if not create_virtual_environment():
        sys.exit(1)
    
    # Instalar dependencias
    if not install_dependencies():
        sys.exit(1)
    
    # Configurar variables de entorno
    if not setup_environment_file():
        sys.exit(1)
    
    # Crear plantilla de ejemplo
    if not create_sample_template():
        print("   ⚠️ Continuando sin plantilla de ejemplo")
    
    # Probar instalación
    if not test_installation():
        sys.exit(1)
    
    # Mostrar próximos pasos
    show_next_steps()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Instalación interrumpida por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error durante la instalación: {e}")
        sys.exit(1)
