# Autenticação

Login com token JWT. Código em `src/auth/`.

## Rotas

| Rota | O que faz |
| --- | --- |
| `POST /auth/login` | Recebe `email` e `senha`. Devolve `token` e os dados do usuário |
| `GET /auth/me` | Devolve o usuário dono do token (exige login) |
| `POST /auth/esqueci-senha` | Recebe `email`. Gera um link de recuperação (vale 1 hora) |
| `POST /auth/redefinir-senha` | Recebe `token` (do link) e `senha`. Troca a senha |

O cadastro continua em `POST /user`.

## Como proteger uma rota

Importe o `AuthModule` no módulo da rota e use o guard:

```ts
@UseGuards(AuthGuard)
@Get()
listar(@Req() requisicao: RequisicaoAutenticada) {
  // requisicao.usuario.sub = id do usuário, requisicao.usuario.papel = papel
}
```

O front envia o token no cabeçalho `Authorization: Bearer <token>`.

## Variáveis de ambiente

| Variável | Para que serve |
| --- | --- |
| `JWT_SECRET` | Chave que assina os tokens (obrigatória, o servidor não sobe sem ela) |
| `JWT_EXPIRA_EM_SEGUNDOS` | Validade do login. Padrão: 86400 (1 dia) |
| `FRONT_URL` | Endereço do front, usado no link de recuperação. Padrão: `http://localhost:3000` |

## Recuperação de senha

O link tem o formato `FRONT_URL/redefinir-senha?token=...`. Só o hash do token fica no banco
(tabela `tokens_recuperacao_senha`), e cada link funciona uma única vez.

Ainda não há provedor de e-mail: em desenvolvimento o link aparece no console do servidor.
Para enviar de verdade, altere o método `enviarRecuperacaoSenha` em `src/auth/email.service.ts`.
