import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { PASTA_FOTOS, PREFIXO_URL_FOTOS } from './foto-upload';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const emailLower = createUserDto.email.toLowerCase();
    const nomeUsuarioLower = createUserDto.nomeUsuario.toLowerCase();

    const existingUser = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { email: emailLower },
          { nomeUsuario: nomeUsuarioLower },
          ...(createUserDto.cpf ? [{ cpf: createUserDto.cpf }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('E-mail, nome de usuário ou CPF já cadastrado.');
    }

    const senhaHash = await bcrypt.hash(createUserDto.senha, 10);

    const { senha, ...userData } = createUserDto;

    return this.prisma.usuario.create({
      data: {
        ...userData,
        email: emailLower,
        nomeUsuario: nomeUsuarioLower,
        senhaHash,
      },
      select: {
        id: true,
        nome: true,
        nomeUsuario: true,
        email: true,
        fotoUrl: true,
        telefone: true,
        cpf: true,
        papel: true,
        ativo: true,
        criadoEm: true,
      },
    });
  }
  async findAll() {
    return this.prisma.usuario.findMany({
      where: { excluidoEm: null },
      select: {
        id: true,
        nome: true,
        nomeUsuario: true,
        email: true,
        fotoUrl: true,
        telefone: true,
        cpf: true,
        papel: true,
        ativo: true,
        criadoEm: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.usuario.findFirst({
      where: { id, excluidoEm: null },
      select: {
        id: true,
        nome: true,
        nomeUsuario: true,
        email: true,
        fotoUrl: true,
        telefone: true,
        cpf: true,
        papel: true,
        ativo: true,
        criadoEm: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const dataToUpdate: any = { ...updateUserDto };

    if (updateUserDto.email) {
      dataToUpdate.email = updateUserDto.email.toLowerCase();
    }
    if (updateUserDto.nomeUsuario) {
      dataToUpdate.nomeUsuario = updateUserDto.nomeUsuario.toLowerCase();
    }
    if (updateUserDto.senha) {
      dataToUpdate.senhaHash = await bcrypt.hash(updateUserDto.senha, 10);
      delete dataToUpdate.senha;
    }

    return this.prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        nome: true,
        nomeUsuario: true,
        email: true,
        fotoUrl: true,
        telefone: true,
        cpf: true,
        papel: true,
        ativo: true,
        atualizadoEm: true,
      },
    });
  }

  async atualizarFoto(id: string, foto: Express.Multer.File | undefined) {
    if (!foto) {
      throw new BadRequestException('Envie uma imagem no campo "foto".');
    }

    const atual = await this.prisma.usuario.findFirst({
      where: { id, excluidoEm: null },
      select: { fotoUrl: true },
    });

    if (!atual) {
      await this.apagarFoto(foto.filename);
      throw new NotFoundException('Usuário não encontrado.');
    }

    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: { fotoUrl: `${PREFIXO_URL_FOTOS}${foto.filename}` },
      select: {
        id: true,
        nome: true,
        nomeUsuario: true,
        email: true,
        fotoUrl: true,
      },
    });

    // a foto antiga não é mais usada: apaga o arquivo para não acumular lixo
    if (atual.fotoUrl) {
      await this.apagarFoto(basename(atual.fotoUrl));
    }

    return usuario;
  }

  private async apagarFoto(nomeArquivo: string) {
    // se o arquivo já não existir, não tem problema
    await unlink(join(PASTA_FOTOS, nomeArquivo)).catch(() => undefined);
  }

  async remove(id: string) {
    return this.prisma.usuario.delete({
      where: { id },
    });
  }
}
