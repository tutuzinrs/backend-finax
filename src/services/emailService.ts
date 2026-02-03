import nodemailer from 'nodemailer';

// Configuração do transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Finax'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Recuperação de Senha - Finax',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperação de Senha</h1>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Você solicitou a recuperação de senha da sua conta no <strong>Finax</strong>.</p>
              <p>Clique no botão abaixo para redefinir sua senha:</p>
              <center>
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
              </center>
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <p><strong>⚠️ Este link expira em 1 hora.</strong></p>
              <p>Se você não solicitou esta recuperação, ignore este email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Finax - Gestão Financeira</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  },

  async sendPasswordChangedNotification(email: string, name: string) {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Finax'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Senha Alterada - Finax',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Senha Alterada com Sucesso</h1>
            </div>
            <div class="content">
              <p>Olá ${name},</p>
              <p>Sua senha foi alterada com sucesso em <strong>${new Date().toLocaleString('pt-BR')}</strong>.</p>
              <p>Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Finax - Gestão Financeira</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      // Não lançar erro aqui, pois é apenas uma notificação
      return { success: false };
    }
  },
};
