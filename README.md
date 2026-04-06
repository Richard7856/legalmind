# LegalMind — Simulador de Juicios con IA

**Plataforma de simulación de juicios impulsada por inteligencia artificial para la formación de abogados.**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
[![AI SDK](https://img.shields.io/badge/AI_SDK-5.0-purple)](https://sdk.vercel.ai/)

---

## Descripción

LegalMind permite a estudiantes y profesionales del derecho practicar habilidades litigantes en un entorno realista. El sistema simula audiencias judiciales completas con interacciones en tiempo real entre actores procesales (jueces, fiscales, testigos), proporcionando una experiencia inmersiva sin los riesgos y costos de la práctica real.

**Demo en producción:** [legalmind.com.mx](https://legalmind.com.mx) (simulador requiere cuenta)

### Características principales

- **Simulación con IA** — Jueces, fiscales y testigos que responden de manera realista usando LLMs
- **Múltiples materias** — Casos penales, laborales, civiles y más
- **Casos predefinidos y personalizados** — Casos listos para practicar o escenarios generados con IA
- **Chat interactivo** — Comunicación con streaming de respuestas en tiempo real
- **Seguimiento del juicio** — Monitoreo de evidencias, testimonios y eventos procesales
- **Historial de casos** — Guarda y revisa simulaciones anteriores

---

## Stack técnico

**Frontend:** Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS

**Backend & DB:** Prisma ORM, PostgreSQL, Supabase (Auth + DB)

**IA:** Vercel AI SDK, OpenAI

---

## Cómo funciona

### Fases del juicio simulado

1. **Presentación** — Introducción de las partes y contexto del caso
2. **Apertura** — Alegatos iniciales de ambas partes
3. **Juicio** — Presentación de evidencias y testimonios
4. **Cierre** — Alegatos finales
5. **Sentencia** — Veredicto del juez

El motor de simulación mantiene el contexto completo del caso, coordina múltiples actores con IA, detecta automáticamente turnos del usuario vs. continuación automática, y extrae información clave (evidencias, testimonios, eventos procesales).

---

## Arquitectura

```
Usuario → Next.js App Router → API Routes → Prisma → PostgreSQL
                                    ↓
                            Vercel AI SDK → OpenAI
```

### Estructura del proyecto

```
legalmind/
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── src/
│   ├── app/                   # App Router (pages + API routes)
│   │   ├── api/               # API Routes (chat streaming)
│   │   ├── dashboard/         # Panel de usuario
│   │   ├── create-case/       # Creación de casos con IA
│   │   └── login/             # Autenticación
│   ├── components/
│   │   ├── simulation/        # Motor de simulación
│   │   ├── ui/                # Componentes reutilizables
│   │   └── auth/              # Autenticación
│   └── lib/
│       ├── actions.ts         # Server Actions
│       ├── prisma.ts          # Cliente Prisma
│       └── auth.ts            # Utilidades de auth
└── public/                    # Archivos estáticos
```

---

## Instalación

### Prerrequisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com/)
- API Key de [OpenAI](https://platform.openai.com/)

### Setup

```bash
# Clonar e instalar
git clone https://github.com/Richard7856/legalmind.git
cd legalmind
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (Supabase, OpenAI, DB)

# Base de datos
npx prisma generate
npx prisma migrate deploy

# Ejecutar
npm run dev
```

### Variables de entorno

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/legalmind"
NEXT_PUBLIC_SUPABASE_URL="tu-url-de-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
OPENAI_API_KEY="tu-api-key"
```

---

## Roadmap

- Sistema de evaluación y scoring automático
- Más materias legales (mercantil, administrativo)
- Análisis de rendimiento con métricas detalladas
- Modo multijugador (varios abogados en un caso)
- Exportación de transcripciones en PDF
- Integración con legislación actualizada

---

## Equipo

Proyecto co-fundado y en desarrollo activo.

**Contacto:** [legalmind.com.mx](https://legalmind.com.mx) · contacto@legalmind.com.mx · [LinkedIn](https://linkedin.com/in/richard-figueroaluna)

---

## Licencia

Todos los derechos reservados.
