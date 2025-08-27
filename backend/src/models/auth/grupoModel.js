const db = require('../../config/db');

const grupoModel = {

    /**
        Método assíncrono para buscar todos os grupos ativos na base de dados.
        Retorna um array com as colunas 'id', 'descricao' e 'status' dos grupos que não foram deletados,
        ordenados pela 'descricao' em ordem crescente.
        
        Exceções serão tratadas no controller. Caso ocorra algum erro durante a execução da consulta,
        a mensagem de erro será registrada no console para fins de depuração.
        
        Retorno:
            - Array de objetos com os campos id, descricao, status para cada grupo encontrado.
    */
    async getAll() {
        // Aguarde até que o banco esteja conectado
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
    }

}

module.exports = grupoModel;
