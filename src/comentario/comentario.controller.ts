import { ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common'
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthGuard, type RequisicaoAutenticada } from '../auth/auth.guard';
import { ComentarioService } from './comentario.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@Controller('comentario')
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req: RequisicaoAutenticada, @Body() createComentarioDto: CreateComentarioDto) {
    return this.comentarioService.create(req.usuario.sub, createComentarioDto);
  }

  @Get()
  findAll(
    @Query('produtoId', new ParseIntPipe({ optional: true })) produtoId?: number,
    @Query('avaliacaoLojaId', new ParseIntPipe({ optional: true })) avaliacaoLojaId?: number,
    @Query('avaliacaoProdutoId', new ParseIntPipe({ optional: true })) avaliacaoProdutoId?: number,
  ) {
    return this.comentarioService.findAll({produtoId, avaliacaoLojaId, avaliacaoProdutoId});
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comentarioService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Req() req: RequisicaoAutenticada, @Body() updateComentarioDto: UpdateComentarioDto) {
    return this.comentarioService.update(id, req.usuario.sub, updateComentarioDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequisicaoAutenticada) {
    return this.comentarioService.remove(id, req.usuario.sub);
  }
}
