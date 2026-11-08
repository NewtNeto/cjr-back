import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  // AuthModule: necessário para usar o AuthGuard nas rotas de administrador
  imports: [AuthModule],
  controllers: [CategoriaController],
  providers: [CategoriaService],
})
export class CategoriaModule {}
