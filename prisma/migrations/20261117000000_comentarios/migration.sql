-- CreateTable
CREATE TABLE "comentarios" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "avaliacao_loja_id" UUID,
    "avaliacao_produto_id" UUID,
    "produto_id" UUID,
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
