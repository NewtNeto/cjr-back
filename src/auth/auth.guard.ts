import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PapelUsuario } from '../generated/prisma/client';

// dados guardados dentro do token
export interface PayloadToken {
    sub: number; // id do usuário
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
        const token = requisicao.cookies?.['auth_token'];

        if (!token) {
            throw new UnauthorizedException('Faça login para continuar.');
        }

        let payload: PayloadToken;
        try {
            payload = await this.jwtService.verifyAsync<PayloadToken>(token);
        } catch {
            throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
        }

        // tokens antigos (de quando o id era UUID) guardam o id como texto: pede login de novo
        if (!Number.isInteger(payload.sub)) {
            throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
        }

        requisicao.usuario = payload;

        return true;
    }
}
