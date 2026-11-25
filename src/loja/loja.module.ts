import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LojaController } from './loja.controller';
import { LojaService } from './loja.service';

// o AuthModule libera o AuthGuard nas rotas que pedem login
@Module({
  imports: [AuthModule],
  controllers: [LojaController],
  providers: [LojaService],
})
export class LojaModule {}
