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
   * @access  Público
   * 
   * Quando uma requisição POST for feita para '/api/grupos',
   * o método 'criar' do 'grupoController' será chamado.
   * 
   * Corpo esperado:
   * {
   *   'descricao': 'Nome do grupo'
   * }
   * 
   * Retorno esperado:
   * - 201: JSON com o grupo criado.
   * - 400: JSON com erros de validação ou duplicidade.
   * - 500: JSON com mensagem de erro interno.
 */
router.post('/', grupoController.criar);
/**
   * @route   PUT /:id
   * @desc    Atualiza a descrição de um grupo existente.
   * @access  Público
   * 
   * Quando uma requisição PUT for feita para '/api/grupos/:id',
   * o método 'atualizar' do 'grupoController' será chamado.
   * 
   * Parâmetros de rota:
   * - id: ID do grupo a ser atualizado.
   * 
   * Corpo esperado:
   * {
   *   'descricao': 'Nova descrição do grupo'
   * }
   * 
   * Regras:
   * - A descrição deve ter no mínimo 3 caracteres.
   * - A nova descrição não pode ser igual à de outro grupo existente (case-insensitive).
   * - O grupo deve existir e estar ativo (não deletado).
   * 
   * Retorno esperado:
   * - 200: JSON com o grupo atualizado.
   * - 400: JSON com erros de validação ou duplicidade.
   * - 404: JSON caso o grupo não seja encontrado.
   * - 500: JSON com mensagem de erro interno.
 */
router.put('/:id', grupoController.atualizar);
/**
   * @route   DELETE /:id
   * @desc    Inativa (soft delete) um grupo existente.
   * @access  Público
   * 
   * Quando uma requisição DELETE for feita para '/api/grupos/:id',
   * o método 'deletar' do 'grupoController' será executado.
   * 
   * Parâmetros de rota:
   * - id: ID do grupo a ser inativado.
   * 
   * Regras:
   * - O grupo deve existir e ainda não estar inativado (deletado).
   * - A operação apenas marca o grupo como inativo no banco de dados.
   * 
   * Retorno esperado:
   * - 200: JSON com mensagem de sucesso e dados do grupo inativado.
   * - 404: JSON caso o grupo não seja encontrado ou já esteja inativo.
   * - 500: JSON com mensagem de erro interno.
 */
router.delete('/:id', grupoController.deletar);
// GET inativos
router.get('/inativos', grupoController.listarInativos);
// PATCH restore
router.patch('/:id/restore', grupoController.restaurar);

module.exports = router;
