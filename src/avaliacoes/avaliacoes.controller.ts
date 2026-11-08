import { Controller, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import {
  CreateAvaliacaoLojaDto,
  UpdateAvaliacaoLojaDto,
  CreateAvaliacaoProdutoDto,
  UpdateAvaliacaoProdutoDto,
} from './avaliacoes.dto';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post('lojas')
  @HttpCode(HttpStatus.CREATED)
  createLoja(@Body() dto: CreateAvaliacaoLojaDto) {
    return this.avaliacoesService.createLoja(dto);
  }

  @Get('lojas')
  findAllLojas() {
    return this.avaliacoesService.findAllLojas();
  }

  @Get('lojas/:id')
  findOneLoja(@Param('id') id: string) {
    return this.avaliacoesService.findOneLoja(id);
  }

  @Patch('lojas/:id')
  updateLoja(@Param('id') id: string, @Body() dto: UpdateAvaliacaoLojaDto) {
    return this.avaliacoesService.updateLoja(id, dto);
  }

  @Delete('lojas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeLoja(@Param('id') id: string) {
    return this.avaliacoesService.removeLoja(id);
  }

  @Post('produtos')
  @HttpCode(HttpStatus.CREATED)
  createProduto(@Body() dto: CreateAvaliacaoProdutoDto) {
    return this.avaliacoesService.createProduto(dto);
  }

  @Get('produtos')
  findAllProdutos() {
    return this.avaliacoesService.findAllProdutos();
  }

  @Get('produtos/:id')
  findOneProduto(@Param('id') id: string) {
    return this.avaliacoesService.findOneProduto(id);
  }

  @Patch('produtos/:id')
  updateProduto(@Param('id') id: string, @Body() dto: UpdateAvaliacaoProdutoDto) {
    return this.avaliacoesService.updateProduto(id, dto);
  }

  @Delete('produtos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProduto(@Param('id') id: string) {
    return this.avaliacoesService.removeProduto(id);
  }
}