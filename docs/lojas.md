# Lojas

CRUD de lojas. Código em `src/loja/`.

## Rotas

| Rota | Login | O que faz |
| --- | --- | --- |
| `POST /loja` | sim | Cria a loja. Quem cria vira o DONO |
| `GET /loja` | não | Lista as lojas ativas, em ordem de nome |
| `GET /loja/minhas` | sim | Lista as lojas de quem está logado |
| `GET /loja/:id` | não | Dados da loja e os produtos à venda |
| `PATCH /loja/:id` | dono | Edita os dados e troca as imagens |
| `DELETE /loja/:id` | dono | Exclui a loja |

## Criar e editar (modal "Adicionar loja")

O front envia um `FormData` (multipart) com:

| Campo | Tipo | Regra |
| --- | --- | --- |
| `nome` | texto | obrigatório na criação, até 60 caracteres |
| `categoriaId` | texto | obrigatório na criação; categoria principal e ativa (sem `paiId`) |
| `foto` | arquivo | opcional; JPG, PNG ou WEBP (foto de perfil, o círculo da loja) |
| `logo` | arquivo | opcional; SVG sem scripts |
| `banner` | arquivo | opcional; JPG, PNG ou WEBP (topo da página da loja) |

Cada arquivo pode ter até 5 MB. As imagens ficam em `uploads/lojas/` e o banco guarda o caminho
(`fotoUrl`, `logoUrl`, `bannerUrl`), por exemplo `/uploads/lojas/<arquivo>.png`.

Também são aceitos `emailContato`, `descricao`, `telefone` e `cnpj` (14 números), que não aparecem
no modal. Sem `emailContato`, a loja usa o e-mail do dono. No `PATCH`, mandar texto vazio em um
campo opcional apaga o valor, e mandar uma imagem nova apaga a antiga.

## Regras

- A loja já nasce `ATIVA` (o projeto não tem aprovação de admin).
- O `slug` (endereço da loja) é gerado pelo nome: "Casa do Café" vira `casa-do-cafe`.
  Se já existir, ganha um final aleatório. Ele não muda quando o nome é editado.
- Quem cria a loja e era `CLIENTE` passa a ser `VENDEDOR`.
- Excluir não apaga do banco: a loja fica `ENCERRADA` (com `excluidoEm`) e os produtos dela
  saem do catálogo. Pedidos e avaliações continuam no histórico.
- Se a requisição der erro, as imagens enviadas nela são apagadas da pasta.
- CNPJ repetido devolve 409 com mensagem; só o dono pode editar ou excluir (403 para os outros).
