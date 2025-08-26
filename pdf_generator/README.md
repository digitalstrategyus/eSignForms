# 🚀 Sistema de Generación Automática de PDFs para eSignForms

Sistema completo que automatiza la generación del formato **Control de Acceso (FR-GRU-INF-SOL-001)** en PDF, integrado con eSignForms para capturar datos y firmas digitales.

## 🎯 **Funcionalidades Principales**

### **1. Integración Automática con eSignForms**
- ✅ Conecta automáticamente con la API de eSignForms
- ✅ Detecta solicitudes completas (con todas las firmas)
- ✅ Extrae datos y firmas digitales automáticamente

### **2. Generación Inteligente de PDFs**
- ✅ Rellena plantilla PDF existente o crea desde cero
- ✅ Inserta datos en coordenadas específicas
- ✅ Embebe firmas digitales con timestamp
- ✅ Genera PDF final listo para distribución

### **3. Flujo de Trabajo Automatizado**
- ✅ Monitoreo continuo de solicitudes
- ✅ Procesamiento automático cuando se completan
- ✅ Actualización de estado en eSignForms
- ✅ Almacenamiento organizado de PDFs generados

## 🏗️ **Arquitectura del Sistema**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   eSignForms    │    │  PDF Generator   │    │   PDF Output    │
│   (Frontend)    │◄──►│   (Backend)      │───►│   Repository    │
│                 │    │                  │    │                 │
│ • Solicitudes   │    │ • API Server     │    │ • PDFs Finales  │
│ • Firmas        │    │ • PDF Engine     │    │ • Metadatos     │
│ • Datos         │    │ • Integration    │    │ • Logs          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 **Requisitos del Sistema**

### **Software Requerido**
- **Python 3.8+**
- **Node.js 16+** (para eSignForms)
- **Git**

### **Dependencias Python**
- `PyPDF2` - Manipulación de PDFs
- `reportlab` - Generación de PDFs
- `Pillow` - Procesamiento de imágenes
- `Flask` - Servidor API
- `requests` - Cliente HTTP

## 🚀 **Instalación y Configuración**

### **1. Clonar el Proyecto**
```bash
git clone <repository-url>
cd pdf_generator
```

### **2. Crear Entorno Virtual**
```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### **3. Instalar Dependencias**
```bash
pip install -r requirements.txt
```

### **4. Configurar Variables de Entorno**
```bash
cp env_example.txt .env
# Editar .env con tus configuraciones
```

### **5. Preparar Directorios**
```bash
mkdir -p templates generated_pdfs logs
```

### **6. Colocar Plantilla PDF**
```bash
# Copiar tu plantilla FR-GRU-INF-SOL-001.pdf a templates/
cp /path/to/your/template.pdf templates/FR-GRU-INF-SOL-001.pdf
```

## ⚙️ **Configuración**

### **Archivo de Configuración (.env)**
```bash
# Conexión a eSignForms
ESIGNFORMS_API_URL=http://localhost:3000
ESIGNFORMS_API_KEY=your_api_key_here

# Rutas de PDF
PDF_TEMPLATE_PATH=templates/FR-GRU-INF-SOL-001.pdf
PDF_OUTPUT_DIR=generated_pdfs/

# Servidor API
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=True

