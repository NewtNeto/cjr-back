import { PartialType } from '@nestjs/mapped-types';
import { CreateComentarioDto } from './create-comentario.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateComentarioDto extends PartialType(CreateComentarioDto) {
    @IsString({ message: 'O texto deve ser uma string.' })
    @IsNotEmpty({ message: 'O texto do comentário não pode ficar vazio.' })
    texto: string;
}
