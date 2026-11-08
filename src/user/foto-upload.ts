import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { join } from 'path';

// pasta onde as fotos ficam salvas (fora do git, veja o .gitignore)
export const PASTA_FOTOS = join(process.cwd(), 'uploads', 'fotos');

// caminho público usado pelo front: http://localhost:3001/uploads/fotos/<arquivo>
export const PREFIXO_URL_FOTOS = '/uploads/fotos/';

// a extensão vem do tipo da imagem, nunca do nome enviado pelo usuário
const EXTENSOES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB

export const opcoesUploadFoto: MulterOptions = {
  storage: diskStorage({
    destination: PASTA_FOTOS,
    // nome aleatório: evita sobrescrever fotos e nomes estranhos vindos do computador do usuário
    filename: (_requisicao, arquivo, callback) => {
      callback(null, `${randomUUID()}${EXTENSOES[arquivo.mimetype]}`);
    },
  }),
  limits: { fileSize: TAMANHO_MAXIMO_FOTO, files: 1 },
  fileFilter: (_requisicao, arquivo, callback) => {
    if (!EXTENSOES[arquivo.mimetype]) {
      callback(new BadRequestException('A foto deve ser JPG, PNG ou WEBP.'), false);
      return;
    }
    callback(null, true);
  },
};
