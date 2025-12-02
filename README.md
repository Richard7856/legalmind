# 🏛️ LegalMind - Simulador de Juicios con IA

<div align="center">

**Plataforma inteligente de simulación de juicios para la formación de abogados**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
[![AI SDK](https://img.shields.io/badge/AI_SDK-5.0-purple)](https://sdk.vercel.ai/)

</div>

---

## 📋 Descripción

**LegalMind** es una plataforma de simulación de juicios impulsada por inteligencia artificial que permite a estudiantes y profesionales del derecho practicar sus habilidades litigantes en un entorno realista y controlado.

El sistema simula audiencias judiciales completas con interacciones en tiempo real entre diferentes actores procesales (jueces, fiscales, testigos, etc.), proporcionando una experiencia inmersiva de aprendizaje sin los riesgos y costos asociados a la práctica real.

### 🎯 Características Principales

- **🤖 Simulación con IA**: Jueces, fiscales y testigos impulsados por inteligencia artificial que responden de manera realista
- **⚖️ Múltiples Materias**: Soporte para casos penales, laborales, civiles y más
- **📝 Casos Predefinidos y Personalizados**: Casos listos para practicar o crea tus propios escenarios
- **📊 Seguimiento en Tiempo Real**: Monitoreo de evidencias presentadas, testimonios y eventos del juicio
- **💬 Chat Interactivo**: Comunicación fluida con streaming de respuestas en tiempo real
- **📈 Historial de Casos**: Guarda y revisa tus simulaciones anteriores
- **🔐 Autenticación Segura**: Sistema de usuarios con Supabase Auth

---

## 🛠️ Stack Tecnológico

### Frontend
- **[Next.js 16](https://nextjs.org/)** - Framework React con App Router y Turbopack
- **[React 19](https://react.dev/)** - Biblioteca de interfaz de usuario
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Lucide Icons](https://lucide.dev/)** - Iconos SVG modernos

### Backend & Database
- **[Prisma](https://www.prisma.io/)** - ORM moderno para TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional
- **[Supabase](https://supabase.com/)** - Backend as a Service (Auth + DB)

### Inteligencia Artificial
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - Framework para aplicaciones con IA
- **[OpenAI](https://openai.com/)** - Modelo de lenguaje para simulaciones

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18.x o superior
- **npm** o **yarn**
- Cuenta en **[Supabase](https://supabase.com/)**
- API Key de **[OpenAI](https://platform.openai.com/)**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/legalmind.git
cd legalmind
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/legalmind"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="tu-url-de-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"

# OpenAI
OPENAI_API_KEY="tu-api-key-de-openai"
```

### 4. Configurar la Base de Datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Abrir Prisma Studio para visualizar datos
npm run db:studio
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del Proyecto

```
legalmind/
├── prisma/
│   └── schema.prisma        # Esquema de base de datos
├── src/
│   ├── app/                 # App Router de Next.js
│   │   ├── api/            # API Routes
│   │   ├── dashboard/      # Panel de usuario
│   │   ├── create-case/    # Creación de casos
│   │   ├── login/          # Autenticación
│   │   └── register/       # Registro
│   ├── components/         # Componentes React
│   │   ├── simulation/     # Componentes de simulación
│   │   ├── ui/            # Componentes UI reutilizables
│   │   └── auth/          # Componentes de autenticación
│   └── lib/               # Utilidades y configuración
│       ├── actions.ts     # Server Actions
│       ├── prisma.ts      # Cliente de Prisma
│       ├── auth.ts        # Utilidades de auth
│       └── utils.ts       # Helpers generales
├── public/                # Archivos estáticos
└── package.json          # Dependencias
```

---

## 🎮 Uso de la Plataforma

### 1. **Registro e Inicio de Sesión**
   - Crea una cuenta con tu email
   - Inicia sesión con Supabase Auth

### 2. **Seleccionar un Caso**
   - Elige entre casos predefinidos (Penal, Laboral)
   - O crea tu propio caso personalizado con IA

### 3. **Iniciar Simulación**
   - La audiencia comienza automáticamente
   - El secretario presenta el caso
   - El juez proporciona un resumen

### 4. **Participar en el Juicio**
   - Responde a las preguntas del juez
   - Presenta tus alegatos
   - Interroga testigos
   - Presenta evidencias
   - Realiza objeciones

### 5. **Revisar Resultados**
   - Consulta el historial de casos
   - Revisa tus argumentos anteriores
   - Aprende de cada simulación

---

## 🧩 Funcionalidades Clave

### Sistema de Simulación Inteligente

El corazón de LegalMind es su engine de simulación que:

- **Mantiene el contexto completo** del caso durante toda la audiencia
- **Coordina múltiples actores** (Juez, Fiscal, Testigos, etc.)
- **Detecta automáticamente** el turno del usuario vs. continuación automática de la IA
- **Previene duplicaciones** mediante un sistema robusto de inicialización única
- **Extrae información clave** como evidencias presentadas, testimonios y eventos procesales

### Fases del Juicio

1. **Presentación** - Introducción de las partes y contexto del caso
2. **Apertura** - Alegatos iniciales de ambas partes
3. **Juicio** - Presentación de evidencias y testimonios
4. **Cierre** - Alegatos finales
5. **Sentencia** - Veredicto del juez

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar servidor de desarrollo

# Producción
npm run build        # Crear build de producción
npm start            # Ejecutar servidor de producción

# Base de Datos
npm run db:studio    # Abrir Prisma Studio

# Linting
npm run lint         # Ejecutar ESLint
```

---

## 🏗️ Arquitectura

### Flujo de Datos

```
Usuario → Next.js App Router → API Routes → Prisma → PostgreSQL
                                    ↓
                            Vercel AI SDK → OpenAI
```

### Componentes Principales

1. **SimulationView** - Motor principal de la simulación
2. **CaseIntakeView** - Formulario de creación de casos con IA
3. **Server Actions** - Operaciones del servidor (saveMessage, acceptCase, etc.)
4. **API Chat Route** - Endpoint de streaming para comunicación con IA

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Roadmap

- [ ] Sistema de evaluación y scoring automático
- [ ] Soporte para más materias legales (Mercantil, Administrativo)
- [ ] Grabación de audio/video de las simulaciones
- [ ] Análisis de rendimiento con métricas detalladas
- [ ] Modo multijugador (varios abogados en un caso)
- [ ] Exportación de transcripciones en PDF
- [ ] Integración con legislación actualizada

---

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.

---

## 👥 Equipo

Desarrollado con ❤️ por el equipo de LegalMind

---

## 📞 Contacto

Para preguntas o soporte:
- Email: soporte@legalmind.com
- Website: [www.legalmind.com](https://legalmind.com)

---

<div align="center">

**⚖️ Practica. Aprende. Domina el litigio. ⚖️**

</div>
