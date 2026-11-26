const assert = require("node:assert/strict")
const test = require("node:test")

const Projeto = require("../Projeto")
const ProjetoEscolar = require("../ProjetoEscolar")
const ProjetoFactory = require("../ProjetoFactory")
const ProjetoTrabalho = require("../ProjetoTrabalho")
const { Integrante, Lider } = require("../Pessoa")
const Tarefa = require("../Tarefa")

test("a fábrica cria as especializações corretas e aceita variação de caixa", () => {
    const escolar = ProjetoFactory.criarProjeto("ESCOLAR", "Feira de ciências")
    const trabalho = ProjetoFactory.criarProjeto("trabalho", "Aplicativo")

    assert.ok(escolar instanceof ProjetoEscolar)
    assert.ok(trabalho instanceof ProjetoTrabalho)
    assert.equal(escolar.apresentarProjeto(), "Projeto escolar: Feira de ciências")
    assert.equal(trabalho.apresentarProjeto(), "Projeto de trabalho: Aplicativo")
    assert.equal(ProjetoFactory.criarProjeto("pessoal", "Ideia"), null)
})

test("pessoas e tarefas rejeitam nomes vazios", () => {
    assert.throws(() => new Lider("  "), /nome da pessoa é obrigatório/)
    assert.throws(() => new Tarefa("  "), /título da tarefa é obrigatório/)
})

test("projetos validam os dados e mantêm suas listas encapsuladas", () => {
    const projeto = new Projeto("  Projeto válido  ", "Pessoal")
    const integrante = new Integrante("Ana")
    const tarefa = new Tarefa("Planejar")

    projeto.adicionarIntegrante(integrante)
    projeto.adicionarTarefa(tarefa)

    const integrantes = projeto.integrantes
    const tarefas = projeto.tarefas
    integrantes.pop()
    tarefas.pop()

    assert.equal(projeto.nome, "Projeto válido")
    assert.equal(projeto.integrantes.length, 1)
    assert.equal(projeto.tarefas.length, 1)
    assert.throws(() => new Projeto("", "Pessoal"), /nome do projeto é obrigatório/)
    assert.throws(() => projeto.adicionarIntegrante({ nome: "Inválido" }), TypeError)
})

test("tarefas podem ser atribuídas e concluídas pelo projeto", () => {
    const projeto = new ProjetoEscolar("Feira")
    const lider = new Lider("Bia")
    const tarefa = new Tarefa("Montar apresentação")

    projeto.adicionarIntegrante(lider)
    projeto.adicionarTarefa(tarefa)

    assert.equal(projeto.atribuirTarefa(1, "Bia"), "Tarefa atribuída para Bia.")
    assert.equal(tarefa.responsavel, lider)
    assert.equal(projeto.concluirTarefa(1), 'Tarefa "Montar apresentação" concluída.')
    assert.match(tarefa.apresentar(), /Estado: Concluída/)
})

test("números de tarefa inválidos e responsáveis ausentes são tratados", () => {
    const projeto = new ProjetoTrabalho("Aplicativo")
    projeto.adicionarTarefa(new Tarefa("Implementar tela"))

    assert.equal(projeto.atribuirTarefa(0, "Ana"), "Tarefa não encontrada.")
    assert.equal(projeto.atribuirTarefa(1, "Ana"), "Integrante não encontrado.")
    assert.equal(projeto.concluirTarefa(1.5), "Tarefa não encontrada.")
})
