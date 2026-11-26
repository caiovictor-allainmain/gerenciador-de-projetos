# Gerenciador de projetos

Aplicação de terminal desenvolvida em JavaScript puro com `prompt-sync` e
Programação Orientada a Objetos. O projeto demonstra classes, encapsulamento
com campos privados, getters e setters, herança, sobrescrita de métodos,
polimorfismo e uma fábrica de projetos. Também inclui uma API REST com Express
em uma pasta separada, sem substituir a interface de terminal.

## Requisitos

- Node.js
- npm

## Como executar

Instale as dependências e inicie o menu:

```bash
npm install
npm start
```

Durante o desenvolvimento, use o modo watch:

```bash
npm run dev
```

## API REST

Instale as dependências com `npm install` e inicie a API:

```bash
npm run api
```

O servidor usa a porta `3000` por padrão. Para escolher outra porta, defina
`PORT` no ambiente. Em desenvolvimento, use `npm run api:dev`.

Todas as rotas começam com `/api` e recebem ou retornam JSON:

| Método | Rota | Uso |
| --- | --- | --- |
| `GET` | `/api/projetos` | Lista os projetos |
| `POST` | `/api/projetos` | Cria projeto com `{ "nome": "...", "tipo": "escolar" }` ou `"trabalho"` |
| `GET` | `/api/projetos/:id` | Consulta um projeto |
| `DELETE` | `/api/projetos/:id` | Exclui um projeto |
| `POST` | `/api/projetos/:id/integrantes` | Adiciona `{ "nome": "...", "tipo": "lider" }` ou `"integrante"` |
| `POST` | `/api/projetos/:id/tarefas` | Adiciona uma tarefa com `{ "titulo": "..." }` |
| `PATCH` | `/api/projetos/:id/tarefas/:numero/atribuir` | Atribui `{ "nomeIntegrante": "..." }` |
| `PATCH` | `/api/projetos/:id/tarefas/:numero/concluir` | Conclui a tarefa |

Os dados da API são persistidos em `api/data/projetos.json` com o módulo nativo
`fs` e continuam disponíveis após reiniciar o servidor. Respostas de erro usam
o formato `{ "erro": "mensagem" }`.

## Testes

Os testes usam o executor nativo do Node.js:

```bash
npm test
```

## Organização

- `Pessoa.js`: classe base `Pessoa` e especializações `Lider` e `Integrante`.
- `Projeto.js`: dados e operações do projeto, integrantes e tarefas.
- `ProjetoEscolar.js` e `ProjetoTrabalho.js`: especializações de `Projeto`.
- `ProjetoFactory.js`: cria a especialização a partir do tipo escolhido.
- `Tarefa.js`: estado, responsável e apresentação de cada tarefa.
- `index.js`: interação com o usuário pelo terminal.