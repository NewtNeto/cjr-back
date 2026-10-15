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
