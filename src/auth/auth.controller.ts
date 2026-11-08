import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import type { RequisicaoAutenticada } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { EsqueciSenhaDto } from './dto/esqueci-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dados: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const resultado = await this.authService.login(dados.email, dados.senha);
        const token = resultado.token;

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        });

        return resultado;
    }

    // devolve o usuário dono do token
    @Get('me')
    @UseGuards(AuthGuard)
    perfil(@Req() requisicao: RequisicaoAutenticada) {
        return this.authService.perfil(requisicao.usuario.sub);
    }

    @Post('esqueci-senha')
    @HttpCode(HttpStatus.OK)
    esqueciSenha(@Body() dados: EsqueciSenhaDto) {
        return this.authService.esqueciSenha(dados.email);
    }

    @Post('redefinir-senha')
    @HttpCode(HttpStatus.OK)
    redefinirSenha(@Body() dados: RedefinirSenhaDto) {
        return this.authService.redefinirSenha(dados.token, dados.senha);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        });
        return { message: 'Logout realizado com sucesso' };
    }
}
