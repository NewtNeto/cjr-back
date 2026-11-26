-- Banco inteiro recriado com ids inteiros (autoincrement) no lugar de UUID.
-- Junta as migrations antigas numa so. Para aplicar: npx prisma migrate reset

-- ===== antes: 20261015000000_modelagem_inicial =====
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "status_produto" AS ENUM ('RASCUNHO', 'ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "status_loja" AS ENUM ('PENDENTE', 'ATIVA', 'SUSPENSA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "papel_na_loja" AS ENUM ('DONO', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "status_pedido" AS ENUM ('PENDENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "papel_usuario" AS ENUM ('ADMIN', 'VENDEDOR', 'CLIENTE');

-- CreateTable
CREATE TABLE "avaliacoes_loja" (
    "id" SERIAL NOT NULL,
    "loja_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "resposta" TEXT,
    "respondida_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avaliacoes_loja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes_produto" (
    "id" SERIAL NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "resposta" TEXT,
    "respondida_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avaliacoes_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "pai_id" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" SERIAL NOT NULL,
    "loja_id" INTEGER NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "sku" TEXT,
    "preco" DECIMAL(12,2) NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "status" "status_produto" NOT NULL DEFAULT 'RASCUNHO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "excluido_em" TIMESTAMP(3),

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagens_produto" (
    "id" SERIAL NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagens_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lojas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "logo_url" TEXT,
    "email_contato" TEXT NOT NULL,
    "telefone" TEXT,
    "cnpj" TEXT,
    "status" "status_loja" NOT NULL DEFAULT 'PENDENTE',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "excluido_em" TIMESTAMP(3),

    CONSTRAINT "lojas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membros_loja" (
    "id" SERIAL NOT NULL,
    "loja_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "papel" "papel_na_loja" NOT NULL DEFAULT 'VENDEDOR',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membros_loja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrinhos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrinhos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_carrinho" (
    "id" SERIAL NOT NULL,
    "carrinho_id" INTEGER NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_carrinho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "numero" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "loja_id" INTEGER NOT NULL,
    "status" "status_pedido" NOT NULL DEFAULT 'PENDENTE',
    "total" DECIMAL(12,2) NOT NULL,
    "observacao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "titulo_produto" TEXT NOT NULL,
    "preco_unitario" DECIMAL(12,2) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_usuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT,
    "papel" "papel_usuario" NOT NULL DEFAULT 'CLIENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "email_verificado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "excluido_em" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_recuperacao_senha" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "usado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_recuperacao_senha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avaliacoes_loja_usuario_id_idx" ON "avaliacoes_loja"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_loja_loja_id_usuario_id_key" ON "avaliacoes_loja"("loja_id", "usuario_id");

-- CreateIndex
CREATE INDEX "avaliacoes_produto_usuario_id_idx" ON "avaliacoes_produto"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_produto_produto_id_usuario_id_key" ON "avaliacoes_produto"("produto_id", "usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "categorias_pai_id_idx" ON "categorias"("pai_id");

-- CreateIndex
CREATE INDEX "produtos_categoria_id_idx" ON "produtos"("categoria_id");

-- CreateIndex
CREATE INDEX "produtos_loja_id_status_idx" ON "produtos"("loja_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_loja_id_slug_key" ON "produtos"("loja_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_loja_id_sku_key" ON "produtos"("loja_id", "sku");

-- CreateIndex
CREATE INDEX "imagens_produto_produto_id_idx" ON "imagens_produto"("produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "lojas_slug_key" ON "lojas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lojas_cnpj_key" ON "lojas"("cnpj");

-- CreateIndex
CREATE INDEX "membros_loja_usuario_id_idx" ON "membros_loja"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "membros_loja_loja_id_usuario_id_key" ON "membros_loja"("loja_id", "usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "carrinhos_usuario_id_key" ON "carrinhos"("usuario_id");

-- CreateIndex
CREATE INDEX "itens_carrinho_produto_id_idx" ON "itens_carrinho"("produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "itens_carrinho_carrinho_id_produto_id_key" ON "itens_carrinho"("carrinho_id", "produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numero_key" ON "pedidos"("numero");

-- CreateIndex
CREATE INDEX "pedidos_cliente_id_idx" ON "pedidos"("cliente_id");

-- CreateIndex
CREATE INDEX "pedidos_loja_id_status_idx" ON "pedidos"("loja_id", "status");

-- CreateIndex
CREATE INDEX "itens_pedido_pedido_id_idx" ON "itens_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "itens_pedido_produto_id_idx" ON "itens_pedido"("produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nome_usuario_key" ON "usuarios"("nome_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_recuperacao_senha_token_hash_key" ON "tokens_recuperacao_senha"("token_hash");

-- CreateIndex
CREATE INDEX "tokens_recuperacao_senha_usuario_id_idx" ON "tokens_recuperacao_senha"("usuario_id");

-- AddForeignKey
ALTER TABLE "avaliacoes_loja" ADD CONSTRAINT "avaliacoes_loja_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes_loja" ADD CONSTRAINT "avaliacoes_loja_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes_produto" ADD CONSTRAINT "avaliacoes_produto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes_produto" ADD CONSTRAINT "avaliacoes_produto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_pai_id_fkey" FOREIGN KEY ("pai_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagens_produto" ADD CONSTRAINT "imagens_produto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membros_loja" ADD CONSTRAINT "membros_loja_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membros_loja" ADD CONSTRAINT "membros_loja_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrinhos" ADD CONSTRAINT "carrinhos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_carrinho" ADD CONSTRAINT "itens_carrinho_carrinho_id_fkey" FOREIGN KEY ("carrinho_id") REFERENCES "carrinhos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_carrinho" ADD CONSTRAINT "itens_carrinho_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_recuperacao_senha" ADD CONSTRAINT "tokens_recuperacao_senha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== antes: 20261015000001_restricoes_de_valores =====
-- Restrições que o Prisma não consegue declarar no schema.
-- Elas protegem o banco mesmo que algum código esqueça de validar.
-- (Esta migration foi escrita à mão; as próximas continuam sendo geradas pelo Prisma.)

-- Produtos: preço e estoque nunca negativos.
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_preco_nao_negativo" CHECK ("preco" >= 0);
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_estoque_nao_negativo" CHECK ("estoque" >= 0);

-- Carrinho e itens do pedido: sempre pelo menos 1 unidade.
ALTER TABLE "itens_carrinho" ADD CONSTRAINT "itens_carrinho_quantidade_positiva" CHECK ("quantidade" > 0);
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_quantidade_positiva" CHECK ("quantidade" > 0);

-- Pedidos: valores não negativos e contas fechando (subtotal do item = preço x quantidade).
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_valores_nao_negativos" CHECK ("preco_unitario" >= 0 AND "subtotal" >= 0);
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_subtotal_confere" CHECK ("subtotal" = "preco_unitario" * "quantidade");
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_total_nao_negativo" CHECK ("total" >= 0);

-- Avaliações: nota de 0 a 5 estrelas.
ALTER TABLE "avaliacoes_loja" ADD CONSTRAINT "avaliacoes_loja_nota_valida" CHECK ("nota" BETWEEN 0 AND 5);
ALTER TABLE "avaliacoes_produto" ADD CONSTRAINT "avaliacoes_produto_nota_valida" CHECK ("nota" BETWEEN 0 AND 5);

-- Formato dos dados: e-mail e nome de usuário em minúsculas, documentos só com números.
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_cpf_formato" CHECK ("cpf" IS NULL OR "cpf" ~ '^[0-9]{11}$');
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_email_minusculo" CHECK ("email" = lower("email"));
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_nome_usuario_minusculo" CHECK ("nome_usuario" = lower("nome_usuario"));
ALTER TABLE "lojas" ADD CONSTRAINT "lojas_cnpj_formato" CHECK ("cnpj" IS NULL OR "cnpj" ~ '^[0-9]{14}$');

-- ===== antes: 20261106000000_foto_perfil =====
-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "foto_url" TEXT;

-- ===== antes: 20261117000000_comentarios =====
-- CreateTable
CREATE TABLE "comentarios" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "avaliacao_loja_id" INTEGER,
    "avaliacao_produto_id" INTEGER,
    "produto_id" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comentarios_avaliacao_loja_id_criado_em_idx" ON "comentarios"("avaliacao_loja_id", "criado_em");

-- CreateIndex
CREATE INDEX "comentarios_avaliacao_produto_id_criado_em_idx" ON "comentarios"("avaliacao_produto_id", "criado_em");

-- CreateIndex
CREATE INDEX "comentarios_produto_id_criado_em_idx" ON "comentarios"("produto_id", "criado_em");

-- CreateIndex
CREATE INDEX "comentarios_usuario_id_idx" ON "comentarios"("usuario_id");

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_avaliacao_loja_id_fkey" FOREIGN KEY ("avaliacao_loja_id") REFERENCES "avaliacoes_loja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_avaliacao_produto_id_fkey" FOREIGN KEY ("avaliacao_produto_id") REFERENCES "avaliacoes_produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- regras escritas a mao (o prisma nao declara CHECK no schema)

-- o comentario fica em um lugar so: avaliacao de loja, avaliacao de produto ou produto
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_um_lugar_so" CHECK (num_nonnulls("avaliacao_loja_id", "avaliacao_produto_id", "produto_id") = 1);

-- texto nao pode ficar vazio nem so com espacos
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_texto_preenchido" CHECK (length(btrim("texto")) > 0);

-- ===== antes: 20261125000000_loja_categoria_e_imagens =====
-- AlterTable
ALTER TABLE "lojas" ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "categoria_id" INTEGER,
ADD COLUMN     "foto_url" TEXT;

-- CreateIndex
CREATE INDEX "lojas_categoria_id_idx" ON "lojas"("categoria_id");

-- AddForeignKey
ALTER TABLE "lojas" ADD CONSTRAINT "lojas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
