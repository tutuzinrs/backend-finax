# 📧 Configuração de Email para Recuperação de Senha

## 🔧 Configuração do Gmail

Para usar o Gmail como servidor SMTP, siga estes passos:

### 1. Ativar Verificação em 2 Etapas

1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas**

### 2. Gerar Senha de App

1. Ainda em **Segurança**, procure por **Senhas de app**
2. Selecione **App**: Outro (nome personalizado)
3. Digite "Finax Backend" ou qualquer nome
4. Clique em **Gerar**
5. **Copie a senha de 16 caracteres** gerada

### 3. Configurar o .env

Edite o arquivo `.env` e adicione:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Senha de app de 16 caracteres
APP_NAME=Finax

# Frontend URL (para links de reset de senha)
FRONTEND_URL=http://localhost:19006  # URL do seu app React Native
```

---

## 🌐 Outros Provedores de Email

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

### SendGrid (Recomendado para produção)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-api-key-do-sendgrid
```

### Mailtrap (Para testes)

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu-username-mailtrap
SMTP_PASS=sua-senha-mailtrap
```

---

## 📦 Instalação de Dependências

Execute o comando para instalar o Nodemailer:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

## 🗄️ Migração do Banco de Dados

Execute a migração para adicionar os campos de reset de senha:

```bash
npx prisma migrate dev --name add_password_reset_fields
```

Ou apenas gere o Prisma Client:

```bash
npx prisma generate
```

---

## 🧪 Testando o Sistema

### 1. Solicitar Reset de Senha

```bash
POST http://localhost:3333/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

### 2. Verificar Email

- Abra o email recebido
- Clique no link ou copie o token

### 3. Redefinir Senha

```bash
POST http://localhost:3333/auth/reset-password
Content-Type: application/json

{
  "token": "token-recebido-no-email",
  "newPassword": "novaSenha123"
}
```

---

## ⚠️ Importante

- **Nunca commite** o arquivo `.env` com credenciais reais
- Use **senhas de app** do Gmail, não sua senha principal
- Em produção, use serviços como **SendGrid**, **AWS SES** ou **Mailgun**
- O token de reset expira em **1 hora**
