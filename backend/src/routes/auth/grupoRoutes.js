const express = require('express');
const grupoController = require('../../controllers/auth/grupoController');

const router = express.Router();

// GET /api/grupos → lista grupos ativos
/**
    Definindo a rota para obter todos os grupos ativos.
    Quando uma requisição GET for feita para '/api/grupos',
    o método 'listar' do 'grupoController' será chamado para retornar a lista de grupos.
    A função 'listar' é responsável por interagir com o modelo e devolver os dados,
    bem como tratar os erros relacionados à operação.

    Retorno esperado: 
        - Uma resposta JSON contendo a lista de grupos ou uma mensagem de erro caso ocorra algum problema.
*/
router.get('/', grupoController.listar);

module.exports = router;
