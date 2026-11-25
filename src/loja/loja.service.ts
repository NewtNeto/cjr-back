import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateLojaDto } from './dto/create-loja.dto';
import { UpdateLojaDto } from './dto/update-loja.dto';
import {
  apagarEnviados,
  apagarImagem,
  type ArquivosLoja,
  garantirSvgSeguro,
  urlDoArquivo,
} from './upload-loja';

// campos da loja que voltam para o front
const camposLoja = {
  id: true,
  nome: true,
  slug: true,
  descricao: true,
  fotoUrl: true,
  logoUrl: true,
  bannerUrl: true,
  emailContato: true,
  telefone: true,
  cnpj: true,
  status: true,
  criadoEm: true,
  categoria: { select: { id: true, nome: true, slug: true } },
} as const;

// nome vira endereco, sem acento e sem simbolo: "loja do joao" -> "loja-do-joao"
function gerarSlug(nome: string) {
  const slug = nome
    .normalize('NFD')
    // tira as marcas de acento que o NFD separou da letra
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  return slug || 'loja';
}

// texto opcional: undefined nao mexe, vazio ou so espacos vira null (apaga)
function textoOpcional(valor?: string | null) {
  if (valor === undefined) return undefined;
  return valor?.trim() || null;
}

// dados do dto prontos para o banco
function normalizar(dados: UpdateLojaDto) {
  return {
    nome: dados.nome?.trim(),
    categoriaId: dados.categoriaId,
    emailContato: dados.emailContato?.trim().toLowerCase(),
    descricao: textoOpcional(dados.descricao),
    telefone: textoOpcional(dados.telefone),
    cnpj: textoOpcional(dados.cnpj),
  };
}

// imagens enviadas no modal (so entra no banco o que veio)
function imagens(arquivos: ArquivosLoja) {
  return {
    fotoUrl: urlDoArquivo(arquivos, 'foto'),
    logoUrl: urlDoArquivo(arquivos, 'logo'),
    bannerUrl: urlDoArquivo(arquivos, 'banner'),
  };
}

// cnpj e unico no banco: vira uma mensagem clara em vez de erro 500
function tratarCnpjRepetido(erro: unknown): never {
  if (
    erro instanceof Prisma.PrismaClientKnownRequestError &&
    erro.code === 'P2002'
  ) {
    throw new ConflictException('Já existe uma loja com esse CNPJ.');
  }
  throw erro;
}

// implementacao do crud de loja
@Injectable()
export class LojaService {
  constructor(private readonly prisma: PrismaService) {}

  // cria a loja ja ativa e coloca quem criou como dono
  async criar(usuarioId: string, dados: CreateLojaDto, arquivos: ArquivosLoja) {
    try {
      await this.garantirCategoria(dados.categoriaId);
      await garantirSvgSeguro(arquivos);

      // o dto de criacao garante nome preenchido (por isso o "!")
      const { nome, emailContato, ...opcionais } = normalizar(dados);
      const slug = await this.slugLivre(nome!);
      // o modal nao pede e-mail: o contato da loja comeca sendo o e-mail do dono
      const dono = await this.prisma.usuario.findUniqueOrThrow({
        where: { id: usuarioId },
        select: { email: true },
      });

      const [loja] = await this.prisma
        .$transaction([
          this.prisma.loja.create({
            data: {
              nome: nome!,
              emailContato: emailContato ?? dono.email,
              ...opcionais,
              ...imagens(arquivos),
              slug,
              // sem aprovacao de admin no projeto: a loja ja comeca vendendo
              status: 'ATIVA',
              membros: { create: { usuarioId, papel: 'DONO' } },
            },
            select: camposLoja,
          }),
          // cliente que abre uma loja passa a ser vendedor (admin continua admin)
          this.prisma.usuario.updateMany({
            where: { id: usuarioId, papel: 'CLIENTE' },
            data: { papel: 'VENDEDOR' },
          }),
        ])
        .catch(tratarCnpjRepetido);

      return loja;
    } catch (erro) {
      // deu erro: as imagens enviadas nao ficam soltas na pasta
      await apagarEnviados(arquivos);
      throw erro;
    }
  }

