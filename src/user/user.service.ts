import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';
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

  async findOne(id: number) {
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

  async update(id: number, updateUserDto: UpdateUserDto) {
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

  async atualizarFoto(id: number, foto: Express.Multer.File | undefined) {
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

  // dados que a propria pessoa muda no modal "editar perfil"
  async atualizarPerfil(id: number, dados: AtualizarPerfilDto) {
    await this.findOne(id);

    const nome = dados.nome?.trim();
    const email = dados.email?.trim().toLowerCase();
    const nomeUsuario = dados.nomeUsuario?.trim().toLowerCase();

    // e-mail e nome de usuario sao unicos: confere antes para dar uma mensagem clara
    if (email && (await this.prisma.usuario.findFirst({ where: { email, NOT: { id } } }))) {
      throw new ConflictException('Esse e-mail já está em uso.');
    }
    if (nomeUsuario && (await this.prisma.usuario.findFirst({ where: { nomeUsuario, NOT: { id } } }))) {
      throw new ConflictException('Esse nome de usuário já está em uso.');
    }

    return this.prisma.usuario.update({
      where: { id },
      data: { nome, email, nomeUsuario },
      select: { id: true, nome: true, nomeUsuario: true, email: true, fotoUrl: true },
    });
  }

  async alterarSenha(id: number, dados: AlterarSenhaDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, excluidoEm: null },
      select: { senhaHash: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    if (!(await bcrypt.compare(dados.senhaAtual, usuario.senhaHash))) {
      throw new BadRequestException('A senha atual está incorreta.');
    }

    await this.prisma.usuario.update({
      where: { id },
      data: { senhaHash: await bcrypt.hash(dados.novaSenha, 10) },
    });
  }

  // "apagar" a conta: marca como excluida em vez de apagar a linha, porque pedidos, lojas e
  // avaliacoes apontam para ela (apagar de verdade daria erro no banco).
  // e-mail, nome de usuario e cpf sao trocados/limpos para poderem ser usados num cadastro novo
  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.usuario.update({
      where: { id },
      data: {
        excluidoEm: new Date(),
        ativo: false,
        email: `${id}@conta-excluida.local`,
        nomeUsuario: `excluido-${id}`,
        cpf: null,
      },
    });
  }
}
