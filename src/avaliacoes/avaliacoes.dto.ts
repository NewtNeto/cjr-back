import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateAvaliacaoLojaDto {
  @IsUUID()
  lojaId: string;

  @IsUUID()
  usuarioId: string;

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
  @IsUUID()
  produtoId: string;

  @IsUUID()
  usuarioId: string;

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