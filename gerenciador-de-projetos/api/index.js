const express = require("express")
const criarRouterProjetos = require("./routes/projetos")

function criarApp(opcoes = {}) {
    const app = express()

    app.use(express.json())
    app.use("/api/projetos", criarRouterProjetos(opcoes.arquivoDados))

    app.use((req, res) => {
        res.status(404).json({ erro: "Rota não encontrada." })
    })

    app.use((erro, req, res, next) => {
        const status = Number.isInteger(erro.status) ? erro.status : 500
        const mensagem = status === 400
            ? "JSON inválido na requisição."
            : (erro.message || "Erro interno do servidor.")

        res.status(status).json({ erro: mensagem })
    })

    return app
}

module.exports = criarApp()
module.exports.criarApp = criarApp
