# 30X Investor Match - Portal de Gestión

Portal de gestión para visualizar y administrar contactos de inversores y fundadores.

## 🚀 Tecnologías Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Material UI (MUI)** - Biblioteca de componentes UI
- **TanStack Query (React Query)** - Gestión de estado del servidor
- **Axios** - Cliente HTTP
- **React Router DOM** - Enrutamiento (listo para escalar)

## 📁 Estructura del Proyecto

```
src/
├── api/                    # Configuración de API y servicios
│   ├── axios.config.ts    # Configuración base de Axios
│   └── contacts.api.ts    # Endpoints de contactos
├── components/            # Componentes reutilizables
│   ├── Sidebar.tsx       # Menú lateral de navegación
│   └── ContactsTable.tsx # Tabla de contactos con paginación
├── hooks/                # Custom hooks
│   └── useContacts.ts   # Hook para gestionar contactos con React Query
├── layouts/              # Layouts de la aplicación
│   └── MainLayout.tsx   # Layout principal con sidebar
├── pages/               # Páginas/vistas
│   └── ContactsPage.tsx # Página de contactos
├── types/               # Definiciones de TypeScript
│   └── contact.types.ts # Tipos para contactos y API
└── App.tsx             # Componente raíz con providers
```

## 🎨 Características

### ✅ Implementadas

- **Tabla Responsive** con Material UI
  - Paginación del lado del servidor
  - Visualización de datos complejos con badges
  - Tooltips para arrays con múltiples valores
  - Diseño adaptativo para mobile y desktop

- **Sidebar Profesional**
  - Responsive con drawer para móviles
  - Diseño moderno con logo personalizado
  - Preparado para agregar más módulos

- **Arquitectura Escalable**
  - Separación de capas (API, Hooks, Components, Types)
  - Configuración centralizada de Axios
  - React Query para caché y gestión de estado del servidor
  - TypeScript para type safety

- **UI/UX Moderna**
  - Tema personalizado de Material UI
  - Gradientes y colores profesionales
  - Componentes con bordes redondeados
  - Loading states y error handling

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de producción
npm run preview
```

## 📊 API

El proyecto consume la API de Investor Match:

**Endpoint Base:** `https://investor-match-api-23715448976.us-east1.run.app/v1`

### Endpoints Disponibles

```typescript
GET /contacts?limit=10&startAfter=0
```

## 🔧 Configuración

### Axios Client

La configuración de Axios se encuentra en `src/api/axios.config.ts` y permite:
- Interceptores de request/response
- Manejo global de errores
- Headers por defecto
- Timeout configurado
- Fácil integración de autenticación

### React Query

Configurado con:
- Stale time de 5 minutos
- Retry en 1 intento
- Sin refetch automático en window focus

## 📱 Responsive Design

La aplicación es completamente responsive:
- **Desktop:** Sidebar permanente visible
- **Tablet/Mobile:** Sidebar colapsable con botón hamburguesa
- **Tabla:** Scroll horizontal en pantallas pequeñas

## 🎯 Próximas Mejoras

- [ ] Filtros avanzados para la tabla
- [ ] Búsqueda de contactos
- [ ] Vista de detalle de contacto
- [ ] Exportación de datos (CSV/Excel)
- [ ] Autenticación y autorización
- [ ] Dashboard con estadísticas
- [ ] Más módulos en el sidebar

## 👨‍💻 Desarrollo

### Agregar Nuevos Endpoints

1. Definir tipos en `src/types/`
2. Crear servicio en `src/api/`
3. Crear custom hook en `src/hooks/`
4. Usar en componentes

### Agregar Nuevas Páginas

1. Crear componente en `src/pages/`
2. Agregar ítem en Sidebar
3. Configurar ruta (cuando se implemente routing)

## 📄 Licencia

MIT

---

Desarrollado con ❤️ para 30X Venture Capital
