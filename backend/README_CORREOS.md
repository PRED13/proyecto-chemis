# 📧 Configuración de Envío de Correos - Granja Premium

## ¿Qué se implementó?

Se ha integrado **nodemailer** para enviar automáticamente notas de remisión por correo electrónico cuando se finaliza una compra. El proceso incluye:

- ✅ Instalación de nodemailer
- ✅ Servicio de correo centralizado (`services/emailService.js`)
- ✅ Integración con el controlador de ventas
- ✅ Manejo seguro de errores (los fallos de correo NO interrumpen las ventas)

---

## ⚙️ Configuración Requerida

### Opción 1: Usar Gmail (Recomendado para pruebas)

1. **Habilitar Contraseña de Aplicación en tu cuenta Google:**
   - Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Selecciona **App: Mail** y **Device: Windows (o tu SO)**
   - Copia la contraseña generada (16 caracteres)

2. **Actualizar variables de entorno en `.env`:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu_correo@gmail.com
   SMTP_PASS=contraseña_app_generada_16_caracteres
   EMAIL_FROM=Granja Premium <noreply@granjapremium.com>
   ```

### Opción 2: Usar Servidor SMTP Personalizado

```env
SMTP_HOST=tu.servidor.smtp.com
SMTP_PORT=587
SMTP_USER=usuario_smtp
SMTP_PASS=contraseña_smtp
EMAIL_FROM=Granja Premium <admin@granjapremium.com>
```

### Opción 3: Desactivar Envío de Correos (Testing)

Si no deseas configurar SMTP por ahora, simplemente no completes las credenciales SMTP en `.env`. El sistema funcionará correctamente, pero mostrará una advertencia en los logs.

---

## 🔄 Flujo de Envío de Correos

### En `completarVenta()`:

1. ✅ Se valida el stock y se registra la venta en BD
2. ✅ Se calcula el IVA (16%)
3. ✅ Se genera la nota de remisión en texto plano
4. ✅ **En un bloque try/catch independiente**, se intenta enviar el correo
5. ✅ Si el correo falla, **la venta se mantiene registrada**

```
┌─────────────────┐
│ Completar Venta │
└────────┬────────┘
         │
    ┌────▼─────────────────────────┐
    │ Transacción BD (validaciones) │
    │ - Stock                       │
    │ - Actualizar Productos        │
    │ - Insertar Detalle_Ventas     │
    └────┬──────────────────────────┘
         │
    ┌────▼───────────────────────────────────┐
    │ COMMIT (Venta registrada)               │
    └────┬───────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │ try {                                      │
    │   Generar Nota de Remisión                │
    │   Enviar Correo (nodemailer)              │
    │ } catch (error) {                         │
    │   Log warning (SIN INTERRUMPIR VENTA)    │
    │ }                                         │
    └────┬──────────────────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ Respuesta JSON al Cliente      │
    │ { success: true, ventaId, ... }│
    └───────────────────────────────┘
```

---

## 📧 Estructura del Correo Enviado

**Asunto:**
```
Nota de Remisión - Granja Premium - Venta #123
```

**Cuerpo (Formato):**
- HTML mejorado con estilos básicos
- Fallback a texto plano si el cliente no soporta HTML

**Contenido:**
```
╔════════════════════════════════════════════════════════════════╗
║                      NOTA DE REMISIÓN                          ║
║                    GRANJA PREMIUM                              ║
╚════════════════════════════════════════════════════════════════╝

NÚMERO DE VENTA: 123
FECHA Y HORA: 12/05/2026 15:30:45
USUARIO ID: 1

─────────────────────────────────────────────────────────────────
DETALLE DE PRODUCTOS:
─────────────────────────────────────────────────────────────────
1. Gallo Sweater
   Cantidad: 1
   Precio Unitario: $4500.00
   Subtotal: $4500.00

─────────────────────────────────────────────────────────────────
RESUMEN DE TOTALES:
─────────────────────────────────────────────────────────────────
Subtotal: $4500.00
IVA (16%): $720.00
─────────────────────────────────────────────────────────────────
TOTAL A PAGAR: $5220.00
─────────────────────────────────────────────────────────────────
```

---

## 📊 Logs Esperados

### Cuando se envía correctamente:

```
✅ Servidor SMTP configurado y verificado correctamente
...
📧 Nota de remisión enviada exitosamente a usuario@gmail.com
   ID del mensaje: <mensaje-id-unico>
```

### Cuando falla el correo (pero la venta se mantiene):

```
⚠️  Los correos no se enviarán, pero el sistema continuará funcionando
...
⚠️  Error al enviar correo: [SMTP Error Details]
```

### Cuando las credenciales SMTP no están configuradas:

```
❌ Error al verificar servidor SMTP: SMTP_USER no está definido
⚠️  Los correos no se enviarán, pero el sistema continuará funcionando
```

---

## 🔧 Archivos Modificados

- `backend/.env` - Agregadas variables SMTP_*
- `backend/app.js` - Importa y verifica conexión SMTP al iniciar
- `backend/controllers/ventasController.js` - Integración con nodemailer
- `backend/services/emailService.js` - **Nuevo archivo** - Servicio centralizado de correos
- `backend/package.json` - Agregada dependencia nodemailer

---

## 🧪 Pruebas

### Test 1: Verificar Configuración SMTP

1. Inicia el servidor: `npm start`
2. En los logs, deberías ver:
   - ✅ "Servidor SMTP configurado y verificado correctamente" (si está bien)
   - ❌ Mensajes de error si algo no está configurado

### Test 2: Completar una Compra y Recibir Correo

1. Ve a la app (`http://localhost:3000`)
2. Agrega productos al carrito
3. Finaliza la compra
4. Revisa tu inbox (puede tardar 30 seg - 2 min)
5. Deberías recibir un correo con la nota de remisión

### Test 3: Sin Credenciales SMTP (Testing sin correos)

1. Deja SMTP_USER y SMTP_PASS vacíos en `.env`
2. Inicia el servidor (mostrará advertencia)
3. Completa una compra - funcionará sin enviar correos
4. Los logs mostrarán: "⚠️  No fue posible enviar el correo, pero la compra se registró correctamente"

---

## 🚨 Troubleshooting

### "Error: Invalid login: 535-5.7.8 Username and password not accepted"

- **Causa:** Credenciales incorrectas o contraseña no es de app (si usas Gmail)
- **Solución:** Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) y genera una nueva contraseña de app

### "Error: connect ECONNREFUSED"

- **Causa:** El servidor SMTP no es accesible (host/puerto incorrectos)
- **Solución:** Verifica SMTP_HOST y SMTP_PORT en `.env`

### "Error: SMTP_USER no está definido"

- **Causa:** Variables de entorno no cargadas
- **Solución:** Asegúrate de que `.env` existe en `backend/` y reinicia el servidor

### "Correo no llegó al inbox"

- **Posibles causas:**
  - Llegó a Spam/Junk (verifica esa carpeta)
  - Proveedor bloqueó el correo (revisa logs del servidor SMTP)
  - Email del usuario es incorrecto en BD
- **Solución:** Verifica en BD que `Usuarios.email` sea un correo válido

---

## 📝 Notas Importantes

1. **Las ventas NO dependen de los correos:** Si nodemailer falla, la venta se registra correctamente en BD
2. **Seguridad:** Nunca hagas commit de credenciales reales. El `.env` debe estar en `.gitignore`
3. **Producción:** Usa un servicio profesional como SendGrid, AWS SES o un servidor SMTP corporativo
4. **Rate Limiting:** Ten en cuenta que Gmail permite ~500 correos/día desde una app

---

¡La configuración está lista! 🎉
