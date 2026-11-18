import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../database/prisma.module';
import { ComentarioService } from './comentario.service';
import { ComentarioController } from './comentario.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ComentarioController],
  providers: [ComentarioService],
})
export class ComentarioModule {}
