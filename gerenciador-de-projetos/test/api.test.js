const assert = require("node:assert/strict")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const test = require("node:test")

const criarApp = require("../api").criarApp

test("a API gerencia projetos, integrantes e tarefas", async () => {
    const diretorioDados = fs.mkdtempSync(path.join(os.tmpdir(), "gerenciador-projetos-"))
    const arquivoDados = path.join(diretorioDados, "projetos.json")
    const servidor = criarApp({ arquivoDados }).listen(0, "127.0.0.1")
    await new Promise(resolve => servidor.once("listening", resolve))

    const { port } = servidor.address()
    const baseUrl = `http://127.0.0.1:${port}`

    async function requisitar(caminho, opcoes = {}) {
        const resposta = await fetch(`${baseUrl}${caminho}`, {
            ...opcoes,
            headers: {
                "Content-Type": "application/json",
                ...opcoes.headers
            }
        })

        return {
            status: resposta.status,
            corpo: await resposta.json()
        }
    }

    try {
        assert.deepEqual(await requisitar("/api/projetos"), {
            status: 200,
            corpo: []
        })

        assert.deepEqual(await requisitar("/api/projetos", {
            method: "POST",
            body: JSON.stringify({ nome: "", tipo: "escolar" })
        }), {
            status: 400,
            corpo: { erro: "O campo nome é obrigatório." }
        })

        const criacao = await requisitar("/api/projetos", {
            method: "POST",
            body: JSON.stringify({ nome: "Feira de ciências", tipo: "escolar" })
        })

        assert.equal(criacao.status, 201)
        assert.equal(criacao.corpo.projeto.id, 1)
        assert.equal(criacao.corpo.projeto.tipo, "Escolar")

        const integrante = await requisitar("/api/projetos/1/integrantes", {
            method: "POST",
            body: JSON.stringify({ nome: "Ana", tipo: "lider" })
        })
        assert.equal(integrante.status, 201)
        assert.equal(integrante.corpo.integrantes[0].tipo, "lider")

        const tarefa = await requisitar("/api/projetos/1/tarefas", {
            method: "POST",
            body: JSON.stringify({ titulo: "Preparar apresentação" })
        })
        assert.equal(tarefa.status, 201)
        assert.equal(tarefa.corpo.tarefas[0].concluida, false)

        const atribuicao = await requisitar("/api/projetos/1/tarefas/1/atribuir", {
            method: "PATCH",
            body: JSON.stringify({ nomeIntegrante: "Ana" })
        })
        assert.equal(atribuicao.status, 200)
        assert.equal(atribuicao.corpo.projeto.tarefas[0].responsavel, "Ana")

        const conclusao = await requisitar("/api/projetos/1/tarefas/1/concluir", {
            method: "PATCH"
        })
        assert.equal(conclusao.status, 200)
        assert.equal(conclusao.corpo.projeto.tarefas[0].concluida, true)

        const projetoRecarregado = criarApp({ arquivoDados })
        const servidorRecarregado = projetoRecarregado.listen(0, "127.0.0.1")
        await new Promise(resolve => servidorRecarregado.once("listening", resolve))

        const { port: portaRecarregada } = servidorRecarregado.address()
        const respostaRecarregada = await fetch(
            `http://127.0.0.1:${portaRecarregada}/api/projetos/1`
        )
        const dadosRecarregados = await respostaRecarregada.json()

        assert.equal(respostaRecarregada.status, 200)
        assert.equal(dadosRecarregados.tarefas[0].concluida, true)
        assert.equal(dadosRecarregados.tarefas[0].responsavel, "Ana")
        await new Promise((resolve, reject) => {
            servidorRecarregado.close(erro => erro ? reject(erro) : resolve())
        })

        assert.deepEqual(await requisitar("/api/projetos/99"), {
            status: 404,
            corpo: { erro: "Projeto não encontrado." }
        })

        assert.deepEqual(await requisitar("/rota-inexistente"), {
            status: 404,
            corpo: { erro: "Rota não encontrada." }
        })

        const segundoProjeto = await requisitar("/api/projetos", {
            method: "POST",
            body: JSON.stringify({ nome: "Projeto dois", tipo: "trabalho" })
        })
        assert.equal(segundoProjeto.corpo.projeto.id, 2)

        assert.deepEqual(await requisitar("/api/projetos/1", {
            method: "DELETE"
        }), {
            status: 200,
            corpo: { mensagem: "Projeto excluído com sucesso." }
        })

        const novoProjeto = await requisitar("/api/projetos", {
            method: "POST",
            body: JSON.stringify({ nome: "Projeto novo", tipo: "trabalho" })
        })
        assert.equal(novoProjeto.corpo.projeto.id, 3)

        assert.deepEqual(await requisitar("/api/projetos"), {
            status: 200,
            corpo: [segundoProjeto.corpo.projeto, novoProjeto.corpo.projeto]
        })
    } finally {
        await new Promise((resolve, reject) => {
            servidor.close(erro => erro ? reject(erro) : resolve())
        })
        fs.rmSync(diretorioDados, { recursive: true, force: true })
    }
})
