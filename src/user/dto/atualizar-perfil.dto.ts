import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

// o que a propria pessoa pode mudar no modal "editar perfil" (senha tem rota propria)
export class AtualizarPerfilDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres.' })
    nome?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-Z0-9._]{3,30}$/, {
        message: 'O nome de usuário deve ter de 3 a 30 caracteres: letras, números, ponto ou _.',
    })
    nomeUsuario?: string;

    @IsOptional()
    @IsEmail({}, { message: 'E-mail inválido.' })
    email?: string;
}
