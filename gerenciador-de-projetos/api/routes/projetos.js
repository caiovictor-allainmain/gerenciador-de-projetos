const express = require("express")

const ProjetoFactory = require("../../ProjetoFactory")
const { Integrante, Lider } = require("../../Pessoa")
const Tarefa = require("../../Tarefa")
const {
    carregarProjetos,
    salvarProjetos,
    serializarProjeto
} = require("../armazenamento")
const {
    validarProjeto,
    validarIntegrante,
    validarTarefa
} = require("../middlewares/validarProjeto")

function criarRouterProjetos(arquivoDados) {
    const router = express.Router()
    const projetos = carregarProjetos(arquivoDados)

    function salvar() {
        salvarProjetos(projetos, arquivoDados)
    }

    function buscarProjeto(req, res) {
        const id = Number(req.params.id)

        if (!Number.isSafeInteger(id) || id < 1) {
            res.status(400).json({ erro: "O id do projeto deve ser um número positivo." })
            return null
        }

        const registro = projetos.find(projeto => projeto.id === id)

        if (!registro) {
            res.status(404).json({ erro: "Projeto não encontrado." })
            return null
        }

        return registro
    }

    router.get("/", (req, res) => {
        res.json(projetos.map(serializarProjeto))
    })

    router.post("/", validarProjeto, (req, res) => {
        const projeto = ProjetoFactory.criarProjeto(req.body.tipo, req.body.nome)
        const registro = {
            id: projetos.reduce((maiorId, item) => Math.max(maiorId, item.id), 0) + 1,
            projeto
        }

        projetos.push(registro)
        salvar()
        res.status(201).json({
            mensagem: "Projeto criado com sucesso.",
            projeto: serializarProjeto(registro)
        })
    })

    router.get("/:id", (req, res) => {
        const registro = buscarProjeto(req, res)

        if (registro) {
            res.json(serializarProjeto(registro))
        }
    })

    router.delete("/:id", (req, res) => {
        const registro = buscarProjeto(req, res)

        if (!registro) {
            return
        }

        projetos.splice(projetos.indexOf(registro), 1)
        salvar()
        res.json({ mensagem: "Projeto excluído com sucesso." })
    })

    router.post("/:id/integrantes", validarIntegrante, (req, res) => {
        const registro = buscarProjeto(req, res)

        if (!registro) {
            return
        }

        const { nome, tipo } = req.body
        const PessoaProjeto = tipo.trim().toLowerCase() === "lider" ? Lider : Integrante
        const pessoa = new PessoaProjeto(nome)

        registro.projeto.adicionarIntegrante(pessoa)
        salvar()
        res.status(201).json(serializarProjeto(registro))
    })

    router.post("/:id/tarefas", validarTarefa, (req, res) => {
        const registro = buscarProjeto(req, res)

        if (!registro) {
            return
        }

        registro.projeto.adicionarTarefa(new Tarefa(req.body.titulo))
        salvar()
        res.status(201).json(serializarProjeto(registro))
    })

    router.patch("/:id/tarefas/:numero/atribuir", (req, res) => {
        const registro = buscarProjeto(req, res)

        if (!registro) {
            return
        }

        const numeroTarefa = Number(req.params.numero)
        const { nomeIntegrante } = req.body || {}

        if (!Number.isSafeInteger(numeroTarefa) || numeroTarefa < 1) {
            return res.status(400).json({ erro: "O numero da tarefa deve ser positivo." })
        }

        if (typeof nomeIntegrante !== "string" || nomeIntegrante.trim() === "") {
            return res.status(400).json({ erro: "O campo nomeIntegrante é obrigatório." })
        }

        const mensagem = registro.projeto.atribuirTarefa(numeroTarefa, nomeIntegrante.trim())

        if (mensagem === "Tarefa não encontrada." || mensagem === "Integrante não encontrado.") {
            return res.status(404).json({ erro: mensagem })
        }

        salvar()
        res.json({
            mensagem,
            projeto: serializarProjeto(registro)
        })
    })

    router.patch("/:id/tarefas/:numero/concluir", (req, res) => {
        const registro = buscarProjeto(req, res)

        if (!registro) {
            return
        }

        const numeroTarefa = Number(req.params.numero)
        const mensagem = registro.projeto.concluirTarefa(numeroTarefa)

        if (mensagem === "Tarefa não encontrada.") {
            return res.status(404).json({ erro: mensagem })
        }

        salvar()
        res.json({
            mensagem,
            projeto: serializarProjeto(registro)
        })
    })

    return router
}

module.exports = criarRouterProjetos
