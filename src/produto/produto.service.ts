import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

const includeProduto = {
  categoria: true,
  loja: true,
  imagens: {
    orderBy: { ordem: 'asc' as const },
  },
};

@Injectable()
export class ProdutoService {
  constructor(private prisma: PrismaService) {}

  async create(createProdutoDto: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: createProdutoDto,
      include: includeProduto,
    });
  }

  async findAll() {
    return this.prisma.produto.findMany({
      where: { excluidoEm: null },
      orderBy: { criadoEm: 'desc' },
      include: includeProduto,
    });
  }

  async findOne(id: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: includeProduto,
    });

    if (!produto || produto.excluidoEm) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }

    return produto;
  }

  async update(id: number, updateProdutoDto: UpdateProdutoDto) {
    await this.findOne(id);

    return this.prisma.produto.update({
      where: { id },
      data: updateProdutoDto,
      include: includeProduto,
    });
  }

  async remove(id: number) {
    return this.prisma.produto.delete({
      where: { id },
    });
  }
}