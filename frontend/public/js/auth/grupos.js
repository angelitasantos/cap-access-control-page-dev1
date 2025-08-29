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
            <td>
                <button class='btn btn-warning' onclick='abrirModalEditar(${JSON.stringify(grupo)})'>Editar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

const modalGrupo = document.querySelector('#modalGrupo');
const btnNovoGrupo = document.querySelector('#btnNovoGrupo');
const closeModalAdd = document.querySelector('#closeModalAdd');
const cancelarBtnAdd = document.querySelector('#cancelarBtnAdd');
const formGrupo = document.querySelector('#formGrupo');
const descricaoInput = document.querySelector('#descricao');
const btnSubmit = document.querySelector('#formGrupo button[type="submit"]');

const modalEditar = document.querySelector('#modalEditar');
const closeModalEdit = document.querySelector('#closeModalEdit');
const cancelarBtnEdit = document.querySelector('#cancelarBtnEdit');
const formEditarGrupo = document.querySelector('#formEditarGrupo');
const descricaoEditar = document.querySelector('#descricaoEditar');

btnNovoGrupo.addEventListener('click', () => { modalGrupo.style.display = 'block'; });

closeModalAdd.addEventListener('click', () => { fecharModal(modalGrupo, formGrupo); });
cancelarBtnAdd.addEventListener('click', () => { fecharModal(modalGrupo, formGrupo); });
closeModalEdit.addEventListener('click', () => { fecharModal(modalEditar, formEditarGrupo); });
cancelarBtnEdit.addEventListener('click', () => { fecharModal(modalEditar, formEditarGrupo); });

/**
 * Fecha o modal e reseta o formulário.
 */
function fecharModal(modal, form) {
    modal.style.display = 'none';
    form.reset();
    setErro('', form);
}

let grupoEditandoId = null;

function abrirModalEditar(grupo) {
    grupoEditandoId = grupo.id;
    document.getElementById('descricaoEditar').value = grupo.descricao;
    modalEditar.style.display = 'block';
}

/**
 * Define a mensagem de erro visível abaixo do campo de descrição.
 * 
 * @param {string} msg - Mensagem a ser exibida.
 */
function setErro(msg, form) {
    if (form === formGrupo) {
        const erroDescricao = document.getElementById('erroDescricao');
        if (erroDescricao) erroDescricao.textContent = msg || '';
    } else if (form === formEditarGrupo) {
        const erroDescricaoEditar = document.getElementById('erroDescricaoEditar');
        if (erroDescricaoEditar) erroDescricaoEditar.textContent = msg || '';
    }
}

// Submissão do formulário para criar grupo
formGrupo.addEventListener('submit', async (e) => {
    e.preventDefault();
    setErro('', formGrupo);

    const descricao = descricaoInput.value.trim();
    if (!descricao) {
        setErro('Descrição é obrigatória!', formGrupo);
        return;
    }
    if (descricao.length < 3) {
        setErro('Descrição deve ter pelo menos 3 caracteres!', formGrupo);
        return;
    }

    try {
        btnSubmit.disabled = true;

        const res = await fetch(`${baseURL}/api/grupos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            fecharModal(modalGrupo, formGrupo)
            carregarGrupos();
        } else {
            setErro(data?.message || 'Não foi possível criar o grupo!', formGrupo);
        }
    } catch (err) {
        console.error('Erro ao criar grupo:', err);
        setErro('Falha na comunicação com o servidor!', formGrupo);
    } finally {
        btnSubmit.disabled = false;
    }
});

// Submissão do formulário para editar grupo
formEditarGrupo.addEventListener('submit', async (e) => {
    e.preventDefault();
    setErro('', formEditarGrupo);

    const descricao = descricaoEditar.value.trim();

    if (!descricao) {
        setErro('Descrição é obrigatória!', formEditarGrupo);
        return;
    }
    if (descricao.length < 3) {
        setErro('Descrição deve ter pelo menos 3 caracteres!', formEditarGrupo);
        return;
    }

    try {
        const res = await fetch(`${baseURL}/api/grupos/${grupoEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            fecharModal(modalEditar, formEditarGrupo);
            carregarGrupos();
        } else {
            setErro(data?.message || 'Não foi possível alterar o grupo!', formEditarGrupo);
        }
    } catch (err) {
        console.error('Erro ao alterar grupo:', err);
        setErro('Falha na comunicação com o servidor!', formEditarGrupo);
    }
});

/**
    A função 'carregarGrupos' é executada automaticamente quando a página é carregada,
    garantindo que os dados mais atualizados sejam exibidos na tabela.
*/
window.onload = carregarGrupos;
