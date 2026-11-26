const TIPOS_PROJETO = ["escolar", "trabalho"]

function validarProjeto(req, res, next) {
    const { nome, tipo } = req.body || {}

    if (typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({ erro: "O campo nome é obrigatório." })
    }

    if (typeof tipo !== "string" || !TIPOS_PROJETO.includes(tipo.trim().toLowerCase())) {
        return res.status(400).json({
            erro: "O campo tipo deve ser 'escolar' ou 'trabalho'."
        })
    }

    next()
}

function validarIntegrante(req, res, next) {
    const { nome, tipo } = req.body || {}

    if (typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({ erro: "O campo nome é obrigatório." })
    }

    if (typeof tipo !== "string" || !["lider", "integrante"].includes(tipo.trim().toLowerCase())) {
        return res.status(400).json({
            erro: "O campo tipo deve ser 'lider' ou 'integrante'."
        })
    }

    next()
}

function validarTarefa(req, res, next) {
    const { titulo } = req.body || {}

    if (typeof titulo !== "string" || titulo.trim() === "") {
        return res.status(400).json({ erro: "O campo titulo é obrigatório." })
    }

    next()
}

module.exports = {
    validarProjeto,
    validarIntegrante,
    validarTarefa
}
