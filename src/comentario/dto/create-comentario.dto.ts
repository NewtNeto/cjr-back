import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateComentarioDto {
    @IsString({ message: 'O texto deve ser uma string.' })
    @IsNotEmpty({ message: 'O texto do comentário não pode ficar vazio.' })
    texto: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'ID da avaliação da loja inválido.' })
    avaliacaoLojaId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'ID da avaliação do produto inválido.' })
    avaliacaoProdutoId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'ID do produto inválido.' })
    produtoId?: number;
}
