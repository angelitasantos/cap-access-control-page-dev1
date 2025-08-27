// Configuração do servidor Express, middlewares e rotas principais

// Importação de pacotes essenciais
const express = require('express');         // Framework para criação do servidor HTTP
const cors = require('cors');               // Middleware para habilitar CORS (Cross-Origin Resource Sharing)
const path = require('path');               // Utilitário para manipulação de caminhos de arquivos
require('dotenv').config();                 // Carrega variáveis de ambiente do arquivo .env

const { pool, isDbConnected } = require('./config/db'); // Conexão com o banco de dados

// Inicializa a aplicação Express
const app = express();

// Middlewares globais
app.use(cors());                            // Habilita CORS para todas as rotas
app.use(express.json());                    // Permite receber dados em JSON no corpo das requisições

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Rota principal ("/") — usada para verificar se a API está rodando
app.get('/', (req, res) => {
    if (!isDbConnected()) {
        return res
            .status(500)
            .sendFile(path.join(__dirname, '../../frontend/public/templates/base/error_500.html'));
    }

    res.send('<h1>🚀 Servidor Express Rodando!</h1>');
});

// Rota para teste de conexão com o banco de dados PostgreSQL
app.get('/db-test', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0] });
    } catch (err) {
        console.error('❌ Erro ao acessar o banco de dados:', err.message);
        next(err); // Encaminha o erro para o middleware de erro 500
    }
});

// Middleware para rota não encontrada (Erro 404)
app.use((req, res) => {
    res
        .status(404)
        .sendFile(path.join(__dirname, '../../frontend/public/templates/base/error_404.html'));
});

// Middleware para erro interno do servidor (Erro 500)
app.use((err, req, res, next) => {
    console.error('❌ Erro interno do servidor:', err.stack);
    res
        .status(500)
        .sendFile(path.join(__dirname, '../../frontend/public/templates/base/error_500.html'));
});

module.exports = app;
