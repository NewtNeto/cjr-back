import { IsEmail, IsNotEmpty } from 'class-validator';

export class EsqueciSenhaDto {
    @IsEmail({}, { message: 'E-mail inválido.' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
    email: string;
}
