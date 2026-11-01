import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    nome: string;

    @IsString()
    @IsNotEmpty({ message: 'O nome de usuário é obrigatório.' })
    nomeUsuario: string;

    @IsEmail({}, { message: 'E-mail inválido.' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
    senha: string;

    @IsOptional()
    @IsString()
    telefone?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{11}$/, { message: 'O CPF deve conter exatamente 11 dígitos numéricos.' })
    cpf?: string;
}
