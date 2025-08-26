# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a **eSignForms**! Este documento te guiará a través del proceso de contribución.

## 📋 Tabla de Contenidos

- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Features](#solicitar-features)

## 🚀 Cómo Contribuir

### **1. Fork del Repositorio**
1. Ve a [https://github.com/digitalstrategyus/eSignForms](https://github.com/digitalstrategyus/eSignForms)
2. Haz clic en el botón "Fork" en la esquina superior derecha
3. Esto creará una copia del repositorio en tu cuenta de GitHub

### **2. Clonar tu Fork**
```bash
git clone https://github.com/TU_USUARIO/eSignForms.git
cd eSignForms
```

### **3. Configurar el Remote Upstream**
```bash
git remote add upstream https://github.com/digitalstrategyus/eSignForms.git
git fetch upstream
```

### **4. Crear una Rama para tu Feature**
```bash
git checkout -b feature/nombre-de-tu-feature
```

## ⚙️ Configuración del Entorno

### **Prerrequisitos**
- Node.js 18+ 
- npm 9+ o yarn
- Git

### **Instalación**
```bash
# Instalar dependencias
npm install

# Verificar que todo funcione
npm start
```

### **Scripts Disponibles**
```bash
npm start          # Desarrollo local
npm run build      # Build de producción
npm test           # Ejecutar tests
npm run lint       # Verificar código
npx tsc --noEmit   # Verificar tipos TypeScript
```

## 📝 Estándares de Código

### **TypeScript**
- Usa TypeScript para todo el código nuevo
- Define interfaces claras para props y estado
- Evita `any` - usa tipos específicos
- Documenta funciones complejas con JSDoc

### **React**
- Usa hooks modernos (useState, useEffect, useCallback, etc.)
- Componentes funcionales con TypeScript
- Props tipadas con interfaces
- Nombres descriptivos para componentes y funciones

### **CSS**
- Usa variables CSS del sistema de diseño
- Clases BEM para componentes específicos
- Responsive design por defecto
- Accesibilidad (contraste, focus, etc.)

### **Git**
- Commits descriptivos en español
- Una feature por rama
- Rebase antes de hacer merge
- Mensajes de commit claros

## 🔄 Proceso de Pull Request

### **1. Desarrollar tu Feature**
```bash
# Hacer cambios en tu rama
git add .
git commit -m "✨ Agregar nueva funcionalidad X

- Descripción de los cambios
- Beneficios de la implementación
- Tests incluidos"
```

### **2. Mantener tu Rama Actualizada**
```bash
git fetch upstream
git rebase upstream/development
```

### **3. Crear el Pull Request**
1. Ve a tu fork en GitHub
2. Haz clic en "New Pull Request"
3. Selecciona `development` como base
4. Describe tus cambios detalladamente
5. Incluye capturas de pantalla si es necesario

### **4. Template del Pull Request**
```markdown
## 📋 Descripción
Breve descripción de los cambios realizados.

## 🎯 Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Mejora de performance
- [ ] Refactoring
- [ ] Documentación

## ✅ Checklist
- [ ] Código sigue los estándares del proyecto
- [ ] Tests pasan localmente
- [ ] Documentación actualizada
- [ ] No hay console.logs o código de debug
- [ ] Responsive design verificado

## 🧪 Tests
Describe los tests que agregaste o modificaste.

## 📱 Screenshots
Si aplica, incluye capturas de pantalla de los cambios.

## 🔍 Revisión
- [ ] Código revisado por mí mismo
- [ ] Funcionalidad probada localmente
```

## 🐛 Reportar Bugs

### **Usa la Plantilla de Bug Report**
1. Ve a [Issues](https://github.com/digitalstrategyus/eSignForms/issues)
2. Haz clic en "New Issue"
3. Selecciona "Bug report"
4. Completa toda la información solicitada

### **Información Requerida**
- Descripción clara del bug
- Pasos para reproducir
- Comportamiento esperado vs actual
- Entorno (OS, navegador, versión)
- Capturas de pantalla si es posible

## 💡 Solicitar Features

### **Usa la Plantilla de Feature Request**
1. Ve a [Issues](https://github.com/digitalstrategyus/eSignForms/issues)
2. Haz clic en "New Issue"
3. Selecciona "Feature request"
4. Describe la funcionalidad deseada

### **Información Requerida**
- Problema que resuelve la feature
- Solución propuesta
- Alternativas consideradas
- Impacto en usuarios existentes

## 🏗️ Estructura del Proyecto

```
src/
├── components/           # Componentes React
├── pdf-services/         # Servicios de PDF
├── services/             # Servicios generales
├── styles/               # Sistema de diseño
└── types/                # Tipos TypeScript
```

## 🔧 Herramientas de Desarrollo

### **VS Code Extensions Recomendadas**
- TypeScript Importer
- Prettier
- ESLint
- GitLens
- Auto Rename Tag

### **Configuración de Prettier**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 📚 Recursos Útiles

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🆘 ¿Necesitas Ayuda?

- **Issues**: [GitHub Issues](https://github.com/digitalstrategyus/eSignForms/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/digitalstrategyus/eSignForms/discussions)
- **Documentación**: [README.md](./README.md)

## 🙏 Agradecimientos

¡Gracias por contribuir a hacer **eSignForms** mejor para todos! Tu contribución es valiosa para la comunidad.

---

**¿Listo para contribuir? ¡Empieza con un issue o fork del repositorio!** 🚀
