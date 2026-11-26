import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, Min, IsEnum } from 'class-validator';

enum StatusProduto {
    RASCUNHO = 'RASCUNHO',
    ATIVO = 'ATIVO',
    INATIVO = 'INATIVO',
}

export class CreateProdutoDto {
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    lojaId: number;

    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    categoriaId: number;

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
