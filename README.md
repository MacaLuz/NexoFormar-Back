# NexoFormar

Plataforma web para **descubrir, publicar y gestionar cursos gratuitos online**.  
Proyecto full-stack con **Next.js (Frontend)** y **NestJS (Backend)**, base de datos **PostgreSQL** y autenticación **JWT**.

---

## 📦 Repositorios

- **Frontend (Next.js):** https://github.com/MacaLuz/NexoFormar-Front.git
- **Backend (NestJS):** https://github.com/MacaLuz/NexoFormar-Back.git

---

## 🌐 Deploy (Producción)

- **Frontend (Vercel):** https://nexoformar-front-vercel.vercel.app/
- **Backend (Railway):** https://nexoformar-back-production.up.railway.app/
- **Swagger (API Docs):** https://nexoformar-back-production.up.railway.app/api

> Nota: El sistema puede ejecutarse **localmente** o consumirse desde la **nube** (producción).

---

## 🚀 Requisitos

- Node.js
- npm
- PostgreSQL (solo si vas a correr el backend con DB local)
- Cuenta/keys para servicios externos (para funcionamiento en producción):
  - **Resend** (emails)
  - **Cloudinary** (imágenes)
- Dominio propio (para funcionamiento en producción | requerido para emails con Resend)

---

## 🛠️ Instalación (Local)

### 1) Clonar repositorios

```bash
git clone https://github.com/MacaLuz/NexoFormar-Front.git
git clone https://github.com/MacaLuz/NexoFormar-Back.git
```

---

### 2) Instalar dependencias

#### Frontend

```bash
cd NexoFormar-Front
npm install
```

#### Backend

```bash
cd NexoFormar-Back
npm install
```

---

## 🔐 Variables de entorno

Cada repo incluye un `.env.example`.  
Copiarlo como `.env` y completar valores.

---

### Frontend (`.env.local`)

```env
# URL del backend (local o producción)
NEXT_PUBLIC_BACK_URL=http://localhost:3001
```

Si querés usar la nube:

```env
NEXT_PUBLIC_BACK_URL=https://tu-backend-produccion.com
```

---

### Backend (`.env`)

```env
# App
PORT=3001
FRONT_URL=http://localhost:3000

# Database (en producción se usa DATABASE_URL)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# JWT
JWT_SECRET=change_me
JWT_EXPIRES_IN_SECONDS=3600

# Mailing (Resend)
RESEND_API_KEY=your_resend_api_key
MAIL_FROM="NexoFormar <tu_correo_o_dominio_verificado>"
```

✅ Resend funciona en local y en producción, siempre que tengas `RESEND_API_KEY`. 
⚠️ `MAIL_FROM` debe ser un remitente válido según la configuración de Resend (dominio verificado o remitente permitido).

---

## ▶️ Ejecutar el proyecto (Local)

### 1) Backend

```bash
cd NexoFormar-Back
npm run start:dev
```

- API disponible en: `http://localhost:3001`
- Swagger (si está habilitado): `http://localhost:3001/api`

> Si el frontend tira errores de CORS o redirecciones, revisar la variable `FRONT_URL`.

---

### 2) Frontend

```bash
cd NexoFormar-Front
npm run dev
```

- Web disponible en: `http://localhost:3000`

---

## 🧭 Uso general de la aplicación

- Registrarse / iniciar sesión.
- Explorar cursos publicados.
- Buscar y filtrar cursos.
- Publicar un curso (usuario autenticado).
- Ver detalle del curso.
- Gestionar perfil y cursos propios.
- Recuperación de contraseña (vía email con Resend).

---

## ⚙️ Scripts útiles

### Backend

```bash
npm run start:dev   # desarrollo
npm run build       # build
npm run start       # producción
npm run test        # tests (Jest)
```

### Frontend

```bash
npm run dev     # desarrollo
npm run build   # build
npm run start   # producción
```

---

## 📚 Glosario (Términos funcionales)

| Término | Definición |
|----------|------------|
| Usuario | Persona registrada que puede publicar cursos y gestionar su perfil. |
| Admin | Usuario con permisos de moderación/gestión adicionales (si aplica). |
| Curso | Publicación con título, descripción, enlace, categoría e imágenes. |
| Categoría | Clasificación de cursos (ej: Programación, Diseño, Data, etc.). |
| Publicación | Acción de crear/editar un curso en la plataforma. |
| Recuperación | Flujo para recuperar contraseña mediante código enviado por email. |

---

## 🧩 Glosario (Términos técnicos)

| Término | Definición |
|----------|------------|
| JWT | Token de autenticación usado para proteger endpoints. |
| Guard | Protección en backend (NestJS) para validar autorización. |
| DTO | Objeto para validar/transportar datos entre frontend y backend. |
| ORM (TypeORM) | Mapeo entre entidades TypeScript y tablas PostgreSQL. |
| Swagger | Documentación interactiva de la API. |
| Resend | Servicio de envío de emails mediante API HTTP (no SMTP). |
| Cloudinary | Servicio de almacenamiento y hosting de imágenes. |

---

## 📖 Documentación del proyecto
Puedes acceder a la documentación completa de este proyecto a través del siguiente **[Enlace](https://drive.google.com/file/d/1vzsnLO0j6fCImDePnelUTpZ_rX7a_Cj0/view?usp=drive_link)**