import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateAvaliacaoLojaDto,
  UpdateAvaliacaoLojaDto,
  CreateAvaliacaoProdutoDto,
  UpdateAvaliacaoProdutoDto,
} from './avaliacoes.dto';

@Injectable()
export class AvaliacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async createLoja(dto: CreateAvaliacaoLojaDto) {
    try {
      return await this.prisma.avaliacaoLoja.create({
        data: dto,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Este usuário já avaliou esta loja.');
      }
      throw error;
    }
  }

  async findAllLojas() {
    return this.prisma.avaliacaoLoja.findMany();
  }

  async findOneLoja(id: string) {
    const avaliacao = await this.prisma.avaliacaoLoja.findUnique({
      where: { id },
    });

    if (!avaliacao) {
      throw new NotFoundException('Avaliação de loja não encontrada.');
    }

    return avaliacao;
  }

  async updateLoja(id: string, dto: UpdateAvaliacaoLojaDto) {
    await this.findOneLoja(id);

    return this.prisma.avaliacaoLoja.update({
      where: { id },
      data: dto,
    });
  }

  async removeLoja(id: string) {
    await this.findOneLoja(id);

    return this.prisma.avaliacaoLoja.delete({
      where: { id },
    });
  }

  async createProduto(dto: CreateAvaliacaoProdutoDto) {
    try {
      return await this.prisma.avaliacaoProduto.create({
        data: dto,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Este usuário já avaliou este produto.');
      }
      throw error;
    }
  }

  async findAllProdutos() {
    return this.prisma.avaliacaoProduto.findMany();
  }

  async findOneProduto(id: string) {
    const avaliacao = await this.prisma.avaliacaoProduto.findUnique({
      where: { id },
    });

    if (!avaliacao) {
      throw new NotFoundException('Avaliação de produto não encontrada.');
    }

    return avaliacao;
  }

  async updateProduto(id: string, dto: UpdateAvaliacaoProdutoDto) {
    await this.findOneProduto(id);

    return this.prisma.avaliacaoProduto.update({
      where: { id },
      data: dto,
    });
  }

  async removeProduto(id: string) {
    await this.findOneProduto(id);

    return this.prisma.avaliacaoProduto.delete({
      where: { id },
    });
  }
}