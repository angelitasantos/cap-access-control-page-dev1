// Defini a URL base da API
const baseURL = 'http://localhost:3000';

let currentPage = 1;
let pageSize = 5;
let currentSearch = '';
let currentOrderBy = 'id';
let currentOrder = 'ASC';
let searchTimeout;
let modoInativos = false;

document.getElementById('btnLimparBusca').addEventListener('click', () => {
    const inputBusca = document.getElementById('searchInput');
    inputBusca.value = '';
    currentSearch = '';
    currentPage = 1;

    if (modoInativos) {
        carregarInativos(1);
    } else {
        carregarGrupos(1);
    }
});

// Busca com debounce e respeitando o modo atual (ativos/inativos)
document.querySelector('#searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentSearch = e.target.value;
        currentPage = 1;
        if (modoInativos) {
            carregarInativos(1);
        } else {
            carregarGrupos(1);
        }
    }, 400);
});

// Cabeçalho com ícones de ordenação
function renderizarCabecalho() {
    const thead = document.querySelector('#table-group thead');
    thead.innerHTML = `
        <tr>
            <th style="width: 50px;" data-col="id" class="sortable text-center">ID ${getSortIcon('id')}</th>
            <th style="min-width: 250px;" data-col="descricao" class="sortable text-center">DESCRICAO ${getSortIcon('descricao')}</th>
            <th style="width: 70px; "data-col="status" class="sortable text-center">STATUS</th>
            <th style="width: 170px;">AÇÕES</th>
        </tr>
    `;

    thead.querySelectorAll('th[data-col]').forEach(th => {
        th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (currentOrderBy === col) {
            currentOrder = currentOrder === 'ASC' ? 'DESC' : 'ASC';
        } else {
            currentOrderBy = col;
            currentOrder = 'ASC';
        }
        // Recarrega respeitando o modo atual
        if (modoInativos) carregarInativos(1);
        else carregarGrupos(1);
        });
    });
}

function getSortIcon(col) {
    if (currentOrderBy !== col) return '';
    return currentOrder === 'ASC' ? '▲' : '▼';
}

/**
 * Carrega os grupos da API e renderiza-os na tabela HTML.
 * 
 * Faz uma requisição GET para '/api/grupos', trata a resposta e
 * atualiza a tabela com os dados retornados.
 */
async function carregarGrupos(page = 1) {
    try {
        currentPage = page || 1;
        modoInativos = false;
        currentSearch = document.getElementById('searchInput').value;
    
        const response = await fetch(`${baseURL}/api/grupos?page=${currentPage}&pageSize=${pageSize}&search=${currentSearch}&orderBy=${currentOrderBy}&order=${currentOrder}`);
        const result = await response.json();

        if (!result.success) {
            console.error('Erro ao carregar grupos:', result.message);
            return;
        }

        renderizarCabecalho();
        renderizarTabela(result.data);
        renderizarPaginacao(result.total, result.page || 1, result.pageSize);

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

    if (!grupos || grupos.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="text-center">Nenhum Registro Encontrado!</td>
        `;
        tbody.appendChild(row);
        return;
    }

    grupos.forEach((grupo) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">${grupo.id}</td>
            <td>${grupo.descricao}</td>
            <td class="text-center">${grupo.status}</td>
            <td class="text-center">
                <button class='btn btn-warning' onclick='abrirModalEditar(${JSON.stringify(grupo)})'>EDITAR</button>
                <button class='btn btn-danger' onclick='inativarGrupo(${grupo.id})'>INATIVAR</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderizarPaginacao(total, page = 1, pageSize) {
    const paginacaoDiv = document.getElementById('paginacao');
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    paginacaoDiv.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;

        if (page && i === page) {
            btn.classList.add('active');
        }

        btn.onclick = () => (modoInativos ? carregarInativos(i) : carregarGrupos(i));
        paginacaoDiv.appendChild(btn);
    }
}

function ordenar(campo) {
    if (currentOrderBy === campo) {
        currentOrder = currentOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
        currentOrderBy = campo;
        currentOrder = 'ASC';
    }
    carregarGrupos(1);
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

        const response = await fetch(`${baseURL}/api/grupos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao })
        });

        const data = await response.json();

        if (response.ok && data.success) {
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
        const response = await fetch(`${baseURL}/api/grupos/${grupoEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao })
        });

        const data = await response.json();

        if (response.ok && data.success) {
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

// função para inativar grupo
async function inativarGrupo(id) {
    if (!confirm('Tem certeza que deseja inativar este grupo?')) return;

    try {
        const response = await fetch(`${baseURL}/api/grupos/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Grupo inativado com sucesso!');
            carregarGrupos();
        } else {
            console.error(data.message || 'Erro ao inativar grupo!');
        }
    } catch (err) {
        console.error('Erro no servidor ao inativar grupo:', err.message);
    }
}

// Carregar grupos inativos
async function carregarInativos(page = 1) {
    try {
        currentPage = page || 1;
        modoInativos = true;
        currentSearch = document.getElementById('searchInput').value;

        const response = await fetch(`${baseURL}/api/grupos/inativos?page=${currentPage}&pageSize=${pageSize}&search=${currentSearch}&orderBy=${currentOrderBy}&order=${currentOrder}`);
        const result = await response.json();

        if (!result.success) {
            console.error('Erro ao carregar grupos inativos:', result.message);
            return;
        }

        renderizarCabecalho();
        renderizarTabelaInativos(result.data);
        renderizarPaginacao(result.total, result.page || 1, result.pageSize);

    } catch (err) {
        console.error('Erro no fetch de inativos:', err.message);
    }
}

function renderizarTabelaInativos(grupos) {
    const tbody = document.querySelector('#table-group tbody');
    tbody.innerHTML = '';

    if (!grupos || grupos.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="text-center">Nenhum Registro Encontrado!</td>
        `;
        tbody.appendChild(row);
        return;
    }

    grupos.forEach((grupo) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">${grupo.id}</td>
            <td>${grupo.descricao}</td>
            <td class="text-center">${grupo.status}</td>
            <td class="text-center">
                <button class='btn btn-warning' onclick='restaurarGrupo(${grupo.id})'>RESTAURAR</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Restaurar grupo
async function restaurarGrupo(id) {
    if (!confirm('Deseja restaurar este grupo?')) return;

    try {
        const response = await fetch(`${baseURL}/api/grupos/${id}/restore`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Grupo restaurado com sucesso!');
            carregarInativos();
        } else {
            console.error(data.message || 'Erro ao restaurar grupo!');
        }
    } catch (err) {
        console.error('Erro no fetch de inativos:', err.message);
    }
}

/**
    A função 'carregarGrupos' é executada automaticamente quando a página é carregada,
    garantindo que os dados mais atualizados sejam exibidos na tabela.
*/
window.onload = carregarGrupos;
