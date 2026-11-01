import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, Min, IsEnum, IsUUID } from 'class-validator';

enum StatusProduto {
    RASCUNHO = 'RASCUNHO',
    ATIVO = 'ATIVO',
    INATIVO = 'INATIVO',
}

export class CreateProdutoDto {
    @IsUUID()
    @IsNotEmpty()
    lojaId: string;

    @IsUUID()
    @IsNotEmpty()
    categoriaId: string;

    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsString()
    @IsOptional()
    descricao?: string;

    @IsString()
    @IsOptional()
    sku?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    preco: number;

    @IsInt()
    @Min(0)
    estoque: number;

    @IsEnum(StatusProduto)
    status: StatusProduto;
}
