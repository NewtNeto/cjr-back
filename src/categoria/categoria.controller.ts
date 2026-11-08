import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { AuthGuard } from '../auth/auth.guard';
import type { RequisicaoAutenticada } from '../auth/auth.guard';
import { PapelUsuario } from '../generated/prisma/client';

@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  // criar, editar e apagar: só ADMIN (regra do schema: categorias são da plataforma, não das lojas)
  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Req() requisicao: RequisicaoAutenticada, @Body() createCategoriaDto: CreateCategoriaDto) {
    this.exigirAdmin(requisicao);
    return this.categoriaService.create(createCategoriaDto);
  }

  // listar e ver: público
  @Get()
  findAll() {
    return this.categoriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriaService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Req() requisicao: RequisicaoAutenticada,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    this.exigirAdmin(requisicao);
    return this.categoriaService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() requisicao: RequisicaoAutenticada, @Param('id', ParseUUIDPipe) id: string) {
    this.exigirAdmin(requisicao);
    return this.categoriaService.remove(id);
  }

  private exigirAdmin(requisicao: RequisicaoAutenticada) {
    if (requisicao.usuario.papel !== PapelUsuario.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem gerenciar categorias.');
    }
  }
}
