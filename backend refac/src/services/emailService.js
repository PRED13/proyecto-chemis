const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Actualizado: recibe 'montos' (subtotal, iva, totalFinal)
const enviarNotaRemision = async (correoDestino, ventaId, items, montos) => {
    const { subtotal, iva, totalFinal } = montos;
    
    let tablaHTML = '';
    items.forEach(item => {
        tablaHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.nombre}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.cantidad}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${parseFloat(item.precio).toFixed(2)}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${(item.cantidad * item.precio).toFixed(2)}</td>
            </tr>`;
    });

    const mailOptions = {
        from: `"Granja Premium" <${process.env.EMAIL_USER}>`,
        to: correoDestino,
        subject: `Nota de Remisión Oficial - Venta #${ventaId}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #d97706; text-align: center;">GRANJA PREMIUM - NOTA DE REMISIÓN</h2>
                <p>Estimado cliente, su compra ha sido procesada de manera exitosa en <strong>SERVER3</strong>.</p>
                <p><strong>Folio de Venta:</strong> #${ventaId}</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="padding: 8px; border: 1px solid #ddd;">Ejemplar</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Cant</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Precio U.</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${tablaHTML}</tbody>
                </table>
                
                <div style="text-align: right; margin-top: 20px; color: #374151;">
                    <p style="margin: 2px 0;">Subtotal: $${subtotal.toFixed(2)}</p>
                    <p style="margin: 2px 0;">IVA (16%): $${iva.toFixed(2)}</p>
                    <h3 style="color: #10b981; margin: 10px 0;">TOTAL: $${totalFinal.toFixed(2)}</h3>
                </div>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p style="font-size: 11px; color: #9ca3af; text-align: center;">Este documento digital sirve como comprobante de control interno e inventario.</p>
            </div>`
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { enviarNotaRemision };