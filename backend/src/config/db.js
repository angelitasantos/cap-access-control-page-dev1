const { Pool } = require('pg');
require('dotenv').config();

// Cria o pool de conexões com o PostgreSQL usando variáveis de ambiente
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// Flag que indica se a conexão com o banco foi bem-sucedida
let isDbConnected = false;

/**
 * Tenta conectar ao banco de dados PostgreSQL.
 * Em caso de falha, agenda nova tentativa em 5 segundos.
 */
async function connectToDatabase() {
    try {
        await pool.query('SELECT NOW()');
        isDbConnected = true;
        console.log('✅ Conectado ao PostgreSQL com sucesso!');
    } catch (err) {
        isDbConnected = false;
        console.error(`❌ Erro ao conectar ao PostgreSQL: ${err.message}`);
        console.error(`Detalhes do erro: ${err.stack}`);
        console.log('🔄 Tentando reconectar em 5 segundos...');
        setTimeout(connectToDatabase, 5000);
    }
}

// Inicia a primeira tentativa de conexão
connectToDatabase();

// Exporta o pool e uma função para verificar o status da conexão
module.exports = {
    pool,
    isDbConnected: () => isDbConnected
};
