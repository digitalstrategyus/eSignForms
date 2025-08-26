# 🖋️ eSignForms - Plataforma de Gestión de Solicitudes de Acceso DevSecOps

## 📋 Descripción

**eSignForms** es una plataforma web moderna y profesional para la gestión de nuevas solicitudes de acceso DevSecOps con firma electrónica avanzada. Desarrollada para el **Digital Government Access Mobility ADO**, esta aplicación permite la captura, gestión y firma digital de solicitudes de acceso con un flujo de trabajo completamente digitalizado.

## ✨ Características Principales

### 🔐 **Gestión de Firmas Digitales**
- **Firmas vectoriales SVG** - Calidad perfecta sin pixelado
- **Captura asíncrona** - Cada usuario puede firmar independientemente
- **Validación de roles** - Gerente Responsable, Gerente del Usuario, Usuario Solicitante
- **Historial de firmas** - Seguimiento completo del estado de cada solicitud

### 📄 **Generación Automática de PDFs**
- **Formato estándar** FR-GRU-INF-SOL-001
- **Campos automáticos** - Todos los datos se insertan automáticamente
- **Firmas embebidas** - Las firmas SVG se integran vectorialmente
- **Diseño profesional** - Layout corporativo con secciones organizadas

### 🎨 **Interfaz de Usuario Moderna**
- **Design System completo** - CSS variables para consistencia visual
- **Responsive design** - Funciona en todos los dispositivos
- **UX optimizada** - Flujo de trabajo intuitivo y eficiente
- **Tema corporativo** - Colores y estilos del gobierno digital

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 18** - Framework principal con hooks modernos
- **TypeScript** - Tipado estático para mayor robustez
- **CSS3** - Sistema de diseño con variables CSS
- **HTML5 Canvas** - Captura de firmas digitales

### **Generación de PDFs**
- **jsPDF** - Generación de PDFs del lado del cliente
- **svg2pdf.js** - Conversión de firmas SVG a PDF vectorial
- **jspdf-autotable** - Creación de tablas en PDFs

### **Persistencia de Datos**
- **localStorage** - Almacenamiento local del lado del cliente
- **Estado React** - Gestión de estado con hooks personalizados

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm 9+ o yarn

### **Instalación**
```bash
# Clonar el repositorio
git clone https://github.com/digitalstrategyus/eSignForms.git
cd eSignForms

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start
```

### **Scripts Disponibles**
```bash
npm start          # Inicia la aplicación en modo desarrollo
npm run build      # Construye la aplicación para producción
npm test           # Ejecuta las pruebas
npm run eject      # Expone la configuración de webpack (irreversible)
```

## 📱 Uso de la Aplicación

### **1. Crear Nueva Solicitud**
- Llena el formulario con los datos del solicitante
- Incluye información del gerente del usuario y gerente responsable
- Agrega la justificación del acceso requerido

### **2. Proceso de Firmas**
- **Usuario Solicitante** - Firma la solicitud inicial
- **Gerente del Usuario** - Aprueba la solicitud del usuario
- **Gerente Responsable** - Aprobación final y autorización

### **3. Generación de PDF**
- Una vez completadas todas las firmas
- El sistema genera automáticamente el PDF del Control de Acceso
- Incluye todos los datos y firmas vectoriales embebidas

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/           # Componentes React reutilizables
│   ├── DocumentUploader.tsx      # Formulario de nueva solicitud
│   ├── DocumentViewer.tsx        # Visualización de documentos
│   ├── SignatureManager.tsx      # Gestión de firmas
│   ├── IndividualSignaturePad.tsx # Captura de firma individual
│   └── HistoryManager.tsx        # Historial de solicitudes
├── pdf-services/         # Servicios de generación de PDFs
│   ├── pdfGenerator.ts           # Lógica principal de generación
│   ├── usePDFGenerator.ts        # Hook personalizado para PDFs
│   ├── PDFGeneratorButton.tsx    # Botón de generación
│   └── types.ts                  # Interfaces TypeScript
├── services/             # Servicios de la aplicación
│   └── storageService.ts         # Persistencia en localStorage
└── styles/               # Sistema de diseño
    └── design-system.css         # Variables CSS y estilos base
```

## 🔧 Configuración Avanzada

### **Variables de Entorno**
```bash
REACT_APP_TITLE=Digital Government Access Mobility ADO
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

### **Personalización de Estilos**
El sistema de diseño utiliza variables CSS que se pueden personalizar en `src/styles/design-system.css`:

```css
:root {
  --primary-color: #007BFF;
  --secondary-color: #6C757D;
  --success-color: #28A745;
  --warning-color: #FFC107;
  --danger-color: #DC3545;
  --font-family: 'Helvetica Neue', Arial, sans-serif;
}
```

## 📊 Estado del Proyecto

### **✅ Funcionalidades Completadas**
- [x] Sistema de captura de firmas digitales
- [x] Generación automática de PDFs
- [x] Gestión de solicitudes de acceso
- [x] Interfaz de usuario moderna y responsive
- [x] Persistencia de datos local
- [x] Firmas vectoriales SVG sin pixelado
- [x] Formato estándar FR-GRU-INF-SOL-001

### **🚧 En Desarrollo**
- [ ] Integración con bases de datos externas
- [ ] Sistema de notificaciones por email
- [ ] API REST para integración con otros sistemas
- [ ] Autenticación y autorización avanzada

### **📋 Roadmap Futuro**
- [ ] Aplicación móvil nativa
- [ ] Integración con sistemas de gobierno
- [ ] Auditoría y logs de seguridad
- [ ] Múltiples formatos de documento

## 🤝 Contribución

### **Cómo Contribuir**
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### **Estándares de Código**
- Usa TypeScript para todo el código nuevo
- Sigue las convenciones de React y hooks
- Mantén la consistencia con el sistema de diseño
- Escribe tests para nuevas funcionalidades

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Organización**: Digital Strategy US
- **Proyecto**: Digital Government Access Mobility ADO

## 📞 Contacto

- **GitHub**: [@digitalstrategyus](https://github.com/digitalstrategyus)
- **Email**: [tu-email@ejemplo.com]
- **Proyecto**: [https://github.com/digitalstrategyus/eSignForms](https://github.com/digitalstrategyus/eSignForms)

## 🙏 Agradecimientos

- React Team por el framework excepcional
- jsPDF por la generación de PDFs del lado del cliente
- svg2pdf.js por la conversión vectorial de firmas
- Comunidad de desarrolladores por las librerías de código abierto

---

**⭐ Si este proyecto te es útil, por favor dale una estrella en GitHub!**
