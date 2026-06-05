# API E-commerce

API REST desenvolvida com Node.js, Express, Prisma ORM e PostgreSQL para gerenciamento de usuários, produtos, carrinho de compras e pedidos.

## 🚀 Tecnologias

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT (JSON Web Token)
- Bcrypt
- ES Modules

## 📋 Funcionalidades

### Autenticação
- Cadastro de usuários
- Login com JWT
- Proteção de rotas
- Controle de acesso por perfil (Admin e Cliente)

### Produtos
- Criar produto
- Listar produtos
- Atualizar produto
- Remover produto

### Carrinho
- Adicionar itens ao carrinho
- Listar carrinho do usuário
- Remover itens do carrinho

### Pedidos
- Criar pedidos a partir do carrinho
- Atualização automática de estoque
- Listagem de pedidos
- Controle de status do pedido
- Transações com Prisma para garantir integridade dos dados

## 📂 Estrutura do Projeto

```bash
src/
├── controllers/
├── services/
├── middlewares/
├── routes/
├── errors/
├── database/
└── app.js
```

## ⚙️ Instalação

### Clone o projeto:

```bash 
git clone https://github.com/josuesantos7/E-commerce-API.git
```
### Instale as dependências:
```bash 
npm install
```

### Configure as variáveis de ambiente:
```bash 
DATABASE_URL=
JWT_SECRET=
PORT=
```

### Execute as migrations:
```bash 
npx prisma migrate dev
```

### Gere o Prisma Client:
```bash 
npx prisma generate
```

### Inicie a aplicação:
```bash 
npm run dev
```

## 🔐 Autenticação

As rotas protegidas utilizam JWT.

Exemplo de header:
```bash
Authorization: Bearer seu_token_aqui
```
## 🛡️ Boas Práticas Aplicadas
- Arquitetura em camadas (Controllers, Services e Middlewares)
- Tratamento centralizado de erros
- Validação de dados
- Controle de permissões por perfil
- Transactions para operações críticas
- Separação de responsabilidades
  
## 📈 Objetivo do Projeto

Este projeto foi desenvolvido com o objetivo de consolidar e aplicar conhecimentos em desenvolvimento backend adquiridos por meio de estudos, documentação oficial e prática contínua.

A aplicação simula um cenário real de e-commerce, contemplando autenticação, autorização, gerenciamento de produtos, carrinho de compras, pedidos e regras de negócio, seguindo boas práticas de arquitetura, organização de código e integridade de dados.

Além de servir como ambiente de aprendizado e experimentação, o projeto representa minha busca constante por evolução técnica e aproximação dos desafios encontrados em aplicações utilizadas no mercado.

#### Desenvolvido por Josué Santos.

