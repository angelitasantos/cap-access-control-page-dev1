// Defini a URL base da API
const baseURL = 'http://localhost:3000';

/**
 * Carrega os grupos da API e renderiza-os na tabela HTML.
 * 
 * Faz uma requisição GET para '/api/grupos', trata a resposta e
 * atualiza a tabela com os dados retornados.
 */
async function carregarGrupos() {
    try {
        const response = await fetch(`${baseURL}/api/grupos`);
        const result = await response.json();

        if (!result.success) {
            console.error('Erro ao carregar grupos:', result.message);
            return;
        }

        renderizarTabela(result.data);

    } catch (err) {
        console.error('Erro no fetch de grupos:', err.message);
    }
}

/**
 * Renderiza os grupos recebidos em formato de tabela.
 * 
 * @param {Array} grupos - Lista de grupos a serem exibidos.
 */
function renderizarTabela(grupos) {
    const tbody = document.querySelector('#table-group tbody');
    tbody.innerHTML = '';

    grupos.forEach((grupo) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${grupo.id}</td>
            <td>${grupo.descricao}</td>
            <td>${grupo.status}</td>
        `;
        tbody.appendChild(row);
    });
}

const modal = document.querySelector("#modalGrupo");
const btnNovoGrupo = document.querySelector("#btnNovoGrupo");
const fecharModal = document.querySelector("#fecharModal");
const cancelarBtn = document.querySelector("#cancelarBtn");
const formGrupo = document.querySelector("#formGrupo");
const descricaoInput = document.querySelector("#descricao");
const erroDescricao = document.querySelector('#erroDescricao');
const btnSubmit = document.querySelector('#formGrupo button[type="submit"]');

btnNovoGrupo.addEventListener("click", () => {
    modal.style.display = "block";
});

fecharModal.addEventListener("click", fechar);
cancelarBtn.addEventListener("click", fechar);

/**
 * Fecha o modal e reseta o formulário.
 */
function fechar() {
    modal.style.display = "none";
    formGrupo.reset();
    setErro('');
}

/**
 * Define a mensagem de erro visível abaixo do campo de descrição.
 * 
 * @param {string} msg - Mensagem a ser exibida.
 */
function setErro(msg) {
    if (erroDescricao) erroDescricao.textContent = msg || '';
}

// Submissão do formulário para criar grupo
formGrupo.addEventListener("submit", async (e) => {
    e.preventDefault();
    setErro('');

    const descricao = descricaoInput.value.trim();
    if (!descricao) {
        setErro('Descrição é obrigatória!');
        return;
    }
    if (descricao.length < 3) {
        setErro('Descrição deve ter pelo menos 3 caracteres!');
        return;
    }

    try {
        btnSubmit.disabled = true;

        const res = await fetch(`${baseURL}/api/grupos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            fechar();
            carregarGrupos();
        } else {
        setErro(data?.message || 'Não foi possível criar o grupo!');
        }
    } catch (err) {
        console.error("Erro ao criar grupo:", err);
        setErro('Falha na comunicação com o servidor!');
    } finally {
        btnSubmit.disabled = false;
    }
});

/**
    A função 'carregarGrupos' é executada automaticamente quando a página é carregada,
    garantindo que os dados mais atualizados sejam exibidos na tabela.
*/
window.onload = carregarGrupos;
