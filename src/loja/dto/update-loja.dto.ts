import { PartialType } from '@nestjs/mapped-types';
import { CreateLojaDto } from './create-loja.dto';

// mesmos campos da criacao, todos opcionais
export class UpdateLojaDto extends PartialType(CreateLojaDto) {}
