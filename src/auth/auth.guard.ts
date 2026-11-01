import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PapelUsuario } from '../generated/prisma/client';

// dados guardados dentro do token
export interface PayloadToken {
    sub: string; // id do usuário
    papel: PapelUsuario;
}

// requisição depois de passar pelo guard
export type RequisicaoAutenticada = Request & { usuario: PayloadToken };

// protege uma rota: só entra quem mandar "Authorization: Bearer <token>" válido.
// uso: @UseGuards(AuthGuard) na rota ou no controller (o módulo precisa importar o AuthModule).
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requisicao = context.switchToHttp().getRequest<RequisicaoAutenticada>();
        const [tipo, token] = requisicao.headers.authorization?.split(' ') ?? [];

        if (tipo !== 'Bearer' || !token) {
            throw new UnauthorizedException('Faça login para continuar.');
        }

        try {
            requisicao.usuario = await this.jwtService.verifyAsync<PayloadToken>(token);
        } catch {
            throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
        }

        return true;
    }
}
