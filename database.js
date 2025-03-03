const Firebird = require("node-firebird");

const options = {
    host: "desenv-databases.jelastic.saveincloud.net",
    port: 15320,
    database: "DADOSVERSATIL",
    user: "SYSDBA",
    password: "E5bNchw9ctCH7BxkKeW0",
    lowercase_keys: false,
    role: null,
    pageSize: 4096
};

let dbConnection = null; // Variável global para armazenar a conexão

function conectarBanco(callback) {
    if (dbConnection) {
        console.log("🔄 Reutilizando conexão existente...");
        return callback(null, dbConnection);
    }

    Firebird.attach(options, (err, db) => {
        if (err) {
            console.error("❌ Erro ao conectar ao Firebird:", err);
            return callback(err, null);
        }

        console.log("✅ Nova conexão ao Firebird estabelecida!");
        dbConnection = db;

        // Captura erros na conexão para evitar problemas futuros
        dbConnection.on("error", (err) => {
            console.error("❌ Erro na conexão do Firebird:", err);
            dbConnection = null; // Reseta a conexão para criar uma nova na próxima vez
        });

        callback(null, dbConnection);
    });
}

module.exports = { conectarBanco };
