const nodemailer = require('nodemailer');

/**
 * Transporte de correo configurado con las variables de entorno
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465', // TLS para puerto 587, SSL para 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Verifica la conexión SMTP al iniciar la aplicación
 */
const verificarConexionSMTP = async () => {
    try {
        await transporter.verify();
        console.log('✅ Servidor SMTP configurado y verificado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al verificar servidor SMTP:', error.message);
        console.log('⚠️  Los correos no se enviarán, pero el sistema continuará funcionando');
        return false;
    }
};

/**
 * Envía un correo de nota de remisión
 * @param {string} destinatario - Email del destinatario
 * @param {string} asunto - Asunto del correo
 * @param {string} contenido - Contenido del correo (texto plano)
 * @returns {Promise<Object>} - Resultado del envío
 */
const enviarNotaRemision = async (destinatario, asunto, contenido) => {
    try {
        // Validar que tenemos las credenciales SMTP configuradas
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('Credenciales SMTP no configuradas en variables de entorno');
        }

        const opcionesCorreo = {
            from: process.env.EMAIL_FROM || 'noreply@granjapremium.com',
            to: destinatario,
            subject: asunto,
            text: contenido,
            // Opcionalmente, puedes enviar también en HTML
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                    <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c5f2d; border-bottom: 2px solid #2c5f2d; padding-bottom: 10px;">
                            🌾 Granja Premium
                        </h2>
                        <pre style="font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6; background-color: #f9f9f9; padding: 15px; border-radius: 5px; overflow-x: auto;">
${contenido}
                        </pre>
                        <p style="color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
                            Este es un correo automático. Por favor, no responda a esta dirección.
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(opcionesCorreo);
        console.log(`✅ Nota de remisión enviada exitosamente a ${destinatario}`);
        console.log(`   ID del mensaje: ${info.messageId}`);
        
        return {
            success: true,
            messageId: info.messageId,
            message: `Correo enviado a ${destinatario}`
        };

    } catch (error) {
        console.error('❌ Error al enviar correo:', error.message);
        
        // Retornar error sin romper el flujo principal
        return {
            success: false,
            error: error.message,
            message: 'No fue posible enviar el correo, pero la compra se registró correctamente'
        };
    }
};

module.exports = {
    verificarConexionSMTP,
    enviarNotaRemision,
    transporter
};
