// Definindo a URL base da API em uma variável
const baseURL = 'http://localhost:3000';

// Função assíncrona para carregar os grupos da API e renderizá-los na tabela HTML.
async function carregarGrupos() {
    try {
        // Fazendo uma requisição GET para o endpoint '/api/grupos' para obter a lista de grupos ativos.
        const response = await fetch(`${baseURL}/api/grupos`);
        const result = await response.json();

        // Verifica se a resposta da API foi bem-sucedida
        if (!result.success) {
            console.error('Erro ao carregar grupos:', result.message);
            return;
        }

        // Seleciona o corpo da tabela onde os grupos serão inseridos
        const tbody = document.querySelector('#table-group tbody');
        tbody.innerHTML = ''; // limpa antes de renderizar

        // Itera sobre os grupos recebidos e cria uma linha para cada grupo na tabela
        result.data.forEach((grupo) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${grupo.id}</td>
                <td>${grupo.descricao}</td>
                <td>${grupo.status}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        // Em caso de erro na requisição ou processamento, registra o erro no console
        console.error('Erro no fetch de grupos:', err.message);
    }
}

/**
    A função 'carregarGrupos' é executada automaticamente quando a página é carregada,
    garantindo que os dados mais atualizados sejam exibidos na tabela.
*/
window.onload = carregarGrupos;
