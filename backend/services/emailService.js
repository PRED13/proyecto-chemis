const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({

    service: 'gmail',

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const verificarConexionSMTP = async () => {

    try {

        await transporter.verify();

        console.log(
            '📧 Servidor SMTP listo para enviar correos'
        );

    } catch (error) {

        console.error(
            '❌ Error SMTP:',
            error.message
        );
    }
};

const enviarNotaRemision = async (
    destinatario,
    asunto,
    contenido
) => {

    try {

        await transporter.sendMail({

            from:
                `"Granja Premium" <${process.env.EMAIL_USER}>`,

            to: destinatario,

            subject: asunto,

            text: contenido
        });

        return {
            success: true,
            message:
                `Correo enviado a ${destinatario}`
        };

    } catch (error) {

        console.error(
            '❌ Error enviando correo:',
            error
        );

        return {
            success: false,
            message:
                'No se pudo enviar el correo',
            error: error.message
        };
    }
};

module.exports = {
    enviarNotaRemision,
    verificarConexionSMTP
};