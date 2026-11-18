import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateComentarioDto {
    @IsString({ message: 'O texto deve ser uma string.' })
    @IsNotEmpty({ message: 'O texto do comentário não pode ficar vazio.' })
    texto: string;

    @IsOptional()
    @IsUUID('4', { message: 'ID da avaliação da loja inválido.' })
    avaliacaoLojaId?: string;

    @IsOptional()
    @IsUUID('4', { message: 'ID da avaliação do produto inválido.' })
    avaliacaoProdutoId?: string;

    @IsOptional()
    @IsUUID('4', { message: 'ID do produto inválido.' })
    produtoId?: string;
}
