import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Força o carregamento do .env atual
dotenv.config();

async function main() {
  console.log('--- Teste de Envio de Email ---');
  console.log(`Host: ${process.env.SMTP_HOST}`);
  console.log(`User: ${process.env.SMTP_USER}`);
  // Mostra apenas os primeiros 4 caracteres da senha para segurança
  console.log(`Pass: ${process.env.SMTP_PASS?.substring(0, 4)}...`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true, // Mostra logs detalhados do SMTP
  });

  try {
    console.log('Tentando enviar email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Envia para o próprio email
      subject: 'Teste de Configuração Finax',
      text: 'Se você recebeu este email, a configuração está correta!',
    });

    console.log('✅ Email enviado com sucesso!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Erro ao enviar email:');
    console.error(error);
  }
}

main();
