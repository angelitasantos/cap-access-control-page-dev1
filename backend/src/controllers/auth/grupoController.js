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
            console.error('Erro em listar grupos:', err);
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
                return res.status(400).json({ success: false, message: 'Descrição é obrigatória' });
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
            console.error('Erro em criar grupo:', err);
            return res.status(500).json({ success: false, message: 'Erro ao criar grupo!' });
        }
    }

}

module.exports = grupoController;
