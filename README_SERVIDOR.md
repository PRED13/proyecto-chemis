# 🚀 Servidor de Granja Premium

## Cómo ejecutar el servidor

### Opción 1: Script de PowerShell (Recomendado)
Ejecuta el servidor de manera persistente con reinicio automático:

```powershell
# Para iniciar el servidor
.\iniciar_servidor.ps1

# Para detener el servidor
.\iniciar_servidor.ps1 -Stop
```

### Opción 2: Script Batch
Ejecuta el servidor en una nueva ventana de comandos:

```cmd
iniciar_servidor.bat
```

### Opción 3: Manual
Desde la carpeta backend:

```bash
cd backend
node app.js
```

## Características

- ✅ Servidor Express con rutas API
- ✅ Conexión a SQL Server
- ✅ Servidor de archivos estáticos
- ✅ SPA (Single Page Application) routing
- ✅ Reinicio automático en caso de fallos (con PowerShell)
- ✅ Puerto 3000

## URLs disponibles

- **Frontend:** http://localhost:3000
- **API Productos:** http://localhost:3000/api/productos
- **API Ventas:** http://localhost:3000/api/ventas
- **API Admin:** http://localhost:3000/api/admin

## Detener el servidor

- **PowerShell:** Presiona `Ctrl+C` o ejecuta `.\iniciar_servidor.ps1 -Stop`
- **Batch:** Cierra la ventana de comandos
- **Manual:** Presiona `Ctrl+C` en la terminal