const app = require("./index")

const porta = Number(process.env.PORT) || 3000

app.listen(porta, () => {
    console.log(`API do gerenciador de projetos disponível na porta ${porta}.`)
})