  // todas as lojas abertas
  listar() {
    return this.prisma.loja.findMany({
      where: { excluidoEm: null, status: 'ATIVA' },
      select: camposLoja,
      orderBy: { nome: 'asc' },
    });
  }

  // lojas de quem esta logado
  minhas(usuarioId: string) {
    return this.prisma.loja.findMany({
      where: { excluidoEm: null, membros: { some: { usuarioId } } },
      select: camposLoja,
      orderBy: { criadoEm: 'desc' },
    });
  }

  // dados da loja e os produtos a venda
  async buscar(id: string) {
    const loja = await this.prisma.loja.findFirst({
      where: { id, excluidoEm: null },
      select: {
        ...camposLoja,
        produtos: {
          where: { excluidoEm: null, status: 'ATIVO' },
          orderBy: { criadoEm: 'desc' },
          select: {
            id: true,
            titulo: true,
            slug: true,
            preco: true,
            estoque: true,
            // so a primeira foto, para o card
            imagens: {
              orderBy: { ordem: 'asc' },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    if (!loja) {
      throw new NotFoundException('Loja não encontrada.');
    }

    return loja;
  }

  // edita os dados e troca as imagens enviadas (as antigas sao apagadas)
  async atualizar(
    id: string,
    usuarioId: string,
    dados: UpdateLojaDto,
    arquivos: ArquivosLoja,
  ) {
    try {
      await this.garantirDono(id, usuarioId);
      if (dados.categoriaId) await this.garantirCategoria(dados.categoriaId);
      await garantirSvgSeguro(arquivos);

      const antes = await this.prisma.loja.findUniqueOrThrow({
        where: { id },
        select: { fotoUrl: true, logoUrl: true, bannerUrl: true },
      });
      const novas = imagens(arquivos);

      const loja = await this.prisma.loja
        .update({
          where: { id },
          data: { ...normalizar(dados), ...novas },
          select: camposLoja,
        })
        .catch(tratarCnpjRepetido);

      // so apaga a imagem antiga depois que a nova ja esta salva
      if (novas.fotoUrl) await apagarImagem(antes.fotoUrl);
      if (novas.logoUrl) await apagarImagem(antes.logoUrl);
      if (novas.bannerUrl) await apagarImagem(antes.bannerUrl);

      return loja;
    } catch (erro) {
      await apagarEnviados(arquivos);
      throw erro;
    }
  }

  // exclusao logica: a loja fecha e os produtos saem do catalogo, o historico fica
  async excluir(id: string, usuarioId: string) {
    await this.garantirDono(id, usuarioId);
    const agora = new Date();

    await this.prisma.$transaction([
      this.prisma.loja.update({
        where: { id },
        data: { excluidoEm: agora, status: 'ENCERRADA' },
      }),
      this.prisma.produto.updateMany({
        where: { lojaId: id, excluidoEm: null },
        data: { excluidoEm: agora },
      }),
    ]);

    return { mensagem: 'Loja excluída com sucesso.' };
  }

  // so o dono pode editar ou excluir
  private async garantirDono(lojaId: string, usuarioId: string) {
    const loja = await this.prisma.loja.findFirst({
      where: { id: lojaId, excluidoEm: null },
      select: {
        membros: { where: { usuarioId }, select: { papel: true } },
      },
    });

    if (!loja) {
      throw new NotFoundException('Loja não encontrada.');
    }
    if (loja.membros[0]?.papel !== 'DONO') {
      throw new ForbiddenException('Só o dono pode alterar esta loja.');
    }
  }

  // a loja usa uma categoria principal ativa (mercado, beleza...), nunca uma subcategoria
  private async garantirCategoria(categoriaId: string) {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id: categoriaId, ativa: true, paiId: null },
      select: { id: true },
    });

    if (!categoria) {
      throw new BadRequestException('Escolha uma categoria válida.');
    }
  }

  // slug unico: se o nome ja existe, ganha um final aleatorio ("casa-do-cafe-a1b2")
  private async slugLivre(nome: string) {
    const base = gerarSlug(nome);
    let slug = base;

    while (await this.prisma.loja.findUnique({ where: { slug } })) {
      slug = `${base}-${randomBytes(2).toString('hex')}`;
    }

    return slug;
  }
}
