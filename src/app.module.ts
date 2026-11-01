import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProdutoModule } from './produto/produto.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, ProdutoModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
