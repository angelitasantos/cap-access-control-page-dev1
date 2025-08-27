const grupoModel = require('../../models/auth/grupoModel');

const grupoController = {

    /**    
        Método assíncrono responsável por listar todos os grupos.
        Este método chama a função 'getAll' do modelo 'grupoModel' para obter os dados
        de todos os grupos ativos (não deletados) e os retorna em formato JSON com um status HTTP 200.
        
        Caso ocorra algum erro durante a execução da consulta ou no processo de resposta,
        o erro é registrado no console para fins de depuração e uma resposta HTTP 500 é enviada,
        com a mensagem 'Erro ao listar grupos' para o cliente.
        
        Retorno:
            - Se bem-sucedido, retorna um objeto JSON com a propriedade 'success' igual a true e a lista de grupos.
            - Se ocorrer erro, retorna um objeto JSON com a propriedade 'success' igual a false e uma mensagem de erro. 
    */
    async listar(req, res) {
        try {
            const grupos = await grupoModel.getAll();
            res.status(200).json({ success: true, data: grupos });
        } catch (err) {
            console.error('Erro em listar grupos:', err);
            res.status(500).json({ success: false, message: 'Erro ao listar grupos' });
        }
    }

}

module.exports = grupoController;
