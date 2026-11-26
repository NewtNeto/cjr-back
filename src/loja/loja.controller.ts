import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard, type RequisicaoAutenticada } from '../auth/auth.guard';
import { CreateLojaDto } from './dto/create-loja.dto';
import { UpdateLojaDto } from './dto/update-loja.dto';
import { LojaService } from './loja.service';
import {
  type ArquivosLoja,
  camposImagem,
  opcoesUploadLoja,
} from './upload-loja';

// rotas de loja: ver e listar sao publicas, o resto exige login.
// criar e editar recebem um FormData com os dados e as imagens (foto, logo e banner)
@Controller('loja')
export class LojaController {
  constructor(private readonly lojaService: LojaService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileFieldsInterceptor(camposImagem, opcoesUploadLoja))
  criar(
    @Req() requisicao: RequisicaoAutenticada,
    @Body() dados: CreateLojaDto,
    @UploadedFiles() arquivos: ArquivosLoja = {},
  ) {
    return this.lojaService.criar(requisicao.usuario.sub, dados, arquivos);
  }

  @Get()
  listar() {
    return this.lojaService.listar();
  }

  // precisa vir antes de ":id", senao "minhas" seria lido como id
  @Get('minhas')
  @UseGuards(AuthGuard)
  minhas(@Req() requisicao: RequisicaoAutenticada) {
    return this.lojaService.minhas(requisicao.usuario.sub);
  }

  // lojas de uma pessoa, para a tela de perfil (publica: qualquer um ve o perfil de qualquer um)
  @Get('usuario/:usuarioId')
  daPessoa(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.lojaService.daPessoa(usuarioId);
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.lojaService.buscar(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileFieldsInterceptor(camposImagem, opcoesUploadLoja))
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Req() requisicao: RequisicaoAutenticada,
    @Body() dados: UpdateLojaDto,
    @UploadedFiles() arquivos: ArquivosLoja = {},
  ) {
    return this.lojaService.atualizar(
      id,
      requisicao.usuario.sub,
      dados,
      arquivos,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  excluir(
    @Param('id', ParseIntPipe) id: number,
    @Req() requisicao: RequisicaoAutenticada,
  ) {
    return this.lojaService.excluir(id, requisicao.usuario.sub);
  }
}
