import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
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
    login(@Body() dados: LoginDto) {
        return this.authService.login(dados.email, dados.senha);
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
}
