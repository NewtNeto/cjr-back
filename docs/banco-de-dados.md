# Banco de dados

PostgreSQL com Prisma.

## Organização

```
prisma/
  schema/
    base.prisma        configuração do Prisma
    usuarios.prisma    Usuario, TokenRecuperacaoSenha
    lojas.prisma       Loja, MembroLoja
    catalogo.prisma    Categoria, Produto, ImagemProduto
    avaliacoes.prisma  AvaliacaoLoja, AvaliacaoProduto
    comentarios.prisma Comentario
    pedidos.prisma     Carrinho, ItemCarrinho, Pedido, ItemPedido
  migrations/          histórico de alterações do banco
prisma.config.ts       configuração da CLI do Prisma
.env.example           modelo das variáveis de ambiente
```

Tabelas novas entram no arquivo do assunto correspondente.

## Como executar

1. Ter um PostgreSQL rodando e criar um banco vazio.
2. Copiar `.env.example` para `.env` e ajustar a `DATABASE_URL`.
3. Rodar:

```bash
npm install
npm run db:migrar   # cria as tabelas e gera o código do Prisma em src/generated
```

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run db:migrar` | Cria e aplica migrations no banco local |
| `npm run db:migrar:producao` | Aplica as migrations existentes (produção) |
| `npm run db:gerar` | Gera o código do Prisma em `src/generated` |
| `npm run db:validar` | Valida o schema |

Depois de alterar qualquer arquivo `.prisma`, rode `npm run db:migrar` e dê um nome à migration.
Migrations já enviadas ao git não devem ser editadas.

## Comentários

Tabela `comentarios`. Cada comentário fica em um lugar só: `avaliacaoLojaId`, `avaliacaoProdutoId`
ou `produtoId` (exatamente um preenchido). Não há resposta a outro comentário.

- O banco recusa comentário sem lugar, com dois lugares ou com texto vazio.
- Apagar a avaliação ou o produto apaga os comentários dele.
- Comentário editado: `atualizadoEm` diferente de `criadoEm`.

```ts
// comentarios de um produto, do mais antigo ao mais novo
prisma.comentario.findMany({
  where: { produtoId },
  orderBy: { criadoEm: 'asc' },
  include: { usuario: { select: { nomeUsuario: true, fotoUrl: true } } },
});
```
