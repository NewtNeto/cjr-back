import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomUUID } from 'crypto';
import { readFile, unlink } from 'fs/promises';
import { diskStorage } from 'multer';
import { basename, join } from 'path';

// implementacao do upload das imagens da loja (mesmo padrao da foto de perfil)

// pasta das imagens (fora do git) e o caminho publico usado pelo front
const pastaLojas = join(process.cwd(), 'uploads', 'lojas');
export const prefixoUrlLojas = '/uploads/lojas/';

// os tres campos do modal: foto de perfil, logo em svg e banner
export type CampoImagem = 'foto' | 'logo' | 'banner';
export type ArquivosLoja = Partial<Record<CampoImagem, Express.Multer.File[]>>;

// tipos aceitos em cada campo e a extensao salva (nunca a do nome enviado)
const tiposPorCampo: Record<CampoImagem, Record<string, string>> = {
  foto: { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' },
  logo: { 'image/svg+xml': '.svg' },
  banner: { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' },
};

const mensagemTipo: Record<CampoImagem, string> = {
  foto: 'A foto de perfil deve ser JPG, PNG ou WEBP.',
  logo: 'A logo deve ser um arquivo SVG.',
  banner: 'O banner deve ser JPG, PNG ou WEBP.',
};

export const camposImagem = [
  { name: 'foto', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
];

export const opcoesUploadLoja: MulterOptions = {
  storage: diskStorage({
    destination: pastaLojas,
    // nome aleatorio: nao sobrescreve nada e ignora o nome do computador do usuario
    filename: (_requisicao, arquivo, callback) => {
      const extensao =
        tiposPorCampo[arquivo.fieldname as CampoImagem][arquivo.mimetype];
      callback(null, `${randomUUID()}${extensao}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (_requisicao, arquivo, callback) => {
    const campo = arquivo.fieldname as CampoImagem;
    if (!tiposPorCampo[campo]?.[arquivo.mimetype]) {
      callback(
        new BadRequestException(mensagemTipo[campo] ?? 'Arquivo não aceito.'),
        false,
      );
      return;
    }
    callback(null, true);
  },
};

// caminho salvo no banco para o arquivo enviado em um campo (ou undefined se nao veio)
export function urlDoArquivo(arquivos: ArquivosLoja, campo: CampoImagem) {
  const arquivo = arquivos[campo]?.[0];
  return arquivo ? `${prefixoUrlLojas}${arquivo.filename}` : undefined;
}

// apaga os arquivos recem enviados (usado quando a requisicao da erro)
export async function apagarEnviados(arquivos: ArquivosLoja) {
  const todos = Object.values(arquivos).flat();
  await Promise.all(
    todos.map((arquivo) => unlink(arquivo.path).catch(() => undefined)),
  );
}

// apaga uma imagem antiga da loja pelo caminho salvo no banco
export async function apagarImagem(url?: string | null) {
  if (!url?.startsWith(prefixoUrlLojas)) return;
  await unlink(join(pastaLojas, basename(url))).catch(() => undefined);
}

// svg pode carregar codigo: recusa logo com script, eventos (onclick...) ou links javascript
export async function garantirSvgSeguro(arquivos: ArquivosLoja) {
  const logo = arquivos.logo?.[0];
  if (!logo) return;

  const conteudo = await readFile(logo.path, 'utf8');
  const perigoso =
    /<script|<foreignObject|<iframe|<embed|<object|\son\w+\s*=|javascript:/i;

  if (!/<svg[\s>]/i.test(conteudo) || perigoso.test(conteudo)) {
    throw new BadRequestException(
      'A logo deve ser um SVG simples, sem scripts.',
    );
  }
}
