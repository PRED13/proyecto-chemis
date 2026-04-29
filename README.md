Markdown
# 🌾 Granja Premium - E-commerce Fullstack 🚀

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **Sistema integral de comercio electrónico** diseñado para la gestión de productos agrícolas con arquitectura de microservicios, seguridad avanzada y procesamiento de transacciones atómicas.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | HTML5, Tailwind CSS, JavaScript Moderno (ES6+) |
| **Backend** | Node.js, Express.js |
| **Base de Datos** | Microsoft SQL Server (Transaccional) |
| **Seguridad** | JWT (JSON Web Tokens), Bcrypt (Hashing) |
| **DevOps** | Dotenv, Nodemon, Git |

---

## 🏗️ Arquitectura de Software

El proyecto sigue un patrón de diseño **orientado a servicios** con una clara separación entre la lógica de negocio y la interfaz de usuario para garantizar escalabilidad y mantenibilidad.

### 🔐 Seguridad & Autenticación
Implementación de **Middlewares** personalizados para la protección de rutas. El sistema valida la integridad de cada petición mediante tokens firmados antes de interactuar con la base de datos:
```javascript
// Auth Middleware Pattern - Senior Implementation
const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
req.user = verified;
next(); 
📉 Lógica Transaccional (Ventas)
El sistema garantiza la integridad de los datos mediante Transacciones SQL. Si un paso falla (ej. stock insuficiente), se realiza un ROLLBACK automático para evitar inconsistencias en el inventario.

📊 Modelo de Entidad-Relación
Fragmento de código
erDiagram
    USUARIOS ||--o{ VENTAS : realiza
    PRODUCTOS ||--o{ DETALLE_VENTAS : contiene
    VENTAS ||--o{ DETALLE_VENTAS : posee

    USUARIOS {
        int id PK
        string nombre
        string correo
        string password
    }
    PRODUCTOS {
        int id PK
        string nombre
        decimal precio
        int stock
    }
    VENTAS {
        int id PK
        int usuario_id FK
        decimal total
        datetime fecha
    }
📂 Estructura del Ecosistema
Bash
PROYECTO-CHEMIS/
├── 📂 backend/           # API REST con Node.js
│   ├── 📂 middleware/    # Guardianes de seguridad (JWT)
│   ├── 📂 routes/        # Endpoints (Auth, Ventas, Productos)
│   ├── 📄 db.js          # Singleton de conexión SQL Server
│   └── 📄 server.js      # Entry point del servidor Express
├── 📂 frontend/          # Interfaz de Usuario (UI/UX)
│   ├── 📂 js/            # Lógica de Carrito y Catálogo (Vanilla JS)
│   ├── 📄 index.html     # Landing Page principal
│   └── 📄 catalogo.html  # Store Front dinámico
└── 📄 README.md          # Documentación Técnica
🚀 Instalación y Despliegue
Sigue estos pasos para replicar el entorno de desarrollo:

Clonar el repositorio:

Bash
git clone [https://github.com/tu-usuario/granja-premium.git](https://github.com/tu-usuario/granja-premium.git)
Configurar Variables de Env (.env):
Crea un archivo .env en la carpeta backend/ con las credenciales correspondientes:

Fragmento de código
PORT=3000
DB_USER=sa
DB_PASSWORD=tu_password
DB_SERVER=localhost
DB_NAME=GranjaPremium
JWT_SECRET=yo_soy_ironMan
Ejecución del Servidor:

Bash
cd backend
npm install
npm run dev
👨‍💻 Autor
Juan Carlos Santana Martinez

Ingeniería en Sistemas Computacionales - 6to Semestre