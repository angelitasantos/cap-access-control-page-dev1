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
    async getAll({ page = 1, pageSize = 10, search = '', orderBy = 'id', order = 'ASC' }) {
        const offset = (page - 1) * pageSize;
        const searchQuery = `%${search}%`;

        const validColumns = ['id', 'descricao', 'status'];
        if (!validColumns.includes(orderBy)) orderBy = 'id';
        order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        const query = `
            SELECT * FROM grupos
            WHERE deletado = false
            AND descricao ILIKE $1
            ORDER BY ${orderBy} ${order}
            LIMIT $2 OFFSET $3
        `;
        const totalQuery = `
            SELECT COUNT(*) AS total FROM grupos
            WHERE deletado = false AND descricao ILIKE $1
        `;

        // métricas gerais
        const metricsQuery = `
            SELECT 
                COUNT(*)::int AS total,
                SUM(CASE WHEN deletado = false THEN 1 ELSE 0 END)::int AS ativos,
                SUM(CASE WHEN deletado = true THEN 1 ELSE 0 END)::int AS inativos
            FROM grupos
        `;

        const [result, totalResult, metricsResult] = await Promise.all([
            db.pool.query(query, [searchQuery, pageSize, offset]),
            db.pool.query(totalQuery, [searchQuery]),
            db.pool.query(metricsQuery)
        ]);

        return {
            data: result.rows,
            total: parseInt(totalResult.rows[0].total, 10),
            page,
            pageSize,
            metrics: metricsResult.rows[0]   // 👉 { total, ativos, inativos }
        };
    },

    async getMetrics() {
        const sql = `
            SELECT 
                COUNT(*)::int AS total,
                SUM(CASE WHEN deletado = false THEN 1 ELSE 0 END)::int AS ativos,
                SUM(CASE WHEN deletado = true THEN 1 ELSE 0 END)::int AS inativos
            FROM grupos
        `;
        const { rows } = await db.pool.query(sql);
        return rows[0];
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
    async existsByDescription (descricao, excludeId = null) {
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
    async existsByDescriptionExceptId(descricao, id) {
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
    },

    /**
     * Realiza a exclusão lógica (soft delete) de um grupo.
     *
     * Em vez de remover o grupo do banco de dados, esta operação marca o registro como deletado,
     * alterando o campo `deletado` para `true` e o `status` para `'INATIVO'`.
     * O grupo permanece na base de dados para fins históricos ou auditoria.
     *
     * A exclusão só é aplicada se o grupo ainda não estiver marcado como deletado.
     *
     * @param {number} id - Identificador do grupo a ser marcado como deletado.
     * @returns {Promise<Object>} Objeto com os campos atualizados: 'id', 'descricao', 'status' e 'deletado'.
     */
    async softDelete(id) {
        const result = await db.pool.query(
            `UPDATE grupos
            SET deletado = true, status = 'INATIVO'
            WHERE id = $1 AND deletado = false
            RETURNING id, descricao, status, deletado`,
            [id]
        );
        return result.rows[0];
    },

    /**
         * Lista grupos inativos (deletados) com paginação, busca e ordenação.
         * 
         * @param {Object} params - Parâmetros de paginação, busca e ordenação.
         * @param {number} params.page - Página atual (default: 1).
         * @param {number} params.pageSize - Quantidade por página (default: 10).
         * @param {string} params.search - Texto de busca para filtrar pela descrição.
         * @param {string} params.orderBy - Coluna para ordenação (id, descricao, status).
         * @param {string} params.order - Direção da ordenação (ASC ou DESC).
         * @returns {Promise<Object>} Lista de grupos inativos paginada.
    */
    async getInactive({ page = 1, pageSize = 10, search = '', orderBy = 'id', order = 'ASC' }) {
        const offset = (page - 1) * pageSize;
        const searchQuery = `%${search}%`;

        const validColumns = ['id', 'descricao', 'status'];
        if (!validColumns.includes(orderBy)) orderBy = 'id';
        order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        const query = `
            SELECT * FROM grupos
            WHERE deletado = true
            AND descricao ILIKE $1
            ORDER BY ${orderBy} ${order}
            LIMIT $2 OFFSET $3
        `;
        const totalQuery = `
            SELECT COUNT(*) AS total FROM grupos
            WHERE deletado = true AND descricao ILIKE $1
        `;

        const [result, totalResult] = await Promise.all([
            db.pool.query(query, [searchQuery, pageSize, offset]),
            db.pool.query(totalQuery, [searchQuery])
        ]);

        return {
            data: result.rows,
            total: parseInt(totalResult.rows[0].total, 10),
            page,
            pageSize
        };
    },

    /**
         * Restaura um grupo inativo (soft delete reverso).
         * 
         * Define 'deletado = false' e 'status = ATIVO'.
    */
    async restore(id) {
        const result = await db.pool.query(
            `UPDATE grupos
            SET deletado = false, status = 'ATIVO'
            WHERE id = $1 AND deletado = true
            RETURNING id, descricao, status, deletado`,
            [id]
        );
        return result.rows[0];
    }

}

module.exports = grupoModel;
