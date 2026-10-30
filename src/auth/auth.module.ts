import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../database/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
          throw new Error('JWT_SECRET não definido no .env');
        }

        return {
          secret,
          // validade do login em segundos (padrão: 1 dia)
          signOptions: { expiresIn: Number(process.env.JWT_EXPIRA_EM_SEGUNDOS ?? 86400) },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
  // outros módulos que importarem o AuthModule conseguem usar o AuthGuard (ele precisa do JwtService)
  exports: [JwtModule],
})
export class AuthModule {}
