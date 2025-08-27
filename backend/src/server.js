// Inicializa o servidor Express (responsabilidade única)

// Importa a instância do app configurado em app.js
const app = require('./app');

// Define a porta do servidor (usa variável de ambiente ou padrão 3000)
const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

// Inicia o servidor
app.listen(PORT, () => {
    console.log('Servidor disponível em:');
    console.log(`• Local:           http://${HOST}:${PORT}`);
    console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
