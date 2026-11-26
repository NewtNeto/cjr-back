import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@Injectable()
export class ComentarioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(usuarioId: number, dto: CreateComentarioDto) {
    const destinos = [
      dto.avaliacaoLojaId,
      dto.avaliacaoProdutoId,
      dto.produtoId,
    ].filter(Boolean);

    if (destinos.length === 0) {
      throw new BadRequestException(
        'Informe o id da avaliação ou do produto',
      );
    }
    if (destinos.length > 1) {
      throw new BadRequestException(
        'O comentário deve estar vinculado a apenas um destino por vez.',
      );
    }

    return this.prisma.comentario.create({
      data: {
        texto: dto.texto.trim(),
        usuarioId,
        avaliacaoLojaId: dto.avaliacaoLojaId,
        avaliacaoProdutoId: dto.avaliacaoProdutoId,
        produtoId: dto.produtoId,
      },
      include: {
        usuario: {
          select: { id: true, nome: true, nomeUsuario: true, fotoUrl: true },
        },
      },
    });
  }

  async findAll(filtros: { produtoId?: number; avaliacaoLojaId?: number; avaliacaoProdutoId?: number; }) {
    return this.prisma.comentario.findMany({
      where: {
        produtoId: filtros.produtoId,
        avaliacaoLojaId: filtros.avaliacaoLojaId,
        avaliacaoProdutoId: filtros.avaliacaoProdutoId,
      },
      orderBy: { criadoEm: 'asc' },
      include: {
        usuario: {
          select: { id: true, nome: true, nomeUsuario: true, fotoUrl: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const comentario = await this.prisma.comentario.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nome: true, nomeUsuario: true, fotoUrl: true },
        },
      },
    });

    if (!comentario) {
      throw new NotFoundException('Comentário não encontrado.');
    }

    return comentario;
  }

  async update(id: number, usuarioId: number, dto: UpdateComentarioDto) {
    const comentario = await this.findOne(id);

    if (comentario.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este comentário.',
      );
    }

    return this.prisma.comentario.update({
      where: { id },
      data: { texto: dto.texto.trim() },
      include: {
        usuario: {
          select: { id: true, nome: true, nomeUsuario: true, fotoUrl: true },
        },
      },
    });
  }

  async remove(id: number, usuarioId: number) {
    const comentario = await this.findOne(id);

    if (comentario.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir este comentário.',
      );
    }

    await this.prisma.comentario.delete({ where: { id } });
    return { mensagem: 'Comentário removido com sucesso.' };
  }
}
