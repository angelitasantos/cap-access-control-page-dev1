const db = require('../../config/db');

const grupoModel = {

    /**
     * Recupera todos os grupos ativos no banco de dados.
     * 
     * Retorna um array com os campos 'id', 'descricao' e 'status' 
     * dos grupos que não foram marcados como deletados, ordenados 
     * pela 'descricao' em ordem alfabética crescente.
     * 
     * Observação:
     * - Exceções serão tratadas no controller.
     * - Em caso de falha na conexão, um erro será lançado.
     * 
     * @returns {Promise<Array>} Lista de grupos ativos.
     */
    async getAll() {
        // Aguarda até que o banco esteja conectado
        if (!db.isDbConnected()) {
            console.error('Banco de dados não está conectado!');
            throw new Error('Banco de dados não está conectado');
        }
        
        try {
            const result = await db.pool.query(
                `SELECT id, descricao, status 
                FROM grupos 
                WHERE deletado = false
                ORDER BY descricao ASC`
            );
            return result.rows;
        } catch (err) {
            console.error('Erro ao buscar grupos:', err.message);
            throw err;
        }
    },

    /**
     * Verifica se já existe um grupo com a mesma descrição.
     * 
     * A comparação é case-insensitive. Pode opcionalmente excluir um ID específico da verificação,
     * útil em atualizações.
     * 
     * @param {string} descricao - Descrição do grupo a ser verificada.
     * @param {number|null} excludeId - (Opcional) ID a ser desconsiderado na verificação.
     * @returns {Promise<boolean>} True se já existir, false caso contrário.
     */
    async existsByDescricao (descricao, excludeId = null) {
        try {
            let sql = 'SELECT 1 FROM grupos WHERE LOWER(descricao) = LOWER($1)';
            const params = [descricao];
            if (excludeId) {
                sql += ' AND id <> $2';
                params.push(excludeId);
            }
            const { rowCount } = await db.pool.query(sql + ' LIMIT 1', params);
            return rowCount > 0;
        } catch (err) {
            console.error('Erro ao verificar duplicidade:', err.message);
            throw err;
        }
    },

    /**
     * Cria um novo grupo com a descrição fornecida.
     * 
     * Retorna o objeto do grupo recém-criado com os campos 'id', 'descricao' e 'status'.
     * 
     * Observação:
     * - Se a descrição já existir (violação de chave única), a propriedade `err.isDuplicate` será marcada como true.
     * 
     * @param {string} descricao - Descrição do novo grupo.
     * @returns {Promise<Object>} Grupo criado.
     */
    async create (descricao) {
        try {
            const result = await db.pool.query(
                `INSERT INTO grupos (descricao) 
                VALUES ($1) 
                RETURNING id, descricao, status`,
                [descricao]
            );
            return result.rows[0];
        } catch (err) {
            // 23505 = unique_violation (PostgreSQL)
            if (err && err.code === '23505') {
                err.isDuplicate = true;
            }
            console.error('Erro ao criar grupo:', err.message);
            throw err;
        }
    },

    /**
     * Verifica se já existe um grupo com a mesma descrição, excetuando um ID específico.
     * 
     * Útil em operações de atualização para evitar conflitos de duplicidade com outros registros.
     * A verificação é case-insensitive e ignora grupos marcados como deletados.
     * 
     * @param {string} descricao - Descrição do grupo a ser verificada.
     * @param {number} id - ID do grupo que deve ser desconsiderado na verificação.
     * @returns {Promise<boolean>} True se já existir outro grupo com a mesma descrição, false caso contrário.
     */
    async existsByDescricaoExceptId(descricao, id) {
        const result = await db.pool.query(
            `SELECT id FROM grupos 
             WHERE descricao ILIKE $1 AND id <> $2`,
            [descricao, id]
        );
        return result.rows.length > 0;
    },

    /**
     * Atualiza a descrição de um grupo existente.
     * 
     * O grupo é identificado pelo ID fornecido e deve estar ativo (não deletado).
     * A data de atualização é registrada automaticamente.
     * 
     * Retorna o objeto atualizado contendo os campos 'id', 'descricao', 'status', 'created_at' e 'updated_at'.
     * 
     * @param {number} id - ID do grupo a ser atualizado.
     * @param {string} descricao - Nova descrição a ser atribuída ao grupo.
     * @returns {Promise<Object>} Grupo atualizado.
     */
    async update(id, descricao) {
        const result = await db.pool.query(
            `UPDATE grupos 
             SET descricao = $1
             WHERE id = $2
             RETURNING id, descricao, status`,
            [descricao, id]
        );
        return result.rows[0];
    }

}

module.exports = grupoModel;
