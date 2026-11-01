import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from './email.service';
import { PayloadToken } from './auth.guard';

// o link de recuperação vale por 1 hora
const VALIDADE_LINK_MS = 60 * 60 * 1000;

// o banco guarda só o hash do token, nunca o token em si
function gerarHash(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

// campos do usuário que podem ser devolvidos ao front
const CAMPOS_PUBLICOS = {
    id: true,
    nome: true,
    nomeUsuario: true,
    email: true,
    papel: true,
} as const;

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) {}

    async login(email: string, senha: string) {
        const registro = await this.prisma.usuario.findFirst({
            where: { email: email.toLowerCase(), excluidoEm: null, ativo: true },
            select: { ...CAMPOS_PUBLICOS, senhaHash: true },
        });

        // mesma mensagem para e-mail inexistente e senha errada, para não revelar quem tem conta
        if (!registro || !(await bcrypt.compare(senha, registro.senhaHash))) {
            throw new UnauthorizedException('E-mail ou senha incorretos.');
        }

        // separa o hash para ele nunca sair na resposta
        const { senhaHash: _senhaHash, ...usuario } = registro;

        const payload: PayloadToken = { sub: usuario.id, papel: usuario.papel };
        const token = await this.jwtService.signAsync(payload);

        return { token, usuario };
    }

    async perfil(id: string) {
        const usuario = await this.prisma.usuario.findFirst({
            where: { id, excluidoEm: null, ativo: true },
            select: CAMPOS_PUBLICOS,
        });

        if (!usuario) {
            throw new UnauthorizedException('Faça login para continuar.');
        }

        return usuario;
    }

    async esqueciSenha(email: string) {
        const usuario = await this.prisma.usuario.findFirst({
            where: { email: email.toLowerCase(), excluidoEm: null, ativo: true },
        });

        if (usuario) {
            const token = randomBytes(32).toString('hex');

            // cancela pedidos anteriores ainda abertos e cria o novo
            await this.prisma.$transaction([
                this.prisma.tokenRecuperacaoSenha.updateMany({
                    where: { usuarioId: usuario.id, usadoEm: null },
                    data: { usadoEm: new Date() },
                }),
                this.prisma.tokenRecuperacaoSenha.create({
                    data: {
                        usuarioId: usuario.id,
                        tokenHash: gerarHash(token),
                        expiraEm: new Date(Date.now() + VALIDADE_LINK_MS),
                    },
                }),
            ]);

            const urlFront = process.env.FRONT_URL ?? 'http://localhost:3000';
            const link = `${urlFront}/redefinir-senha?token=${token}`;

            // falha no envio não pode mudar a resposta, senão revelaria que o e-mail existe
            try {
                await this.emailService.enviarRecuperacaoSenha(usuario.email, link);
            } catch (erro) {
                this.logger.error('não foi possível enviar o e-mail de recuperação', erro);
            }
        }

        // a resposta é sempre a mesma, exista o e-mail ou não
        return { mensagem: 'Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha.' };
    }

    async redefinirSenha(token: string, novaSenha: string) {
        const mensagemInvalido = 'Link inválido ou expirado. Solicite uma nova recuperação de senha.';

        const registro = await this.prisma.tokenRecuperacaoSenha.findUnique({
            where: { tokenHash: gerarHash(token) },
        });

        if (!registro || registro.usadoEm || registro.expiraEm < new Date()) {
            throw new BadRequestException(mensagemInvalido);
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);

        await this.prisma.$transaction(async (tx) => {
            // marca como usado só se ninguém usou antes, assim o link não funciona duas vezes
            const marcado = await tx.tokenRecuperacaoSenha.updateMany({
                where: { id: registro.id, usadoEm: null },
                data: { usadoEm: new Date() },
            });

            if (marcado.count === 0) {
                throw new BadRequestException(mensagemInvalido);
            }

            await tx.usuario.update({
                where: { id: registro.usuarioId },
                data: { senhaHash },
            });
        });

        return { mensagem: 'Senha alterada com sucesso.' };
    }
}
