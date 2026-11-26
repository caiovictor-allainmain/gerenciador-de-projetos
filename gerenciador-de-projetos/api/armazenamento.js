const fs = require("node:fs")
const path = require("node:path")

const ProjetoFactory = require("../ProjetoFactory")
const { Integrante, Lider } = require("../Pessoa")
const Tarefa = require("../Tarefa")

const arquivoPadrao = path.join(__dirname, "data", "projetos.json")

function serializarProjeto(registro) {
    return {
        id: registro.id,
        nome: registro.projeto.nome,
        tipo: registro.projeto.tipo,
        integrantes: registro.projeto.integrantes.map((pessoa, indice) => ({
            id: indice + 1,
            nome: pessoa.nome,
            tipo: pessoa instanceof Lider ? "lider" : "integrante"
        })),
        tarefas: registro.projeto.tarefas.map((tarefa, indice) => ({
            id: indice + 1,
            titulo: tarefa.titulo,
            concluida: tarefa.concluida,
            responsavel: tarefa.responsavel ? tarefa.responsavel.nome : null
        }))
    }
}

function garantirArquivo(arquivo) {
    fs.mkdirSync(path.dirname(arquivo), { recursive: true })

    if (!fs.existsSync(arquivo)) {
        fs.writeFileSync(arquivo, "[]\n", "utf8")
    }
}

function reconstruirProjeto(dados) {
    const tipo = dados.tipo.toLowerCase()
    const projeto = ProjetoFactory.criarProjeto(tipo, dados.nome)

    if (!projeto || !Array.isArray(dados.integrantes) || !Array.isArray(dados.tarefas)) {
        throw new Error("O arquivo de projetos contém dados inválidos.")
    }

    for (const integrante of dados.integrantes) {
        const ClassePessoa = integrante.tipo === "lider" ? Lider : Integrante
        projeto.adicionarIntegrante(new ClassePessoa(integrante.nome))
    }

    for (const dadosTarefa of dados.tarefas) {
        const tarefa = new Tarefa(dadosTarefa.titulo)
        projeto.adicionarTarefa(tarefa)

        if (dadosTarefa.responsavel) {
            const resultado = projeto.atribuirTarefa(
                projeto.tarefas.length,
                dadosTarefa.responsavel
            )

            if (resultado === "Integrante não encontrado.") {
                throw new Error("O arquivo de projetos contém um responsável inválido.")
            }
        }

        if (dadosTarefa.concluida) {
            tarefa.concluir()
        }
    }

    return { id: dados.id, projeto }
}

function carregarProjetos(arquivo = arquivoPadrao) {
    garantirArquivo(arquivo)

    const conteudo = fs.readFileSync(arquivo, "utf8")
    const dados = JSON.parse(conteudo)

    if (!Array.isArray(dados)) {
        throw new Error("O arquivo de projetos deve conter uma lista.")
    }

    return dados.map(reconstruirProjeto)
}

function salvarProjetos(projetos, arquivo = arquivoPadrao) {
    garantirArquivo(arquivo)

    const conteudo = JSON.stringify(projetos.map(serializarProjeto), null, 2)
    fs.writeFileSync(arquivo, `${conteudo}\n`, "utf8")
}

module.exports = {
    carregarProjetos,
    salvarProjetos,
    serializarProjeto
}
