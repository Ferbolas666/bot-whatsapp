const fs = require("fs");
const path = require("path");

function pegarPiadaAleatoria() {
    const filePath = path.join(__dirname, "piadas.json");

    try {
        const data = fs.readFileSync(filePath, "utf8");
        const piadas = JSON.parse(data);
        const piadaAleatoria = piadas[Math.floor(Math.random() * piadas.length)];
        return piadaAleatoria;
    } catch (error) {
        console.error("❌ Erro ao ler as piadas:", error);
        return "Desculpe, não consegui pensar em uma piada agora. 😂";
    }
}

module.exports = { pegarPiadaAleatoria };