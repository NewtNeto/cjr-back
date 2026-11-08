import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    await this.garantirSlugLivre(createCategoriaDto.slug);

    if (createCategoriaDto.paiId) {
      await this.validarPai(createCategoriaDto.paiId);
    }

    return this.prisma.categoria.create({
      data: createCategoriaDto,
    });
  }

  async findAll() {
    return this.prisma.categoria.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        pai: true,
        filhas: { orderBy: { nome: 'asc' } },
      },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return categoria;
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);

    if (updateCategoriaDto.slug && updateCategoriaDto.slug !== categoria.slug) {
      await this.garantirSlugLivre(updateCategoriaDto.slug);
    }

    if (updateCategoriaDto.paiId) {
      if (updateCategoriaDto.paiId === id) {
        throw new BadRequestException('Uma categoria não pode ser subcategoria de si mesma.');
      }

      // se esta categoria já tem subcategorias, ela não pode virar subcategoria (seriam 3 níveis)
      if (categoria.filhas.length > 0) {
        throw new BadRequestException(
          'Esta categoria tem subcategorias e por isso não pode virar subcategoria de outra.',
        );
      }

      await this.validarPai(updateCategoriaDto.paiId);
    }

    return this.prisma.categoria.update({
      where: { id },
      data: updateCategoriaDto,
    });
  }

  async remove(id: string) {
    const categoria = await this.findOne(id);

    if (categoria.filhas.length > 0) {
      throw new ConflictException('Esta categoria tem subcategorias. Remova ou mova as subcategorias antes.');
    }

    const totalProdutos = await this.prisma.produto.count({ where: { categoriaId: id } });

    if (totalProdutos > 0) {
      throw new ConflictException(
        'Esta categoria tem produtos. Mova os produtos para outra categoria ou desative-a (ativa: false).',
      );
    }

    await this.prisma.categoria.delete({ where: { id } });
  }

  private async garantirSlugLivre(slug: string) {
    const existente = await this.prisma.categoria.findUnique({ where: { slug } });

    if (existente) {
      throw new ConflictException('Já existe uma categoria com esse slug.');
    }
  }

  // o pai precisa existir e ser uma categoria principal (as categorias têm no máximo 2 níveis)
  private async validarPai(paiId: string) {
    const pai = await this.prisma.categoria.findUnique({ where: { id: paiId } });

    if (!pai) {
      throw new NotFoundException('Categoria pai não encontrada.');
    }

    if (pai.paiId) {
      throw new BadRequestException(
        'A categoria pai já é uma subcategoria. As categorias têm no máximo dois níveis.',
      );
    }
  }
}
