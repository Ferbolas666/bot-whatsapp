const { conectarBanco } = require("./database");

conectarBanco((err, db) => {
    if (err) {
        console.error("❌ Erro na conexão:", err);
    } else {
        console.log("✅ Conexão bem-sucedida!");
        db.detach();
    }
});