# Logging
LOG_LEVEL=INFO
LOG_FILE=pdf_generator.log
```

### **Coordenadas de Campos PDF**
Edita `config.py` para ajustar las coordenadas de tu plantilla:

```python
PDF_FIELD_COORDINATES = {
    'usuario_solicitante': {'x': 150, 'y': 700, 'width': 200, 'height': 20},
    'gerente_usuario': {'x': 150, 'y': 650, 'width': 200, 'height': 20},
    'gerente_responsable': {'x': 150, 'y': 600, 'width': 200, 'height': 20},
    # ... más campos
}
```

## 🎮 **Uso del Sistema**

### **1. Modo Interactivo (Recomendado para pruebas)**
```bash
python main.py
# o
python main.py --interactive
```

### **2. Modo Automático**
```bash
python main.py --auto
```

### **3. Procesar Solicitud Específica**
```bash
python main.py --request-id "12345"
```

### **4. Ver Estadísticas**
```bash
python main.py --stats
```

### **5. Servidor API**
```bash
python api_server.py
```

## 🔌 **API Endpoints**

### **Verificar Salud del Sistema**
```bash
GET /health
```

### **Obtener Solicitudes de Acceso**
```bash
GET /api/access-requests
GET /api/access-requests/<id>
GET /api/access-requests/completed
```

### **Generar PDFs**
```bash
POST /api/access-requests/<id>/generate-pdf
POST /api/access-requests/batch-generate-pdf
POST /api/auto-generate-pdfs
```

### **Descargar PDFs**
```bash
GET /api/download-pdf/<filename>
```

### **Estadísticas**
```bash
GET /api/statistics
```

## 📊 **Flujo de Trabajo Automatizado**

### **1. Monitoreo Continuo**
- El sistema verifica constantemente eSignForms
- Detecta solicitudes completas automáticamente

### **2. Procesamiento Automático**
- Extrae datos y firmas de la solicitud
- Genera PDF con información completa
- Embebe firmas digitales en posiciones correctas

### **3. Integración con eSignForms**
- Actualiza estado de la solicitud
- Marca PDF como generado
- Registra timestamp de generación

### **4. Almacenamiento Organizado**
- PDFs se guardan con nomenclatura estándar
- Metadatos de cada generación
- Logs detallados del proceso

## 🔧 **Personalización**

### **Agregar Nuevos Campos**
1. Editar `models.py` para agregar campos
2. Actualizar `config.py` con coordenadas
3. Modificar `pdf_generator.py` para mapear datos

### **Cambiar Formato de PDF**
1. Reemplazar plantilla en `templates/`
2. Ajustar coordenadas en `config.py`
3. Modificar lógica de generación si es necesario

### **Integrar con Otros Sistemas**
- El sistema está diseñado modularmente
- Fácil agregar nuevos clientes de datos
- APIs REST estándar para integración

## 📁 **Estructura de Archivos**

```
pdf_generator/
├── 📁 templates/                 # Plantillas PDF
├── 📁 generated_pdfs/            # PDFs generados
├── 📁 logs/                      # Archivos de log
├── 📄 config.py                  # Configuración del sistema
├── 📄 models.py                  # Modelos de datos
├── 📄 esignforms_client.py       # Cliente de eSignForms
├── 📄 pdf_generator.py           # Motor de generación
├── 📄 api_server.py              # Servidor API Flask
├── 📄 main.py                    # Script principal
├── 📄 requirements.txt           # Dependencias Python
├── 📄 env_example.txt            # Variables de entorno
└── 📄 README.md                  # Esta documentación
```

## 🚨 **Solución de Problemas**

### **Error de Conexión con eSignForms**
```bash
# Verificar que eSignForms esté ejecutándose
curl http://localhost:3000/health

# Verificar configuración en .env
ESIGNFORMS_API_URL=http://localhost:3000
```

### **Error de Generación de PDF**
```bash
# Verificar permisos de directorios
chmod 755 generated_pdfs/
chmod 644 templates/*.pdf

# Verificar dependencias Python
pip install --upgrade PyPDF2 reportlab Pillow
```

### **Error de Coordenadas PDF**
- Ajustar coordenadas en `config.py`
- Usar herramienta de medición de PDF
- Probar con coordenadas de ejemplo

## 🔒 **Seguridad y Privacidad**

- **Datos locales**: Los PDFs se generan localmente
- **Sin almacenamiento externo**: No se envían datos a servidores externos
- **Logs seguros**: Solo información de proceso, no datos sensibles
- **Validación de entrada**: Verificación de datos antes de procesar

## 📈 **Monitoreo y Logs**

### **Archivos de Log**
- `pdf_generator.log` - Log principal del sistema
- Logs de Flask para API
- Logs de errores y excepciones

### **Métricas Disponibles**
- Total de solicitudes procesadas
- Tasa de éxito de generación
- Tiempo promedio de procesamiento
- Estado de conexión con eSignForms

## 🤝 **Contribución y Soporte**

### **Reportar Bugs**
- Crear issue con descripción detallada
- Incluir logs de error
- Especificar versión y configuración

### **Sugerir Mejoras**
- Describir funcionalidad deseada
- Proponer implementación
- Contribuir con código

### **Soporte Técnico**
- Revisar documentación
- Verificar configuración
- Consultar logs del sistema

## 📄 **Licencia**

Este proyecto está disponible para uso educativo y comercial.

---

## 🎉 **¡Comienza a Usar el Sistema!**

1. **Instala** las dependencias
2. **Configura** tu entorno
3. **Ejecuta** en modo interactivo
4. **Personaliza** según tus necesidades
5. **Automatiza** tu flujo de trabajo

**¡Transforma tu proceso de solicitudes de acceso con automatización inteligente!** 🚀
