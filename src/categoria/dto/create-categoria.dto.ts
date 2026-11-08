import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    @MaxLength(80, { message: 'O nome deve ter no máximo 80 caracteres.' })
    nome: string;

    // texto usado na URL, ex.: "roupas-femininas"
    @IsString()
    @IsNotEmpty({ message: 'O slug é obrigatório.' })
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'O slug deve ter apenas letras minúsculas, números e hífens (ex.: roupas-femininas).',
    })
    slug: string;

    @IsOptional()
    @IsBoolean({ message: 'O campo ativa deve ser verdadeiro ou falso.' })
    ativa?: boolean;

    // preencher só em subcategorias: id da categoria "mãe"
    @IsOptional()
    @IsUUID('all', { message: 'O paiId deve ser um UUID válido.' })
    paiId?: string | null;
}
