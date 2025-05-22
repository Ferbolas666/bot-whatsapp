<p align="center">
  <img src="https://raw.githubusercontent.com/Ferbolas666/bot-whatsapp/main/banner.png" alt="Bot WhatsApp - Garçom Virtual" width="100%">
</p>

# 🤖 Bot WhatsApp - Garçom Virtual

Um bot inteligente para WhatsApp, desenvolvido com **Node.js**, que atua como um **garçom virtual**. Ele oferece cardápio com imagens direto do banco, verifica status de pedidos, envia notificações e muito mais — tudo integrado com **Firebird SQL**.

---

## 📦 Funcionalidades

- 📸 **Exibe cardápio com imagens** direto do banco (BLOBs convertidos em URLs).
- 🧾 Consulta de status do pedido (em preparo, saiu para entrega, etc).
- 💬 Respostas automáticas com saudações e interações amigáveis.
- 🔒 Verificação por senha para remoções sensíveis.
- 📤 Envio automático de mensagens pelo WhatsApp.
- 🌐 Integração com banco de dados **Firebird** na nuvem.

---

## 🧠 Tecnologias utilizadas

| Stack | Tecnologias |
|-------|-------------|
| Linguagem | Node.js |
| Banco de Dados | Firebird SQL |
| Integração WhatsApp | `venom-bot` ou `whatsapp-web.js` |
| Servidor | Express |
| Hospedagem | SaveInCloud / VPS |
| Frontend auxiliar | Scriptcase (opcional) |

---

## 🚀 Como rodar o projeto

### Pré-requisitos

- Node.js instalado (v16+)
- Banco Firebird configurado
- WebDriver para o WhatsApp (Chromium)
- `.env` configurado com as variáveis necessárias

### Instalação

```bash
git clone https://github.com/Ferbolas666/bot-whatsapp.git
cd bot-whatsapp
npm install
