import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAvaliacaoLojaDto {
  @Type(() => Number)
  @IsInt()
  lojaId: number;

  @Type(() => Number)
  @IsInt()
  usuarioId: number;

  @IsInt()
  @Min(0)
  @Max(5)
  nota: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}

export class UpdateAvaliacaoLojaDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  nota?: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}

export class CreateAvaliacaoProdutoDto {
  @Type(() => Number)
  @IsInt()
  produtoId: number;

  @Type(() => Number)
  @IsInt()
  usuarioId: number;

  @IsInt()
  @Min(0)
  @Max(5)
  nota: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}

export class UpdateAvaliacaoProdutoDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  nota?: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}