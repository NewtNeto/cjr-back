import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

// dados para criar uma loja (chegam junto com as imagens, em multipart/form-data)
// cada campo tem uma regra so, assim o front recebe uma mensagem clara por campo
export class CreateLojaDto {
  // de 1 a 60 caracteres e pelo menos um que nao seja espaco
  @Matches(/^(?=.*\S).{1,60}$/, {
    message: 'Informe o nome da loja (até 60 caracteres).',
  })
  nome: string;

  // categoria principal escolhida no modal
  @Type(() => Number)
  @IsInt({ message: 'Escolha uma categoria.' })
  categoriaId: number;

  // sem e-mail, o back usa o e-mail do dono
  @IsOptional()
  @IsEmail({}, { message: 'Informe um e-mail de contato válido.' })
  emailContato?: string;

  @IsOptional()
  @MaxLength(500, { message: 'A descrição pode ter no máximo 500 caracteres.' })
  descricao?: string;

  @IsOptional()
  @MaxLength(20, { message: 'O telefone pode ter no máximo 20 caracteres.' })
  telefone?: string;

  // so numeros, igual a regra do banco
  @IsOptional()
  @Matches(/^\d{14}$/, { message: 'O CNPJ deve ter 14 números.' })
  cnpj?: string;
}
