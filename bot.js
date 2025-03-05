const { conectarBanco } = require("./database");
const { Client, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const oneLinerJoke = require("one-liner-joke");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const pastaImagens = "C:\\ImagensCardapio"; // Altere conforme necessário!
const { pegarPiadaAleatoria } = require("./index");

console.log("🔎 Testando importação do database.js...");
console.log(typeof conectarBanco);

app.use(express.static("public"));

let client;
const estadoUsuarios = {}; // Armazena o estado de cada usuário

io.on("connection", (socket) => {
    console.log("🖥️ Cliente conectado ao socket");

    socket.on("solicitar_qr", () => {
        if (!client) {
            client = new Client();

            client.on("qr", (qr) => {
                console.log("📲 Escaneie este QR Code para conectar!");
                qrcode.toDataURL(qr, (err, url) => {
                    io.emit("qr", url);
                });
            });

            client.on("ready", () => {
                console.log("✅ Bot conectado!");
                io.emit("status", "✅ Bot conectado!");
            });

            client.on("message", async (msg) => {
                const texto = msg.body.toLowerCase().trim();
                const numeroUsuario = msg.from;

                // Responde a saudações automaticamente
                const saudacoes = ["oi", "olá", "bom dia", "boa tarde", "boa noite"];
                if (saudacoes.includes(texto)) {
                    msg.reply("🤖 Olá! Eu sou o *Botlomeu*! Como posso te ajudar?");
                    return;
                }

                if (texto === "1") {
                    console.log("📸 Enviando imagens do cardápio...");
                    const imagens = ["cardapio1.png", "cardapio2.png", "cardapio3.png", "cardapio4.png"];
                    imagens.forEach((nomeArquivo, index) => {
                        const caminhoCompleto = path.resolve(pastaImagens, nomeArquivo);
                        if (fs.existsSync(caminhoCompleto)) {
                            const imagemBase64 = fs.readFileSync(caminhoCompleto).toString("base64");
                            const media = new MessageMedia("image/png", imagemBase64);
                            client.sendMessage(numeroUsuario, media, { caption: `📸 Imagem ${index + 1} do cardápio` });
                        } else {
                            console.log(`⚠️ Imagem não encontrada: ${caminhoCompleto}`);
                        }
                    });
                    return;
                }

                if (texto === "2") {
                    msg.reply("👉 Para fazer seu pedido, clique aqui: https://jaentrego.app.br/");
                    return;
                }

                if (estadoUsuarios[numeroUsuario] === "aguardando_produto") {
                    conectarBanco((err, db) => {
                        if (err) {
                            msg.reply("❌ Erro ao conectar ao banco de dados!");
                            return;
                        }
                
                        db.query(
                            "SELECT DESCRICAO, PRECO_CUSTO FROM PRODUTOS WHERE LOWER(DESCRICAO) LIKE ?",
                            [`%${texto}%`],
                            (err, result) => {
                                if (err || result.length === 0) {
                                    msg.reply("❌ Produto não encontrado.");
                                } else {
                                    let resposta = "🔍 *Produtos encontrados:*\n";
                                    result.forEach((item) => {
                                        resposta += `📌 ${item.DESCRICAO} - 💲 ${item.PRECO_CUSTO.toFixed(2)}\n`;
                                    });
                                    msg.reply(resposta);
                                }
                                delete estadoUsuarios[numeroUsuario]; // Remove o estado depois da resposta
                            }
                        );
                    });
                    return;
                }
                
                if (estadoUsuarios[numeroUsuario] === "aguardando_cpf_pedido") {
                    delete estadoUsuarios[numeroUsuario];
                    const cpf = texto.replace(/\D/g, ""); // Remove caracteres não numéricos
                
                    if (cpf.length !== 11) {
                        msg.reply("❌ CPF inválido! Envie apenas os 11 números do CPF.");
                        return;
                    }
                
                    conectarBanco((err, db) => {
                        if (err) {
                            msg.reply("❌ Erro ao conectar ao banco de dados!");
                            return;
                        }
                
                        db.query("SELECT COD_CLIENTE, NOME FROM CLIENTES WHERE CNPJ_CGC = ?", [cpf], (err, result) => {
                            if (err || result.length === 0) {
                                msg.reply("❌ Cliente não encontrado.");
                                return;
                            }
                
                            const codCliente = result[0].COD_CLIENTE;
                            const nomeCliente = result[0].NOME;
                
                            db.query("SELECT STATUS FROM VENDAS_FICHA WHERE COD_CLIENTE = ?", [codCliente], (err, vendas) => {
                                if (err || vendas.length === 0) {
                                    msg.reply(`❌ Nenhuma venda encontrada para ${nomeCliente}.`);
                                } else {
                                    const statusVenda = vendas[0].STATUS;
                                    msg.reply(`👤 Cliente: ${nomeCliente}\n📦 Status do pedido: ${statusVenda}`);
                                }
                            });
                        });
                    });
                    return;
                }                

                if (texto.includes("menu")) {
                    msg.reply("📋 *Opções do bot:*\n" +
                        "1️⃣ Cardápio como imagens\n" +
                        "2️⃣ Fazer pedido\n" +
                        "3️⃣ Ofertas e Promoção do Dia\n" +
                        "4️⃣ Verificar se o Pedido já saiu para entrega.\n" +
                        "5️⃣ Ouvir uma Piada.\n" +
                        "6️⃣ Verificar preço de algum produto.\n" +
                        "7️⃣ Transferir para um atendente\n\n" +
                        "Digite o número da opção desejada.");
                    return;
                }

                if (texto === "3") {
                    conectarBanco((err, db) => {
                        if (err) {
                            msg.reply("❌ Erro ao conectar ao banco de dados!");
                            return;
                        }
                
                        db.query(
                            "SELECT COD_PRODUTO, VALOR_PROMOCAO, DATAINICIAL, DATAFINAL FROM PRODUTOS_PROMOCAO WHERE COD_PROMOCAO = 1",
                            (err, resultadoPromocoes) => {
                                if (err || resultadoPromocoes.length === 0) {
                                    msg.reply("📢 No momento, não há promoções ativas.");
                                    return;
                                }
                
                                let resposta = "🔥 *Promoções Ativas:*\n";
                                let consultasPendentes = resultadoPromocoes.length;
                
                                resultadoPromocoes.forEach((promo) => {
                                    const { COD_PRODUTO, VALOR_PROMOCAO, DATAINICIAL, DATAFINAL } = promo;
                
                                    db.query(
                                        "SELECT DESCRICAO, PRECO_CUSTO FROM PRODUTOS WHERE COD_PRODUTO = ?",
                                        [COD_PRODUTO],
                                        (err, resultadoProduto) => {
                                            if (!err && resultadoProduto.length > 0) {
                                                const nomeProduto = resultadoProduto[0].DESCRICAO;
                                                const precoOriginal = resultadoProduto[0].PRECO_CUSTO.toFixed(2);
                                                const valorPromo = VALOR_PROMOCAO.toFixed(2);
                                                const dataInicio = new Date(DATAINICIAL).toLocaleDateString("pt-BR");
                                                const dataFim = new Date(DATAFINAL).toLocaleDateString("pt-BR");
                
                                                resposta += `🍔 *${nomeProduto}*\n💲 De: ~R$${precoOriginal}~ Por: *R$${valorPromo}*\n📅 Promoção válida de ${dataInicio} até ${dataFim}\n\n`;
                                            }
                
                                            consultasPendentes--;
                                            if (consultasPendentes === 0) msg.reply(resposta);
                                        }
                                    );
                                });
                            }
                        );
                    });
                
                } else if (texto === "4") {
                    estadoUsuarios[numeroUsuario] = "aguardando_cpf_pedido";
                    msg.reply("📦 Por favor, envie o CPF do cliente para verificar o status do pedido.");
                } else if (texto === "5") {
                    msg.reply(pegarPiadaAleatoria());
                } else if (texto === "6") {
                    estadoUsuarios[numeroUsuario] = "aguardando_produto";
                    msg.reply("🔍 Por favor, envie o nome do produto para verificar o preço.");
                } else if (texto === "7") {
                    const nomeCliente = msg._data.notifyName || "Cliente";
                    const numeroCliente = msg.from.replace(/\D/g, ""); //Remove caracteres não numéricos

                    msg.reply("📞 Logo um de nossos atendentes irá entrar em contato. Aguarde...");

                    //Criando um vCard
                    const vCard = `BEGIN:VCARD\nVERSION:3.0\nFN:${nomeCliente}\nTEL;TYPE=cell:+${numeroCliente}\nEND:VCARD`;

                    const contato = new MessageMedia("text/vcard", Buffer.from(vCard).toString("base64"), "contato.vcf");

                    client.sendMessage("5518988033870@c.us", contato, {
                        caption: `📢 O cliente *${nomeCliente}* (${numeroCliente}) precisa de atendimento!`,
                    });
                }
            });
            client.initialize();
        }
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log("🌍 Servidor rodando em http://0.0.0.0:3000");
});

