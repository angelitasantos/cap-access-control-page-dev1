const express = require('express');
const grupoController = require('../../controllers/auth/grupoController');

const router = express.Router();

/**
 * @route   GET /
 * @desc    Lista todos os grupos ativos (não deletados).
 * @access  Público
 * 
 * Quando uma requisição GET for feita para '/api/grupos',
 * o método 'listar' do 'grupoController' será chamado.
 * 
 * Retorno esperado:
 * - 200: JSON com lista de grupos.
 * - 500: JSON com mensagem de erro.
 */
router.get('/', grupoController.listar);
/**
 * @route   POST /
 * @desc    Cria um novo grupo.
 * @access  Público (ou ajustar conforme regras de autenticação)
 * 
 * Quando uma requisição POST for feita para '/api/grupos',
 * o método 'criar' do 'grupoController' será chamado.
 * 
 * Corpo esperado:
 * {
 *   "descricao": "Nome do grupo"
 * }
 * 
 * Retorno esperado:
 * - 201: JSON com o grupo criado.
 * - 400: JSON com erros de validação ou duplicidade.
 * - 500: JSON com mensagem de erro interno.
 */
router.post('/', grupoController.criar);

module.exports = router;
