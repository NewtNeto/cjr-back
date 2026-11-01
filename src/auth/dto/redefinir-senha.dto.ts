import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
    @IsString()
    @IsNotEmpty({ message: 'O token é obrigatório.' })
    token: string;

    @IsString()
    @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
    senha: string;
}
