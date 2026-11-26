import { Controller, Get, Post, Body, Param, Patch, Delete, ForbiddenException, HttpCode, HttpStatus, Req, Res, UploadedFile, UseGuards, UseInterceptors, ParseIntPipe } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, type RequisicaoAutenticada } from '../auth/auth.guard';
import { opcoesUploadFoto } from './foto-upload';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';
import { PapelUsuario } from '../generated/prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // troca a foto de quem está logado. O front envia um FormData com o arquivo no campo "foto".
  @Patch('me/foto')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('foto', opcoesUploadFoto))
  atualizarFoto(@Req() requisicao: RequisicaoAutenticada, @UploadedFile() foto: Express.Multer.File | undefined) {
    return this.userService.atualizarFoto(requisicao.usuario.sub, foto);
  }

  // rotas "me": a propria pessoa logada (o id vem do token, nao da url).
  // precisam vir antes das rotas ":id", senao "me" seria lido como um id
  @Patch('me')
  @UseGuards(AuthGuard)
  atualizarPerfil(@Req() requisicao: RequisicaoAutenticada, @Body() dados: AtualizarPerfilDto) {
    return this.userService.atualizarPerfil(requisicao.usuario.sub, dados);
  }

  @Patch('me/senha')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  alterarSenha(@Req() requisicao: RequisicaoAutenticada, @Body() dados: AlterarSenhaDto) {
    return this.userService.alterarSenha(requisicao.usuario.sub, dados);
  }

  // apaga a conta de quem esta logado e encerra a sessao (apaga o cookie do login)
  @Delete('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirConta(@Req() requisicao: RequisicaoAutenticada, @Res({ passthrough: true }) res: Response) {
    await this.userService.remove(requisicao.usuario.sub);
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // editar ou apagar pelo id: so a propria pessoa ou um ADMIN
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Req() requisicao: RequisicaoAutenticada, @Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    this.exigirDonoOuAdmin(requisicao, id);
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() requisicao: RequisicaoAutenticada, @Param('id', ParseIntPipe) id: number) {
    this.exigirDonoOuAdmin(requisicao, id);
    await this.userService.remove(id);
  }

  private exigirDonoOuAdmin(requisicao: RequisicaoAutenticada, id: number) {
    if (requisicao.usuario.sub !== id && requisicao.usuario.papel !== PapelUsuario.ADMIN) {
      throw new ForbiddenException('Você só pode alterar a sua própria conta.');
    }
  }
}
