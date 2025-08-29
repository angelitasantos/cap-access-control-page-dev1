const grupoModel = require('../../models/auth/grupoModel');

const grupoController = {

    /**
     * Lista todos os grupos ativos (não deletados).
     * 
     * Chama o método `getAll` do model para recuperar os dados do banco.
     * 
     * @param {Request} req - Objeto de requisição do Express.
     * @param {Response} res - Objeto de resposta do Express.
     * @returns {Response} 200 com lista de grupos ou 500 em caso de erro.
     */
    async listar(req, res) {
        try {
            const grupos = await grupoModel.getAll();
            res.status(200).json({ success: true, data: grupos });
        } catch (err) {
            console.error('Erro ao listar grupos:', err);
            res.status(500).json({ success: false, message: 'Erro ao listar grupos!' });
        }
    },

    /**
     * Cria um novo grupo com base na descrição enviada no corpo da requisição.
     * 
     * Valida a entrada, verifica duplicidade e chama o model para inserção.
     * 
     * @param {Request} req - Objeto de requisição contendo a descrição.
     * @param {Response} res - Objeto de resposta.
     * @returns {Response} 201 com grupo criado, 400 para erros de validação ou 500 para falhas internas.
     */
    async criar (req, res) {
        try {
            let { descricao } = req.body;

            if (!descricao || typeof descricao !== 'string') {
                return res.status(400).json({ success: false, message: 'Descrição é obrigatória!' });
            }
            descricao = descricao.trim();
            if (descricao.length < 3) {
                return res.status(400).json({ success: false, message: 'Descrição deve ter pelo menos 3 caracteres!' });
            }

            // valida duplicidade antes do insert
            const jaExiste = await grupoModel.existsByDescricao(descricao);
            if (jaExiste) {
                return res.status(400).json({ success: false, message: 'Já existe um grupo com essa descrição!' });
            }

            const novo = await grupoModel.create(descricao);
            return res.status(201).json({ success: true, data: novo });
        } catch (err) {
            if (err.isDuplicate || err.code === '23505') {
                return res.status(400).json({ success: false, message: 'Já existe um grupo com essa descrição!' });
            }
            console.error('Erro ao criar grupo:', err);
            return res.status(500).json({ success: false, message: 'Erro ao criar grupo!' });
        }
    },

    /**
     * Atualiza um grupo existente com uma nova descrição.
     * 
     * Valida se a descrição possui pelo menos 3 caracteres e verifica se já existe 
     * outro grupo com a mesma descrição (case-insensitive), desconsiderando o próprio ID.
     * 
     * Fluxo:
     * - Se a descrição for inválida, retorna erro 400.
     * - Se já existir outro grupo com a mesma descrição, retorna erro 400.
     * - Se o grupo não for encontrado ou estiver inativo (deletado), retorna erro 404.
     * - Em caso de sucesso, retorna o grupo atualizado com status 200.
     * 
     * Observação:
     * - Erros inesperados são tratados e respondidos com status 500.
     * 
     * @param {import('express').Request} req - Objeto da requisição HTTP.
     * @param {import('express').Response} res - Objeto da resposta HTTP.
     * @returns {Promise<void>}
     */
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            let { descricao } = req.body;

            if (!descricao || descricao.trim().length < 3) {
                return res.status(400).json({ success: false, message: 'Descrição deve ter pelo menos 3 caracteres!' });
            }
            descricao = descricao.trim();

            const jaExiste = await grupoModel.existsByDescricaoExceptId(descricao, id);
            if (jaExiste) {
                return res.status(400).json({ success: false, message: 'Já existe um grupo com essa descrição!' });
            }

            const atualizado = await grupoModel.update(id, descricao);
            if (!atualizado) {
                return res.status(404).json({ success: false, message: 'Grupo não encontrado para atualização!' });
            }

            return res.status(200).json({ success: true, data: atualizado });

        } catch (err) {
            if (err.isDuplicate || err.code === '23505') {
                return res.status(400).json({ success: false, message: 'Já existe um grupo com essa descrição!' });
            }
            console.error('Erro ao atualizar grupo:', err);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar grupo!' });
        }
    },

    /**
     * Inativa (soft delete) um grupo existente com base no ID informado.
     *
     * A operação não remove o grupo do banco de dados, apenas atualiza seu status para 'INATIVO'
     * e marca o campo 'deletado' como `true`.
     *
     * Regras de retorno:
     * - 404: Se o grupo já estiver inativado ou não for encontrado.
     * - 200: Grupo inativado com sucesso.
     * - 500: Em caso de erro interno.
     *
     * @param {import('express').Request} req - Requisição HTTP contendo o ID do grupo a ser inativado.
     * @param {import('express').Response} res - Resposta HTTP com o resultado da operação.
     * @returns {Promise<void>}
     */
    async deletar(req, res) {
        try {
            const { id } = req.params;

            const deletado = await grupoModel.softDelete(id);

            if (!deletado) {
                return res.status(404).json({ success: false, message: 'Grupo não encontrado ou já inativado!' });
            }

            return res.status(200).json({
                success: true,
                message: 'Grupo inativado com sucesso!',
                data: deletado
            });

        } catch (err) {
            console.error('Erro ao inativar grupo:', err);
            return res.status(500).json({ success: false, message: 'Erro ao inativar grupo!' });
        }
    }

}

module.exports = grupoController;
