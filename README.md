## 🚀 Cómo ejecutar el proyecto en local

Sigue estos pasos para correr el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/MacaLuz/NexoFormar-Back.git
```
### 2. Entrar a la carpeta del proyecto
```bash
cd NexoFormar-Back
```
### 3. Instalar dependencias
```bash
npm install
```
### 4. Configurar variables de entorno
crear un archivo .env en la raiz del proyecto y completar las siguientes credenciales

#### Frontend
```bash
FRONT_URL=http://localhost:3000
```
#### Backend
```bash
PORT=3001
```
#### Base de datos
```bash
DB_HOST=localhost
DB_PORT=tu_puerto_de_postgres
DB_USERNAME=nombre_de_usuario_de_postgres
DB_PASSWORD=tu_password_de_postgres
DB_NAME=nombre_de_la_base_de_datos_de_postgres
```
#### JWT
```bash
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN_SECONDS=3600
```
#### Mailing
```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_clave_de_app
MAIL_FROM="NexoFormar <your_email@gmail.com>"
```
#### Recovery
```bash
RECOVERY_CODE_TTL_MINUTES=15
```
### 5. Crea la base de datos

En PostreSQL crea una base de datos con el nombre configurado en el archivo .env

```bash
CREATE DATABASE "NexoFormar"
```

### 5. Ejecutar el servidor backend
```bash
npm run start:dev
```