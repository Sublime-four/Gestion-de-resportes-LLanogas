# Plataforma de Gestión de Reportes Regulatorios (LLANOGAS)

Sistema web corporativo para la **consolidación, trazabilidad y seguimiento** de los reportes a entidades de control
(SUI, Superservicios, etc.), incluyendo calendario, alertas, panel de control e histórico de cumplimiento.

> Proyecto serio, entorno serio. Aquí no vive el código de juguete.

---

## 🎯 Objetivo del proyecto

Centralizar en una sola plataforma:

- Todos los **reportes regulatorios** (nombre, entidad, frecuencia, base legal, responsable, etc.).
- El **cumplimiento de plazos** (vencimientos, recordatorios, retrasos).
- El **estado operativo** de cada obligación (pendiente, en proceso, enviado, vencido).
- El **histórico y evidencias** (archivos enviados y soportes de envío).
- Los **indicadores clave de desempeño (KPIs)** para la dirección:
  - % de reportes enviados a tiempo  
  - Reportes vencidos  
  - Reportes enviados tarde  
  - Días promedio de retraso  
  - Cumplimiento por entidad y por responsable

---

## 🏗 Arquitectura general

Arquitectura por capas, pensada para entorno corporativo:

- **Frontend:**  
  - React + Vite  
  - Tailwind CSS  
  - Autenticación vía JWT  
  - Calendario interactivo (estilo Google Calendar)  
  - Dashboard con gráficos de cumplimiento

- **Backend (API REST):**  
  - Node.js + NestJS  
  - ORM: Prisma  
  - Autenticación y autorización por roles  
  - Servicios:
    - Gestión de entidades de control  
    - Gestión de obligaciones de reporte y periodos  
    - Motor de alertas y notificaciones  
    - Integración con Google Drive (link de archivos)  
    - Módulo de usuarios y roles

- **Base de Datos:**  
  - PostgreSQL  
  - Modelo relacional para:
    - Entidades  
    - Reportes  
    - Periodos (instancias de envío)  
    - Usuarios y roles  
    - Alertas y notificaciones  
    - Registros de auditoría

- **Almacenamiento de archivos:**  
  - Google Drive (vía API)  
  - La BD almacena únicamente el **link** al archivo/evidencia.

- **Infraestructura:**  
  - Contenedores Docker (opcional pero recomendado)  
  - CI/CD con GitHub Actions o Azure DevOps

---

## 🌐 Entornos

La plataforma se divide en tres entornos clave:

### 1. Desarrollo (DEV)

- **Dónde:**  
  - GitHub + Codespaces (o entorno local con Node + Docker)
- **Objetivo:**  
  - Trabajo diario de desarrollo
  - Pruebas unitarias
- **Características:**
  - BD Postgres local (Docker o instancia de desarrollo)
  - Variables de entorno separadas (`.env.development`)

---

### 2. Calidad / Staging (QA)

- **Dónde:**  
  - Railway.app o Render.com
- **Objetivo:**  
  - Pruebas integradas y validación funcional
  - Demo interna a usuarios clave
- **Características:**
  - BD Postgres propia para QA  
  - Deploy automatizado desde rama `develop`  
  - Datos de prueba controlados  
  - Integración con Google Drive de pruebas

---

### 3. Producción (PROD)

- **Dónde (recomendado):**  
  - Azure:
    - Azure App Service (frontend + backend)
    - Azure Database for PostgreSQL
    - Azure Key Vault (secretos)
    - Azure Monitor / Application Insights (logs y métricas)
- **Objetivo:**  
  - Operación real con datos oficiales
- **Características:**
  - HTTPS obligatorio  
  - Acceso por roles  
  - Logs de auditoría  
  - Integración con Google Drive productiva  
  - Despliegue solo desde rama `main` (aprobado)

---

## 👥 Roles del sistema

Los roles se implementan desde el backend y se respetan en la interfaz:

- **Administrador del sistema**
  - Gestión de usuarios, roles, parámetros generales
  - Acceso completo

- **Responsable de reportes**
  - Gestiona la elaboración y envío de los reportes
  - Cambia estados: Pendiente → En proceso → Enviado
  - Carga reportes y evidencias

- **Supervisor de cumplimiento**
  - Monitorea estados y vencimientos
  - Valida cumplimiento
  - Acceso a dashboard completo

- **Usuario de consulta / Auditoría**
  - Solo lectura
  - Acceso al histórico, reportes y evidencias
  - Visualización de indicadores

---

## 🧪 Flujo de trabajo principal

1. **Configuración inicial**
   - Cargar entidades de control
   - Definir obligaciones de reporte (frecuencia, base legal, formato, responsables)
   - Configurar usuarios y roles

2. **Generación de instancias de reporte**
   - El sistema calcula la fecha de vencimiento de cada periodo (según frecuencia y plazos)
   - Se generan tareas para los responsables

3. **Alertas y notificaciones**
   - Alertas tempranas (verde)
   - Alertas próximas al vencimiento (amarilla)
   - Alertas de riesgo (naranja)
   - Alertas vencidas (roja)
   - Canales:
     - Notificación en la interfaz (campana)
     - Correo electrónico
     - (Opcional) WhatsApp para casos críticos

4. **Envío de reporte**
   - Responsable carga el archivo enviado (PDF/Excel/link)
   - Registra la fecha real de envío
   - Adjunta evidencia de envío (acuse, pantalla, etc.)

5. **Validación y monitoreo**
   - Supervisor revisa KPIs y estados
   - Dashboard muestra:
     - Cumplimiento a tiempo
     - Reportes vencidos
     - Entidades con mayor incumplimiento
     - Responsables con mayor retraso

---

## 🚀 Puesta en marcha (DEV)

### 1. Prerrequisitos

- Node.js LTS (v18+)
- Docker (opcional pero recomendado)
- Cuenta de GitHub
- PostgreSQL local o Docker

### 2. Clonar el repositorio

```bash
git clone https://github.com/<org>/<repo-llanogas-reportes>.git
cd <repo-llanogas-reportes>
